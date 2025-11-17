import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAutoSort } from '../../hooks/useAutoSort';
import { useSelectedFolder } from '../../context/SelectedFolderContext';
import { useEffect } from 'react';
import { FolderOpen, Play, Zap, X, Plus } from 'lucide-react';
export const AutoSortEngine = () => {
    const { startSorting, stopSorting, getPreview, isSorting, progress, statistics, updateStatistics } = useAutoSort();
    const { selectedFolder } = useSelectedFolder();
    const [activeJob, setActiveJob] = useState(null);
    const [useML, setUseML] = useState(false);
    const [folderPath, setFolderPath] = useState(null);
    const [preview, setPreview] = useState(null);
    const [showAddRuleModal, setShowAddRuleModal] = useState(false);
    const [showDryRunPreview, setShowDryRunPreview] = useState(false);
    const [dryRunResults, setDryRunResults] = useState(null);
    const [newRuleName, setNewRuleName] = useState('');
    const [newRuleCategory, setNewRuleCategory] = useState('');
    const [newRuleConditionType, setNewRuleConditionType] = useState('extension');
    const [newRuleConditionValue, setNewRuleConditionValue] = useState('');
    const [sortRules, setSortRules] = useState([
        {
            id: '1',
            name: 'Document Files',
            category: 'documents',
            enabled: true,
            priority: 1,
            conditions: [
                { type: 'extension', operator: 'equals', value: '.pdf' },
                { type: 'extension', operator: 'equals', value: '.doc' },
                { type: 'extension', operator: 'equals', value: '.docx' },
                { type: 'extension', operator: 'equals', value: '.txt' }
            ]
        },
        {
            id: '2',
            name: 'Image Files',
            category: 'images',
            enabled: true,
            priority: 1,
            conditions: [
                { type: 'extension', operator: 'equals', value: '.jpg' },
                { type: 'extension', operator: 'equals', value: '.png' },
                { type: 'extension', operator: 'equals', value: '.gif' },
                { type: 'extension', operator: 'equals', value: '.bmp' }
            ]
        },
        {
            id: '3',
            name: 'Audio Files',
            category: 'audio',
            enabled: true,
            priority: 1,
            conditions: [
                { type: 'extension', operator: 'equals', value: '.mp3' },
                { type: 'extension', operator: 'equals', value: '.wav' },
                { type: 'extension', operator: 'equals', value: '.flac' }
            ]
        },
        {
            id: '4',
            name: 'Video Files',
            category: 'video',
            enabled: true,
            priority: 1,
            conditions: [
                { type: 'extension', operator: 'equals', value: '.mp4' },
                { type: 'extension', operator: 'equals', value: '.avi' },
                { type: 'extension', operator: 'equals', value: '.mov' }
            ]
        },
        {
            id: '5',
            name: 'Large Files',
            category: 'large_files',
            enabled: true,
            priority: 2,
            conditions: [
                { type: 'size', operator: 'greater', value: '100000000' } // 100MB
            ]
        },
        {
            id: '6',
            name: 'Recent Files',
            category: 'recent',
            enabled: true,
            priority: 3,
            conditions: [
                { type: 'date', operator: 'greater', value: '7' } // Last 7 days
            ]
        }
    ]);
    const handleStart = useCallback(async () => {
        const pathToUse = folderPath || selectedFolder;
        if (!pathToUse)
            return;
        const enabledRules = sortRules.filter(r => r.enabled);
        // Prevent running a real sort if no rules enabled and AI is off
        if (!useML && enabledRules.length === 0) {
            alert('Please enable at least one sorting rule or enable AI classification before running AutoSort.');
            return;
        }
        await startSorting(pathToUse, { dryRun: false, useML: useML, rules: enabledRules });
    }, [folderPath, selectedFolder, useML, startSorting]);
    const handleBrowse = async () => {
        try {
            const selected = await window.electronAPI.selectFolder();
            if (selected) {
                setFolderPath(selected);
                const p = await getPreview(selected);
                setPreview(p);
            }
        }
        catch (err) {
            console.error('Folder select error', err);
        }
    };
    // Sync with global selected folder: if user selects a folder in Dashboard, reflect it here
    useEffect(() => {
        if (selectedFolder) {
            setFolderPath(selectedFolder);
            (async () => {
                try {
                    const p = await getPreview(selectedFolder);
                    setPreview(p);
                }
                catch (e) {
                    console.warn('Preview load failed for selectedFolder', e);
                }
            })();
        }
    }, [selectedFolder]);
    // Load statistics on mount
    useEffect(() => {
        updateStatistics();
    }, [updateStatistics]);
    const handleDrop = async (e) => {
        e.preventDefault();
        const items = e.dataTransfer.items;
        if (items && items.length > 0) {
            const path = e.dataTransfer.items[0].getAsFileSystemHandle?.();
            // Fallback: try first file path
            const file = e.dataTransfer.files[0];
            if (file) {
                const folder = file.path || file.name;
                setFolderPath(folder);
                try {
                    const p = await getPreview(folder);
                    setPreview(p);
                }
                catch (err) {
                    console.warn('Preview fetch failed for dropped folder', err);
                }
            }
        }
    };
    const handleDragOver = (e) => {
        e.preventDefault();
    };
    const handleAddRule = () => {
        if (!newRuleName || !newRuleCategory || !newRuleConditionValue) {
            alert('Please fill in all fields');
            return;
        }
        const newRule = {
            id: Date.now().toString(),
            name: newRuleName,
            category: newRuleCategory,
            enabled: true,
            priority: 1,
            conditions: [
                {
                    type: newRuleConditionType,
                    operator: newRuleConditionType === 'size' ? 'greater' : 'equals',
                    value: newRuleConditionValue
                }
            ]
        };
        setSortRules([...sortRules, newRule]);
        setShowAddRuleModal(false);
        setNewRuleName('');
        setNewRuleCategory('');
        setNewRuleConditionValue('');
        alert('Rule added successfully!');
    };
    const handleDeleteRule = (id) => {
        if (confirm('Delete this rule?')) {
            setSortRules(sortRules.filter(r => r.id !== id));
        }
    };
    const simulateAutoSort = async (job) => {
        // Phase 1: Scanning
        for (let progress = 0; progress <= 40; progress += 10) {
            await new Promise(resolve => setTimeout(resolve, 500));
            setActiveJob(prev => prev ? {
                ...prev,
                progress,
                filesScanned: Math.floor(progress * 25)
            } : null);
        }
        // Phase 2: Organizing
        setActiveJob(prev => prev ? { ...prev, status: 'organizing' } : null);
        for (let progress = 40; progress <= 90; progress += 10) {
            await new Promise(resolve => setTimeout(resolve, 300));
            setActiveJob(prev => prev ? {
                ...prev,
                progress,
                filesOrganized: Math.floor((progress - 40) * 20)
            } : null);
        }
        // Phase 3: Completion
        setActiveJob(prev => prev ? {
            ...prev,
            status: 'completed',
            progress: 100,
            filesOrganized: 1000,
            endTime: new Date()
        } : null);
    };
    const getCategoryColor = (category) => {
        const colors = {
            documents: 'blue',
            images: 'green',
            audio: 'purple',
            video: 'orange',
            archives: 'red',
            large_files: 'yellow',
            recent: 'indigo'
        };
        return colors[category] || 'gray';
    };
    return (_jsxs("div", { className: "h-full flex flex-col p-6 space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "AutoSort Engine" }), _jsx("p", { className: "text-gray-600 mt-2", children: "Automatically organize files using AI-powered classification" })] }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("label", { className: "flex items-center space-x-2 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: useML, onChange: (e) => setUseML(e.target.checked), className: "w-4 h-4 text-primary-500 rounded focus:ring-primary-500" }), _jsxs("span", { className: "text-sm font-medium text-gray-700 flex items-center gap-1", children: [_jsx(Zap, { className: "w-4 h-4 text-blue-600" }), "Use AI Classification"] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [!selectedFolder && (_jsxs(motion.button, { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, onClick: handleBrowse, className: "bg-white border border-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 transition-colors", children: [_jsx(FolderOpen, { className: "w-5 h-5 text-primary-600" }), _jsx("span", { children: "Browse Folder" })] })), _jsxs(motion.button, { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, onClick: handleStart, disabled: !(folderPath || selectedFolder), className: `px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 transition-colors ${(folderPath || selectedFolder) ? 'bg-primary-500 hover:bg-primary-600 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`, children: [_jsx(Play, { className: "w-5 h-5" }), _jsx("span", { children: "Start AutoSort" })] })] })] })] }), _jsx("div", { className: "bg-white border border-dashed border-gray-200 rounded-lg p-6", children: _jsxs("div", { onDrop: handleDrop, onDragOver: handleDragOver, className: "flex items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Drag & drop a folder here, or use the Dashboard to select a folder." }), _jsx("p", { className: "text-sm text-gray-700 font-mono mt-2", children: folderPath || selectedFolder || 'No folder selected' })] }), _jsxs("div", { className: "flex items-center gap-3", children: [!selectedFolder && (_jsx("button", { onClick: handleBrowse, className: "px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200", children: "Browse" })), _jsx("button", { onClick: handleStart, disabled: !(folderPath || selectedFolder), className: `px-3 py-2 rounded ${(folderPath || selectedFolder) ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-400'}`, children: "Start" })] })] }) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: "lg:col-span-2 space-y-6", children: [activeJob && (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "bg-white rounded-xl p-6 shadow-sm border border-gray-100", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "text-lg font-semibold", children: activeJob.name }), _jsx("div", { className: `px-3 py-1 rounded-full text-sm font-medium ${activeJob.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    activeJob.status === 'error' ? 'bg-red-100 text-red-800' :
                                                        'bg-blue-100 text-blue-800'}`, children: activeJob.status.charAt(0).toUpperCase() + activeJob.status.slice(1) })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-sm text-gray-600 mb-2", children: [_jsx("span", { children: "Progress" }), _jsxs("span", { children: [activeJob.progress, "%"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-3", children: _jsx(motion.div, { initial: { width: 0 }, animate: { width: `${activeJob.progress}%` }, className: `h-3 rounded-full ${activeJob.status === 'completed' ? 'bg-green-500' :
                                                                activeJob.status === 'error' ? 'bg-red-500' :
                                                                    'bg-blue-500'}` }) })] }), _jsxs("div", { className: "grid grid-cols-3 gap-4 text-center", children: [_jsxs("div", { className: "p-3 bg-gray-50 rounded-lg", children: [_jsx("p", { className: "text-2xl font-bold text-gray-900", children: activeJob.filesScanned }), _jsx("p", { className: "text-sm text-gray-600", children: "Files Scanned" })] }), _jsxs("div", { className: "p-3 bg-gray-50 rounded-lg", children: [_jsx("p", { className: "text-2xl font-bold text-gray-900", children: activeJob.filesOrganized }), _jsx("p", { className: "text-sm text-gray-600", children: "Files Organized" })] }), _jsxs("div", { className: "p-3 bg-gray-50 rounded-lg", children: [_jsx("p", { className: "text-2xl font-bold text-gray-900", children: activeJob.rulesApplied }), _jsx("p", { className: "text-sm text-gray-600", children: "Rules Applied" })] })] }), _jsxs("div", { className: "flex justify-between text-sm text-gray-500", children: [_jsxs("span", { children: ["Started: ", activeJob.startTime.toLocaleTimeString()] }), activeJob.endTime && (_jsxs("span", { children: ["Completed: ", activeJob.endTime.toLocaleTimeString()] }))] })] })] })), _jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-gray-100", children: [_jsxs("div", { className: "p-6 border-b border-gray-200", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Sorting Rules" }), _jsx("p", { className: "text-gray-600 text-sm mt-1", children: "Configure how files should be automatically organized" })] }), _jsxs("div", { className: "p-6", children: [_jsx("div", { className: "space-y-4", children: sortRules.map((rule, index) => (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: index * 0.1 }, className: "flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("div", { className: `w-3 h-3 rounded-full bg-${getCategoryColor(rule.category)}-500` }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-gray-900", children: rule.name }), _jsx("p", { className: "text-sm text-gray-500 capitalize", children: rule.category.replace('_', ' ') }), _jsxs("p", { className: "text-xs text-gray-400", children: [rule.conditions.length, " condition", rule.conditions.length !== 1 ? 's' : ''] })] })] }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("div", { className: "text-right", children: [_jsxs("p", { className: "text-sm font-medium text-gray-900", children: ["Priority ", rule.priority] }), _jsx("p", { className: "text-xs text-gray-500", children: rule.enabled ? 'Active' : 'Disabled' })] }), _jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: rule.enabled, onChange: (e) => {
                                                                                const updated = [...sortRules];
                                                                                updated[index].enabled = e.target.checked;
                                                                                setSortRules(updated);
                                                                            }, className: "sr-only peer" }), _jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" })] }), rule.priority > 1 || index > 5 ? (_jsx("button", { onClick: () => handleDeleteRule(rule.id), className: "p-2 text-red-500 hover:bg-red-50 rounded transition-colors", children: _jsx(X, { className: "w-5 h-5" }) })) : null] })] }, rule.id))) }), _jsxs("button", { className: "w-full mt-4 border-2 border-dashed border-gray-300 rounded-lg py-4 text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors flex items-center justify-center space-x-2", onClick: () => setShowAddRuleModal(true), children: [_jsx(Plus, { className: "w-5 h-5" }), _jsx("span", { children: "Add Custom Rule" })] })] })] }), preview && (_jsxs("div", { className: "bg-white rounded-lg p-4 border border-gray-200", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold", children: "Preview Organization" }), _jsxs("p", { className: "text-sm text-gray-600", children: ["Estimated organization for ", _jsx("span", { className: "font-mono", children: folderPath || selectedFolder })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "text-sm text-gray-500", children: ["Estimated time: ", preview.estimatedTime, "s"] }), _jsxs("div", { className: "text-sm text-gray-500", children: ["Avg confidence: ", (preview.confidenceScore || 0).toFixed(2)] })] })] }), _jsx("div", { className: "mt-3 grid grid-cols-2 md:grid-cols-5 gap-3", children: Object.entries(preview.proposedStructure || {}).map(([cat, count]) => (_jsxs("div", { className: "p-3 bg-gray-50 rounded flex flex-col items-center", children: [_jsx("div", { className: "text-sm text-gray-600", children: cat }), _jsx("div", { className: "text-lg font-bold", children: count })] }, cat))) }), _jsxs("div", { className: "mt-4 flex justify-end items-center gap-3", children: [_jsx("button", { onClick: async () => {
                                                    const target = folderPath || selectedFolder;
                                                    if (!target) {
                                                        alert('No folder selected to refresh preview');
                                                        return;
                                                    }
                                                    try {
                                                        const p = await getPreview(target);
                                                        setPreview(p);
                                                        alert('Preview refreshed');
                                                    }
                                                    catch (e) {
                                                        console.error('Preview failed', e);
                                                        alert('Failed to refresh preview');
                                                    }
                                                }, className: "px-3 py-2 bg-gray-100 rounded", children: "Refresh" }), _jsx("button", { onClick: async () => {
                                                    const pathToUse = folderPath || selectedFolder;
                                                    if (!pathToUse)
                                                        return;
                                                    const enabledRules = sortRules.filter(r => r.enabled);
                                                    if (!confirm('Apply organization? This will move files on disk. Proceed?'))
                                                        return;
                                                    if (!useML && enabledRules.length === 0) {
                                                        alert('Please enable at least one sorting rule or enable AI classification before applying organization.');
                                                        return;
                                                    }
                                                    try {
                                                        await startSorting(pathToUse, { dryRun: false, useML: useML, rules: enabledRules, organizeBy: 'category' });
                                                        alert('AutoSort started — check progress in UI');
                                                    }
                                                    catch (e) {
                                                        console.error('Apply failed', e);
                                                        alert('Failed to apply organization');
                                                    }
                                                }, className: "px-4 py-2 bg-red-600 text-white rounded", children: "Apply Organization" })] })] }))] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-white rounded-xl p-6 shadow-sm border border-gray-100", children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "AutoSort Statistics" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center p-3 bg-gray-50 rounded-lg", children: [_jsx("span", { className: "text-gray-600", children: "Total Files Organized" }), _jsx("span", { className: "font-bold text-gray-900", children: statistics.totalFilesOrganized.toLocaleString() })] }), _jsxs("div", { className: "flex justify-between items-center p-3 bg-gray-50 rounded-lg", children: [_jsx("span", { className: "text-gray-600", children: "Space Optimized" }), _jsx("span", { className: "font-bold text-green-600", children: statistics.spaceSaved })] }), _jsxs("div", { className: "flex justify-between items-center p-3 bg-gray-50 rounded-lg", children: [_jsx("span", { className: "text-gray-600", children: "Accuracy Rate" }), _jsx("span", { className: "font-bold text-blue-600", children: statistics.accuracy })] }), _jsxs("div", { className: "flex justify-between items-center p-3 bg-gray-50 rounded-lg", children: [_jsx("span", { className: "text-gray-600", children: "Time Saved" }), _jsx("span", { className: "font-bold text-purple-600", children: statistics.timeSaved })] })] })] }), useML && (_jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-xl p-4", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Zap, { className: "w-5 h-5 text-blue-600" }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold text-blue-800", children: "AI Classification Enabled" }), _jsx("p", { className: "text-sm text-blue-600", children: "Using multi-strategy ML with file signatures, content analysis & heuristics for accurate classification." })] })] }) }))] })] }), showAddRuleModal && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: _jsxs(motion.div, { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, className: "bg-white rounded-lg p-6 max-w-md w-full shadow-xl", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h2", { className: "text-xl font-bold", children: "Add Custom Sorting Rule" }), _jsx("button", { onClick: () => setShowAddRuleModal(false), className: "text-gray-400 hover:text-gray-600", children: _jsx(X, { className: "w-6 h-6" }) })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Rule Name" }), _jsx("input", { type: "text", value: newRuleName, onChange: (e) => setNewRuleName(e.target.value), placeholder: "e.g., Source Code Files", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Target Category" }), _jsx("input", { type: "text", value: newRuleCategory, onChange: (e) => setNewRuleCategory(e.target.value), placeholder: "e.g., code, backups, work", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Condition Type" }), _jsxs("select", { value: newRuleConditionType, onChange: (e) => setNewRuleConditionType(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "extension", children: "File Extension" }), _jsx("option", { value: "size", children: "File Size" }), _jsx("option", { value: "name", children: "File Name" }), _jsx("option", { value: "date", children: "Modification Date" }), _jsx("option", { value: "content", children: "Content Type" })] })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: [newRuleConditionType === 'extension' && 'Extension (e.g., .js, .ts, .py)', newRuleConditionType === 'size' && 'Size in bytes (e.g., 1000000 for 1MB)', newRuleConditionType === 'name' && 'Name pattern or keyword', newRuleConditionType === 'date' && 'Days (e.g., 30 for last 30 days)', newRuleConditionType === 'content' && 'Content pattern'] }), _jsx("input", { type: "text", value: newRuleConditionValue, onChange: (e) => setNewRuleConditionValue(e.target.value), placeholder: "Enter value", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" })] })] }), _jsxs("div", { className: "mt-6 flex gap-3", children: [_jsx("button", { onClick: () => setShowAddRuleModal(false), className: "flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors", children: "Cancel" }), _jsx("button", { onClick: handleAddRule, className: "flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors", children: "Add Rule" })] })] }) }))] }));
};
//# sourceMappingURL=AutoSortEngine.js.map