from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.models.database import get_db, User
from app.models.schemas import RegisterRequest, LoginRequest, LoginResponse
from app.services.auth_service import hash_password, verify_password, create_token

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.post("/register")
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.username == req.username).first()
    if existing:
        raise HTTPException(400, "用户名已存在")
    user = User(
        username=req.username,
        password_hash=hash_password(req.password),
        role=req.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_token(user.id, user.role, user.username)
    return {"code": 200, "data": LoginResponse(token=token, role=user.role, username=user.username)}


@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == req.username).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(401, "用户名或密码错误")
    token = create_token(user.id, user.role, user.username)
    return {"code": 200, "data": LoginResponse(token=token, role=user.role, username=user.username)}
