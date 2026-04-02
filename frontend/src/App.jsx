import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Activity, ChevronRight, AlertCircle, Database, ShieldCheck, Zap, Layers, Cpu, Edit3, History, FileText, X } from 'lucide-react';
import { Graphviz } from 'graphviz-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { ReactFlow, Background, Controls, useNodesState, useEdgesState, addEdge, Panel, MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { EncryptedText } from './components/ui/encrypted-text';
import { NoiseBackground } from './components/ui/noise-background';
import { WavyBackground } from './components/ui/wavy-background';
import { LoaderOne } from './components/ui/loader';
import { Cover } from './components/ui/cover';

const API_BASE = '/api';

const App = () => {
  const [view, setView] = useState('landing'); // landing | hub | designer | processing | result
  const [ragFeed, setRagFeed] = useState([]);
  const [results, setResults] = useState({ tara: null });
  const [error, setError] = useState(null);
  const [systemText, setSystemText] = useState(`## Automotive Gateway System Design
- **Architecture**: Dual-core ARM Cortex-R52
- **Interfaces**: 4x CAN-FD, 2x Gigabit Ethernet
- **Function**: Secure storage of cryptographic keys and routing of safety-critical data.`);
  const [rubricText, setRubricText] = useState(`## ISO 21434 Risk Rubric
- **Impact**: S: Safety, O: Operational, F: Financial, P: Privacy
- **Feasibility**: High, Medium, Low, Very Low
- **Risk Calculation**: Impact x Feasibility`);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const feedRef = useRef(null);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [ragFeed]);

  const fetchHistory = async () => {
    try {
      const resp = await fetch(`${API_BASE}/history`);
      const data = await resp.json();
      setHistory(data);
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const addFeed = (msg) => {
    setRagFeed(prev => [...prev.slice(-15), msg]);
  };

  const onConnect = (params) => setEdges((eds) => addEdge({ ...params, markerEnd: { type: MarkerType.ArrowClosed, color: '#c88cae' }, style: { stroke: '#c88cae' } }, eds));

  // --- SERIALIZATION ---
  const serializeTopology = () => {
    let markdown = "## Automotive System Topology\n";
    nodes.forEach(node => {
      markdown += `- **${node.data.label}** (${node.type.toUpperCase()}): located at [${Math.round(node.position.x)}, ${Math.round(node.position.y)}].\n`;
    });
    markdown += "\n## Communication Pathways\n";
    edges.forEach(edge => {
      const source = nodes.find(n => n.id === edge.source);
      const target = nodes.find(n => n.id === edge.target);
      if (source && target) {
        markdown += `- ${source.data.label} → ${target.data.label} (Safety-Critical Path)\n`;
      }
    });
    return markdown;
  };

  const handleRun = async () => {
    setError(null);
    setView('processing');
    setRagFeed([]);
    setResults({ tara: null });

    const finalSysContent = view === 'designer' ? serializeTopology() : systemText;

    try {
      addFeed("Engaging Deep-Cyber Warp-Stream...");
      const response = await fetch(`${API_BASE}/analyze_text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_content: finalSysContent,
          rubric_content: rubricText,
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop();
        for (const line of lines) {
          if (!line.trim()) continue;
          const chunk = JSON.parse(line);
          if (chunk.stage === "orchestrating") {
            addFeed(chunk.message);
          } else if (chunk.stage === "orchestrator_complete") {
            setResults(prev => ({ ...prev, tara: chunk.data }));
            addFeed("TARA protocol finalized.");
            fetchHistory();
            setTimeout(() => { setView('result'); }, 500);
          } else if (chunk.stage === "error") {
            setError(chunk.detail);
            setView('hub');
          }
        }
      }
    } catch (err) {
      setError(err.message);
      setView('hub');
    }
  };

  const addNode = (type) => {
    const id = `${type}-${Date.now()}`;
    const newNode = {
      id,
      type,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { label: `${type.toUpperCase()} ${nodes.length + 1}` },
      style: { background: '#13182a', color: '#f7edf4', border: '1px solid #c88cae44', borderRadius: '12px', fontSize: '10px', padding: '10px', fontWeight: 'bold' }
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const onNodeDoubleClick = (_, node) => {
    const newLabel = prompt('Enter new label:', node.data.label);
    if (newLabel) {
      setNodes((nds) =>
        nds.map((n) => (n.id === node.id ? { ...n, data: { ...n.data, label: newLabel } } : n))
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#080812] text-[#f7edf4] font-sans antialiased overflow-hidden relative selection:bg-[#c88cae] selection:text-[#080812] custom-scrollbar">

      {/* 0. HISTORY SIDEBAR */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            className="fixed inset-y-0 left-0 w-80 bg-[#13182a] border-r border-[#c88cae]/20 z-[200] p-8 overflow-y-auto custom-scrollbar shadow-2xl"
          >
            <div className="flex justify-between items-center mb-10">
              <h3 className="font-black text-sm tracking-[0.2em] uppercase text-[#c88cae] flex items-center gap-3">
                <History size={16} /> Neural Archives
              </h3>
              <button onClick={() => setShowHistory(false)} className="text-[#f7edf4]/40 hover:text-[#c88cae]">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => { setResults({ tara: item.data }); setView('result'); setShowHistory(false); }}
                  className="p-4 bg-[#080812] border border-[#c88cae]/10 rounded-2xl hover:border-[#c88cae]/40 transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-mono text-[#c88cae] uppercase tracking-widest">{new Date(item.timestamp).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-xs font-bold text-[#f7edf4] truncate">{item.system_name}</h4>
                  <div className="mt-2 text-[9px] text-[#f7edf4]/40 font-mono italic">{item.total_threats} Threats Mapping</div>
                </div>
              ))}
              {history.length === 0 && <p className="text-[10px] text-[#f7edf4]/20 text-center py-20 font-mono">Archive Empty.</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">

        {/* VIEW 1: LANDING */}
        {view === 'landing' && (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="h-screen w-full">
            <WavyBackground containerClassName="h-screen">
              <div className="text-center">
                <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-[12rem] font-black tracking-tighter leading-none mb-4">
                  TARA<span className="text-[#c88cae]">X</span><Cover>01</Cover>
                </motion.h1>
                <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="font-mono text-xs text-[#c88cae]/60 tracking-[0.5em] uppercase mb-16">
                  Next-Gen ISO 21434 Neural Engineering
                </motion.p>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                  <NoiseBackground containerClassName="p-1 rounded-full inline-block" gradientColors={["#4b2741", "#c88cae", "#4b2741"]}>
                    <button onClick={() => setView('hub')} className="px-20 py-8 bg-[#080812] rounded-full text-[#f7edf4] font-black tracking-[0.3em] uppercase hover:scale-105 active:scale-95 transition-all group">
                      Initialize Pipeline <span className="group-hover:translate-x-2 inline-block transition-transform">&rarr;</span>
                    </button>
                  </NoiseBackground>
                </motion.div>
              </div>
            </WavyBackground>
          </motion.div>
        )}

        {/* VIEW 2: HUB */}
        {view === 'hub' && (
          <motion.div key="hub" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="h-screen w-full flex flex-col items-center justify-center p-20 relative z-10">
            <h2 className="text-4xl font-black tracking-tighter mb-20 uppercase">Command Center</h2>
            <div className="grid grid-cols-2 gap-10 w-full max-w-5xl">
              <div onClick={() => { fetchHistory(); setShowHistory(true); }} className="group relative bg-[#13182a] border border-[#c88cae]/10 rounded-[40px] p-12 cursor-pointer hover:border-[#c88cae]/60 transition-all overflow-hidden h-[400px] flex flex-col justify-end">
                <div className="absolute top-10 right-10 text-[#c88cae]/20 group-hover:text-[#c88cae]/40 transition-colors"><History size={80} strokeWidth={1} /></div>
                <h3 className="text-3xl font-black mb-4">Neural Archives</h3>
                <p className="text-[#f7edf4]/40 font-mono text-xs uppercase tracking-widest leading-relaxed">Access previously generated automotive threat landscapes and audit trails.</p>
              </div>
              <div onClick={() => setView('designer')} className="group relative bg-[#13182a] border border-[#c88cae]/10 rounded-[40px] p-12 cursor-pointer hover:border-[#c88cae]/60 transition-all overflow-hidden h-[400px] flex flex-col justify-end">
                <div className="absolute top-10 right-10 text-[#c88cae]/20 group-hover:text-[#c88cae]/40 transition-colors"><Zap size={80} strokeWidth={1} /></div>
                <h3 className="text-3xl font-black mb-4">Quantum Analysis</h3>
                <p className="text-[#f7edf4]/40 font-mono text-xs uppercase tracking-widest leading-relaxed">Initiate a fresh ISO 21434 analysis using the multi-agent visual architect.</p>
              </div>
            </div>
            <button onClick={() => setView('landing')} className="mt-20 text-[10px] font-mono uppercase tracking-[0.4em] text-[#c88cae]/40 hover:text-[#c88cae] transition-colors">&larr; Back to Terminus</button>
          </motion.div>
        )}

        {/* VIEW 3: DESIGNER */}
        {view === 'designer' && (
          <motion.div key="designer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-screen w-full flex flex-col pt-10">
            <div className="px-10 flex justify-between items-center mb-6">
              <h3 className="text-xl font-black tracking-tighter uppercase flex items-center gap-3"><Edit3 size={20} className="text-[#c88cae]" /> Visual Architect</h3>
              <div className="flex gap-4">
                <button onClick={() => setView('hub')} className="px-6 py-2 border border-[#c88cae]/20 rounded-full text-[10px] font-bold uppercase tracking-widest">Cancel</button>
                <button onClick={handleRun} className="px-8 py-2 bg-[#c88cae] text-[#080812] rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">Engage pipeline &rarr;</button>
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Toolbox */}
              <div className="w-64 bg-[#13182a] border-r border-[#c88cae]/10 p-6 flex flex-col gap-4">
                <p className="text-[9px] font-mono uppercase tracking-widest text-[#c88cae] mb-4">Neural Assets</p>
                {[
                  { type: 'ecu', icon: <Cpu size={14} />, label: 'Electronic Control Unit' },
                  { type: 'gateway', icon: <Layers size={14} />, label: 'Security Gateway' },
                  { type: 'sensor', icon: <Zap size={14} />, label: 'Sensor Cluster' },
                  { type: 'actuator', icon: <Activity size={14} />, label: 'Braking Actuator' }
                ].map(item => (
                  <button key={item.type} onClick={() => addNode(item.type)} className="flex items-center gap-4 p-4 bg-[#080812] border border-[#c88cae]/10 rounded-2xl hover:border-[#c88cae] transition-all text-left group">
                    <span className="text-[#c88cae]/40 group-hover:text-[#c88cae]">{item.icon}</span>
                    <span className="text-[10px] font-bold uppercase tracking-tight">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Canvas */}
              <div className="flex-1 relative bg-[#080812] flex flex-col">
                <div className="flex-1 relative">
                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeDoubleClick={onNodeDoubleClick}
                    fitView
                  >
                    <Background color="#c88cae" gap={40} size={1} opacity={0.05} />
                    <Controls className="!bg-[#13182a] !border-[#c88cae]/20 !fill-[#f7edf4]" />
                    <Panel position="top-right" className="bg-[#13182a]/80 p-4 rounded-xl border border-[#c88cae]/10 text-[9px] font-mono text-[#f7edf4]/60 uppercase tracking-widest backdrop-blur-md">
                      Drag nodes to connect &bull; Double click to edit
                    </Panel>
                  </ReactFlow>
                </div>

                {/* Rubric Quick Config */}
                <div className="h-48 bg-[#13182a] border-t border-[#c88cae]/10 p-6 flex flex-col overflow-hidden">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-[9px] font-mono uppercase tracking-widest text-[#c88cae]">Risk Rubric Parameters</p>
                    <Zap size={12} className="text-[#c88cae]/40" />
                  </div>
                  <textarea
                    value={rubricText}
                    onChange={(e) => setRubricText(e.target.value)}
                    className="flex-1 bg-[#080812] border border-[#c88cae]/10 rounded-xl p-4 text-[10px] font-mono text-[#f7edf4]/60 outline-none focus:border-[#c88cae]/40 transition-all resize-none custom-scrollbar"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW 4: PROCESSING */}
        {view === 'processing' && (
          <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-screen w-full flex flex-col items-center justify-center">
            <LoaderOne />
            <div className="mt-12 text-center">
              <p className="font-mono text-[10px] uppercase text-[#c88cae] tracking-[0.5em] animate-pulse mb-8">Neural Simulation in Progress...</p>
              <div className="w-80 h-1 bg-[#13182a] rounded-full overflow-hidden">
                <motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="w-full h-full bg-[#c88cae]" />
              </div>
            </div>
            {/* Feed */}
            <div className="mt-20 w-full max-w-md space-y-4">
              {ragFeed.slice(-3).map((msg, i) => (
                <div key={i} className="flex gap-4 items-center opacity-40">
                  <ChevronRight size={14} className="text-[#c88cae]" />
                  <p className="font-mono text-[10px] uppercase font-bold tracking-tight">{msg}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* VIEW 5: RESULT */}
        {view === 'result' && results.tara && (
          <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="min-h-screen w-full flex flex-col items-center px-10 pt-20 pb-40 overflow-y-auto">
            <div className="w-full max-w-5xl">
              <div className="mb-10 flex justify-between items-center">
                <button onClick={() => setView('hub')} className="text-[10px] font-mono text-[#c88cae]/40 hover:text-[#c88cae] uppercase tracking-[0.3em]">&larr; Cluster Overview</button>
                <div className="text-right">
                  <p className="text-[10px] font-mono text-[#c88cae] uppercase tracking-[0.3em]">{new Date().toLocaleTimeString()}</p>
                </div>
              </div>

              <div className="bg-[#13182a]/40 p-16 rounded-[60px] border border-[#c88cae]/10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                {/* Decorative */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#c88cae]/[0.02] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

                {/* Header */}
                <div className="text-center mb-20">
                  <span className="text-[10px] font-mono text-[#c88cae] uppercase tracking-[0.6em] mb-4 block">Audit Response Verified</span>
                  <h2 className="text-7xl font-black tracking-tighter text-[#f7edf4] mb-6 uppercase">
                    {results.tara.header?.system_name || "Neural Topology"}
                  </h2>
                  <div className="inline-flex items-center gap-4 px-10 py-3 border-2 border-[#FF4D4D]/30 bg-[#FF4D4D]/10 rounded-full">
                    <ShieldCheck size={20} className="text-[#FF4D4D]" />
                    <h3 className="text-2xl font-black text-[#FF4D4D] uppercase tracking-[0.2em]">
                      {results.tara.header?.risk_level || "CRITICAL"}
                    </h3>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-8 mb-20">
                  <div className="p-10 bg-[#080812]/60 rounded-[40px] border border-[#c88cae]/20 text-center group">
                    <h4 className="text-[10px] text-[#c88cae] uppercase tracking-[0.3em] mb-4 font-bold opacity-60 group-hover:opacity-100 transition-opacity">Threat Vectors Identified</h4>
                    <p className="text-7xl font-black text-[#f7edf4] tracking-tighter">{results.tara.dashboard_metrics?.total_threats || 0}</p>
                  </div>
                  <div className="p-10 bg-[#080812]/60 rounded-[40px] border border-[#c88cae]/20 text-center group">
                    <h4 className="text-[10px] text-[#c88cae] uppercase tracking-[0.3em] mb-4 font-bold opacity-60 group-hover:opacity-100 transition-opacity">Feasibility Probability</h4>
                    <p className="text-7xl font-black text-[#f7edf4] tracking-tighter">{results.tara.dashboard_metrics?.avg_feasibility || 0.0}</p>
                  </div>
                </div>

                {/* Matrix */}
                <h4 className="text-[11px] font-black text-[#c88cae] uppercase tracking-[0.4em] mb-10 flex items-center gap-4"><Zap size={18} /> ISO/SAE 21434 Neural Matrix</h4>
                <div className="w-full overflow-hidden rounded-[40px] border border-[#c88cae]/20 mb-20 bg-[#080812]/40 backdrop-blur-md">
                  <table className="w-full text-left font-mono text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#13182a]/80 border-b border-[#c88cae]/20">
                        <th className="p-8 text-[#f7edf4]/60 uppercase tracking-widest text-[10px] font-bold">Neural Asset</th>
                        <th className="p-8 text-[#f7edf4]/60 uppercase tracking-widest text-[10px] font-bold">Lattice Threat</th>
                        <th className="p-8 text-[#f7edf4]/60 uppercase tracking-widest text-[10px] font-bold text-center">Score</th>
                        <th className="p-8 text-[#f7edf4]/60 uppercase tracking-widest text-[10px] font-bold text-center">Protocol</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.tara.risk_matrix?.map((row, i) => (
                        <tr key={i} className="border-b border-[#c88cae]/10 hover:bg-[#c88cae]/5 transition-all last:border-0 group">
                          <td className="p-8 text-[#f7edf4] font-bold">{row.asset}</td>
                          <td className="p-8 text-[#f7edf4]/60 italic">{row.threat}</td>
                          <td className="p-8 text-center font-black text-[#f7edf4] text-2xl">{row.risk_score}</td>
                          <td className="p-8 text-center">
                            <span className="px-6 py-2 rounded-full text-[9px] font-black tracking-[0.2em] shadow-2xl inline-block" style={{ backgroundColor: row.hex_color || '#c88cae', color: "#080812" }}>{row.risk_score > 10 ? 'CRITICAL' : 'ELEVATED'}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Graphs */}
                <div className="grid grid-cols-2 gap-16">
                  <div className="bg-[#080812]/40 p-10 rounded-[40px] border border-[#c88cae]/10">
                    <h4 className="text-[11px] font-black text-[#c88cae] uppercase tracking-[0.4em] mb-8 flex items-center gap-4"><Database size={18} /> Attack Geometry</h4>
                    <div className="bg-[#f7edf4] p-4 rounded-[30px] h-[400px] flex items-center justify-center overflow-hidden border-8 border-[#080812] shadow-2xl invert-[0.05]">
                      <Graphviz dot={results.tara.attack_tree} options={{ width: '100%', height: '100%', fit: true, zoom: true }} />
                    </div>
                  </div>
                  <div className="flex flex-col justify-between">
                    <div>
                      <h4 className="text-[11px] font-black text-[#c88cae] uppercase tracking-[0.4em] mb-8 flex items-center gap-4"><ShieldCheck size={18} /> Chief Audit Decision</h4>
                      <div className="bg-[#13182a]/80 p-10 rounded-[40px] border-l-8 border-[#c88cae] text-[#f7edf4]/80 text-sm leading-loose font-mono">
                        {results.tara.audit_summary}
                      </div>
                    </div>
                    <div className="mt-12 p-8 bg-[#c88cae]/5 rounded-3xl border border-[#c88cae]/20">
                      <p className="text-[9px] font-mono text-[#c88cae] uppercase tracking-[0.4em] mb-2 font-black italic">Neural Integrity Sign-off</p>
                      <p className="text-[9px] font-mono text-[#f7edf4]/40 leading-relaxed uppercase">Models: Gemma 3 (Parallel Extraction) &bull; Gemini 3.1 Flash (Orchestration). Compliance: UN R155 & ISO 21434 verified.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-20 flex justify-center">
                  <button onClick={() => setView('hub')} className="px-20 py-8 border border-[#c88cae]/40 rounded-full text-[12px] font-black tracking-[0.5em] uppercase hover:bg-[#c88cae] hover:text-[#080812] transition-all transform hover:-translate-y-2 shadow-2xl">Return to Hub</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Global Aesthetics */}
      <div className="fixed top-[-30vh] right-[-10vw] w-[90vw] h-[90vh] bg-[#4b2741]/[0.05] rounded-full blur-[200px] pointer-events-none z-0" />
      <div className="fixed bottom-[-20vh] left-[-20vw] w-[60vw] h-[60vh] bg-[#4b2741]/[0.05] rounded-full blur-[150px] pointer-events-none z-0" />

      {/* Persistence Bar */}
      <div className="fixed bottom-10 right-10 flex gap-4 z-[150]">
        <div className="bg-[#13182a]/95 backdrop-blur-xl border border-[#c88cae]/20 px-6 py-4 rounded-full flex items-center gap-4 shadow-2xl">
          <div className="w-2 h-2 rounded-full bg-[#c88cae] animate-pulse" />
          <span className="text-[9px] font-mono text-[#c88cae] uppercase tracking-widest font-black">Neural Lattice Online [2026]</span>
        </div>
      </div>

    </div>
  );
};

export default App;
