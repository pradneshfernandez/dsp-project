import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PieChart, Pie, Cell, ScatterChart, Scatter, XAxis, YAxis,
    CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import { ShieldCheck, Database, Layers, Activity, X, ChevronRight, Zap, Target, FileText, Search, User, Monitor } from 'lucide-react';

const CHART_COLORS = ['#c88cae', '#4CAF50', '#FF4D4D', '#ffcc00', '#00bcd4', '#9c27b0'];

export default function ResultDashboard({ results, setView, applyMitigation, isApplying }) {
    const [activeFilter, setActiveFilter] = useState(null);
    const [selectedRisk, setSelectedRisk] = useState(null);

    // Compute aggregated dynamic chart data from `results.tara`
    const getAssetDistribution = () => {
        if (!results.tara?.risk_matrix) return [];
        const counts = {};
        results.tara.risk_matrix.forEach(row => {
            counts[row.asset] = (counts[row.asset] || 0) + 1;
        });
        return Object.keys(counts).map(k => ({ name: k, value: counts[k] }));
    };

    const getRiskScatterData = () => {
        if (!results.tara?.risk_matrix) return [];
        return results.tara.risk_matrix.map(row => ({
            ...row,
            feasibility: (Math.random() * 0.5 + 0.5).toFixed(2), // simulated feasibility ratio
            impact: row.risk_score,
            color: row.hex_color || '#c88cae'
        }));
    };

    const filteredMatrix = results.tara?.risk_matrix?.filter(row =>
        !activeFilter || row.asset === activeFilter
    );

    return (
        <div className="h-screen w-screen overflow-hidden bg-[#0a0a0f] text-[#f7edf4] font-sans flex flex-col">
            {/* 1. Persistent Command & Navigation Center */}
            <header className="h-16 w-full bg-[#13182a] border-b border-[#c88cae]/20 flex items-center justify-between px-6 shrink-0 z-50">
                <div className="flex items-center gap-6">
                    <button onClick={() => setView('hub')} className="text-[#c88cae] hover:text-white transition-colors">
                        <Monitor size={20} />
                    </button>
                    <div className="flex items-center gap-2">
                        <h1 className="text-[12px] font-black uppercase tracking-widest text-white">Automotive Infotainment & Telematics</h1>
                        <span className="text-[#f7edf4]/40 text-[10px] uppercase font-mono tracking-widest px-2">&bull;</span>
                        <span className="text-[#c88cae] text-[10px] uppercase font-mono tracking-widest hover:bg-[#c88cae]/10 px-3 py-1 rounded cursor-pointer transition-colors">Overview</span>
                    </div>
                </div>

                <div className="flex-1 max-w-md px-6">
                    <div className="relative w-full">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#f7edf4]/40" />
                        <input
                            type="text"
                            placeholder="Search assets, threat vectors, or CVEs..."
                            className="w-full bg-[#080812] border border-[#c88cae]/20 rounded-full py-1.5 pl-10 pr-4 text-[11px] font-mono focus:outline-none focus:border-[#c88cae]/50 focus:ring-1 focus:ring-[#c88cae]/50 transition-all text-[#f7edf4]"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 px-3 py-1 bg-[#FF4D4D]/10 border border-[#FF4D4D]/20 rounded-full">
                        <ShieldCheck size={14} className="text-[#FF4D4D]" />
                        <span className="text-[#FF4D4D] text-[9px] font-black uppercase tracking-widest">{results.tara?.header?.risk_level || "CRITICAL"}</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#c88cae] uppercase tracking-[0.3em]">{new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}</span>
                    <div className="w-8 h-8 rounded-full bg-[#c88cae]/20 border border-[#c88cae]/40 flex items-center justify-center cursor-pointer hover:bg-[#c88cae]/30 transition-colors">
                        <User size={14} className="text-[#c88cae]" />
                    </div>
                </div>
            </header>

            {/* 2. Main High-Density Grid Canvas */}
            <main className="flex-1 w-full bg-[#080812] p-4 flex gap-4 overflow-hidden">
                {/* Left Column (Stats & Pie) - 25% width */}
                <div className="w-1/4 flex flex-col gap-4">

                    {/* KPI Block */}
                    <div className="bg-[#13182a] border border-[#c88cae]/10 rounded-2xl p-6 shadow-xl shrink-0 flex flex-col justify-center">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-[10px] font-bold text-[#c88cae] uppercase tracking-[0.2em] mb-1">Threat Vectors</h3>
                                <p className="text-4xl font-black text-white">{results.tara?.dashboard_metrics?.total_threats || 0}</p>
                            </div>
                            <div className="text-right">
                                <h3 className="text-[10px] font-bold text-[#c88cae] uppercase tracking-[0.2em] mb-1">Feasibility</h3>
                                <p className="text-4xl font-black text-white">{results.tara?.dashboard_metrics?.avg_feasibility || "0.0"}</p>
                            </div>
                        </div>
                        <div className="text-[9px] font-mono text-[#f7edf4]/50 leading-relaxed uppercase">
                            {results.tara?.audit_summary?.substring(0, 150)}...
                        </div>
                    </div>

                    {/* Threat Mapping Distro (Ring Chart) */}
                    <div className="bg-[#13182a] border border-[#c88cae]/10 rounded-2xl p-6 shadow-xl flex-1 flex flex-col relative min-h-0">
                        <div className="flex justify-between items-center mb-4 shrink-0">
                            <h3 className="text-[10px] font-bold text-[#f7edf4] uppercase tracking-[0.2em] flex items-center gap-2"><Activity size={14} className="text-[#c88cae]" /> Threat Mapping Distro</h3>
                        </div>
                        <div className="flex-1 w-full min-h-0 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={getAssetDistribution()}
                                        cx="50%" cy="50%"
                                        innerRadius="60%" outerRadius="80%"
                                        padAngle={5} dataKey="value"
                                        onClick={(data) => setActiveFilter(activeFilter === data.name ? null : data.name)}
                                        className="cursor-pointer outline-none transition-all duration-300"
                                        animationDuration={800}
                                    >
                                        {getAssetDistribution().map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={CHART_COLORS[index % CHART_COLORS.length]}
                                                opacity={activeFilter && activeFilter !== entry.name ? 0.2 : 1}
                                                stroke="rgba(0,0,0,0.5)"
                                                strokeWidth={2}
                                            />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: '#080812', border: '1px solid rgba(200,140,174,0.3)', borderRadius: '8px' }}
                                        itemStyle={{ color: '#f7edf4', fontSize: '10px', textTransform: 'uppercase' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-[8px] mt-2 text-[#f7edf4]/40 font-mono uppercase tracking-widest text-center absolute bottom-4 left-0 w-full shrink-0">Click Segment to Isolate</p>
                    </div>
                </div>

                {/* Middle & Right Column Container - 75% width */}
                <div className="w-3/4 flex flex-col gap-4 min-w-0">

                    {/* Top: Risk Topology Scatter */}
                    <div className="bg-[#13182a] border border-[#c88cae]/10 rounded-2xl p-6 shadow-xl h-1/2 flex flex-col relative min-h-0">
                        <div className="flex justify-between items-center mb-4 shrink-0">
                            <h3 className="text-[10px] font-bold text-[#f7edf4] uppercase tracking-[0.2em] flex items-center gap-2"><Database size={14} className="text-[#c88cae]" /> Risk Topology Scatter Matrix</h3>
                            {activeFilter && (
                                <button
                                    onClick={() => setActiveFilter(null)}
                                    className="bg-[#c88cae]/20 text-[#c88cae] border border-[#c88cae]/50 px-3 py-1 rounded text-[8px] uppercase tracking-widest font-bold hover:bg-[#c88cae] hover:text-[#0a0a0f] transition-colors"
                                >
                                    Clear Filter: {activeFilter} &times;
                                </button>
                            )}
                        </div>
                        <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#c88cae" opacity={0.1} vertical={false} />
                                    <XAxis type="category" dataKey="asset" stroke="#c88cae" tick={{ fill: '#f7edf4', fontSize: 9, opacity: 0.5 }} axisLine={false} tickLine={false} />
                                    <YAxis type="number" dataKey="impact" name="Risk Impact" stroke="#c88cae" tick={{ fill: '#f7edf4', fontSize: 9, opacity: 0.5 }} axisLine={false} tickLine={false} />
                                    <RechartsTooltip
                                        cursor={{ strokeDasharray: '3 3', stroke: '#c88cae', opacity: 0.4 }}
                                        contentStyle={{ backgroundColor: '#080812', border: '1px solid rgba(200,140,174,0.3)', borderRadius: '8px' }}
                                        labelStyle={{ color: '#c88cae', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}
                                        itemStyle={{ color: '#f7edf4', fontSize: '10px', textTransform: 'uppercase' }}
                                    />
                                    <Scatter name="Threats" data={getRiskScatterData()} shape="circle" onClick={(data) => setSelectedRisk(data.payload)}>
                                        {getRiskScatterData().map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.color}
                                                opacity={activeFilter && activeFilter !== entry.asset ? 0.1 : 0.9}
                                                className="cursor-pointer hover:stroke-white hover:stroke-2 transition-all"
                                            />
                                        ))}
                                    </Scatter>
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Bottom: The Intelligence Ledger (Table) */}
                    <div className="bg-[#13182a] border border-[#c88cae]/10 rounded-2xl shadow-xl h-1/2 flex flex-col min-h-0">
                        <div className="p-4 border-b border-[#c88cae]/10 shrink-0">
                            <h3 className="text-[10px] font-bold text-[#f7edf4] uppercase tracking-[0.2em] flex items-center gap-2"><Layers size={14} className="text-[#c88cae]" /> Threat Intelligence Ledger</h3>
                        </div>

                        {/* Table Header */}
                        <div className="grid grid-cols-12 bg-[#080812]/50 border-b border-[#c88cae]/10 px-6 py-3 text-[8px] text-[#c88cae] uppercase tracking-[0.2em] font-bold shrink-0">
                            <div className="col-span-3">Asset Target</div>
                            <div className="col-span-4">Identified Threat Payload</div>
                            <div className="col-span-3">Protocol Rule</div>
                            <div className="col-span-2 text-right">Risk Score</div>
                        </div>

                        {/* Table Body (Scrollable inside pane) */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar px-2 py-2">
                            {filteredMatrix?.map((row, i) => (
                                <div
                                    key={i}
                                    onClick={() => setSelectedRisk(row)}
                                    className="grid grid-cols-12 items-center px-4 py-3 mx-2 my-1 rounded-lg border border-transparent hover:border-[#c88cae]/20 hover:bg-[#c88cae]/5 cursor-pointer transition-all group"
                                >
                                    <div className="col-span-3 text-[10px] text-white font-bold tracking-widest truncate pr-4 uppercase">{row.asset}</div>
                                    <div className="col-span-4 text-[10px] text-[#f7edf4]/60 font-mono truncate pr-4 group-hover:text-white transition-colors">{row.threat}</div>
                                    <div className="col-span-3 flex items-center">
                                        <span
                                            className="px-2 py-0.5 rounded-[4px] text-[8px] font-black tracking-widest uppercase transition-colors"
                                            style={{ backgroundColor: `${row.hex_color || '#c88cae'}15`, color: row.hex_color || '#c88cae', border: `1px solid ${row.hex_color || '#c88cae'}30` }}
                                        >
                                            {row.risk_score > 10 ? 'ISO-21434:CRITICAL' : row.risk_score > 5 ? 'ISO-21434:ELEVATED' : 'ISO-21434:SECURE'}
                                        </span>
                                    </div>
                                    <div className="col-span-2 text-right text-[11px] font-black" style={{ color: row.hex_color || '#c88cae' }}>{row.risk_score}</div>
                                </div>
                            ))}
                            {filteredMatrix?.length === 0 && (
                                <div className="flex h-full w-full items-center justify-center text-[#f7edf4]/20 font-mono text-[10px] uppercase tracking-widest">
                                    No assets align with current telemetry filter.
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </main>

            {/* 3. Interactive Data Explorer Tool: Dedicated Overlay Window */}
            <AnimatePresence>
                {selectedRisk && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center bg-[#080812]/90 backdrop-blur-sm p-10"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.95, y: 20, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className={`bg-[#13182a] border border-[#c88cae]/30 rounded-3xl w-full max-w-4xl max-h-full flex flex-col shadow-[0_0_100px_-20px_rgba(200,140,174,0.15)] overflow-hidden relative ${selectedRisk.applied ? 'ring-2 ring-[#4CAF50] shadow-[0_0_100px_-20px_rgba(76,175,80,0.3)]' : ''}`}
                        >
                            {/* Overlay Header */}
                            <div className="flex justify-between items-center p-6 border-b border-[#c88cae]/15 bg-[#080812]/50 shrink-0 relative">
                                {/* Green Sweep Animation Element */}
                                {selectedRisk.applied && (
                                    <motion.div
                                        initial={{ x: "-100%" }} animate={{ x: "100%" }} transition={{ duration: 1.5, ease: "easeInOut" }}
                                        className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-[#4CAF50]/20 to-transparent pointer-events-none"
                                    />
                                )}
                                <div>
                                    <span className="text-[9px] font-mono text-[#c88cae] uppercase tracking-[0.4em] block mb-1">Deep-Dive Telemetry Inspector</span>
                                    <h2 className="text-xl font-black text-white uppercase tracking-widest">{selectedRisk.asset}</h2>
                                </div>
                                <button onClick={() => setSelectedRisk(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#c88cae]/20 text-[#f7edf4]/50 hover:text-white transition-colors cursor-pointer z-10"><X size={18} /></button>
                            </div>

                            {/* Overlay Body */}
                            <div className="p-8 flex-1 overflow-y-auto custom-scrollbar flex flex-col md:flex-row gap-8">
                                {/* Left Info Pane */}
                                <div className="flex-1 space-y-8">
                                    <div>
                                        <h4 className="text-[9px] text-[#c88cae] uppercase tracking-[0.2em] font-bold mb-3 flex items-center gap-2"><Target size={12} /> Threat Payload Identification</h4>
                                        <p className="text-2xl font-mono text-white mb-2">{selectedRisk.threat}</p>
                                        <p className="text-[11px] text-[#f7edf4]/70 leading-relaxed font-sans">{selectedRisk.description || "The identified threat vector breaches the asset perimeter, establishing anomalous lateral communication pathways."}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-[#080812] border border-[#c88cae]/10 p-4 rounded-xl">
                                            <p className="text-[9px] text-[#c88cae] uppercase tracking-[0.2em] font-bold mb-1">Feasibility Index</p>
                                            <p className="text-xl font-black text-white">{selectedRisk.feasibility || "0.85"}</p>
                                        </div>
                                        <div className="bg-[#080812] border border-[#c88cae]/10 p-4 rounded-xl">
                                            <p className="text-[9px] text-[#c88cae] uppercase tracking-[0.2em] font-bold mb-1">Impact Velocity</p>
                                            <p className="text-xl font-black" style={{ color: selectedRisk.hex_color || '#c88cae' }}>{selectedRisk.risk_score}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Action Pane */}
                                <div className="md:w-80 flex flex-col shrink-0">
                                    <div className="bg-[#080812] border border-[#c88cae]/10 rounded-xl p-5 flex flex-col h-full relative overflow-hidden">

                                        {!selectedRisk.applied ? (
                                            <>
                                                <div className="flex items-center gap-2 mb-4">
                                                    <Zap size={14} className="text-[#ffcc00]" />
                                                    <h4 className="text-[10px] text-[#ffcc00] uppercase tracking-[0.2em] font-bold">Countermeasure Protocol</h4>
                                                </div>
                                                <p className="text-[10px] text-[#f7edf4] font-mono leading-relaxed mb-6 flex-1">
                                                    {selectedRisk.mitigation || "Deploy strict cryptographic validation on incoming data payloads."}
                                                </p>

                                                <button
                                                    onClick={() => applyMitigation(selectedRisk)}
                                                    disabled={isApplying}
                                                    className="w-full relative overflow-hidden py-4 bg-gradient-to-br from-[#c88cae] to-[#9c27b0] text-white rounded-lg font-black uppercase tracking-[0.2em] text-[10px] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(200,140,174,0.4)] disabled:opacity-50 disabled:cursor-not-allowed group"
                                                >
                                                    {isApplying ? (
                                                        <>Engaging Policy <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /></>
                                                    ) : (
                                                        <>Execute Enforcement <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" /></>
                                                    )}
                                                </button>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                                                <motion.div
                                                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                                    className="w-16 h-16 bg-[#4CAF50]/20 rounded-full flex items-center justify-center border border-[#4CAF50]/50 shadow-[0_0_30px_rgba(76,175,80,0.4)]"
                                                >
                                                    <ShieldCheck size={32} className="text-[#4CAF50]" />
                                                </motion.div>
                                                <div>
                                                    <h4 className="text-[12px] font-black text-[#4CAF50] uppercase tracking-[0.2em] mb-2">Perimeter Secured</h4>
                                                    <p className="text-[#f7edf4]/60 text-[9px] font-mono leading-relaxed uppercase tracking-wider">The protocol was successfully enforced. Risk topology recalculation complete.</p>
                                                </div>
                                                <button className="flex items-center gap-2 mt-4 px-4 py-2 border border-[#4CAF50]/30 rounded-full text-[#4CAF50] text-[9px] hover:bg-[#4CAF50]/10 transition-colors uppercase font-bold tracking-widest"><FileText size={12} /> View Audit Log</button>
                                            </div>
                                        )}

                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
