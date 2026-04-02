from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
import json
import os
import asyncio
import logging

from src.pipeline.orchestrator import run_parallel_orchestrator
from src.pipeline.models import init_db, get_db, AnalysisResult

# Initialize DB
init_db()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="TARA x 01 API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, you might want to restrict this to your specific Vercel domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "operational", "message": "Streaming TARA API is live."}

async def tara_stream_generator(sys_content: str, rubric_content: str):
    """Generates TARA results stage by stage using threads and centralized config."""
    try:
        # 0. Initial Heartbeat
        yield json.dumps({"stage": "init", "message": "Neural Lattice Engaged."}) + "\n"
        await asyncio.sleep(0.1)

        # 1. Parallel Multi-Agent Execution
        logger.info("Engaging Parallel Multi-Agent Orchestrator...")
        yield json.dumps({"stage": "orchestrating", "message": "Gemma 3 & Gemini 3.1 Agents Engaged in Parallel..."}) + "\n"
        
        # We run the orchestrator in a thread so it doesn't block the async event loop
        json_data = await asyncio.to_thread(run_parallel_orchestrator, sys_content)
        
        # 2. Complete
        logger.info("Orchestration Complete.")
        yield json.dumps({"stage": "orchestrator_complete", "data": json_data}) + "\n"

    except Exception as e:
        logger.error(f"Pipeline Error: {str(e)}")
        yield json.dumps({"stage": "error", "detail": str(e)}) + "\n"

class TaraTextRequest(BaseModel):
    system_content: str
    rubric_content: str

@app.post("/analyze")
async def analyze_system(
    system_file: UploadFile = File(...),
    rubric_file: UploadFile = File(...)
):
    try:
        sys_content = (await system_file.read()).decode("utf-8")
        rubric_content = (await rubric_file.read()).decode("utf-8")
        
        return StreamingResponse(
            tara_stream_generator(sys_content, rubric_content),
            media_type="application/x-ndjson"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze_text")
async def analyze_system_text(request: TaraTextRequest):
    try:
        return StreamingResponse(
            tara_stream_generator(request.system_content, request.rubric_content),
            media_type="application/x-ndjson"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history")
async def get_history():
    try:
        from src.pipeline.models import SessionLocal
        db = SessionLocal()
        results = db.query(AnalysisResult).order_by(AnalysisResult.timestamp.desc()).limit(20).all()
        db.close()
        return [
            {
                "id": r.id,
                "timestamp": r.timestamp.isoformat(),
                "system_name": r.system_name,
                "risk_level": r.risk_level,
                "total_threats": r.total_threats,
                "data": r.raw_data
            } for r in results
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
