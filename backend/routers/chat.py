from fastapi import APIRouter
from models import ChatMessage, ChatResponse
from services.vector_service import VectorService
from services.chat_service import ChatService

router = APIRouter(prefix="/api", tags=["chat"])

vector_service = VectorService()
chat_service = ChatService(vector_service)


@router.post("/chat", response_model=ChatResponse)
async def chat(message: ChatMessage):
    return chat_service.process_query(message.content)
