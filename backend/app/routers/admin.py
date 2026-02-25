from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Header, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session
from app.models.database import get_db, Asset
from app.models.schemas import AssetOut, AssetUpdate
from app.services.auth_service import verify_token
from app.services import excel_parser, embedding_service, vector_store

router = APIRouter(prefix="/api/v1/admin", tags=["admin"])


def _require_admin(authorization: str = Header(default="")):
    if not authorization:
        raise HTTPException(401, "未登录")
    token = authorization.replace("Bearer ", "")
    try:
        payload = verify_token(token)
    except Exception:
        raise HTTPException(401, "Token 无效或已过期")
    if payload.get("role") != "admin":
        raise HTTPException(403, "权限不足")
    return payload


def _asset_to_text(a) -> str:
    return f"{a.title} {a.asset_type} {a.region} {a.description}"


def _asset_to_metadata(a) -> dict:
    return {
        "title": a.title or "",
        "asset_type": a.asset_type or "",
        "region": a.region or "",
        "price": float(a.price or 0),
        "area": float(a.area or 0),
        "image_url": a.image_url or "",
        "status": a.status or "",
    }


@router.post("/assets/upload")
async def upload_assets(file: UploadFile = File(...), db: Session = Depends(get_db),
                        _=Depends(_require_admin)):
    if not file.filename or not file.filename.endswith((".xlsx", ".xls")):
        raise HTTPException(400, "请上传 .xlsx 或 .xls 格式的文件")

    content = await file.read()
    try:
        parsed = excel_parser.parse_excel(content)
    except Exception as e:
        raise HTTPException(400, f"解析Excel文件失败: {e}")

    if not parsed:
        raise HTTPException(400, "Excel文件中没有找到有效的资产数据")

    # Save to SQLite + ChromaDB
    ids, texts, metadatas = [], [], []
    for asset_id, asset_data in parsed:
        db_asset = Asset(id=asset_id, **asset_data.model_dump())
        db.merge(db_asset)
        text = _asset_to_text(db_asset)
        meta = _asset_to_metadata(db_asset)
        ids.append(asset_id)
        texts.append(text)
        metadatas.append(meta)

    # Batch embedding if DashScope available
    embeddings = embedding_service.get_embeddings_batch(texts)
    vector_store.add_assets_batch(ids, texts, metadatas, embeddings)

    db.commit()
    return {"code": 200, "message": f"成功导入 {len(parsed)} 条资产", "count": len(parsed)}


@router.get("/assets")
def list_assets(page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100),
                db: Session = Depends(get_db), _=Depends(_require_admin)):
    total = db.query(Asset).count()
    assets = db.query(Asset).order_by(Asset.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return {
        "code": 200,
        "data": {
            "assets": [AssetOut.model_validate(a) for a in assets],
            "total": total, "page": page, "page_size": page_size,
        },
    }


@router.get("/assets/template")
def download_template(_=Depends(_require_admin)):
    content = excel_parser.create_template()
    return Response(
        content=content,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=asset_template.xlsx"},
    )


@router.get("/assets/{asset_id}")
def get_asset(asset_id: str, db: Session = Depends(get_db), _=Depends(_require_admin)):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(404, "资产不存在")
    return {"code": 200, "data": AssetOut.model_validate(asset)}


@router.put("/assets/{asset_id}")
def update_asset(asset_id: str, data: AssetUpdate, db: Session = Depends(get_db),
                 _=Depends(_require_admin)):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(404, "资产不存在")

    update_data = data.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(asset, k, v)
    db.commit()
    db.refresh(asset)

    text = _asset_to_text(asset)
    meta = _asset_to_metadata(asset)
    emb = embedding_service.get_embedding(text)
    vector_store.update(asset_id, text, meta, emb)

    return {"code": 200, "message": "更新成功，向量已重新生成"}


@router.delete("/assets/{asset_id}")
def delete_asset(asset_id: str, db: Session = Depends(get_db), _=Depends(_require_admin)):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(404, "资产不存在")
    db.delete(asset)
    db.commit()
    vector_store.delete(asset_id)
    return {"code": 200, "message": "删除成功"}


# Public asset detail endpoint (for VIP users)
public_router = APIRouter(prefix="/api/v1", tags=["assets"])


@public_router.get("/assets/{asset_id}")
def get_asset_detail(asset_id: str, db: Session = Depends(get_db)):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(404, "资产不存在")
    return {"code": 200, "data": AssetOut.model_validate(asset)}
