import os
from supabase import create_client, Client
from dotenv import load_dotenv
load_dotenv()

url: str = os.getenv("SUPABASE_URL", "")
key: str = os.getenv("SUPABASE_KEY", "")

supabase: Client = None
if url and key:
    supabase = create_client(url, key)

def save_analysis(data: dict):
    if not supabase:
        return None
    
    # Matching the schema from models.py
    response = supabase.table("analysis_results").insert({
        "system_name": data.get("system_name"),
        "risk_level": data.get("risk_level"),
        "total_threats": data.get("total_threats"),
        "system_design": data.get("system_design"),
        "risk_rubric": data.get("risk_rubric"),
        "raw_data": data.get("raw_data")
    }).execute()
    return response.data

def fetch_history(limit: int = 10):
    if not supabase:
        return []
    
    response = supabase.table("analysis_results") \
        .select("*") \
        .order("timestamp", desc=True) \
        .limit(limit) \
        .execute()
    return response.data
