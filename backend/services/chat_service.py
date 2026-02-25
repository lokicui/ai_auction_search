from typing import List
from models import Asset, AssetMatch, ChatResponse, ThinkingStep
from services.vector_service import VectorService
from config import TOP_K


class ChatService:
    def __init__(self, vector_service: VectorService):
        self.vector_service = vector_service

    def process_query(self, query: str) -> ChatResponse:
        total_assets = self.vector_service.count()

        thinking: List[ThinkingStep] = []

        thinking.append(ThinkingStep(
            step="需求理解",
            detail=f"正在分析您的需求: 「{query}」",
            icon="🔍",
        ))

        if total_assets == 0:
            thinking.append(ThinkingStep(
                step="资产检索",
                detail="资产库为空，请先导入资产数据",
                icon="⚠️",
            ))
            return ChatResponse(
                thinking=thinking,
                matches=[],
                summary="当前资产库为空，请联系管理员导入资产数据后再试。",
            )

        thinking.append(ThinkingStep(
            step="向量检索",
            detail=f"在 {total_assets} 条资产中进行语义相似度检索...",
            icon="📊",
        ))

        results = self.vector_service.search(query, n_results=TOP_K)

        matches: List[AssetMatch] = []
        if results["ids"] and results["ids"][0]:
            ids = results["ids"][0]
            metadatas = results["metadatas"][0]
            distances = results["distances"][0]

            for i, aid in enumerate(ids):
                meta = metadatas[i]
                distance = distances[i]
                score = max(0.0, 1.0 - distance)

                asset = Asset(
                    id=aid,
                    title=meta.get("title", ""),
                    description=meta.get("description", ""),
                    category=meta.get("category", ""),
                    location=meta.get("location", ""),
                    starting_price=float(meta.get("starting_price", 0)),
                    status=meta.get("status", "在售"),
                    source_url=meta.get("source_url", ""),
                )

                reason = self._generate_match_reason(query, asset, score)
                matches.append(AssetMatch(asset=asset, score=round(score, 4), reason=reason))

        match_count = len(matches)
        if match_count > 0:
            best_score = matches[0].score
            thinking.append(ThinkingStep(
                step="相似度匹配",
                detail=f"找到 {match_count} 条匹配资产，最高相似度: {best_score:.0%}",
                icon="📋",
            ))
            thinking.append(ThinkingStep(
                step="结果排序",
                detail="已按相似度从高到低排序，为您推荐以下标的",
                icon="✅",
            ))
            summary = f"根据您的需求，为您找到 {match_count} 条匹配的拍卖资产，请查看以下推荐："
        else:
            thinking.append(ThinkingStep(
                step="检索结果",
                detail="未找到与您需求高度匹配的资产",
                icon="😔",
            ))
            summary = "抱歉，暂未找到与您需求匹配的资产。请尝试更换关键词或描述更多细节。"

        return ChatResponse(thinking=thinking, matches=matches, summary=summary)

    def _generate_match_reason(self, query: str, asset: Asset, score: float) -> str:
        parts = []
        if asset.category:
            parts.append(f"类别: {asset.category}")
        if asset.location:
            parts.append(f"位置: {asset.location}")
        if asset.starting_price > 0:
            if asset.starting_price >= 10000:
                price_str = f"¥{asset.starting_price / 10000:.1f}万"
            else:
                price_str = f"¥{asset.starting_price:.0f}"
            parts.append(f"起拍价: {price_str}")
        parts.append(f"匹配度: {score:.0%}")
        return " | ".join(parts)
