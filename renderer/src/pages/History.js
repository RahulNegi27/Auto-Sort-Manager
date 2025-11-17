import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertCircle, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
export const History = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    useEffect(() => {
        loadHistory();
    }, []);
    const loadHistory = async () => {
        setLoading(true);
        try {
            const history = await window.electronAPI.getJobHistory();
            setJobs((history || []).map((job) => ({
                id: job.id,
                uuid: job.uuid || `job_${job.id}`,
                type: job.type || 'unknown',
                status: job.status || 'unknown',
                start_time: job.start_time || new Date().toISOString(),
                end_time: job.end_time || null,
                files_processed: job.files_processed || 0,
                total_files: job.total_files || 0,
                error_message: job.error_message || null,
                metadata: job.metadata || '{}'
            })));
        }
        catch (error) {
            console.error('Failed to load job history:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const filteredJobs = jobs.filter((job) => {
        if (filter === 'all')
            return true;
        return job.status === filter;
    });
    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return _jsx(CheckCircle, { className: "w-5 h-5 text-green-500" });
            case 'failed':
                return _jsx(AlertCircle, { className: "w-5 h-5 text-red-500" });
            case 'started':
                return _jsx(Loader2, { className: "w-5 h-5 text-blue-500 animate-spin" });
            default:
                return _jsx(Clock, { className: "w-5 h-5 text-gray-400" });
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-50 border-l-4 border-green-500';
            case 'failed':
                return 'bg-red-50 border-l-4 border-red-500';
            case 'started':
                return 'bg-blue-50 border-l-4 border-blue-500';
            default:
                return 'bg-gray-50 border-l-4 border-gray-300';
        }
    };
    const getTypeLabel = (type) => {
        const labels = {
            scan: '📁 Scan Directory',
            move: '➡️ Move File',
            delete: '🗑️ Delete File',
            compress: '📦 Compress Files',
            quarantine: '⚠️ Quarantine',
            duplicates: '👥 Find Duplicates',
            autosort: '🔄 AutoSort',
            classification: '🤖 Classify'
        };
        return labels[type] || type;
    };
    const formatDate = (dateStr) => {
        try {
            return new Date(dateStr).toLocaleString();
        }
        catch {
            return dateStr;
        }
    };
    const formatDuration = (start, end) => {
        if (!end)
            return 'In progress...';
        try {
            const startTime = new Date(start).getTime();
            const endTime = new Date(end).getTime();
            const durationMs = endTime - startTime;
            if (durationMs < 1000)
                return '<1s';
            if (durationMs < 60000)
                return `${Math.round(durationMs / 1000)}s`;
            return `${Math.round(durationMs / 60000)}m`;
        }
        catch {
            return 'Unknown';
        }
    };
    const parseMetadata = (metaStr) => {
        try {
            return JSON.parse(metaStr);
        }
        catch {
            return {};
        }
    };
    return (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 }, className: "w-full h-full flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden", children: [_jsxs("div", { className: "flex-shrink-0 px-6 py-4 border-b border-slate-200 bg-white/80 backdrop-blur-sm", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Clock, { className: "w-6 h-6 text-blue-600" }), _jsx("h1", { className: "text-2xl font-bold text-slate-900", children: "Operation History" })] }), _jsxs("button", { onClick: loadHistory, disabled: loading, className: "flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors", children: [_jsx(RefreshCw, { className: `w-4 h-4 ${loading ? 'animate-spin' : ''}` }), "Refresh"] })] }), _jsx("div", { className: "flex gap-2 mt-4", children: ['all', 'completed', 'failed', 'started'].map((f) => (_jsxs("button", { onClick: () => setFilter(f), className: `px-4 py-1 rounded-full text-sm font-medium transition-all ${filter === f
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-400'}`, children: [f.charAt(0).toUpperCase() + f.slice(1), ' ', jobs.filter((j) => f === 'all' ? true : j.status === f).length] }, f))) })] }), _jsx("div", { className: "flex-1 overflow-y-auto p-6", children: loading ? (_jsx("div", { className: "flex items-center justify-center h-full", children: _jsx(Loader2, { className: "w-8 h-8 animate-spin text-blue-600" }) })) : filteredJobs.length === 0 ? (_jsxs("div", { className: "flex flex-col items-center justify-center h-full text-slate-500", children: [_jsx(Clock, { className: "w-16 h-16 text-slate-300 mb-4" }), _jsx("p", { className: "text-lg font-medium", children: "No operations recorded yet" }), _jsx("p", { className: "text-sm", children: "Operations will appear here as you use the app" })] })) : (_jsx("div", { className: "space-y-3 max-w-4xl mx-auto", children: filteredJobs.map((job) => {
                        const meta = parseMetadata(job.metadata);
                        return (_jsx(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, className: `p-4 rounded-lg ${getStatusColor(job.status)} cursor-pointer hover:shadow-md transition-shadow`, children: _jsx("div", { className: "flex items-start justify-between gap-4", children: _jsxs("div", { className: "flex items-start gap-3 flex-1", children: [_jsx("div", { className: "flex-shrink-0 mt-1", children: getStatusIcon(job.status) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [_jsx("h3", { className: "font-semibold text-slate-900", children: getTypeLabel(job.type) }), _jsx("span", { className: `text-xs px-2 py-1 rounded font-medium ${job.status === 'completed'
                                                                ? 'bg-green-200 text-green-800'
                                                                : job.status === 'failed'
                                                                    ? 'bg-red-200 text-red-800'
                                                                    : job.status === 'started'
                                                                        ? 'bg-blue-200 text-blue-800'
                                                                        : 'bg-gray-200 text-gray-800'}`, children: job.status.toUpperCase() })] }), _jsxs("p", { className: "text-sm text-slate-600 mt-1", children: ["Started: ", formatDate(job.start_time)] }), job.end_time && (_jsxs("p", { className: "text-sm text-slate-600", children: ["Duration: ", formatDuration(job.start_time, job.end_time)] })), job.files_processed > 0 && (_jsxs("p", { className: "text-sm text-slate-600", children: ["Processed: ", job.files_processed, " / ", job.total_files || '?', " items"] })), meta.path && (_jsxs("p", { className: "text-xs text-slate-500 mt-1 truncate", children: ["\uD83D\uDCC2 ", meta.path] })), meta.output && (_jsxs("p", { className: "text-xs text-slate-500 truncate", children: ["\uD83D\uDCE6 Output: ", meta.output] })), job.error_message && (_jsx("p", { className: "text-xs text-red-600 mt-1 bg-red-100 p-2 rounded mt-2", children: job.error_message }))] })] }) }) }, job.id));
                    }) })) })] }));
};
export default History;
//# sourceMappingURL=History.js.map