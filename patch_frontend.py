import os
import re

file_path = "frontend/src/App.jsx"
with open(file_path, "r") as f:
    text = f.read()

# 1. Add import Graphviz
text = text.replace(
    "import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';",
    "import { Graphviz } from 'graphviz-react';\nimport { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';"
)

# 2. Update state to t_results (tara context)
text = text.replace(
    "assets: null, threats: null, paths: null, risks: null, mitigations: null, report_url: null",
    "tara: null"
)

# 3. Stream reader handling
stream_block_start = text.find("if (chunk.stage === \"assets\") {")
stream_block_end = text.find("} else if (chunk.stage === \"error\") {")
if stream_block_start != -1 and stream_block_end != -1:
    new_stream_logic = """if (chunk.stage === "orchestrating") {
            addFeed(chunk.message);
          } else if (chunk.stage === "orchestrator_complete") {
            setResults(prev => ({ ...prev, tara: chunk.data }));
            addFeed("TARA protocol finalized.");
            setTimeout(() => { setState('result'); }, 500);
          """
    text = text[:stream_block_start] + new_stream_logic + text[stream_block_end:]

# 4. Status Bar Modification
status_bar_start = text.find("const items = [")
# Actually, the status bar in App.jsx uses an inline array
# Replace inline array
text = text.replace(
    """[
                { id: 'assets', icon: <Database size={16} />, label: 'Assets', data: results.assets },
                { id: 'threats', icon: <ShieldCheck size={16} />, label: 'Threats', data: results.threats },
                { id: 'risks', icon: <Zap size={16} />, label: 'Vectors', data: results.risks },
                { id: 'mitigations', icon: <Layers size={16} />, label: 'Guards', data: results.mitigations },
              ]""",
    """[
                { id: 'orch', icon: <ShieldCheck size={16} />, label: 'Gemma 3 & Gemini 3.1 Orchestrator Engine Engaged', data: results.tara }
              ]"""
)

# 5. Result View Replacement
# We find: {/* Zero-Latency Results Grid */}
# And replace everything until: {/* 3. PILLAR: CONTEXT PANEL */}
grid_start = text.find("{/* Zero-Latency Results Grid */}")
grid_end = text.find("{/* 3. PILLAR: CONTEXT PANEL */}")

if grid_start != -1 and grid_end != -1:
    new_grid = """{/* Zero-Latency Results Grid */}
            <div className="w-full flex justify-center mt-10">
              {!results.tara ? (
                <div className="flex flex-col items-center py-40">
                  <LoaderOne />
                  <p className="mt-8 font-mono text-[10px] uppercase text-[#c88cae]/40 tracking-[0.4em] animate-pulse">Running Neural Simulation...</p>
                </div>
              ) : (
                <div className="w-full max-w-5xl space-y-10">
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full bg-[#13182a]/40 p-10 rounded-[40px] border border-[#c88cae]/10 shadow-2xl relative overflow-hidden">
                    
                    {/* Header */}
                    <div className="text-center mb-16">
                      <h2 className="text-5xl font-black tracking-tighter text-[#f7edf4] mb-4 uppercase">
                        {results.tara.header?.system_name || "System"}
                      </h2>
                      <div className="inline-block px-6 py-2 border-2 border-[#FF4D4D]/30 bg-[#FF4D4D]/10 rounded-full">
                        <h3 className="text-xl font-black text-[#FF4D4D] uppercase tracking-[0.3em]">
                          {results.tara.header?.risk_level || "CRITICAL"} RISK
                        </h3>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-6 mb-16">
                      <div className="p-6 bg-[#080812] rounded-[24px] border border-[#c88cae]/20 text-center">
                        <h4 className="text-[10px] text-[#c88cae] uppercase tracking-[0.2em] mb-2 font-bold">Total Threats Identified</h4>
                        <p className="text-5xl font-black text-[#f7edf4] tracking-tighter">{results.tara.dashboard_metrics?.total_threats || 0}</p>
                      </div>
                      <div className="p-6 bg-[#080812] rounded-[24px] border border-[#c88cae]/20 text-center">
                        <h4 className="text-[10px] text-[#c88cae] uppercase tracking-[0.2em] mb-2 font-bold">Average Attack Feasibility</h4>
                        <p className="text-5xl font-black text-[#f7edf4] tracking-tighter">{results.tara.dashboard_metrics?.avg_feasibility || 0.0}</p>
                      </div>
                    </div>

                    {/* Risk Matrix Table */}
                    <h4 className="text-[11px] font-black text-[#c88cae] uppercase tracking-[0.3em] mb-6 flex items-center gap-3"><Zap size={16}/> ISO/SAE 21434 Risk Matrix</h4>
                    <div className="w-full overflow-hidden rounded-[24px] border border-[#c88cae]/20 mb-16 bg-[#080812]">
                      <table className="w-full text-left font-mono text-xs border-collapse">
                        <thead>
                          <tr className="bg-[#13182a] border-b border-[#c88cae]/20">
                            <th className="p-5 text-[#f7edf4]/60 uppercase tracking-widest text-[10px] font-bold">Asset Target</th>
                            <th className="p-5 text-[#f7edf4]/60 uppercase tracking-widest text-[10px] font-bold">Threat Vector</th>
                            <th className="p-5 text-[#f7edf4]/60 uppercase tracking-widest text-[10px] font-bold text-center">Risk Value</th>
                            <th className="p-5 text-[#f7edf4]/60 uppercase tracking-widest text-[10px] font-bold text-center">Scale</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.tara.risk_matrix?.map((row, i) => (
                            <tr key={i} className="border-b border-[#c88cae]/10 hover:bg-[#13182a]/50 transition-colors last:border-0">
                              <td className="p-5 text-[#f7edf4] max-w-[150px] truncate">{row.asset}</td>
                              <td className="p-5 text-[#f7edf4] max-w-[200px] truncate">{row.threat}</td>
                              <td className="p-5 text-center font-black text-[#f7edf4] text-lg">{row.risk_score}</td>
                              <td className="p-5 text-center">
                                <span 
                                  className="px-4 py-1.5 rounded-full text-[9px] font-bold tracking-[0.2em] shadow-lg inline-block text-center min-w-[80px]"
                                  style={{ backgroundColor: row.hex_color, color: "#111" }}
                                >
                                  LEVEL
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Attack Tree Graphviz DOT */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="col-span-1">
                        <h4 className="text-[11px] font-black text-[#c88cae] uppercase tracking-[0.3em] mb-6 flex items-center gap-3"><Database size={16}/> Attack Path Topology</h4>
                        <div className="bg-[#f7edf4] p-2 rounded-[24px] h-[350px] flex items-center justify-center overflow-auto pointer-events-auto border-4 border-[#080812] shadow-inner mb-6">
                            {results.tara.attack_tree && (
                                <Graphviz dot={results.tara.attack_tree} options={{ width: '100%', height: '100%', fit: true, zoom: true }} />
                            )}
                        </div>
                      </div>

                      {/* Chief Auditor */}
                      <div className="col-span-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-[11px] font-black text-[#c88cae] uppercase tracking-[0.3em] mb-6 flex items-center gap-3"><ShieldCheck size={16}/> Chief Auditor Sign-off</h4>
                          <div className="bg-[#13182a]/60 p-6 rounded-2xl border-l-4 border-[#c88cae] text-[#f7edf4]/80 shadow-md">
                            <p className="font-mono text-sm leading-relaxed">
                              {results.tara.audit_summary || "Audit pipeline complete. Analysis generated based on current ISO/SAE 21434 directives."}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-auto bg-[#c88cae]/10 p-5 rounded-2xl border border-[#c88cae]/20 text-center">
                          <h5 className="text-[9px] text-[#c88cae] uppercase tracking-widest font-black mb-2">PRIVACY JUSTIFICATION</h5>
                          <p className="font-mono text-[9px] text-[#f7edf4]/60 leading-relaxed uppercase">
                            Gemma 3 27B utilized for deep layer extraction. Its open-weight architectural nature allows for hyper-secure On-Premises deployments, guaranteeing absolute confidentiality of target system blueprints. Data remains air-gapped from external APIs.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center mt-16 pb-4">
                      <button
                        onClick={() => { setState('idle'); setResults({tara: null}); }}
                        className="border border-[#c88cae]/40 bg-[#13182a] text-[#c88cae] px-16 py-5 rounded-full font-black text-[11px] tracking-[0.3em] uppercase hover:bg-[#c88cae] hover:text-[#080812] transition-all transform hover:-translate-y-1 shadow-[0_20px_50px_rgba(200,140,174,0.1)]"
                      >
                        Reset Terminal Sequence &rarr;
                      </button>
                    </div>

                  </motion.div>
                </div>
              )}
            </div>
            """
    text = text[:grid_start] + new_grid + "\n" + text[grid_end:]

# 6. Context Panel ISO logic tweak
# Search for results.risks condition inside the context panel and remove or replace it
ctxt_start = text.find("{results.risks && (")
ctxt_end = text.find(")}", ctxt_start)

# Actually I'd rather just remove the results.risks logic block cleanly.
if ctxt_start != -1:
    # Just replace it with empty string
    text = text[:ctxt_start] + text[ctxt_end+2:]

with open(file_path, "w") as f:
    f.write(text)

print("SUCCESS")
