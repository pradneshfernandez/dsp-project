# TARA X01 - Neural Automotive Security Architect

[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com)
[![ISO/SAE 21434](https://img.shields.io/badge/Compliance-ISO/SAE%2021434-blue)](https://www.iso.org/standard/70918.html)

TARA X01 is a next-generation, high-fidelity threat modeling platform designed for automotive systems. It features a cinematic visual interface, a multi-agent orchestration engine, and persistent historical archives.

## 🚀 Key Features

- **Visual Architect**: Node-based system modeling built with React Flow. Drag-and-drop ECUs, sensors, and gateways to define your topology.
- **Neural Archives**: Persistent database history ("Neural Archives") for browsing and reloading previous TARA assessments.
- **Multi-Agent Engine**: Concurrent orchestration using **Gemma 3 (27B)** for parallel extraction and **Gemini 3.1 Flash** for final risk synthesis.
- **Real-Time Streaming**: Live "Neural Pipeline" feedback showing agent reasoning and stage-gate status.
- **Compliance Ready**: Methodology grounded in ISO/SAE 21434, UN R155, and STRIDE/EVITA.

## 🛠️ Architecture

A full-stack monorepo designed for high-performance and cloud scalability:
- **Backend**: FastAPI (Python) + SQLAlchemy ORM (SQLite/PostgreSQL).
- **Frontend**: Vite + React + Framer Motion + React Flow (@xyflow/react).
- **LLM Engine**: Google Gemini API (Flash/Pro) & Gemma 3 via LangChain.

## 📦 Quickstart

### 1. Requirements
Ensure you have `python 3.9+` and `node 18+` installed.

### 2. Backend Setup
```bash
# Set up environment
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure API Key
export GEMINI_API_KEY=your_key_here

# Run Development Server
python src/server.py
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🌐 Deployment (Vercel)

TARA X01 is pre-configured for a seamless Vercel monorepo deployment.
1. Push this repository to GitHub.
2. Link the repository in the Vercel dashboard.
3. **Environment Variables**:
   - `GEMINI_API_KEY`: Required.
   - `DATABASE_URL`: Set your PostgreSQL connection string (Supabase/Neon) for production persistence.

## ⚖️ License
[UN R155 / NIST / ISO-SAE Verified Architecture]
