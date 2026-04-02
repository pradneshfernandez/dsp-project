import sys

with open("app.py", "r") as f:
    text = f.read()

# Replace Imports
old_imports = """
from src.pipeline.asset_extraction import extract_assets
from src.pipeline.threat_modeling import generate_threats
from src.pipeline.attack_path import generate_attack_paths
from src.pipeline.risk_assessment import evaluate_risks
from src.pipeline.countermeasure import propose_mitigations
from src.pipeline.report_generator import ReportGenerator
""".strip()

new_imports = "from src.pipeline.orchestrator import run_parallel_orchestrator"

text = text.replace(old_imports, new_imports)

# Replace display_rag_feed
import re
rag_feed_start = text.find("def display_rag_feed(state=\"analyzing\"):")
rag_feed_end = text.find("# --- IDLE STATE ---", rag_feed_start)
if rag_feed_start != -1 and rag_feed_end != -1:
    new_rag_feed = """def display_rag_feed(state="analyzing"):
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
"""
    text = text[:rag_feed_start] + new_rag_feed + "\n" + text[rag_feed_end:]

# Replace try/except block in ANALYZING STATE
analyzing_start = text.find("    try:\n        update_feed(\"Parsing ECU Boundaries [ISO Clause 15]\", 15)")
analyzing_end = text.find("# --- RESULT STATE ---", analyzing_start)

if analyzing_start != -1 and analyzing_end != -1:
    new_analyzing = """    try:
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

"""
    text = text[:analyzing_start] + new_analyzing + text[analyzing_end:]

# Replace RESULT STATE rendering
result_state_start = text.find("elif st.session_state.tara_state == \"result\":")
if result_state_start != -1:
    new_result_state = """elif st.session_state.tara_state == "result":
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
"""
    text = text[:result_state_start] + new_result_state

with open("app.py", "w") as f:
    f.write(text)

print("SUCCESS: Modified app.py")
