"""Router for TradingAgents deep analysis endpoints."""

import asyncio
import json

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.config import settings
from app.models.schemas import DeepAnalysis, DeepAnalysisJob, DeepAnalyzeRequest
from app.services import trading_agents_service

router = APIRouter()


@router.post("/start")
async def start_deep_analysis(request: DeepAnalyzeRequest):
    """Kick off a TradingAgents deep analysis. Returns a job_id for polling."""
    if not settings.ta_enabled:
        raise HTTPException(status_code=503, detail="Deep analysis is disabled")
    try:
        job_id = await trading_agents_service.start_analysis(request.ticker)
        return {"job_id": job_id, "ticker": request.ticker.upper()}
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Failed to start analysis: {e}")


@router.get("/job/{job_id}", response_model=DeepAnalysisJob)
def get_job_status(job_id: str):
    """Poll for analysis job status and result."""
    job = trading_agents_service.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.get("/result/{ticker}", response_model=DeepAnalysis)
def get_cached_result(ticker: str):
    """Get cached deep analysis result for a ticker (if available)."""
    result = trading_agents_service.get_cached_analysis(ticker)
    if not result:
        raise HTTPException(
            status_code=404, detail="No cached analysis for this ticker"
        )
    return result


@router.post("/stream")
async def stream_deep_analysis(request: DeepAnalyzeRequest):
    """SSE endpoint that starts analysis and streams progress updates."""
    if not settings.ta_enabled:
        raise HTTPException(status_code=503, detail="Deep analysis is disabled")

    job_id = await trading_agents_service.start_analysis(request.ticker)

    async def event_generator():
        yield f"data: {json.dumps({'type': 'started', 'job_id': job_id, 'ticker': request.ticker.upper()})}\n\n"

        while True:
            job = trading_agents_service.get_job(job_id)
            if not job:
                yield f"data: {json.dumps({'type': 'error', 'content': 'Job not found'})}\n\n"
                break

            if job.status == "completed":
                result_data = job.result.model_dump() if job.result else None
                yield f"data: {json.dumps({'type': 'completed', 'result': result_data})}\n\n"
                break
            elif job.status == "failed":
                yield f"data: {json.dumps({'type': 'error', 'content': job.error or 'Analysis failed'})}\n\n"
                break
            else:
                yield f"data: {json.dumps({'type': 'progress', 'status': job.status})}\n\n"

            await asyncio.sleep(2)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
