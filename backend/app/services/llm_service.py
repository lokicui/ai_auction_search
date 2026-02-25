import json
import logging
from typing import Generator, Optional
from app.config import DASHSCOPE_API_KEY, CHAT_MODEL

logger = logging.getLogger(__name__)

_dashscope_available = False
if DASHSCOPE_API_KEY:
    try:
        import dashscope
        dashscope.api_key = DASHSCOPE_API_KEY
        from dashscope import Generation
        _dashscope_available = True
    except ImportError:
        logger.warning("dashscope package not installed, using fallback LLM")


def stream_chat(messages: list[dict]) -> Generator[str, None, None]:
    """Stream chat completion. Yields content chunks."""
    if not _dashscope_available:
        yield from _fallback_stream(messages)
        return
    try:
        responses = Generation.call(
            model=CHAT_MODEL,
            messages=messages,
            stream=True,
            result_format="message",
            incremental_output=True,
        )
        for chunk in responses:
            if chunk.status_code == 200:
                content = chunk.output.choices[0].message.content
                if content:
                    yield content
            else:
                logger.error("LLM stream error: %s", chunk.message)
                break
    except Exception as e:
        logger.error("LLM stream failed: %s", e)
        yield f"\n⚠️ AI 服务暂时不可用: {e}"


def sync_chat(messages: list[dict]) -> str:
    """Synchronous chat completion. Returns full response."""
    if not _dashscope_available:
        return _fallback_sync(messages)
    try:
        resp = Generation.call(
            model=CHAT_MODEL,
            messages=messages,
            result_format="message",
        )
        if resp.status_code == 200:
            return resp.output.choices[0].message.content
        logger.error("LLM sync error: %s", resp.message)
        return ""
    except Exception as e:
        logger.error("LLM sync failed: %s", e)
        return ""


def is_available() -> bool:
    return _dashscope_available


def _fallback_stream(messages: list[dict]) -> Generator[str, None, None]:
    """Fallback when DashScope is not available - generate structured thinking."""
    user_msg = ""
    for m in reversed(messages):
        if m["role"] == "user":
            user_msg = m["content"]
            break

    yield "🔍 正在分析您的需求...\n"
    yield f"📍 目标区域：未指定\n"
    yield f"🏠 标的类型：未指定\n"
    yield f"💰 预算范围：未指定\n"
    yield "⏳ 正在为您全库匹配中...\n"
    intent = {
        "region": "", "asset_type": "", "price_min": None, "price_max": None,
        "area_min": None, "area_max": None, "features": [], "is_auction_related": True,
    }
    yield f"\n<INTENT_JSON>\n{json.dumps(intent, ensure_ascii=False)}\n</INTENT_JSON>"


def _fallback_sync(messages: list[dict]) -> str:
    return "[]"
