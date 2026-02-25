from datetime import datetime, timedelta
import jwt
from passlib.context import CryptContext
from app.config import JWT_SECRET

ALGORITHM = "HS256"
TOKEN_EXPIRE_DAYS = 7

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_ctx.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_ctx.verify(plain, hashed)


def create_token(user_id: int, role: str, username: str) -> str:
    payload = {
        "user_id": user_id,
        "role": role,
        "username": username,
        "exp": datetime.utcnow() + timedelta(days=TOKEN_EXPIRE_DAYS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=ALGORITHM)


def verify_token(token: str) -> dict:
    return jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
