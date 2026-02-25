import os
from dotenv import load_dotenv

load_dotenv()

DASHSCOPE_API_KEY = os.getenv("DASHSCOPE_API_KEY", "")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-v3")
CHAT_MODEL = os.getenv("CHAT_MODEL", "qwen-max")
CHROMA_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", "./data/chroma_db")
SQLITE_DB_PATH = os.getenv("SQLITE_DB_PATH", "./data/app.db")
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-me")
DEFAULT_TOP_K = int(os.getenv("DEFAULT_TOP_K", "5"))
RERANK_CANDIDATE_COUNT = int(os.getenv("RERANK_CANDIDATE_COUNT", "20"))
COLLECTION_NAME = "auction_assets"

SYSTEM_PROMPT = """你是阿里拍卖平台的 VIP 专属购买顾问 AI。

【核心任务】
分析用户的购买需求，按以下步骤响应：

第一步 - 展示思考过程（直接输出给用户看）：
🔍 正在分析您的需求...
📍 目标区域：{area，未提及则写"未指定"}
🏠 标的类型：{type，如住宅/商铺/车辆/土地/设备等}
💰 预算范围：{budget，未提及则写"未指定"}
📐 面积要求：{area_size，未提及则写"未指定"}
✨ 特殊要求：{features，如带院子、学区房等}
⏳ 正在为您全库匹配中...

第二步 - 在 <INTENT_JSON> 标签中输出结构化意图（用于系统内部处理）：
<INTENT_JSON>
{"region": "...", "asset_type": "...", "price_min": null, "price_max": null,
 "area_min": null, "area_max": null, "features": ["..."], "is_auction_related": true}
</INTENT_JSON>

【规则】
- 如果用户输入与拍卖/购买无关，设 is_auction_related=false，并礼貌引导
- 多轮对话时，结合历史消息理解叠加/修改意图
- 始终使用中文"""

RERANK_PROMPT_TEMPLATE = """你是一个拍卖标的推荐精排专家。

用户需求：{user_requirement}
用户意图标签：{intent_json}

以下是初步召回的候选资产列表：
{candidate_assets_json}

请根据用户需求与每条资产的相关程度，输出重排后的资产 ID 列表（从最相关到最不相关），
并给出每条资产的匹配度评分（0-100）。
仅保留匹配度 ≥ 50 的资产。

输出格式（纯 JSON 数组，不要 markdown）：
[{{"asset_id": "...", "score": 95, "reason": "简要原因"}}]"""
