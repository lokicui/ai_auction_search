from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from typing import List
from models import AssetListResponse, StatsResponse
from services.asset_service import AssetService
from services.vector_service import VectorService

router = APIRouter(prefix="/api/assets", tags=["assets"])

vector_service = VectorService()
asset_service = AssetService(vector_service)


@router.post("/upload")
async def upload_assets(file: UploadFile = File(...)):
    if not file.filename or not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="请上传 .xlsx 或 .xls 格式的文件")

    content = await file.read()
    try:
        assets = asset_service.parse_excel(content)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"解析Excel文件失败: {str(e)}")

    if not assets:
        raise HTTPException(status_code=400, detail="Excel文件中没有找到有效的资产数据")

    count = asset_service.import_assets(assets)
    return {"message": f"成功导入 {count} 条资产", "count": count}


@router.get("", response_model=AssetListResponse)
async def list_assets(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    assets, total = asset_service.get_assets(page=page, page_size=page_size)
    return AssetListResponse(assets=assets, total=total, page=page, page_size=page_size)


@router.delete("/{asset_id}")
async def delete_asset(asset_id: str):
    try:
        asset_service.delete_asset(asset_id)
        return {"message": "删除成功"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"删除失败: {str(e)}")


@router.post("/batch-delete")
async def batch_delete_assets(ids: List[str]):
    try:
        asset_service.delete_assets(ids)
        return {"message": f"成功删除 {len(ids)} 条资产"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"批量删除失败: {str(e)}")


@router.get("/stats", response_model=StatsResponse)
async def get_stats():
    total = vector_service.count()
    return StatsResponse(total_assets=total)
