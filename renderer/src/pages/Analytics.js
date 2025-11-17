import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useSelectedFolder } from '../context/SelectedFolderContext';
import { BarChart3, PieChart as PieIcon, TrendingUp, RefreshCw } from 'lucide-react';
const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'];
export const Analytics = () => {
    const { selectedFolder } = useSelectedFolder();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [chartData, setChartData] = useState([]);
    const [pieData, setPieData] = useState([]);
    useEffect(() => {
        if (selectedFolder) {
            runAnalysis();
        }
    }, [selectedFolder]);
    const runAnalysis = async () => {
        const folderToUse = selectedFolder;
        if (!folderToUse)
            return;
        setLoading(true);
        try {
            const files = await window.electronAPI.scanDirectory(folderToUse);
            const totalFiles = files.length;
            const totalSize = files.reduce((a, b) => a + (b.size || 0), 0);
            const byExt = {};
            for (const f of files) {
                const ext = f.extension || 'folder';
                if (!byExt[ext])
                    byExt[ext] = { count: 0, size: 0 };
                byExt[ext].count += 1;
                byExt[ext].size += f.size || 0;
            }
            // Prepare chart data (top 8 extensions)
            const chartDataArray = Object.entries(byExt)
                .map(([ext, data]) => ({
                name: ext,
                files: data.count,
                size: Math.round(data.size / 1024 / 1024), // MB
            }))
                .sort((a, b) => b.files - a.files)
                .slice(0, 8);
            // Prepare pie data (file count by extension)
            const pieDataArray = chartDataArray.map(d => ({
                name: d.name,
                value: d.files,
            }));
            const largest = [...files]
                .filter(f => f.type === 'file')
                .sort((a, b) => b.size - a.size)
                .slice(0, 10);
            setChartData(chartDataArray);
            setPieData(pieDataArray);
            setStats({ totalFiles, totalSize, byExt, largest });
        }
        catch (e) {
            console.error(e);
        }
        finally {
            setLoading(false);
        }
    };
    const formatBytes = (bytes) => {
        if (bytes === 0)
            return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    return (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "w-full h-full p-8 space-y-8 overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(BarChart3, { className: "w-8 h-8 text-blue-600" }), _jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "\uD83D\uDCCA Analytics" })] }), _jsxs("button", { onClick: runAnalysis, disabled: loading || !selectedFolder, className: "flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-all", children: [_jsx(RefreshCw, { className: `w-5 h-5 ${loading ? 'animate-spin' : ''}` }), loading ? 'Analyzing...' : 'Refresh'] })] }), selectedFolder ? (_jsxs("div", { className: "bg-white rounded-lg p-4 border-l-4 border-green-500 shadow-sm", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Analyzing:" }), _jsx("p", { className: "font-mono text-sm text-gray-900 mt-1 truncate", children: selectedFolder })] })) : (_jsx("div", { className: "bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-500 shadow-sm", children: _jsx("p", { className: "text-sm font-medium text-yellow-800", children: "\uD83D\uDCC2 No folder selected. Select one from the Dashboard." }) })), stats && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "bg-white rounded-xl p-6 shadow-lg border border-gray-200", children: [_jsx("div", { className: "text-sm font-medium text-gray-600", children: "\uD83D\uDCC1 Total Files" }), _jsx("div", { className: "text-4xl font-bold text-gray-900 mt-2", children: stats.totalFiles }), _jsx("p", { className: "text-xs text-gray-500 mt-2", children: "Files in folder" })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.05 }, className: "bg-white rounded-xl p-6 shadow-lg border border-gray-200", children: [_jsx("div", { className: "text-sm font-medium text-gray-600", children: "\uD83D\uDCBE Total Size" }), _jsx("div", { className: "text-3xl font-bold text-gray-900 mt-2", children: formatBytes(stats.totalSize) }), _jsx("p", { className: "text-xs text-gray-500 mt-2", children: "Combined file size" })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 }, className: "bg-white rounded-xl p-6 shadow-lg border border-gray-200", children: [_jsx("div", { className: "text-sm font-medium text-gray-600", children: "\uD83D\uDCCA Types" }), _jsx("div", { className: "text-4xl font-bold text-gray-900 mt-2", children: Object.keys(stats.byExt).length }), _jsx("p", { className: "text-xs text-gray-500 mt-2", children: "File extensions" })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8", children: [_jsxs(motion.div, { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, className: "bg-white rounded-xl p-6 shadow-lg border border-gray-200", children: [_jsxs("h2", { className: "text-xl font-bold text-gray-900 mb-4 flex items-center gap-2", children: [_jsx(BarChart3, { className: "w-5 h-5 text-blue-600" }), "Files by Type"] }), _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(BarChart, { data: chartData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#e5e7eb" }), _jsx(XAxis, { dataKey: "name", angle: -45, textAnchor: "end", height: 80, tick: { fontSize: 12 } }), _jsx(YAxis, { label: { value: 'Count', angle: -90, position: 'insideLeft' } }), _jsx(Tooltip, { contentStyle: {
                                                        backgroundColor: '#1f2937',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        color: '#fff',
                                                    } }), _jsx(Legend, {}), _jsx(Bar, { dataKey: "files", fill: "#3b82f6", radius: [8, 8, 0, 0], name: "File Count" })] }) })] }), _jsxs(motion.div, { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, transition: { delay: 0.1 }, className: "bg-white rounded-xl p-6 shadow-lg border border-gray-200", children: [_jsxs("h2", { className: "text-xl font-bold text-gray-900 mb-4 flex items-center gap-2", children: [_jsx(PieIcon, { className: "w-5 h-5 text-green-600" }), "Distribution"] }), _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: pieData, cx: "50%", cy: "50%", labelLine: false, label: (entry) => `${entry.name} (${entry.value})`, outerRadius: 100, fill: "#8884d8", dataKey: "value", children: pieData.map((entry, index) => (_jsx(Cell, { fill: COLORS[index % COLORS.length] }, `cell-${index}`))) }), _jsx(Tooltip, { contentStyle: {
                                                        backgroundColor: '#1f2937',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        color: '#fff',
                                                    } })] }) })] })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2 }, className: "bg-white rounded-xl p-6 shadow-lg border border-gray-200", children: [_jsxs("h2", { className: "text-xl font-bold text-gray-900 mb-4 flex items-center gap-2", children: [_jsx(TrendingUp, { className: "w-5 h-5 text-orange-600" }), "Top 10 Largest Files"] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "border-b border-gray-200", children: _jsxs("tr", { className: "text-gray-600 font-semibold", children: [_jsx("th", { className: "text-left py-3 px-2", children: "File Name" }), _jsx("th", { className: "text-right py-3 px-2", children: "Size" }), _jsx("th", { className: "text-right py-3 px-2", children: "Modified" })] }) }), _jsx("tbody", { children: stats.largest.map((f, i) => (_jsxs(motion.tr, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { delay: i * 0.02 }, className: "border-b border-gray-100 hover:bg-gray-50 transition-colors", children: [_jsx("td", { className: "py-3 px-2 truncate text-gray-900 font-medium", children: f.name }), _jsx("td", { className: "py-3 px-2 text-right text-gray-700 font-semibold", children: formatBytes(f.size) }), _jsx("td", { className: "py-3 px-2 text-right text-gray-500 text-xs", children: new Date(f.modifiedAt).toLocaleDateString() })] }, f.path))) })] }) })] })] })), !stats && !loading && (_jsx("div", { className: "flex items-center justify-center py-20", children: _jsxs("div", { className: "text-center text-gray-500", children: [_jsx(BarChart3, { className: "w-16 h-16 mx-auto mb-4 opacity-30" }), _jsx("p", { className: "text-lg font-medium", children: "Select a folder and click Refresh to analyze" })] }) }))] }));
};
export default Analytics;
//# sourceMappingURL=Analytics.js.map