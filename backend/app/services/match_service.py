import json
import logging
import re
from typing import Generator, Optional
from app.config import SYSTEM_PROMPT, RERANK_PROMPT_TEMPLATE, DEFAULT_TOP_K, RERANK_CANDIDATE_COUNT
from app.services import llm_service, embedding_service, vector_store
from app.models.schemas import AssetMatchOut

logger = logging.getLogger(__name__)


def _parse_intent(full_text: str) -> Optional[dict]:
    """Extract INTENT_JSON from LLM output."""
    match = re.search(r"<INTENT_JSON>\s*(.*?)\s*</INTENT_JSON>", full_text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            logger.warning("Failed to parse INTENT_JSON")
    return None


def _build_where_filter(intent: dict) -> Optional[dict]:
    """Build ChromaDB where filter from parsed intent."""
    conditions = []

    if intent.get("region") and intent["region"] != "未指定":
        conditions.append({"region": {"$eq": intent["region"]}})

    if intent.get("asset_type") and intent["asset_type"] != "未指定":
        conditions.append({"asset_type": {"$eq": intent["asset_type"]}})

    if intent.get("price_max") is not None:
        conditions.append({"price": {"$lte": intent["price_max"]}})

    if intent.get("price_min") is not None:
        conditions.append({"price": {"$gte": intent["price_min"]}})

    if not conditions:
        return None
    if len(conditions) == 1:
        return conditions[0]
    return {"$and": conditions}


def _do_rerank(user_message: str, intent: dict, candidates: list[dict]) -> list[dict]:
    """Use LLM to rerank candidates. Falls back to similarity order."""
    if not llm_service.is_available() or not candidates:
        return candidates[:DEFAULT_TOP_K]

    prompt = RERANK_PROMPT_TEMPLATE.format(
        user_requirement=user_message,
        intent_json=json.dumps(intent, ensure_ascii=False),
        candidate_assets_json=json.dumps(candidates, ensure_ascii=False),
    )

    messages = [{"role": "user", "content": prompt}]
    response = llm_service.sync_chat(messages)

    try:
        match = re.search(r"\[.*\]", response, re.DOTALL)
        if match:
            reranked = json.loads(match.group(0))
            id_to_candidate = {c["asset_id"]: c for c in candidates}
            result = []
            for item in reranked:
                aid = item.get("asset_id", "")
                if aid in id_to_candidate:
                    c = id_to_candidate[aid]
                    c["similarity_score"] = item.get("score", c.get("similarity_score", 50))
                    c["match_reason"] = item.get("reason", "")
                    result.append(c)
            return result[:DEFAULT_TOP_K] if result else candidates[:DEFAULT_TOP_K]
    except (json.JSONDecodeError, Exception) as e:
        logger.warning("Rerank parse failed: %s", e)

    return candidates[:DEFAULT_TOP_K]


def stream_match(user_message: str, history_messages: list[dict]) -> Generator[dict, None, None]:
    """
    Four-layer matching pipeline with SSE streaming.
    Yields dicts with type: "thinking" | "assets" | "done"
    """
    # === Layer 1: Intent parsing with streaming thinking chain ===
    messages = [{"role": "system", "content": SYSTEM_PROMPT}] + history_messages + [
        {"role": "user", "content": user_message}
    ]

    full_response = ""
    thinking_buffer = ""
    in_intent_block = False

    for chunk in llm_service.stream_chat(messages):
        full_response += chunk

        for char in chunk:
            thinking_buffer += char
            if "<INTENT_JSON>" in thinking_buffer:
                in_intent_block = True
                before = thinking_buffer.split("<INTENT_JSON>")[0].strip()
                if before:
                    yield {"type": "thinking", "content": before + "\n"}
                thinking_buffer = ""
                continue
            if in_intent_block:
                if "</INTENT_JSON>" in thinking_buffer:
                    in_intent_block = False
                    thinking_buffer = ""
                continue
            if char == "\n" or len(thinking_buffer) > 100:
                line = thinking_buffer.strip()
                if line:
                    yield {"type": "thinking", "content": thinking_buffer}
                thinking_buffer = ""

    if thinking_buffer.strip() and not in_intent_block:
        yield {"type": "thinking", "content": thinking_buffer}

    # Parse intent
    intent = _parse_intent(full_response)
    if not intent:
        intent = {"region": "", "asset_type": "", "price_min": None, "price_max": None,
                  "features": [], "is_auction_related": True}

    if not intent.get("is_auction_related", True):
        yield {"type": "assets", "content": []}
        yield {"type": "done", "content": ""}
        return

    # === Layer 2: Structured filtering ===
    where_filter = _build_where_filter(intent)

    # === Layer 3: Vector semantic recall ===
    query_embedding = embedding_service.get_embedding(user_message)

    results = vector_store.query(
        query_text=user_message,
        n_results=RERANK_CANDIDATE_COUNT,
        where=where_filter,
        query_embedding=query_embedding,
    )

    candidates = []
    if results["ids"] and results["ids"][0]:
        for i, aid in enumerate(results["ids"][0]):
            meta = results["metadatas"][0][i]
            dist = results["distances"][0][i]
            score = max(0, int((1 - dist) * 100))
            candidates.append({
                "asset_id": aid,
                "title": meta.get("title", ""),
                "asset_type": meta.get("asset_type", ""),
                "region": meta.get("region", ""),
                "price": float(meta.get("price", 0)),
                "area": float(meta.get("area", 0)),
                "image_url": meta.get("image_url", ""),
                "summary": (results["documents"][0][i] or "")[:200],
                "similarity_score": score,
                "match_reason": "",
            })

    # === Layer 4: LLM Rerank ===
    if candidates and llm_service.is_available():
        yield {"type": "thinking", "content": "🏆 正在对候选结果进行精排...\n"}
        final = _do_rerank(user_message, intent, candidates)
    else:
        final = candidates[:DEFAULT_TOP_K]

    yield {"type": "assets", "content": final}
    yield {"type": "done", "content": ""}
