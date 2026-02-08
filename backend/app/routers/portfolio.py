from fastapi import APIRouter, UploadFile, File, HTTPException

from app.models.schemas import Holding, PortfolioSummary
from app.services import portfolio_service

router = APIRouter()


@router.post("/upload", response_model=list[Holding])
async def upload_portfolio(file: UploadFile = File(...)):
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a CSV file")
    content = await file.read()
    try:
        holdings = portfolio_service.upload_portfolio(content)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {e}")
    return holdings


@router.get("/holdings", response_model=list[Holding])
def get_holdings():
    return portfolio_service.get_holdings()


@router.get("/summary", response_model=PortfolioSummary)
def get_summary():
    return portfolio_service.get_summary()
