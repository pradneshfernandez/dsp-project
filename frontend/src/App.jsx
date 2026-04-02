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

const PRESETS = {
  adas: {
    name: 'ADAS Sensor Fusion',
    nodes: [
      { id: '1', position: { x: 50, y: 150 }, data: { label: 'Front Camera' }, type: 'input', style: { border: '2px solid #50ffab', borderRadius: '15px', padding: '10px', background: '#000', color: '#50ffab', fontWeight: 'bold' } },
      { id: '2', position: { x: 300, y: 150 }, data: { label: 'Fusion ECU' }, style: { border: '2px solid #50ffab', borderRadius: '15px', padding: '10px', background: '#000', color: '#50ffab', fontWeight: 'bold' } },
      { id: '3', position: { x: 550, y: 150 }, data: { label: 'Brake Controller' }, type: 'output', style: { border: '2px solid #50ffab', borderRadius: '15px', padding: '10px', background: '#000', color: '#50ffab', fontWeight: 'bold' } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#50ffab' } },
      { id: 'e2-3', source: '2', target: '3', style: { stroke: '#50ffab' } },
    ]
  },
  ev: {
    name: 'EV Powertrain',
    nodes: [
      { id: '1', position: { x: 50, y: 150 }, data: { label: 'BMS' }, type: 'input', style: { border: '2px solid #50ffab', borderRadius: '15px', padding: '10px', background: '#000', color: '#50ffab', fontWeight: 'bold' } },
      { id: '2', position: { x: 300, y: 150 }, data: { label: 'Inverter' }, style: { border: '2px solid #50ffab', borderRadius: '15px', padding: '10px', background: '#000', color: '#50ffab', fontWeight: 'bold' } },
      { id: '3', position: { x: 550, y: 150 }, data: { label: 'Traction Motor' }, type: 'output', style: { border: '2px solid #50ffab', borderRadius: '15px', padding: '10px', background: '#000', color: '#50ffab', fontWeight: 'bold' } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', style: { stroke: '#50ffab' } },
      { id: 'e2-3', source: '2', target: '3', style: { stroke: '#50ffab' } },
    ]
  },
  infotainment: {
    name: 'Infotainment Hub',
    nodes: [
      { id: '1', position: { x: 50, y: 150 }, data: { label: 'TCU (5G)' }, type: 'input', style: { border: '2px solid #50ffab', borderRadius: '15px', padding: '10px', background: '#000', color: '#50ffab', fontWeight: 'bold' } },
      { id: '2', position: { x: 300, y: 150 }, data: { label: 'IVI SoC' }, style: { border: '2px solid #50ffab', borderRadius: '15px', padding: '10px', background: '#000', color: '#50ffab', fontWeight: 'bold' } },
      { id: '3', position: { x: 550, y: 50 }, data: { label: 'Digital Cluster' }, type: 'output', style: { border: '2px solid #50ffab', borderRadius: '15px', padding: '10px', background: '#000', color: '#50ffab', fontWeight: 'bold' } },
      { id: '4', position: { x: 550, y: 250 }, data: { label: 'Rear-Seat ENT' }, type: 'output', style: { border: '2px solid #50ffab', borderRadius: '15px', padding: '10px', background: '#000', color: '#50ffab', fontWeight: 'bold' } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#50ffab' } },
      { id: 'e2-3', source: '2', target: '3', style: { stroke: '#50ffab' } },
      { id: 'e2-4', source: '2', target: '4', style: { stroke: '#50ffab' } },
    ]
  },
  gateway: {
    name: 'Security Gateway',
    nodes: [
      { id: '1', position: { x: 50, y: 150 }, data: { label: 'OBD-II' }, type: 'input', style: { border: '2px solid #50ffab', borderRadius: '15px', padding: '10px', background: '#000', color: '#50ffab', fontWeight: 'bold' } },
      { id: '2', position: { x: 300, y: 150 }, data: { label: 'Central Gateway' }, style: { border: '2px solid #50ffab', borderRadius: '15px', padding: '10px', background: '#000', color: '#50ffab', fontWeight: 'bold' } },
      { id: '3', position: { x: 550, y: 150 }, data: { label: 'Powertrain CAN' }, type: 'output', style: { border: '2px solid #50ffab', borderRadius: '15px', padding: '10px', background: '#000', color: '#50ffab', fontWeight: 'bold' } },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', style: { stroke: '#50ffab' } },
      { id: 'e2-3', source: '2', target: '3', style: { stroke: '#50ffab' } },
    ]
  },
  autolevel3: {
    name: 'L3 Autonomous',
    nodes: [
      { id: '1', position: { x: 50, y: 50 }, data: { label: 'LIDAR' }, type: 'input', style: { border: '2px solid #50ffab', borderRadius: '15px', padding: '10px', background: '#000', color: '#50ffab', fontWeight: 'bold' } },
      { id: '2', position: { x: 50, y: 250 }, data: { label: 'RADAR' }, type: 'input', style: { border: '2px solid #50ffab', borderRadius: '15px', padding: '10px', background: '#000', color: '#50ffab', fontWeight: 'bold' } },
      { id: '3', position: { x: 300, y: 150 }, data: { label: 'Drive Pilot ECU' }, style: { border: '2px solid #50ffab', borderRadius: '15px', padding: '10px', background: '#000', color: '#50ffab', fontWeight: 'bold' } },
      { id: '4', position: { x: 550, y: 150 }, data: { label: 'Steering Rack' }, type: 'output', style: { border: '2px solid #50ffab', borderRadius: '15px', padding: '10px', background: '#000', color: '#50ffab', fontWeight: 'bold' } },
    ],
    edges: [
      { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: '#50ffab' } },
      { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#50ffab' } },
      { id: 'e3-4', source: '3', target: '4', style: { stroke: '#50ffab' } },
    ]
  }
};

const RUBRIC_PRESETS = {
  iso: {
    name: 'ISO 21434 Standard',
    content: `## ISO 21434 Risk Rubric
- **Impact**: Safety, Operational, Financial, Privacy
- **Feasibility**: High, Medium, Low, Very Low
- **Calculation**: Impact x Feasibility (Score 1-20)`
  },
  heavens: {
    name: 'HEAVENS Tier 1',
    content: `## HEAVENS Security Model
- **Impact**: Critical, Major, Moderate, Minor
- **Threat Level**: High, Medium, Low
- **Calculation**: Security Level (Impact x Threat)`
  },
  stride: {
    name: 'STRIDE Mapping',
    content: `## STRIDE/CWE Assessment
- **Categories**: Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege
- **Priority**: Based on CWE severity scores.`
  },
  custom: {
    name: 'Custom Research',
    content: `## Technical Vulnerability Analysis
- **Focus**: Zero-day trends (2025-2026)
- **Metric**: CVSS v4 equivalent base scoring.`
  }
};

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
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const feedRef = useRef(null);
  const chatEndRef = useRef(null);

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

  const onConnect = (params) => setEdges((eds) => addEdge({
    ...params,
    markerEnd: { type: MarkerType.ArrowClosed, color: '#50ffab' },
    style: { stroke: '#50ffab', strokeWidth: 2 }
  }, eds));

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
      style: { border: '2px solid #50ffab', borderRadius: '15px', padding: '10px', background: '#000', color: '#50ffab', fontWeight: 'bold', boxShadow: '0 0 15px rgba(80, 255, 171, 0.2)' }
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const loadPreset = (key) => {
    const preset = PRESETS[key];
    if (preset) {
      setNodes(preset.nodes);
      setEdges(preset.edges);
    }
  };

  const loadRubric = (key) => {
    const preset = RUBRIC_PRESETS[key];
    if (preset) {
      setRubricText(preset.content);
    }
  };

  const applyMitigation = async (risk) => {
    setIsApplying(true);
    await new Promise(r => setTimeout(r, 2000)); // Visual Simulation Delay

    setResults(prev => {
      const newMatrix = prev.tara.risk_matrix.map(r => {
        if (r.asset === risk.asset && r.threat === risk.threat) {
          const newScore = Math.max(1, r.risk_score - (r.reduction_score || 5));
          return {
            ...r,
            risk_score: newScore,
            applied: true,
            hex_color: newScore > 10 ? '#FF4D4D' : newScore > 5 ? '#ffcc00' : '#4CAF50'
          };
        }
        return r;
      });
      return { ...prev, tara: { ...prev.tara, risk_matrix: newMatrix } };
    });

    setIsApplying(false);
    setSelectedRisk(null);
  };

  const handleChat = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsChatLoading(true);

    try {
      const resp = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          context: results.tara
        })
      });
      const data = await resp.json();
      setChatHistory(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: "Neural Connection Error. Please verify Groq API status." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

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
                  onClick={() => {
                    setResults({ tara: item.data });
                    setChatHistory([]); // Clear chat for new context
                    setView('result');
                    setShowHistory(false);
                  }}
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
              {/* COMPREHENSIVE SIDEBAR */}
              <div className="w-80 bg-[#13182a] border-r border-[#c88cae]/10 py-8 px-6 flex flex-col gap-8 overflow-y-auto custom-scrollbar shadow-2xl">

                {/* 1. ARCHITECTURE PRESETS */}
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#c88cae] mb-6 flex items-center gap-2"><Layers size={14} /> Design Presets</p>
                  <div className="space-y-3">
                    {Object.entries(PRESETS).map(([key, p]) => (
                      <button
                        key={key}
                        onClick={() => loadPreset(key)}
                        className="w-full text-left p-4 bg-[#080812]/40 border border-[#c88cae]/5 rounded-2xl hover:border-[#c88cae]/40 transition-all group"
                      >
                        <p className="text-[10px] font-bold text-[#f7edf4] group-hover:text-[#c88cae] tracking-tight transition-colors">{p.name}</p>
                        <div className="flex gap-2 mt-1 opacity-20 group-hover:opacity-100 transition-opacity">
                          <span className="text-[8px] uppercase font-mono">{p.nodes.length} Nodes</span>
                          <span className="text-[8px] uppercase font-mono">&bull;</span>
                          <span className="text-[8px] uppercase font-mono">{p.edges.length} Edges</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. NEURAL ASSETS (DRAG/ADD) */}
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#c88cae] mb-6 flex items-center gap-2"><Cpu size={14} /> Add Components</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: <Cpu size={14} />, label: 'ECU', type: 'ecu' },
                      { icon: <ShieldCheck size={14} />, label: 'GW', type: 'gateway' },
                      { icon: <Activity size={14} />, label: 'ACT', type: 'actuator' },
                      { icon: <Zap size={14} />, label: 'SEN', type: 'sensor' }
                    ].map(item => (
                      <button
                        key={item.type}
                        onClick={() => addNode(item.type)}
                        className="flex flex-col items-center justify-center p-4 bg-[#080812]/80 border border-[#c88cae]/10 rounded-2xl hover:bg-[#c88cae]/10 hover:border-[#c88cae]/40 transition-all group"
                      >
                        <span className="text-[#c88cae]/40 group-hover:text-[#c88cae] mb-2">{item.icon}</span>
                        <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. RUBRIC PRESETS */}
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#c88cae] mb-6 flex items-center gap-2"><Zap size={14} /> Risk Rubrics</p>
                  <div className="space-y-3">
                    {Object.entries(RUBRIC_PRESETS).map(([key, r]) => (
                      <button
                        key={key}
                        onClick={() => loadRubric(key)}
                        className="w-full text-left p-4 bg-[#080812]/40 border border-[#c88cae]/5 rounded-2xl hover:border-[#c88cae]/40 transition-all group"
                      >
                        <p className="text-[10px] font-bold text-[#f7edf4] group-hover:text-[#c88cae] tracking-tight">{r.name}</p>
                      </button>
                    ))}
                  </div>
                </div>

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
                    style={{ backgroundColor: '#000' }}
                  >
                    <Background color="#ffffff" gap={40} size={1} opacity={0.3} variant="dots" />
                    <Controls className="!bg-[#ffffff] !border-[#000000] !fill-[#000000]" />
                    <Panel position="top-right" className="bg-[#ffffff]/10 p-4 rounded-xl border border-[#ffffff]/20 text-[9px] font-mono text-[#ffffff] uppercase tracking-widest backdrop-blur-md">
                      Interactive Simulation Canvas &bull; Monochrome Edition
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
                        <tr
                          key={i}
                          onClick={() => setSelectedRisk(row)}
                          className="border-b border-[#c88cae]/10 hover:bg-[#c88cae]/5 transition-all last:border-0 group cursor-pointer"
                        >
                          <td className="p-8 text-[#f7edf4] font-bold">{row.asset}</td>
                          <td className="p-8 text-[#f7edf4]/60 italic">{row.threat}</td>
                          <td className="p-8 text-center font-black text-[#f7edf4] text-2xl">
                            <motion.span
                              key={row.risk_score}
                              initial={{ scale: 1.5, color: '#fff' }}
                              animate={{ scale: 1, color: '#f7edf4' }}
                            >
                              {row.risk_score}
                            </motion.span>
                          </td>
                          <td className="p-8 text-center">
                            <span
                              className="px-6 py-2 rounded-full text-[9px] font-black tracking-[0.2em] shadow-2xl inline-block transition-colors duration-1000"
                              style={{ backgroundColor: row.hex_color || '#c88cae', color: "#080812" }}
                            >
                              {row.risk_score > 10 ? 'CRITICAL' : row.risk_score > 5 ? 'ELEVATED' : 'SECURE'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Neural Drill-down Overlay */}
                <AnimatePresence>
                  {selectedRisk && (
                    <motion.div
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="fixed inset-0 z-[300] flex items-center justify-center p-20 bg-[#080812]/80 backdrop-blur-xl"
                    >
                      <motion.div
                        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                        className="bg-[#13182a] border border-[#c88cae]/20 rounded-[60px] p-16 max-w-3xl w-full relative shadow-2xl overflow-hidden"
                      >
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#c88cae]/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />

                        <button onClick={() => setSelectedRisk(null)} className="absolute top-10 right-10 text-[#f7edf4]/40 hover:text-[#c88cae]"><X size={24} /></button>

                        <div className="mb-12">
                          <span className="text-[10px] font-mono text-[#c88cae] uppercase tracking-[0.5em] mb-4 block">Neural Drill-down</span>
                          <h3 className="text-4xl font-black tracking-tighter mb-4 uppercase">{selectedRisk.asset} <span className="text-[#c88cae]/40">&bull;</span> {selectedRisk.threat}</h3>
                          <div className="flex gap-4 items-center">
                            <div className="px-4 py-1 bg-[#c88cae]/10 border border-[#c88cae]/20 rounded-full text-[10px] font-mono text-[#c88cae] uppercase tracking-widest">
                              Score: {selectedRisk.risk_score}
                            </div>
                            {selectedRisk.applied && (
                              <div className="flex items-center gap-2 text-[#4CAF50] text-[10px] font-bold uppercase tracking-widest">
                                <ShieldCheck size={14} /> Mitigation Active
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-10">
                          <div>
                            <h4 className="text-[11px] font-black text-[#c88cae] uppercase tracking-[0.3em] mb-4 flex items-center gap-3"><Layers size={16} /> Asset Vulnerability</h4>
                            <p className="text-[#f7edf4]/60 text-sm leading-relaxed font-mono bg-[#080812]/40 p-6 rounded-3xl border border-[#c88cae]/5">
                              {selectedRisk.description || "Synthesizing deep architecture analysis... This threat targets the internal communication bus of the specified asset, potentially allowing unauthorized command injection or state manipulation."}
                            </p>
                          </div>

                          {!selectedRisk.applied ? (
                            <div className="p-10 bg-[#c88cae]/5 border border-[#c88cae]/20 rounded-[40px]">
                              <h4 className="text-[11px] font-black text-[#c88cae] uppercase tracking-[0.3em] mb-6 flex items-center gap-3"><Zap size={16} /> Suggested Neural Patch</h4>
                              <p className="text-[#f7edf4] text-sm font-bold mb-8">{selectedRisk.mitigation || "Implement hardware-backed cryptographic signatures (AES-GCM 256) for all control messages."}</p>

                              <button
                                onClick={() => applyMitigation(selectedRisk)}
                                disabled={isApplying}
                                className="w-full py-6 bg-[#c88cae] text-[#080812] rounded-[30px] font-black uppercase tracking-[0.3em] text-xs hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 group"
                              >
                                {isApplying ? (
                                  <>Applying Neural Patch <div className="w-4 h-4 border-2 border-[#080812] border-t-transparent rounded-full animate-spin" /></>
                                ) : (
                                  <>Apply Countermeasure <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform" /></>
                                )}
                              </button>
                              <p className="mt-6 text-[9px] text-[#f7edf4]/30 text-center uppercase tracking-widest font-mono">Estimated Risk Reduction: -{selectedRisk.reduction_score || 8} Points</p>
                            </div>
                          ) : (
                            <div className="p-10 bg-[#4CAF50]/10 border border-[#4CAF50]/20 rounded-[40px] text-center">
                              <ShieldCheck size={48} className="text-[#4CAF50] mx-auto mb-6" />
                              <h4 className="text-xl font-black text-[#4CAF50] uppercase tracking-[0.2em] mb-4">Integrity Verified</h4>
                              <p className="text-[#f7edf4]/60 text-[10px] font-mono leading-relaxed uppercase tracking-wider">The suggested mitigation has been applied to the neural simulation. The newly calculated risk score reflects the enhanced security posture.</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

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

      {/* 6. NEURAL INTELLIGENCE CHAT */}
      {view === 'result' && (
        <div className="fixed bottom-10 right-80 z-[200] flex flex-col items-end gap-4">
          <AnimatePresence>
            {isChatOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className="w-96 h-[500px] bg-[#13182a]/95 backdrop-blur-3xl border border-[#c88cae]/30 rounded-[40px] shadow-2xl flex flex-col overflow-hidden"
              >
                <div className="p-6 border-b border-[#c88cae]/10 bg-[#c88cae]/5 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#c88cae] animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c88cae]">Neural Intelligence</span>
                  </div>
                  <button onClick={() => setIsChatOpen(false)} className="text-[#f7edf4]/40 hover:text-[#c88cae] transition-colors"><X size={16} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                  {chatHistory.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center px-4 opacity-40">
                      <Cpu size={32} className="mb-4 text-[#c88cae]" />
                      <p className="text-[10px] font-mono leading-relaxed uppercase tracking-wider">Analysis context loaded. Ask me about vulnerabilities, threat vectors, or ISO 21434 compliance.</p>
                    </div>
                  )}
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-4 rounded-3xl text-[11px] leading-relaxed ${msg.role === 'user' ? 'bg-[#c88cae] text-[#080812] font-bold' : 'bg-[#080812]/60 border border-[#c88cae]/20 text-[#f7edf4]/80'}`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-[#080812]/60 border border-[#c88cae]/20 p-4 rounded-3xl">
                        <div className="flex gap-1">
                          <div className="w-1 h-1 bg-[#c88cae] rounded-full animate-bounce" />
                          <div className="w-1 h-1 bg-[#c88cae] rounded-full animate-bounce [animation-delay:0.2s]" />
                          <div className="w-1 h-1 bg-[#c88cae] rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <div className="p-6 border-t border-[#c88cae]/10 bg-[#080812]/40 backdrop-blur-md">
                  <div className="relative">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                      placeholder="Query the lattice..."
                      className="w-full bg-[#13182a] border border-[#c88cae]/20 rounded-full py-4 pl-6 pr-14 text-[11px] font-mono text-[#f7edf4] outline-none focus:border-[#c88cae]/60 transition-all placeholder-[#c88cae]/20"
                    />
                    <button
                      onClick={handleChat}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#c88cae] rounded-full flex items-center justify-center text-[#080812] hover:scale-105 active:scale-95 transition-all shadow-xl"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`w-16 h-16 rounded-[24px] flex items-center justify-center shadow-2xl transition-all duration-500 border-2 ${isChatOpen ? 'bg-[#c88cae] border-white/20 rotate-90' : 'bg-[#13182a]/95 border-[#c88cae]/20'}`}
          >
            {isChatOpen ? <X size={24} className="text-[#080812]" /> : <Cpu size={24} className="text-[#c88cae]" />}
          </motion.button>
        </div>
      )}

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
