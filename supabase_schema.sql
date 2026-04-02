-- TARA x 01: Supabase Database Schema
-- Run this in the Supabase SQL Editor (SQL Web Interface)

CREATE TABLE IF NOT EXISTS analysis_results (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    system_name TEXT,
    risk_level TEXT,
    total_threats INTEGER,
    system_design TEXT,
    risk_rubric TEXT,
    raw_data JSONB
);

-- Enable Realtime (optional, for future upgrades)
ALTER TABLE analysis_results REPLICA IDENTITY FULL;
