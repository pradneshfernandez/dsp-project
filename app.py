import streamlit as st
import pandas as pd
import json
import time
import plotly.express as px
import plotly.graph_objects as go

from src.pipeline.orchestrator import run_parallel_orchestrator

st.set_page_config(page_title="TARA x 01", page_icon="🛡️", layout="wide", initial_sidebar_state="collapsed")

# 1. THE CANVAS (Global Styling - Brutalism meets Luxury)
DESIGN_CSS = """
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700;900&family=Roboto+Mono:wght@400;500;700&display=swap');

/* Base Canvas */
.stApp {
    background-color: #F9F9F9;
    font-family: 'Inter', sans-serif;
    color: #111111;
}

/* Hide streamlit noise */
header {visibility: hidden;}
#MainMenu {visibility: hidden;}
footer {visibility: hidden;}
.st-emotion-cache-16txtl3 {padding: 0;}

/* Vertical Left Navigation */
.vertical-nav {
    position: fixed;
    top: 50%;
    left: -200px;
    transform: translateY(-50%) rotate(-90deg);
    font-family: 'Inter', sans-serif;
    font-weight: 900;
    font-size: 0.9rem;
    letter-spacing: 0.4rem;
    color: #DDDDDD;
    z-index: 100;
    text-transform: uppercase;
    white-space: nowrap;
}

.bottom-icons {
    position: fixed;
    bottom: 30px;
    left: 30px;
    display: flex;
    flex-direction: column;
    gap: 15px;
    opacity: 0.25;
}
.bottom-icons span {
    font-family: 'Roboto Mono', monospace;
    font-weight: 700;
    font-size: 0.7rem;
    writing-mode: vertical-rl;
    text-orientation: mixed;
    transform: rotate(180deg);
    cursor: default;
}

/* Right Context Panel (The Pop-up) */
.rag-feed {
    position: fixed;
    bottom: 40px;
    right: 40px;
    width: 380px;
    max-height: 450px;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(0,0,0,0.06);
    border-radius: 6px;
    padding: 28px;
    box-shadow: 0 30px 60px rgba(0,0,0,0.06);
    z-index: 999;
    overflow-y: hidden;
    display: flex;
    flex-direction: column;
}

.rag-feed p {
    font-family: 'Roboto Mono', monospace;
    font-size: 0.75rem;
    color: #666;
    line-height: 1.5;
    margin-bottom: 12px;
    border-left: 2px solid #EEE;
    padding-left: 12px;
    transition: all 0.3s ease;
}
.rag-feed p.active {
    border-left: 2px solid #FF007F;
    color: #111;
}

.rag-feed .title {
    font-family: 'Inter', sans-serif;
    font-weight: 900;
    text-transform: uppercase;
    font-size: 0.7rem;
    letter-spacing: 0.15em;
    color: #FF007F;
    margin-bottom: 20px;
}

/* Action Pink Native Buttons */
div.stButton > button {
    background-color: #FF007F !important;
    color: white !important;
    border: none !important;
    border-radius: 0px !important;
    padding: 1.2rem 3rem !important;
    font-family: 'Inter', sans-serif !important;
    font-weight: 900 !important;
    letter-spacing: 0.15em !important;
    text-transform: uppercase !important;
    font-size: 0.9rem !important;
    transition: all 0.3s ease !important;
    box-shadow: 0 10px 20px rgba(255,0,127,0.15) !important;
}
div.stButton > button:hover {
    background-color: #E60073 !important;
    transform: translateY(-2px) !important;
    box-shadow: 0 15px 30px rgba(255, 0, 127, 0.25) !important;
}

/* Massive Idle Text */
.idle-text {
    font-size: 11rem;
    font-weight: 900;
    color: #E6E6E6;
    text-align: center;
    margin-top: 15vh;
    letter-spacing: -0.06em;
    line-height: 0.8;
}
.idle-text span {
    color: #FF007F;
}
.idle-sub {
    text-align: center;
    font-family: 'Roboto Mono', monospace;
    font-weight: 700;
    font-size: 0.85rem;
    color: #777;
    margin-top: 1.5rem;
    letter-spacing: 0.15em;
}

/* Glassmorphism Blob Container */
.blob-container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 650px;
    height: 650px;
    z-index: 0;
    pointer-events: none;
}
.blob {
    position: absolute;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(255,0,127,0.06) 0%, rgba(249,249,249,0) 65%);
    border-radius: 50%;
    animation: blobPulse 5s infinite alternate ease-in-out;
}
@keyframes blobPulse {
    0% { transform: scale(0.9) translate(15px, 15px); opacity: 0.7; }
    100% { transform: scale(1.1) translate(-15px, -15px); opacity: 1; }
}

/* Standard-Aware Text */
.iso-evidence {
    font-family: 'Roboto Mono', monospace;
    font-size: 0.75rem;
    color: #FF007F;
    background: rgba(255,0,127,0.05);
    padding: 3px 8px;
    border-radius: 3px;
    font-weight: 700;
}

/* Chart Container */
.chart-wrapper {
    position: relative;
    z-index: 10;
    height: 60vh;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 2vh;
}
</style>
"""
st.markdown(DESIGN_CSS, unsafe_allow_html=True)

# Fixed Decors
st.markdown('<div class="vertical-nav">iso/sae 21434 x automated pipeline</div>', unsafe_allow_html=True)
st.markdown('<div class="bottom-icons"><span>[ UN R155 ]</span><span>[ NIST CSF ]</span><span>[ EVITA ]</span></div>', unsafe_allow_html=True)

# State Management
if "tara_state" not in st.session_state:
    st.session_state.tara_state = "idle"  # idle | analyzing | result
if "rag_feed" not in st.session_state:
    st.session_state.rag_feed = []

def display_rag_feed(state="analyzing"):
    html = '<div class="rag-feed"><div class="title">Regulatory Grounding & Multi-Agent feed</div>'
    if state == "analyzing":
        sliced = st.session_state.rag_feed[-5:]
        for i, msg in enumerate(sliced):
            c_class = "active" if i == len(sliced)-1 else ""
            html += f'<p class="{c_class}">> {msg}</p>'
    elif state == "result" and "tara_json" in st.session_state:
        # Show top risk from JSON
        rm = st.session_state.tara_json.get("risk_matrix", [])
        if rm:
            top = sorted(rm, key=lambda x: x.get("risk_score", 0), reverse=True)[0]
            html += f'<p class="active" style="color:{top.get("hex_color", "#FF007F")}; font-weight:700;">CRITICAL RISK: <br>{top.get("threat", "Unknown")}</p>'
            html += f'<p class="iso-evidence">Asset: {top.get("asset", "Unknown")} | Risk Score: {top.get("risk_score", 0)}</p>'
            html += '<div style="margin-top:20px; display:flex; gap:10px;">'
            html += '<button style="background:#111; color:white; border:none; padding:12px 18px; font-family:Inter; font-weight:900; font-size:11px; cursor:pointer;">ACCEPT RISK</button>'
            html += '<button style="background:transparent; color:#FF007F; border:1px solid #FF007F; padding:12px 18px; font-family:Inter; font-weight:900; font-size:11px; cursor:pointer; letter-spacing:0.1em;">MITIGATE</button>'
            html += '</div>'
        else:
            html += '<p>No vulnerabilities identified.</p>'
        
        # Privacy Justification
        html += f'<p style="margin-top: 15px; font-size:0.65rem; color:#888;"><b>Privacy Justification:</b> Gemma 3 was utilized for this analysis. Its open-weight nature allows for On-Premises deployment, ensuring your blueprints never leave the secure network.</p>'
        
    html += '</div>'
    st.markdown(html, unsafe_allow_html=True)

# --- IDLE STATE ---
if st.session_state.tara_state == "idle":
    st.markdown('<div class="idle-text">tara<br><span>x</span> 01</div>', unsafe_allow_html=True)
    st.markdown('<div class="idle-sub">STANDARDIZED RISK ASSESSMENT VIA RAG</div><br><br>', unsafe_allow_html=True)
    
    col_l, col_c, col_r = st.columns([3, 4, 3])
    with col_c:
        st.markdown("<p style='font-family:Roboto Mono; font-size:0.8rem; text-align:center; color:#888; margin-bottom:10px;'>UPLOAD ARCHITECTURE TOPOLOGY</p>", unsafe_allow_html=True)
        uploaded_sys = st.file_uploader("Sys_md", label_visibility="collapsed")
        st.markdown("<p style='font-family:Roboto Mono; font-size:0.8rem; text-align:center; color:#888; margin-top:20px; margin-bottom:10px;'>UPLOAD RISK RUBRIC PARAMETERS</p>", unsafe_allow_html=True)
        uploaded_rubric = st.file_uploader("Rubric_md", label_visibility="collapsed")
        
        st.write("")
        c1, c2, c3 = st.columns([1,1.5,1])
        with c2:
            if st.button("RUN PIPELINE"):
                if uploaded_sys and uploaded_rubric:
                    st.session_state.sys_content = uploaded_sys.read().decode('utf-8')
                    st.session_state.rubric_content = uploaded_rubric.read().decode('utf-8')
                    st.session_state.tara_state = "analyzing"
                    st.session_state.rag_feed = []
                    st.rerun()

# --- ANALYZING STATE ---
elif st.session_state.tara_state == "analyzing":
    st.markdown('<div class="blob-container"><div class="blob"></div></div>', unsafe_allow_html=True)
    st.markdown("<h1 style='text-align: center; margin-top:20vh; font-size:3rem; letter-spacing: -0.05em; color:#222;'>Analyzing Topology</h1>", unsafe_allow_html=True)
    
    col_x, col_prog, col_y = st.columns([3, 4, 3])
    with col_prog:
        prog_bar = st.progress(0, text="")
    
    feed_holder = st.empty()
    
    def update_feed(msg, val):
        st.session_state.rag_feed.append(msg)
        html = '<div class="rag-feed"><div class="title">RAG & CoT Feed</div>'
        for i, m in enumerate(st.session_state.rag_feed[-5:]):
            c = "active" if i == len(st.session_state.rag_feed[-5:])-1 else ""
            html += f'<p class="{c}">> {m}</p>'
        html += '</div>'
        feed_holder.markdown(html, unsafe_allow_html=True)
        prog_bar.progress(val)

    try:
        def orchestrator_callback(msg, val):
            update_feed(msg, val)
            
        json_data = run_parallel_orchestrator(st.session_state.sys_content, progress_callback=orchestrator_callback)
        st.session_state.tara_json = json_data
        
        update_feed("Finalizing Multi-Agent Output Geometry...", 100)
        time.sleep(1.0)
        st.session_state.tara_state = "result"
        st.rerun()
        
    except Exception as e:
        feed_holder.error(f"Critical Backend Failure: {e}")
        if st.button("RESET SESSION"):
            st.session_state.tara_state = "idle"
            st.rerun()

# --- RESULT STATE ---
elif st.session_state.tara_state == "result":
    tara_json = st.session_state.tara_json
    header = tara_json.get("header", {})
    sys_name = header.get("system_name", "UNKNOWN")
    risk_level = header.get("risk_level", "UNKNOWN")
    
    st.markdown(f'<div class="idle-text" style="font-size:4rem; margin-top:3vh; line-height: 1.1;">{sys_name}<br><span style="font-size:2.5rem; color:#FF4D4D;">{risk_level}</span> RISK</div>', unsafe_allow_html=True)
    st.markdown('<div class="blob-container"><div class="blob"></div></div>', unsafe_allow_html=True)
    
    col_l, col_c, col_r = st.columns([1, 4, 1])
    with col_c:
        st.markdown('<div class="chart-wrapper" style="height: auto; padding: 20px; background: rgba(255,255,255,0.7); backdrop-filter: blur(10px); border-radius: 8px;">', unsafe_allow_html=True)
        
        # Dashboard Metrics
        metrics = tara_json.get("dashboard_metrics", {})
        m1, m2 = st.columns(2)
        m1.metric("Total Threats", metrics.get("total_threats", 0))
        m2.metric("Avg Feasibility", metrics.get("avg_feasibility", 0.0))
        
        st.markdown("### ISO/SAE 21434 Risk Matrix")
        rm = tara_json.get("risk_matrix", [])
        if rm:
            # Reconstruct HTML table with styled spans
            html_table = "<table style='width:100%; text-align:left; border-collapse: collapse; font-family: Inter; margin-bottom: 30px;'>"
            html_table += "<tr style='border-bottom: 2px solid #ddd;'><th>Asset</th><th>Threat</th><th>Risk Score</th><th>Risk Level</th></tr>"
            for row in rm:
                color = row.get("hex_color", "#888")
                # Ensure contrast for text based on background brightness
                text_color = "black" if color.upper() in ["#FFFF66", "#99FF99"] else "white"
                html_table += f"<tr style='border-bottom: 1px solid #eee;'>"
                html_table += f"<td style='padding:8px;'>{row.get('asset', '')}</td>"
                html_table += f"<td style='padding:8px;'>{row.get('threat', '')}</td>"
                html_table += f"<td style='padding:8px;'>{row.get('risk_score', '')}</td>"
                html_table += f"<td style='padding:8px;'><span style='background-color: {color}; color: {text_color}; padding: 4px 8px; border-radius: 4px; font-weight: bold;'>Level</span></td>"
                html_table += "</tr>"
            html_table += "</table>"
            st.markdown(html_table, unsafe_allow_html=True)
            
        st.markdown("### Attack Tree Analysis")
        dot_code = tara_json.get("attack_tree", "digraph G {}")
        st.graphviz_chart(dot_code)
        
        st.markdown("### Chief Auditor Sign-Off")
        st.info(tara_json.get("audit_summary", "Review completed."))
        
        st.markdown('</div>', unsafe_allow_html=True)
        
        c1, c2, c3 = st.columns([1,1,1])
        with c2:
            if st.button("NEW ANALYSIS"):
                st.session_state.tara_state = "idle"
                st.session_state.rag_feed = []
                st.rerun()

    display_rag_feed("result")
