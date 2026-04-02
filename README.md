# LLM-Powered TARA Framework for Automotive & General System Security

This repository implements a research-grade Threat Analysis and Risk Assessment (TARA) platform, fully automating the ISO/SAE 21434 and STRIDE/EVITA methodologies using Large Language Models (LLMs) and Retrieval-Augmented Generation (RAG).

## Architecture
The framework abstracts the TARA workflow into isolated, deterministic pipeline stages:
1. **Asset Identification**: Extracts structured entity registries from unstructured texts/UML.
2. **Threat Modeling**: Employs Chain-of-Thought reasoning to map STRIDE & EVITA classifications.
3. **Attack Path Analysis**: Generates hierarchical Attack Trees and CVSS severity metrics.
4. **Risk Assessment**: Matrix-based evaluations (Impact x Likelihood) focused on automotive (SFOP) and privacy (LINDDUN) metrics grounded by a localized RAG vector database.
5. **Countermeasure Generation**: Context-aware mitigation mapping to standard frameworks (NIST CSF / GDPR).
6. **Report Generation**: Automatically builds PDF/Markdown compliance reports.

## Installation
```bash
chmod +x setup_env.sh
./setup_env.sh
cp .env.example .env
# Edit .env and supply your OPENAI_API_KEY
```

## Running the Dashboard
```bash
source tara_env/bin/activate
streamlit run app.py
```

## Evaluation Suite
The `evaluation/` directory holds benchmarks for Threat Coverage Rate (TCR), Risk Score Consistency (RSC), and Mitigation Relevance Score (MRS).
```bash
pytest evaluation/
```
