import chromadb
from config import CHROMA_PERSIST_DIR, COLLECTION_NAME
from typing import List, Dict, Any, Optional


class VectorService:
    def __init__(self):
        self.client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)
        self.collection = self.client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
        )

    def add_assets(
        self,
        ids: List[str],
        documents: List[str],
        metadatas: List[Dict[str, Any]],
    ):
        self.collection.upsert(ids=ids, documents=documents, metadatas=metadatas)

    def search(self, query: str, n_results: int = 5):
        if self.collection.count() == 0:
            return {"ids": [[]], "documents": [[]], "metadatas": [[]], "distances": [[]]}
        actual_n = min(n_results, self.collection.count())
        return self.collection.query(
            query_texts=[query],
            n_results=actual_n,
            include=["documents", "metadatas", "distances"],
        )

    def delete(self, ids: List[str]):
        self.collection.delete(ids=ids)

    def count(self) -> int:
        return self.collection.count()

    def get_all(self, limit: int = 100, offset: int = 0):
        return self.collection.get(
            limit=limit,
            offset=offset,
            include=["documents", "metadatas"],
        )

    def get_by_id(self, asset_id: str):
        return self.collection.get(
            ids=[asset_id],
            include=["documents", "metadatas"],
        )
