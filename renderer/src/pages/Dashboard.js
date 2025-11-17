import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../hooks/useDashboard';
import { useSelectedFolder } from '../context/SelectedFolderContext';
import { useEffect, useState } from 'react';
export const Dashboard = () => {
    const { stats, systemUsage, isLoading } = useDashboard();
    const { selectedFolder, setSelectedFolder, clearSelectedFolder } = useSelectedFolder();
    const [folderStats, setFolderStats] = useState(null);
    const [onboardDismissed, setOnboardDismissed] = useState(() => {
        try {
            return localStorage.getItem('autosort:onboardDismissed') === '1';
        }
        catch (e) {
            return false;
        }
    });
    const [confirmVisible, setConfirmVisible] = useState(false);
    const [loadingStats, setLoadingStats] = useState(false);
    useEffect(() => {
        (async () => {
            if (!selectedFolder) {
                setFolderStats(null);
                return;
            }
            setLoadingStats(true);
            try {
                const files = await window.electronAPI.scanDirectory(selectedFolder);
                const total = files.length;
                const totalSize = files.reduce((a, b) => a + (b.size || 0), 0);
                // Count by file type
                const byType = {};
                const bySizeRange = { small: 0, medium: 0, large: 0, huge: 0 };
                const topFiles = files
                    .sort((a, b) => (b.size || 0) - (a.size || 0))
                    .slice(0, 5)
                    .map((f) => ({ name: f.name, size: f.size, type: f.extension || 'folder' }));
                files.forEach((f) => {
                    const ext = f.extension || 'folder';
                    byType[ext] = (byType[ext] || 0) + 1;
                    const size = f.size || 0;
                    if (size < 1024 * 1024)
                        bySizeRange.small++;
                    else if (size < 10 * 1024 * 1024)
                        bySizeRange.medium++;
                    else if (size < 100 * 1024 * 1024)
                        bySizeRange.large++;
                    else
                        bySizeRange.huge++;
                });
                setFolderStats({ total, size: totalSize, byType, bySizeRange, topFiles });
            }
            catch (e) {
                console.error('Failed to scan folder:', e);
                setFolderStats(null);
            }
            finally {
                setLoadingStats(false);
            }
        })();
    }, [selectedFolder]);
    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const files = e.dataTransfer.files;
            if (files && files.length > 0) {
                const file = files[0];
                const path = file.path;
                if (path) {
                    setSelectedFolder(path);
                    setConfirmVisible(true);
                    setTimeout(() => setConfirmVisible(false), 3000);
                }
            }
        }
        catch (err) {
            console.warn('Drop handling failed', err);
        }
    };
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };
    const navigate = useNavigate();
    if (isLoading) {
        return (_jsx("div", { className: "flex items-center justify-center h-screen", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" }) }));
    }
    return (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "w-full h-full p-8 space-y-8 overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100", children: [_jsx("div", { onDrop: handleDrop, onDragOver: handleDragOver, className: `rounded-2xl border-4 border-dashed p-12 text-center transition-all ${selectedFolder
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-400'
                    : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-400 hover:shadow-xl'}`, children: _jsxs("div", { className: "space-y-6", children: [!selectedFolder ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "text-6xl", children: "\uD83D\uDCC1" }), _jsxs("div", { children: [_jsx("h2", { className: "text-4xl font-bold text-gray-900 mb-3", children: "Select Your Folder" }), _jsx("p", { className: "text-xl text-gray-700 mb-2", children: "Drag a folder here or click to browse" }), _jsx("p", { className: "text-sm text-gray-600", children: "All AutoSort tools will use this folder automatically" })] }), _jsx("div", { className: "flex gap-4 justify-center", children: _jsx("button", { onClick: async () => {
                                            const p = await window.electronAPI.selectFolder();
                                            if (p) {
                                                setSelectedFolder(p);
                                                setConfirmVisible(true);
                                                setTimeout(() => setConfirmVisible(false), 3000);
                                            }
                                        }, className: "px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-105", children: "\uD83D\uDCC2 BROWSE FOLDER" }) }), !onboardDismissed && (_jsxs("div", { className: "bg-white/90 rounded-lg p-4 border border-blue-200 max-w-xl mx-auto", children: [_jsxs("p", { className: "text-sm text-gray-700", children: ["\uD83D\uDCA1 ", _jsx("span", { className: "font-semibold", children: "Tip:" }), " Select a folder once. AutoSort, Analysis, Compression, Duplicates and other tools will all work with this folder automatically."] }), _jsx("button", { onClick: () => { setOnboardDismissed(true); try {
                                                localStorage.setItem('autosort:onboardDismissed', '1');
                                            }
                                            catch (e) { } }, className: "text-xs text-gray-500 mt-2 underline", children: "Dismiss" })] }))] })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "text-6xl", children: "\u2713" }), _jsxs("div", { children: [_jsx("h2", { className: "text-4xl font-bold text-green-700 mb-3", children: "Folder Selected!" }), _jsxs("div", { className: "bg-white rounded-xl p-6 mb-4 border border-green-300 max-w-2xl mx-auto", children: [_jsx("p", { className: "font-mono text-sm text-gray-800 break-all mb-3", children: selectedFolder }), loadingStats ? (_jsxs("div", { className: "flex items-center justify-center gap-2", children: [_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-green-600" }), _jsx("span", { className: "text-sm text-gray-600", children: "Loading folder details..." })] })) : folderStats ? (_jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { className: "bg-green-50 p-3 rounded-lg", children: [_jsx("p", { className: "text-gray-600 text-xs", children: "Total Files" }), _jsx("p", { className: "text-2xl font-bold text-green-700", children: folderStats.total })] }), _jsxs("div", { className: "bg-blue-50 p-3 rounded-lg", children: [_jsx("p", { className: "text-gray-600 text-xs", children: "Total Size" }), _jsx("p", { className: "text-2xl font-bold text-blue-700", children: folderStats.size > 1024 * 1024 * 1024
                                                                        ? (folderStats.size / 1024 / 1024 / 1024).toFixed(2) + ' GB'
                                                                        : (folderStats.size / 1024 / 1024).toFixed(2) + ' MB' })] }), _jsxs("div", { className: "bg-purple-50 p-3 rounded-lg", children: [_jsx("p", { className: "text-gray-600 text-xs", children: "Avg File Size" }), _jsx("p", { className: "text-2xl font-bold text-purple-700", children: folderStats.total > 0
                                                                        ? (folderStats.size / folderStats.total / 1024).toFixed(1) + ' KB'
                                                                        : 'N/A' })] }), _jsxs("div", { className: "bg-orange-50 p-3 rounded-lg", children: [_jsx("p", { className: "text-gray-600 text-xs", children: "File Types" }), _jsx("p", { className: "text-2xl font-bold text-orange-700", children: Object.keys(folderStats.byType).length })] })] })) : null] })] }), _jsxs("div", { className: "flex gap-4 justify-center", children: [_jsx("button", { onClick: async () => {
                                                const p = await window.electronAPI.selectFolder();
                                                if (p)
                                                    setSelectedFolder(p);
                                            }, className: "px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg transition-all", children: "\uD83D\uDCC2 CHANGE FOLDER" }), _jsx("button", { onClick: () => clearSelectedFolder(), className: "px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-lg transition-all", children: "\uD83D\uDDD1\uFE0F CLEAR" })] })] })), confirmVisible && (_jsx(motion.div, { initial: { scale: 0, opacity: 0 }, animate: { scale: 1, opacity: 1 }, className: "text-xl font-bold text-green-600", children: "\u2713 Folder Selected!" }))] }) }), selectedFolder && folderStats && (_jsxs("div", { className: "space-y-6", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "\uD83D\uDCCA Folder Analysis" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "bg-white rounded-2xl p-8 shadow-lg border border-gray-200", children: [_jsx("h3", { className: "text-lg font-bold text-gray-900 mb-6", children: "\uD83D\uDCC8 File Size Distribution" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between mb-2", children: [_jsx("span", { className: "text-sm font-medium text-gray-700", children: "Tiny (<1MB)" }), _jsx("span", { className: "text-sm font-bold text-gray-900", children: folderStats.bySizeRange.small })] }), _jsx("div", { className: "w-full h-3 bg-gray-200 rounded-full overflow-hidden", children: _jsx("div", { className: "h-full bg-blue-500 rounded-full", style: { width: `${(folderStats.bySizeRange.small / folderStats.total) * 100}%` } }) })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between mb-2", children: [_jsx("span", { className: "text-sm font-medium text-gray-700", children: "Small (1-10MB)" }), _jsx("span", { className: "text-sm font-bold text-gray-900", children: folderStats.bySizeRange.medium })] }), _jsx("div", { className: "w-full h-3 bg-gray-200 rounded-full overflow-hidden", children: _jsx("div", { className: "h-full bg-green-500 rounded-full", style: { width: `${(folderStats.bySizeRange.medium / folderStats.total) * 100}%` } }) })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between mb-2", children: [_jsx("span", { className: "text-sm font-medium text-gray-700", children: "Large (10-100MB)" }), _jsx("span", { className: "text-sm font-bold text-gray-900", children: folderStats.bySizeRange.large })] }), _jsx("div", { className: "w-full h-3 bg-gray-200 rounded-full overflow-hidden", children: _jsx("div", { className: "h-full bg-orange-500 rounded-full", style: { width: `${(folderStats.bySizeRange.large / folderStats.total) * 100}%` } }) })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between mb-2", children: [_jsx("span", { className: "text-sm font-medium text-gray-700", children: "Huge (>100MB)" }), _jsx("span", { className: "text-sm font-bold text-gray-900", children: folderStats.bySizeRange.huge })] }), _jsx("div", { className: "w-full h-3 bg-gray-200 rounded-full overflow-hidden", children: _jsx("div", { className: "h-full bg-red-500 rounded-full", style: { width: `${(folderStats.bySizeRange.huge / folderStats.total) * 100}%` } }) })] })] })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 }, className: "bg-white rounded-2xl p-8 shadow-lg border border-gray-200", children: [_jsx("h3", { className: "text-lg font-bold text-gray-900 mb-6", children: "\uD83D\uDCC1 File Types" }), _jsx("div", { className: "space-y-3 max-h-64 overflow-y-auto", children: Object.entries(folderStats.byType)
                                            .sort((a, b) => b[1] - a[1])
                                            .slice(0, 10)
                                            .map(([type, count]) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded-lg", children: [_jsxs("span", { className: "text-sm font-medium text-gray-700", children: [type || 'folder', " ", type === '' && '(Folders)'] }), _jsx("span", { className: "inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full text-xs font-bold", children: count })] }, type))) })] })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2 }, className: "bg-white rounded-2xl p-8 shadow-lg border border-gray-200", children: [_jsx("h3", { className: "text-lg font-bold text-gray-900 mb-6", children: "\uD83C\uDFC6 Largest Files" }), _jsx("div", { className: "space-y-3", children: folderStats.topFiles.map((file, idx) => (_jsxs("div", { className: "flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors", children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium text-gray-900 truncate", children: file.name }), _jsx("p", { className: "text-xs text-gray-600", children: file.type || 'folder' })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-sm font-bold text-gray-900", children: file.size > 1024 * 1024
                                                        ? (file.size / 1024 / 1024).toFixed(2) + ' MB'
                                                        : (file.size / 1024).toFixed(2) + ' KB' }), _jsx("div", { className: "w-32 h-2 bg-gray-300 rounded-full mt-1 overflow-hidden", children: _jsx("div", { className: "h-full bg-purple-500 rounded-full", style: { width: `${(file.size / folderStats.size) * 100}%` } }) })] })] }, idx))) })] })] })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "\uD83D\uDCC1 Total Files" }), _jsx("p", { className: "text-3xl font-bold text-gray-900 mt-2", children: folderStats ? folderStats.total : (stats?.totalFiles ?? '—') }), folderStats && _jsx("p", { className: "text-xs text-gray-500 mt-2", children: "In selected folder" })] }), _jsx("div", { className: "text-4xl opacity-30", children: "\uD83D\uDCC2" })] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.05 }, className: "bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all", children: _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "\uD83D\uDCBE Storage" }), _jsx("div", { className: "mt-3", children: _jsx("div", { className: "flex items-center gap-4", children: _jsx("div", { className: "flex-1", children: folderStats ? (_jsxs(_Fragment, { children: [_jsxs("p", { className: "text-2xl font-bold text-gray-900", children: [(folderStats.size / 1024 / 1024 / 1024).toFixed(2), " GB"] }), _jsx("p", { className: "text-xs text-gray-600 mt-1", children: "Folder total" })] })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "w-full bg-gray-200 h-4 rounded-full overflow-hidden", children: _jsx("div", { className: "h-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500", style: { width: `${stats?.diskUsage ?? 0}%` } }) }), _jsxs("p", { className: "text-xs text-gray-600 mt-2 font-semibold", children: [stats?.diskUsage ?? 0, "% System Used"] })] })) }) }) })] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 }, className: "bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all", children: _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "\uD83D\uDCCA File Types" }), _jsx("div", { className: "mt-3 space-y-1 text-xs text-gray-700", children: folderStats ? (Object.entries(folderStats.byType || {})
                                        .sort((a, b) => b[1] - a[1])
                                        .slice(0, 3)
                                        .map(([type, count]) => (_jsxs("div", { className: "flex justify-between", children: [_jsx("div", { className: "capitalize font-medium", children: type || 'folder' }), _jsx("div", { className: "font-bold", children: count })] }, type)))) : (_jsxs(_Fragment, { children: [stats?.diskUsageByType && Object.entries(stats.diskUsageByType).slice(0, 3).map(([k, v]) => (_jsxs("div", { className: "flex justify-between", children: [_jsx("div", { className: "capitalize font-medium", children: k.replace('_', ' ') }), _jsx("div", { className: "font-bold", children: String(v) })] }, k))), !stats?.diskUsageByType && _jsx("div", { className: "text-gray-400", children: "No data" })] })) })] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.15 }, className: "bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all", children: _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "\uD83C\uDFAF Space Saved" }), _jsx("p", { className: "text-3xl font-bold text-green-600 mt-2", children: stats?.spaceSaved ?? '—' }), _jsx("p", { className: "text-xs text-gray-500 mt-2", children: "From organization & compression" })] }) })] }), _jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-6", children: "Available Tools" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: [
                            { name: 'File Explorer (CRUD)', desc: 'Browse & perform CRUD operations on files', emoji: '📂', path: '/files', color: 'blue' },
                            { name: 'AutoSort', desc: 'Automatically organize files by type & rules', emoji: '⚡', path: '/autosort', color: 'yellow' },
                            { name: 'Duplicate Finder', desc: 'Find and remove duplicate files', emoji: '👥', path: '/duplicates', color: 'purple' },
                            { name: 'Compression', desc: 'Compress files and save space', emoji: '📦', path: '/compress', color: 'green' },
                            { name: 'Smart Search', desc: 'Find files using natural language', emoji: '🔍', path: '/search', color: 'pink' },
                            { name: 'Analytics', desc: 'Analyze file distribution & usage', emoji: '📊', path: '/analytics', color: 'indigo' },
                        ].map((tool, i) => (_jsxs(motion.button, { onClick: () => navigate(tool.path), initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.05 }, className: "bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl hover:border-blue-400 transition-all text-left transform hover:scale-105", children: [_jsx("div", { className: "text-4xl mb-3", children: tool.emoji }), _jsx("h3", { className: "font-bold text-lg text-gray-900", children: tool.name }), _jsx("p", { className: "text-sm text-gray-600 mt-2", children: tool.desc })] }, tool.name))) })] })] }));
};
//# sourceMappingURL=Dashboard.js.map