from pydantic import BaseModel
from typing import Optional


class RegisterRequest(BaseModel):
    username: str
    password: str
    role: str = "vip"


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    token: str
    role: str
    username: str


class ChatMatchRequest(BaseModel):
    user_message: str
    session_id: Optional[str] = None


class AssetCreate(BaseModel):
    title: str
    asset_type: str = ""
    region: str = ""
    price: float = 0
    area: float = 0
    image_url: str = ""
    description: str = ""
    status: str = "即将开拍"


class AssetUpdate(BaseModel):
    title: Optional[str] = None
    asset_type: Optional[str] = None
    region: Optional[str] = None
    price: Optional[float] = None
    area: Optional[float] = None
    image_url: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None


class AssetOut(BaseModel):
    id: str
    title: str
    asset_type: str
    region: str
    price: float
    area: float
    image_url: str
    description: str
    status: str

    class Config:
        from_attributes = True


class AssetMatchOut(BaseModel):
    asset_id: str
    title: str
    asset_type: str
    region: str
    price: float
    area: float
    image_url: str
    summary: str
    similarity_score: int
    match_reason: str
