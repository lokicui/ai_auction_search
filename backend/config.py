import os

CHROMA_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", os.path.join(os.path.dirname(__file__), "chroma_data"))
COLLECTION_NAME = "auction_assets"
TOP_K = int(os.getenv("TOP_K", "5"))
