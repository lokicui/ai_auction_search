import json
import uuid
from fastapi import APIRouter, Depends, Header, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.models.database import get_db, ChatSession, ChatMessage
from app.models.schemas import ChatMatchRequest
from app.services.auth_service import verify_token
from app.services.match_service import stream_match

router = APIRouter(prefix="/api/v1", tags=["chat"])


def _get_user(authorization: str = Header(default="")):
    if not authorization:
        raise HTTPException(401, "未登录")
    token = authorization.replace("Bearer ", "")
    try:
        return verify_token(token)
    except Exception:
        raise HTTPException(401, "Token 无效或已过期")


@router.post("/chat-match")
async def chat_match(req: ChatMatchRequest, db: Session = Depends(get_db), user: dict = Depends(_get_user)):
    user_id = user["user_id"]

    # Resolve or create session
    session_id = req.session_id
    if session_id:
        session = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == user_id).first()
        if not session:
            raise HTTPException(404, "会话不存在")
    else:
        session_id = str(uuid.uuid4())
        title = req.user_message[:20] + ("..." if len(req.user_message) > 20 else "")
        session = ChatSession(id=session_id, user_id=user_id, title=title)
        db.add(session)
        db.commit()

    # Load history
    history_msgs = db.query(ChatMessage).filter(
        ChatMessage.session_id == session_id
    ).order_by(ChatMessage.created_at).all()

    history = [{"role": m.role, "content": m.content} for m in history_msgs if m.msg_type == "text"]

    # Save user message
    db.add(ChatMessage(session_id=session_id, role="user", content=req.user_message, msg_type="text"))
    db.commit()

    def event_stream():
        full_thinking = ""
        assets_data = []

        for event in stream_match(req.user_message, history):
            etype = event["type"]
            if etype == "thinking":
                full_thinking += event["content"]
                yield f"data: {json.dumps(event, ensure_ascii=False)}\n\n"
            elif etype == "assets":
                assets_data = event["content"]
                yield f"data: {json.dumps(event, ensure_ascii=False)}\n\n"
            elif etype == "done":
                yield f"data: {json.dumps({'type': 'done', 'session_id': session_id}, ensure_ascii=False)}\n\n"

        # Persist assistant messages
        db_session = next(get_db())
        try:
            if full_thinking.strip():
                db_session.add(ChatMessage(
                    session_id=session_id, role="assistant",
                    content=full_thinking.strip(), msg_type="thinking",
                ))
            if assets_data:
                db_session.add(ChatMessage(
                    session_id=session_id, role="assistant",
                    content=json.dumps(assets_data, ensure_ascii=False), msg_type="assets",
                ))
            # Save a plain text version for context
            summary = full_thinking.split("<INTENT_JSON")[0].strip()
            if assets_data:
                titles = ", ".join(a.get("title", "") for a in assets_data[:3])
                summary += f"\n为您推荐了以下标的: {titles}"
            db_session.add(ChatMessage(
                session_id=session_id, role="assistant",
                content=summary, msg_type="text",
            ))
            db_session.commit()
        finally:
            db_session.close()

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@router.get("/chat/sessions")
def get_sessions(db: Session = Depends(get_db), user: dict = Depends(_get_user)):
    sessions = db.query(ChatSession).filter(
        ChatSession.user_id == user["user_id"]
    ).order_by(ChatSession.updated_at.desc()).all()
    return {"code": 200, "data": [
        {"id": s.id, "title": s.title, "updated_at": str(s.updated_at)} for s in sessions
    ]}


@router.get("/chat/history")
def get_history(session_id: str, db: Session = Depends(get_db), user: dict = Depends(_get_user)):
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id, ChatSession.user_id == user["user_id"]
    ).first()
    if not session:
        raise HTTPException(404, "会话不存在")

    messages = db.query(ChatMessage).filter(
        ChatMessage.session_id == session_id
    ).order_by(ChatMessage.created_at).all()

    result = []
    for m in messages:
        item = {"role": m.role, "content": m.content, "msg_type": m.msg_type}
        if m.msg_type == "assets":
            try:
                item["content"] = json.loads(m.content)
            except json.JSONDecodeError:
                pass
        result.append(item)

    return {"code": 200, "data": result}
