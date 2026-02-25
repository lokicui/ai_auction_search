import chromadb
from typing import Optional
from app.config import CHROMA_PERSIST_DIR, COLLECTION_NAME
from app.services import embedding_service
import os

os.makedirs(CHROMA_PERSIST_DIR, exist_ok=True)

_client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)
_collection = _client.get_or_create_collection(
    name=COLLECTION_NAME,
    metadata={"hnsw:space": "cosine"},
)


def add_asset(asset_id: str, text: str, metadata: dict, embedding: Optional[list[float]] = None):
    """Add a single asset. Uses DashScope embedding if available, else ChromaDB default."""
    kwargs = {"ids": [asset_id], "metadatas": [metadata], "documents": [text]}
    if embedding:
        kwargs["embeddings"] = [embedding]
    _collection.upsert(**kwargs)


def add_assets_batch(ids: list[str], texts: list[str], metadatas: list[dict],
                     embeddings: Optional[list[list[float]]] = None):
    kwargs = {"ids": ids, "metadatas": metadatas, "documents": texts}
    if embeddings:
        kwargs["embeddings"] = embeddings
    _collection.upsert(**kwargs)


def query(query_text: str, n_results: int = 20,
          where: Optional[dict] = None,
          query_embedding: Optional[list[float]] = None) -> dict:
    """Query the collection. Uses DashScope embedding if available."""
    if _collection.count() == 0:
        return {"ids": [[]], "documents": [[]], "metadatas": [[]], "distances": [[]]}

    actual_n = min(n_results, _collection.count())
    kwargs = {"n_results": actual_n, "include": ["documents", "metadatas", "distances"]}

    if where:
        kwargs["where"] = where

    if query_embedding:
        kwargs["query_embeddings"] = [query_embedding]
    else:
        kwargs["query_texts"] = [query_text]

    try:
        return _collection.query(**kwargs)
    except Exception:
        if "where" in kwargs:
            del kwargs["where"]
            return _collection.query(**kwargs)
        raise


def delete(asset_id: str):
    _collection.delete(ids=[asset_id])


def update(asset_id: str, text: str, metadata: dict, embedding: Optional[list[float]] = None):
    kwargs = {"ids": [asset_id], "metadatas": [metadata], "documents": [text]}
    if embedding:
        kwargs["embeddings"] = [embedding]
    _collection.upsert(**kwargs)


def count() -> int:
    return _collection.count()


def get_all(limit: int = 100, offset: int = 0) -> dict:
    return _collection.get(limit=limit, offset=offset, include=["documents", "metadatas"])
