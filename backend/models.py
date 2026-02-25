from pydantic import BaseModel
from typing import Optional, List, Dict, Any


class Asset(BaseModel):
    id: str
    title: str
    description: str = ""
    category: str = ""
    location: str = ""
    starting_price: float = 0.0
    status: str = "在售"
    source_url: str = ""
    metadata: Dict[str, Any] = {}


class ChatMessage(BaseModel):
    content: str


class ThinkingStep(BaseModel):
    step: str
    detail: str
    icon: str = ""


class AssetMatch(BaseModel):
    asset: Asset
    score: float
    reason: str = ""


class ChatResponse(BaseModel):
    thinking: List[ThinkingStep]
    matches: List[AssetMatch]
    summary: str


class AssetListResponse(BaseModel):
    assets: List[Asset]
    total: int
    page: int
    page_size: int


class StatsResponse(BaseModel):
    total_assets: int
