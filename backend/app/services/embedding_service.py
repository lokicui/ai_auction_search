import logging
from typing import Optional
from app.config import DASHSCOPE_API_KEY, EMBEDDING_MODEL

logger = logging.getLogger(__name__)

_dashscope_available = False
if DASHSCOPE_API_KEY:
    try:
        import dashscope
        dashscope.api_key = DASHSCOPE_API_KEY
        from dashscope import TextEmbedding
        _dashscope_available = True
    except ImportError:
        logger.warning("dashscope package not installed, using fallback embedding")


def get_embedding(text: str) -> Optional[list[float]]:
    """Get embedding vector for text. Returns None if DashScope is unavailable."""
    if not _dashscope_available:
        return None
    try:
        resp = TextEmbedding.call(model=EMBEDDING_MODEL, input=text)
        if resp.status_code == 200:
            return resp.output["embeddings"][0]["embedding"]
        logger.error("Embedding API error: %s", resp.message)
        return None
    except Exception as e:
        logger.error("Embedding call failed: %s", e)
        return None


def get_embeddings_batch(texts: list[str]) -> Optional[list[list[float]]]:
    """Get embeddings for a batch of texts."""
    if not _dashscope_available:
        return None
    try:
        resp = TextEmbedding.call(model=EMBEDDING_MODEL, input=texts)
        if resp.status_code == 200:
            return [e["embedding"] for e in resp.output["embeddings"]]
        logger.error("Batch embedding API error: %s", resp.message)
        return None
    except Exception as e:
        logger.error("Batch embedding call failed: %s", e)
        return None


def is_available() -> bool:
    return _dashscope_available
