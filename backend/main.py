from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import assets, chat

app = FastAPI(title="AI拍卖搜索", description="基于向量检索的智能拍卖资产推荐系统")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(assets.router)
app.include_router(chat.router)


@app.get("/api/health")
async def health():
    return {"status": "ok"}
