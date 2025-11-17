import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, AlertCircle } from 'lucide-react';
export const DeadlockVisualizer = ({ autoRun }) => {
    const [processes, setProcesses] = useState([
        { id: 'p1', name: 'Proc A', status: 'running', x: 120, y: 80 },
        { id: 'p2', name: 'Proc B', status: 'ready', x: 320, y: 80 },
        { id: 'p3', name: 'Proc C', status: 'waiting', x: 520, y: 80 },
        { id: 'p4', name: 'Proc D', status: 'blocked', x: 220, y: 220 },
        { id: 'p5', name: 'Proc E', status: 'blocked', x: 420, y: 220 },
    ]);
    const [resources, setResources] = useState([
        { id: 'r1', name: 'Res A', x: 120, y: 320, available: 1, total: 1 },
        { id: 'r2', name: 'Res B', x: 320, y: 320, available: 0, total: 1 },
        { id: 'r3', name: 'Res C', x: 520, y: 320, available: 0, total: 2 },
    ]);
    const [edges, setEdges] = useState([
        { from: 'p1', to: 'r1', type: 'allocation' },
        { from: 'p2', to: 'r2', type: 'allocation' },
        { from: 'p3', to: 'r3', type: 'request' },
        { from: 'p4', to: 'r3', type: 'request' },
        { from: 'r1', to: 'p2', type: 'request' },
        { from: 'r2', to: 'p3', type: 'request' },
        { from: 'r3', to: 'p4', type: 'request' },
        // add or remove edges to create/destroy cycles
    ]);
    const [cycles, setCycles] = useState([
        ['p1', 'r2', 'p3', 'r3', 'p4', 'r1', 'p2']
    ]);
    const [isRunning, setIsRunning] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speedMs, setSpeedMs] = useState(2000);
    const [tick, setTick] = useState(0);
    const [snapshots, setSnapshots] = useState([]);
    const svgRef = useRef(null);
    const [dragging, setDragging] = useState(null);
    // --- interactive controls state ---
    const [newProcessName, setNewProcessName] = useState('NewProc');
    const [newProcessX, setNewProcessX] = useState(100);
    const [newProcessY, setNewProcessY] = useState(80);
    const [newProcessStatus, setNewProcessStatus] = useState('ready');
    const [newResourceName, setNewResourceName] = useState('NewRes');
    const [newResourceX, setNewResourceX] = useState(120);
    const [newResourceY, setNewResourceY] = useState(320);
    const [newResourceTotal, setNewResourceTotal] = useState(1);
    const [edgeFrom, setEdgeFrom] = useState('');
    const [edgeTo, setEdgeTo] = useState('');
    const [edgeType, setEdgeType] = useState('request');
    const genId = (prefix) => `${prefix}_${Date.now().toString(36)}_${Math.floor(Math.random() * 1000)}`;
    const addProcess = () => {
        const id = genId('p');
        setProcesses(prev => [...prev, { id, name: newProcessName, status: newProcessStatus, x: Number(newProcessX), y: Number(newProcessY) }]);
        setNewProcessName('NewProc');
    };
    const addResource = () => {
        const id = genId('r');
        setResources(prev => [...prev, { id, name: newResourceName, x: Number(newResourceX), y: Number(newResourceY), available: Number(newResourceTotal) > 0 ? 0 : 0, total: Number(newResourceTotal) }]);
        setNewResourceName('NewRes');
    };
    const addEdge = () => {
        if (!edgeFrom || !edgeTo)
            return;
        setEdges(prev => [...prev, { from: edgeFrom, to: edgeTo, type: edgeType }]);
        setEdgeFrom('');
        setEdgeTo('');
        setEdgeType('request');
    };
    const removeProcess = (id) => {
        setProcesses(prev => prev.filter(p => p.id !== id));
        // remove related edges
        setEdges(prev => prev.filter(e => e.from !== id && e.to !== id));
    };
    const removeResource = (id) => {
        setResources(prev => prev.filter(r => r.id !== id));
        setEdges(prev => prev.filter(e => e.from !== id && e.to !== id));
    };
    const removeEdge = (index) => {
        setEdges(prev => prev.filter((_, i) => i !== index));
    };
    // Detect cycles using DFS
    const detectCycles = () => {
        const adj = new Map();
        edges.forEach(edge => {
            if (!adj.has(edge.from))
                adj.set(edge.from, []);
            adj.get(edge.from).push(edge.to);
        });
        const visited = new Set();
        const recStack = new Set();
        const allCycles = [];
        const dfs = (node, path) => {
            visited.add(node);
            recStack.add(node);
            path.push(node);
            const neighbors = adj.get(node) || [];
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    dfs(neighbor, [...path]);
                }
                else if (recStack.has(neighbor)) {
                    const cycleStart = path.indexOf(neighbor);
                    if (cycleStart !== -1) {
                        allCycles.push([...path.slice(cycleStart), neighbor]);
                    }
                }
            }
            recStack.delete(node);
        };
        const allNodes = new Set();
        edges.forEach(e => {
            allNodes.add(e.from);
            allNodes.add(e.to);
        });
        allNodes.forEach(node => {
            if (!visited.has(node)) {
                dfs(node, []);
            }
        });
        setCycles(allCycles);
        // capture a snapshot of statuses for Gantt timeline
        const nodesInCycle = new Set(allCycles.flat());
        const snapshot = {};
        [...processes, ...resources].forEach(e => {
            if (nodesInCycle.has(e.id))
                snapshot[e.id] = 'blocked';
            else
                snapshot[e.id] = 'running';
        });
        setSnapshots(prev => {
            const next = [...prev, snapshot];
            // keep last 20 snapshots
            return next.slice(-20);
        });
        setTick(t => t + 1);
    };
    const simulate = () => {
        setIsRunning(true);
        setTimeout(() => {
            detectCycles();
            setIsRunning(false);
        }, Math.max(200, speedMs));
    };
    // Helpers for drag-to-position
    const getSvgPoint = (clientX, clientY) => {
        const svg = svgRef.current;
        if (!svg)
            return { x: clientX, y: clientY };
        const rect = svg.getBoundingClientRect();
        return { x: clientX - rect.left, y: clientY - rect.top };
    };
    useEffect(() => {
        const onMouseMove = (ev) => {
            if (!dragging)
                return;
            const pt = getSvgPoint(ev.clientX, ev.clientY);
            const nextX = pt.x - dragging.offsetX;
            const nextY = pt.y - dragging.offsetY;
            if (dragging.kind === 'process') {
                setProcesses(prev => prev.map(p => p.id === dragging.id ? { ...p, x: nextX, y: nextY } : p));
            }
            else {
                setResources(prev => prev.map(r => r.id === dragging.id ? { ...r, x: nextX, y: nextY } : r));
            }
        };
        const onMouseUp = () => setDragging(null);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [dragging]);
    const step = () => {
        detectCycles();
    };
    useEffect(() => {
        if (!isPlaying)
            return;
        setIsRunning(true);
        const id = setInterval(() => {
            detectCycles();
        }, Math.max(200, speedMs));
        return () => {
            clearInterval(id);
            setIsRunning(false);
        };
    }, [isPlaying, speedMs]);
    // Auto-run when requested by parent
    React.useEffect(() => {
        if (autoRun) {
            simulate();
        }
    }, [autoRun]);
    const getProcessColor = (status) => {
        switch (status) {
            case 'running': return 'from-green-400 to-green-500';
            case 'ready': return 'from-blue-400 to-blue-500';
            case 'waiting': return 'from-yellow-400 to-yellow-500';
            case 'blocked': return 'from-red-400 to-red-500';
            default: return 'from-gray-400 to-gray-500';
        }
    };
    const nodesInCycle = new Set(cycles.flat());
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center gap-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("button", { onClick: simulate, disabled: isRunning, className: "flex items-center gap-3 bg-gradient-to-r from-pink-500 to-orange-400 text-white px-5 py-3 rounded-lg shadow-lg hover:scale-105 transform transition-all disabled:opacity-50 disabled:cursor-not-allowed", children: [_jsx(RefreshCw, { className: `w-4 h-4 ${isRunning ? 'animate-spin' : ''}` }), isRunning ? 'Simulating...' : 'Start Simulation'] }), _jsx("button", { onClick: () => setIsPlaying(p => !p), className: `px-3 py-2 rounded-md border ${isPlaying ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'} hover:scale-105 transition-transform`, children: isPlaying ? 'Pause' : 'Play' }), _jsx("button", { onClick: step, className: "px-3 py-2 rounded-md bg-white border text-gray-700 hover:bg-gray-50", children: "Step" })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("label", { className: "text-sm text-gray-600", children: "Speed:" }), _jsx("input", { type: "range", min: 200, max: 5000, step: 100, value: speedMs, onChange: (e) => setSpeedMs(Number(e.target.value)), className: "w-48" }), _jsxs("span", { className: "text-sm text-gray-700 font-medium", children: [Math.round(speedMs), " ms"] })] }), cycles.length > 0 && (_jsxs("div", { className: "ml-auto flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-lg", children: [_jsx(AlertCircle, { className: "w-4 h-4" }), _jsxs("span", { className: "text-sm font-medium", children: [cycles.length, " cycle(s) detected!"] })] }))] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-4", children: [_jsx("h4", { className: "font-semibold mb-2", children: "Add Process" }), _jsx("input", { className: "w-full mb-2 p-2 border rounded", value: newProcessName, onChange: e => setNewProcessName(e.target.value) }), _jsxs("div", { className: "flex gap-2 mb-2", children: [_jsx("input", { type: "number", className: "p-2 border rounded w-1/2", value: newProcessX, onChange: e => setNewProcessX(Number(e.target.value)) }), _jsx("input", { type: "number", className: "p-2 border rounded w-1/2", value: newProcessY, onChange: e => setNewProcessY(Number(e.target.value)) })] }), _jsxs("select", { className: "w-full mb-2 p-2 border rounded", value: newProcessStatus, onChange: e => setNewProcessStatus(e.target.value), children: [_jsx("option", { value: "running", children: "running" }), _jsx("option", { value: "ready", children: "ready" }), _jsx("option", { value: "waiting", children: "waiting" }), _jsx("option", { value: "blocked", children: "blocked" })] }), _jsx("button", { className: "px-4 py-2 bg-primary-500 text-white rounded", onClick: addProcess, children: "Add Process" })] }), _jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-4", children: [_jsx("h4", { className: "font-semibold mb-2", children: "Add Resource" }), _jsx("input", { className: "w-full mb-2 p-2 border rounded", value: newResourceName, onChange: e => setNewResourceName(e.target.value) }), _jsxs("div", { className: "flex gap-2 mb-2", children: [_jsx("input", { type: "number", className: "p-2 border rounded w-1/2", value: newResourceX, onChange: e => setNewResourceX(Number(e.target.value)) }), _jsx("input", { type: "number", className: "p-2 border rounded w-1/2", value: newResourceY, onChange: e => setNewResourceY(Number(e.target.value)) })] }), _jsx("input", { type: "number", className: "w-full mb-2 p-2 border rounded", value: newResourceTotal, onChange: e => setNewResourceTotal(Number(e.target.value)) }), _jsx("button", { className: "px-4 py-2 bg-primary-500 text-white rounded", onClick: addResource, children: "Add Resource" })] }), _jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-4", children: [_jsx("h4", { className: "font-semibold mb-2", children: "Add Edge" }), _jsxs("div", { className: "mb-2", children: [_jsx("label", { className: "text-xs text-gray-600", children: "From" }), _jsxs("select", { className: "w-full p-2 border rounded", value: edgeFrom, onChange: e => setEdgeFrom(e.target.value), children: [_jsx("option", { value: "", children: "-- select --" }), [...processes, ...resources].map(n => _jsxs("option", { value: n.id, children: [n.name, " (", n.id, ")"] }, n.id))] })] }), _jsxs("div", { className: "mb-2", children: [_jsx("label", { className: "text-xs text-gray-600", children: "To" }), _jsxs("select", { className: "w-full p-2 border rounded", value: edgeTo, onChange: e => setEdgeTo(e.target.value), children: [_jsx("option", { value: "", children: "-- select --" }), [...processes, ...resources].map(n => _jsxs("option", { value: n.id, children: [n.name, " (", n.id, ")"] }, n.id))] })] }), _jsx("div", { className: "mb-2", children: _jsxs("select", { className: "w-full p-2 border rounded", value: edgeType, onChange: e => setEdgeType(e.target.value), children: [_jsx("option", { value: "request", children: "request" }), _jsx("option", { value: "allocation", children: "allocation" })] }) }), _jsx("button", { className: "px-4 py-2 bg-primary-500 text-white rounded", onClick: addEdge, children: "Add Edge" })] })] }), _jsx("div", { className: "bg-white border border-gray-200 rounded-lg p-4", children: _jsxs("svg", { ref: svgRef, className: "w-full h-96", viewBox: "0 0 800 400", children: [_jsxs("defs", { children: [_jsx("marker", { id: "arrowAlloc", markerWidth: "10", markerHeight: "10", refX: "9", refY: "3", orient: "auto", markerUnits: "strokeWidth", children: _jsx("path", { d: "M0,0 L0,6 L9,3 z", fill: "#059669" }) }), _jsx("marker", { id: "arrowRequest", markerWidth: "10", markerHeight: "10", refX: "9", refY: "3", orient: "auto", markerUnits: "strokeWidth", children: _jsx("path", { d: "M0,0 L0,6 L9,3 z", fill: "#dc2626" }) })] }), edges.map((edge, idx) => {
                            const fromEntity = [...processes, ...resources].find(e => e.id === edge.from);
                            const toEntity = [...processes, ...resources].find(e => e.id === edge.to);
                            if (!fromEntity || !toEntity)
                                return null;
                            const isInCycle = cycles.some(cycle => cycle.includes(edge.from) && cycle.includes(edge.to));
                            const baseColor = edge.type === 'allocation' ? '#059669' : '#dc2626';
                            const strokeColor = isInCycle ? '#ff0077' : baseColor;
                            return (_jsx(motion.line, { x1: fromEntity.x, y1: fromEntity.y, x2: toEntity.x, y2: toEntity.y, stroke: strokeColor, strokeWidth: isInCycle ? 4 : 2, markerEnd: edge.type === 'allocation' ? 'url(#arrowAlloc)' : 'url(#arrowRequest)', strokeDasharray: isInCycle ? '6,4' : '0', animate: isInCycle ? { strokeDashoffset: [0, 12], opacity: [1, 0.6, 1] } : {}, transition: { duration: 0.9, repeat: Infinity } }, `${edge.from}-${edge.to}`));
                        }), processes.map((process) => {
                            const highlighted = nodesInCycle.has(process.id);
                            return (_jsxs("g", { onMouseDown: (e) => {
                                    const pt = getSvgPoint(e.clientX, e.clientY);
                                    setDragging({ id: process.id, kind: 'process', offsetX: pt.x - process.x, offsetY: pt.y - process.y });
                                }, style: { cursor: 'grab' }, children: [highlighted && (_jsx(motion.circle, { cx: process.x, cy: process.y, r: 42, fill: "none", stroke: "#ff0077", strokeWidth: 3, animate: { opacity: [0.9, 0.15, 0.9], scale: [1, 1.05, 1] }, transition: { duration: 1.2, repeat: Infinity } })), _jsx(motion.circle, { cx: process.x, cy: process.y, r: 30, className: `fill-gradient-to-br ${getProcessColor(process.status)} cursor-pointer`, whileHover: { r: 35 }, animate: { r: process.status === 'blocked' ? 32 : 30 } }), _jsx("text", { x: process.x, y: process.y + 5, textAnchor: "middle", className: "fill-white font-bold text-sm", children: process.name })] }, process.id));
                        }), resources.map((resource) => {
                            const highlighted = nodesInCycle.has(resource.id);
                            return (_jsxs("g", { onMouseDown: (e) => {
                                    const pt = getSvgPoint(e.clientX, e.clientY);
                                    setDragging({ id: resource.id, kind: 'resource', offsetX: pt.x - resource.x, offsetY: pt.y - resource.y });
                                }, style: { cursor: 'grab' }, children: [highlighted && (_jsx(motion.ellipse, { cx: resource.x, cy: resource.y, rx: 40, ry: 28, fill: "none", stroke: "#ff0077", strokeWidth: 3, animate: { opacity: [0.9, 0.15, 0.9], scale: [1, 1.03, 1] }, transition: { duration: 1.2, repeat: Infinity } })), _jsx(motion.rect, { x: resource.x - 25, y: resource.y - 25, width: 50, height: 50, rx: 5, fill: "#f3f4f6", stroke: "#9ca3af", strokeWidth: 2, whileHover: { fill: '#e5e7eb' } }), _jsx("text", { x: resource.x, y: resource.y - 5, textAnchor: "middle", className: "fill-gray-700 font-bold text-sm", children: resource.name }), _jsxs("text", { x: resource.x, y: resource.y + 15, textAnchor: "middle", className: "fill-gray-600 text-xs", children: [resource.available, "/", resource.total] })] }, resource.id));
                        })] }) }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "bg-blue-50 rounded-lg p-4", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Total Processes" }), _jsx("p", { className: "text-2xl font-bold text-blue-600", children: processes.length })] }), _jsxs("div", { className: "bg-purple-50 rounded-lg p-4", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Total Resources" }), _jsx("p", { className: "text-2xl font-bold text-purple-600", children: resources.length })] }), _jsxs("div", { className: "bg-yellow-50 rounded-lg p-4", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Blocked Processes" }), _jsx("p", { className: "text-2xl font-bold text-yellow-600", children: processes.filter(p => p.status === 'blocked').length })] }), _jsxs("div", { className: "bg-red-50 rounded-lg p-4", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Deadlock Cycles" }), _jsx("p", { className: "text-2xl font-bold text-red-600", children: cycles.length })] })] }), cycles.length > 0 && (_jsxs("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: [_jsx("h3", { className: "font-semibold text-red-700 mb-3", children: "Detected Cycles:" }), _jsx("div", { className: "space-y-2", children: cycles.map((cycle, idx) => (_jsx("div", { className: "bg-white rounded p-2 text-sm", children: _jsx("code", { className: "text-red-600 font-mono", children: cycle.join(' → ') }) }, idx))) })] })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-4", children: [_jsx("h4", { className: "font-semibold mb-2", children: "Processes" }), _jsx("div", { className: "space-y-2 max-h-48 overflow-auto", children: processes.map(p => (_jsxs("div", { className: "flex items-center justify-between p-2 bg-gray-50 rounded", children: [_jsxs("div", { className: "text-sm", children: [p.name, " ", _jsxs("span", { className: "text-xs text-gray-400", children: ["(", p.id, ")"] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "text-xs text-gray-500", children: p.status }), _jsx("button", { className: "text-sm text-red-600", onClick: () => removeProcess(p.id), children: "Remove" })] })] }, p.id))) })] }), _jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-4", children: [_jsx("h4", { className: "font-semibold mb-2", children: "Resources" }), _jsx("div", { className: "space-y-2 max-h-48 overflow-auto", children: resources.map(r => (_jsxs("div", { className: "flex items-center justify-between p-2 bg-gray-50 rounded", children: [_jsxs("div", { className: "text-sm", children: [r.name, " ", _jsxs("span", { className: "text-xs text-gray-400", children: ["(", r.id, ")"] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("div", { className: "text-xs text-gray-500", children: [r.available, "/", r.total] }), _jsx("button", { className: "text-sm text-red-600", onClick: () => removeResource(r.id), children: "Remove" })] })] }, r.id))) })] }), _jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-4", children: [_jsx("h4", { className: "font-semibold mb-2", children: "Edges" }), _jsx("div", { className: "space-y-2 max-h-48 overflow-auto", children: edges.map((e, i) => (_jsxs("div", { className: "flex items-center justify-between p-2 bg-gray-50 rounded", children: [_jsxs("div", { className: "text-sm", children: [e.from, " \u2192 ", e.to, " ", _jsxs("span", { className: "text-xs text-gray-400", children: ["(", e.type, ")"] })] }), _jsx("button", { className: "text-sm text-red-600", onClick: () => removeEdge(i), children: "Remove" })] }, `${e.from}-${e.to}-${i}`))) })] })] }), _jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-4", children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-3", children: "Gantt Timeline (recent steps)" }), snapshots.length === 0 ? (_jsx("p", { className: "text-sm text-gray-500", children: "No timeline data yet. Run or play the simulation to populate." })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("div", { className: "min-w-[600px]", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-36 text-sm font-medium text-gray-700", children: "Entity" }), _jsx("div", { className: "flex-1 grid grid-cols-", style: { gridTemplateColumns: `repeat(${snapshots.length}, 40px)` }, children: snapshots.map((_, i) => (_jsxs("div", { className: "text-xs text-center text-gray-500 border-l border-gray-100 py-1", children: ["T", i] }, i))) })] }), [...processes, ...resources].map((ent) => (_jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-36 text-sm text-gray-700 pr-2", children: ent.name }), _jsx("div", { className: "flex-1 grid", style: { gridTemplateColumns: `repeat(${snapshots.length}, 40px)` }, children: snapshots.map((snap, i) => {
                                                const s = snap[ent.id] || 'idle';
                                                const color = s === 'blocked' ? 'bg-red-400' : s === 'running' ? 'bg-green-400' : 'bg-gray-200';
                                                return _jsx("div", { className: `${color} h-6 border border-gray-100`, title: `${ent.name}: ${s}` }, i);
                                            }) })] }, ent.id)))] }) }))] })] }));
};
//# sourceMappingURL=DeadlockVisualizer.js.map