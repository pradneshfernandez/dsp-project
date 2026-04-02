from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
import json
import os
import asyncio
import logging
from dotenv import load_dotenv
load_dotenv()

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

@app.get("/api")
async def root():
    return {"status": "operational", "message": "Streaming TARA API is live."}

async def tara_stream_generator(sys_content: str, rubric_content: str):
    """Generates TARA results with immediate async relay for Vercel."""
    queue = asyncio.Queue()

    def progress_callback(msg, progress):
        # Direct put since we are in the same loop now
        queue.put_nowait({"stage": "orchestrating", "message": f"[{progress}%] {msg}"})

    try:
        yield json.dumps({"stage": "init", "message": "Neural Lattice Engaged."}) + "\n"
        
        # Start the async orchestrator
        task = asyncio.create_task(run_parallel_orchestrator(sys_content, progress_callback))

        # Monitor queue and task status
        while not task.done() or not queue.empty():
            try:
                # Polling for progress updates
                if not queue.empty():
                    chunk = queue.get_nowait()
                    yield json.dumps(chunk) + "\n"
                await asyncio.sleep(0.1) # Yield control
            except Exception:
                break

        # Final result
        json_data = await task
        yield json.dumps({"stage": "orchestrator_complete", "data": json_data}) + "\n"

    except Exception as e:
        logger.error(f"Critical Stream Error: {str(e)}")
        yield json.dumps({"stage": "error", "detail": str(e)}) + "\n"

class TaraTextRequest(BaseModel):
    system_content: str
    rubric_content: str

@app.post("/api/analyze")
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

@app.post("/api/analyze_text")
async def analyze_system_text(request: TaraTextRequest):
    try:
        return StreamingResponse(
            tara_stream_generator(request.system_content, request.rubric_content),
            media_type="application/x-ndjson"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from src.pipeline.supabase_client import fetch_history as fetch_supabase_history

@app.get("/api/history")
async def get_history(db: Session = Depends(get_db)):
    """Fetches analysis history with deep diagnostic trace."""
    logger.info("🛰️ History Request Received.")
    try:
        # 1. Try Supabase first if configured
        supabase_key = os.getenv("SUPABASE_KEY")
        if supabase_key:
            logger.info("🔗 Attempting Supabase History Fetch...")
            data = fetch_supabase_history(limit=10)
            logger.info(f"✅ Supabase Fetch Success: {len(data) if data else 0} records.")
            return data
        
        # 2. Fallback to local SQLAlchemy/SQLite
        logger.info("🏠 Falling back to Local SQLite...")
        results = db.query(AnalysisResult).order_by(AnalysisResult.timestamp.desc()).limit(10).all()
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
        logger.error(f"❌ CRITICAL HISTORY ERROR: {str(e)}")
        # Return a safe empty list but log the hell out of it
        return []

from langchain_groq import ChatGroq

class ChatRequest(BaseModel):
    message: str
    context: dict

@app.post("/api/chat")
async def chat_with_analysis(request: ChatRequest):
    try:
        groq_key = os.getenv("GROQ_API_KEY")
        if not groq_key:
            raise HTTPException(status_code=500, detail="Groq API Key not configured.")

        llm = ChatGroq(
            groq_api_key=groq_key,
            model_name="llama-3.1-70b-versatile",
            temperature=0.2
        )

        # Prepare context summary
        tara = request.context
        system_name = tara.get("system_name", "Unknown System")
        threats_count = len(tara.get("risk_matrix", []))
        risk_level = tara.get("risk_level", "Unknown")
        
        system_prompt = f"""You are the TARA x01 Neural Intelligence, an automotive cybersecurity expert.
You are discussing a TARA (Threat Assessment and Remediation Analysis) for the system: {system_name}.
Current Security Posture:
- Risk Level: {risk_level}
- Total Threats Identified: {threats_count}

Context Data (JSON):
{json.dumps(tara, indent=2)}

Guidelines:
1. Provide concise, technical, and actionable security advice.
2. Focus on ISO/SAE 21434 compliance and automotive safety.
3. Be helpful but maintain a professional 'Cyber-Intelligence' tone.
"""

        messages = [
            ("system", system_prompt),
            ("human", request.message)
        ]

        response = await asyncio.to_thread(llm.invoke, messages)
        return {"response": response.content}

    except Exception as e:
        logger.error(f"Chat Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
