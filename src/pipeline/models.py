from sqlalchemy import create_all, Column, Integer, String, DateTime, JSON, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
import datetime
import os

# Database URL - uses SQLite locally, can be swapped for PostgreSQL via env var
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./tara_results.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    system_name = Column(String)
    risk_level = Column(String)
    total_threats = Column(Integer)
    system_design = Column(Text)
    risk_rubric = Column(Text)
    raw_data = Column(JSON)  # Stores the full JSON response from the orchestrator

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
