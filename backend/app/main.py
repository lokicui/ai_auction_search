from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, chat, admin

app = FastAPI(title="AI拍卖搜索", description="阿里拍卖 VIP 我要买 - AI智能匹配系统")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(admin.router)
app.include_router(admin.public_router)


@app.get("/api/v1/health")
def health():
    from app.services import embedding_service, llm_service, vector_store
    return {
        "status": "ok",
        "dashscope_llm": llm_service.is_available(),
        "dashscope_embedding": embedding_service.is_available(),
        "vector_count": vector_store.count(),
    }
