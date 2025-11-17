import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
export const DiskScheduler = ({ autoRun }) => {
    const [algorithm, setAlgorithm] = useState('FCFS');
    const [diskRequests, setDiskRequests] = useState([
        { id: 'r1', track: 10, arrival: 0 },
        { id: 'r2', track: 40, arrival: 1 },
        { id: 'r3', track: 150, arrival: 2 },
        { id: 'r4', track: 90, arrival: 3 },
        { id: 'r5', track: 180, arrival: 4 },
        // You can add many requests to stress-test algorithms.
    ]);
    const [isRunning, setIsRunning] = useState(false);
    const [currentPosition, setCurrentPosition] = useState(0);
    const [serviceOrder, setServiceOrder] = useState([]);
    const [totalSeekTime, setTotalSeekTime] = useState(0);
    const [scheduleTimeline, setScheduleTimeline] = useState([]);
    // Interactive controls for disk requests
    const [newReqTrack, setNewReqTrack] = useState(50);
    const [newReqArrival, setNewReqArrival] = useState(0);
    const addDiskRequest = () => {
        const id = `r_${Date.now().toString(36)}_${Math.floor(Math.random() * 1000)}`;
        setDiskRequests(prev => [...prev, { id, track: Number(newReqTrack), arrival: Number(newReqArrival) }]);
    };
    const removeDiskRequest = (id) => {
        setDiskRequests(prev => prev.filter(r => r.id !== id));
    };
    const scheduleRequests = () => {
        const requests = [...diskRequests];
        let order = [];
        let currentPos = 0;
        let seekTime = 0;
        const timeline = [];
        let currentTime = 0;
        if (algorithm === 'FCFS') {
            // First Come First Served
            order = requests.map((r, i) => {
                const seek = Math.abs(r.track - currentPos);
                seekTime += seek;
                // record timeline segment
                timeline.push({ id: r.id, start: currentTime, duration: Math.max(1, seek), track: r.track });
                currentTime += Math.max(1, seek);
                currentPos = r.track;
                return r.id;
            });
        }
        else if (algorithm === 'SSTF') {
            // Shortest Seek Time First
            const remaining = [...requests];
            currentPos = 0;
            while (remaining.length > 0) {
                let nearestIdx = 0;
                let minSeek = Math.abs(remaining[0].track - currentPos);
                for (let i = 1; i < remaining.length; i++) {
                    const seek = Math.abs(remaining[i].track - currentPos);
                    if (seek < minSeek) {
                        minSeek = seek;
                        nearestIdx = i;
                    }
                }
                const nearest = remaining[nearestIdx];
                order.push(nearest.id);
                seekTime += minSeek;
                // timeline segment
                timeline.push({ id: nearest.id, start: currentTime, duration: Math.max(1, minSeek), track: nearest.track });
                currentTime += Math.max(1, minSeek);
                currentPos = nearest.track;
                remaining.splice(nearestIdx, 1);
            }
        }
        else if (algorithm === 'SCAN') {
            // SCAN (Elevator Algorithm)
            const remaining = [...requests].sort((a, b) => a.track - b.track);
            currentPos = 0;
            let direction = 1; // 1 for up, -1 for down
            while (remaining.length > 0) {
                if (direction === 1) {
                    // Moving towards end (199)
                    const nextIdx = remaining.findIndex(r => r.track >= currentPos);
                    if (nextIdx === -1) {
                        // Change direction
                        direction = -1;
                        currentPos = 199;
                    }
                    else {
                        const next = remaining[nextIdx];
                        const s = Math.abs(next.track - currentPos);
                        seekTime += s;
                        timeline.push({ id: next.id, start: currentTime, duration: Math.max(1, s), track: next.track });
                        currentTime += Math.max(1, s);
                        currentPos = next.track;
                        order.push(next.id);
                        remaining.splice(nextIdx, 1);
                    }
                }
                else {
                    // Moving towards start (0)
                    const nextIdx = remaining.findIndex(r => r.track <= currentPos);
                    if (nextIdx === -1) {
                        // Change direction
                        direction = 1;
                        currentPos = 0;
                    }
                    else {
                        const next = remaining[nextIdx];
                        const s2 = Math.abs(next.track - currentPos);
                        seekTime += s2;
                        timeline.push({ id: next.id, start: currentTime, duration: Math.max(1, s2), track: next.track });
                        currentTime += Math.max(1, s2);
                        currentPos = next.track;
                        order.push(next.id);
                        remaining.splice(nextIdx, 1);
                    }
                }
            }
        }
        else if (algorithm === 'C-SCAN') {
            // Circular SCAN
            const remaining = [...requests].sort((a, b) => a.track - b.track);
            currentPos = 0;
            seekTime = 199; // Move to end
            // Service requests in circular manner
            for (const req of remaining) {
                const s3 = Math.abs(req.track - currentPos);
                seekTime += s3;
                timeline.push({ id: req.id, start: currentTime, duration: Math.max(1, s3), track: req.track });
                currentTime += Math.max(1, s3);
                currentPos = req.track;
                order.push(req.id);
            }
            // Return to beginning
            seekTime += currentPos;
        }
        setServiceOrder(order);
        setTotalSeekTime(seekTime);
        // store timeline for Gantt
        setScheduleTimeline(timeline);
    };
    const handleSimulate = () => {
        setIsRunning(true);
        scheduleRequests();
        setTimeout(() => setIsRunning(false), 2000);
    };
    // Auto-run when requested
    React.useEffect(() => {
        if (autoRun) {
            handleSimulate();
        }
    }, [autoRun]);
    const getRequestPosition = (track) => {
        return (track / 200) * 100;
    };
    const isServicedRequest = (id) => {
        return serviceOrder.includes(id);
    };
    const serviceIndex = (id) => {
        return serviceOrder.indexOf(id) + 1;
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-4", children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-4", children: "Scheduling Algorithm" }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: ['FCFS', 'SSTF', 'SCAN', 'C-SCAN'].map((algo) => (_jsx("button", { onClick: () => {
                                setAlgorithm(algo);
                                setServiceOrder([]);
                                setTotalSeekTime(0);
                            }, className: `py-2 px-4 rounded-lg font-medium transition-all ${algorithm === algo
                                ? 'bg-primary-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`, children: algo }, algo))) }), _jsxs("p", { className: "text-sm text-gray-600 mt-4", children: [algorithm === 'FCFS' && 'Services requests in arrival order.', algorithm === 'SSTF' && 'Services request with shortest seek time first.', algorithm === 'SCAN' && 'Moves disk head in one direction, services all, then reverses.', algorithm === 'C-SCAN' && 'Like SCAN but always returns to start, providing uniform service.'] })] }), _jsxs("button", { onClick: handleSimulate, disabled: isRunning, className: "flex items-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors", children: [isRunning ? _jsx(Pause, { className: "w-4 h-4" }) : _jsx(Play, { className: "w-4 h-4" }), isRunning ? 'Simulating...' : 'Run Simulation'] }), _jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-4", children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-4", children: "Disk Track Visualization" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "relative h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg overflow-hidden border border-gray-300", children: [_jsx("div", { className: "absolute inset-0 flex items-center px-4", children: _jsxs("div", { className: "w-full h-1 bg-gray-400 relative", children: [_jsx("div", { className: "absolute left-0 top-0 -translate-y-1/2 w-0.5 h-3 bg-gray-600" }), _jsx("div", { className: "absolute right-0 top-0 -translate-y-1/2 w-0.5 h-3 bg-gray-600" })] }) }), diskRequests.map((req) => (_jsx(motion.div, { initial: { y: 0 }, animate: { y: 0 }, className: `absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold cursor-pointer transition-all ${isServicedRequest(req.id)
                                            ? 'bg-green-400 border-green-600 text-white'
                                            : 'bg-blue-400 border-blue-600 text-white'}`, style: { left: `calc(${getRequestPosition(req.track)}% - 12px)` }, title: `Track ${req.track}`, children: isServicedRequest(req.id) ? serviceIndex(req.id) : '' }, req.id))), serviceOrder.length > 0 && (_jsx(motion.div, { className: "absolute top-1/2 -translate-y-1/2 w-1 h-full bg-red-500 opacity-70", style: {
                                            left: `calc(${getRequestPosition(serviceOrder.length > 0
                                                ? diskRequests.find(r => r.id === serviceOrder[Math.min(serviceOrder.length - 1, serviceOrder.length - 1)])?.track || 0
                                                : 0)}%)`
                                        } }))] }), _jsxs("div", { className: "flex justify-between text-xs text-gray-600 font-mono", children: [_jsx("span", { children: "Track 0" }), _jsx("span", { children: "Track 100" }), _jsx("span", { children: "Track 199" })] })] })] }), _jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-4", children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-3", children: "Edit Requests" }), _jsxs("div", { className: "flex gap-2 mb-3", children: [_jsx("input", { type: "number", className: "p-2 border rounded w-32", value: newReqTrack, onChange: e => setNewReqTrack(Number(e.target.value)) }), _jsx("input", { type: "number", className: "p-2 border rounded w-32", value: newReqArrival, onChange: e => setNewReqArrival(Number(e.target.value)) }), _jsx("button", { className: "px-3 py-2 bg-primary-500 text-white rounded", onClick: addDiskRequest, children: "Add Request" })] }), _jsx("div", { className: "space-y-2", children: diskRequests.map((req) => (_jsxs("div", { className: "flex items-center justify-between p-2 bg-gray-50 rounded", children: [_jsxs("div", { className: "text-sm", children: [req.id, " \u2014 Track ", req.track, " (arrival ", req.arrival, ")"] }), _jsx("button", { className: "text-sm text-red-600", onClick: () => removeDiskRequest(req.id), children: "Remove" })] }, req.id))) })] }), _jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-4", children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-4", children: "Service Order" }), serviceOrder.length > 0 ? (_jsx("div", { className: "flex flex-wrap gap-2", children: serviceOrder.map((id, idx) => {
                            const req = diskRequests.find(r => r.id === id);
                            return (_jsxs(motion.div, { initial: { scale: 0 }, animate: { scale: 1 }, transition: { delay: idx * 0.1 }, className: "bg-primary-50 border-2 border-primary-500 rounded-lg px-3 py-2 flex items-center gap-2", children: [_jsx("span", { className: "font-bold text-primary-600", children: idx + 1 }), _jsxs("span", { className: "text-sm text-gray-700", children: [id, " (T", req?.track, ")"] })] }, id));
                        }) })) : (_jsx("p", { className: "text-gray-500 text-sm", children: "Run simulation to see service order" }))] }), _jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-4", children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-3", children: "Gantt Chart (seek timeline)" }), scheduleTimeline.length === 0 ? (_jsx("p", { className: "text-sm text-gray-500", children: "Run a simulation to populate the seek timeline." })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("div", { className: "min-w-[600px]", children: [_jsxs("div", { className: "flex items-center text-xs text-gray-600", children: [_jsx("div", { className: "w-24 font-medium", children: "Sequence" }), _jsx("div", { className: "flex-1 relative", style: { height: 48 }, children: scheduleTimeline.map((seg, idx) => {
                                                const total = scheduleTimeline.reduce((a, b) => a + b.duration, 0) || 1;
                                                const left = (seg.start / total) * 100;
                                                const width = (seg.duration / total) * 100;
                                                return (_jsx("div", { className: "absolute top-2 h-10", style: { left: `${left}%`, width: `${width}%` }, children: _jsxs("div", { className: "h-10 rounded-md flex items-center justify-center text-xs text-white", style: { background: '#3b82f6' }, children: [seg.id, " (T", seg.track, ")"] }) }, idx));
                                            }) })] }), _jsxs("div", { className: "text-xs text-gray-500 mt-2", children: ["Total time: ", scheduleTimeline.reduce((a, b) => a + b.duration, 0)] })] }) }))] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "bg-blue-50 rounded-lg p-4", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Total Requests" }), _jsx("p", { className: "text-2xl font-bold text-blue-600", children: diskRequests.length })] }), _jsxs("div", { className: "bg-purple-50 rounded-lg p-4", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Total Seek Time" }), _jsx("p", { className: "text-2xl font-bold text-purple-600", children: totalSeekTime })] }), _jsxs("div", { className: "bg-green-50 rounded-lg p-4", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Average Seek Time" }), _jsx("p", { className: "text-2xl font-bold text-green-600", children: diskRequests.length > 0 ? (totalSeekTime / diskRequests.length).toFixed(1) : 0 })] })] }), _jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-4", children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-4", children: "Request Queue" }), _jsx("div", { className: "space-y-2", children: diskRequests.map((req) => (_jsxs(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, className: `flex items-center justify-between p-3 rounded-lg border ${isServicedRequest(req.id)
                                ? 'bg-green-50 border-green-200'
                                : 'bg-gray-50 border-gray-200'}`, children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${isServicedRequest(req.id) ? 'bg-green-500' : 'bg-gray-400'}`, children: isServicedRequest(req.id) ? serviceIndex(req.id) : '-' }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-gray-900", children: req.id }), _jsxs("p", { className: "text-sm text-gray-600", children: ["Track ", req.track] })] })] }), isServicedRequest(req.id) && (_jsx("span", { className: "text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded", children: "Serviced" }))] }, req.id))) })] })] }));
};
//# sourceMappingURL=DiskScheduler.js.map