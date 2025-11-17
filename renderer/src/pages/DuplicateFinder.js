import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSelectedFolder } from '../context/SelectedFolderContext';
export const DuplicateFinder = () => {
    const { selectedFolder } = useSelectedFolder();
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [minSize, setMinSize] = useState(1);
    const runFind = async () => {
        if (!selectedFolder)
            return alert('Select a folder from Dashboard');
        setLoading(true);
        try {
            const res = await window.electronAPI.findDuplicates(selectedFolder, { minSize });
            // Normalize modified dates and selected flag
            const normalized = res.map(g => ({
                id: g.id,
                files: g.files.map((f) => ({ ...f, selected: false })),
                totalSize: g.totalSize,
                hash: g.hash,
                type: g.type
            }));
            setGroups(normalized);
        }
        catch (e) {
            console.error('Find duplicates failed', e);
            alert('Failed to find duplicates: ' + String(e));
        }
        finally {
            setLoading(false);
        }
    };
    const toggleFile = (groupId, fileId) => {
        setGroups(gs => gs.map(g => {
            if (g.id !== groupId)
                return g;
            return { ...g, files: g.files.map(f => f.id === fileId ? { ...f, selected: !f.selected } : f) };
        }));
    };
    const deleteSelected = async () => {
        const toDelete = [];
        groups.forEach(g => g.files.forEach(f => { if (f.selected)
            toDelete.push(f); }));
        if (toDelete.length === 0) {
            alert('No files selected');
            return;
        }
        if (!confirm(`Delete ${toDelete.length} files? This cannot be undone.`))
            return;
        // Check settings to decide whether to move to quarantine or delete
        const settings = await window.electronAPI.getSettings();
        const useQuarantine = !!settings?.enableTrash;
        for (const f of toDelete) {
            try {
                if (useQuarantine && window.electronAPI.moveToQuarantine) {
                    await window.electronAPI.moveToQuarantine(f.path);
                }
                else {
                    await window.electronAPI.deleteFile(f.path);
                }
            }
            catch (e) {
                console.error('Delete/Quarantine failed', f.path, e);
            }
        }
        // Refresh groups by removing processed files locally
        setGroups(gs => gs.map(g => ({ ...g, files: g.files.filter(f => !f.selected) })).filter(g => g.files.length > 1));
    };
    return (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "p-6 space-y-6", children: [_jsx("div", { className: `rounded-lg p-4 border-2 transition ${selectedFolder ? 'bg-green-50 border-green-300' : 'bg-yellow-50 border-yellow-300'}`, children: _jsxs("div", { children: [_jsx("p", { className: "font-semibold text-gray-800", children: "Analyzing:" }), _jsx("p", { className: "font-mono text-sm text-gray-700 mt-1", children: selectedFolder ? selectedFolder : '❌ No folder selected - select from Dashboard' })] }) }), _jsxs("div", { className: "bg-white rounded-lg p-6", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Duplicate Finder" }), _jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("div", { className: "text-sm text-gray-600", children: "Min size (bytes):" }), _jsx("input", { type: "number", value: minSize, onChange: e => setMinSize(Number(e.target.value)), className: "border rounded px-2 py-1 w-32" }), _jsx("button", { onClick: runFind, disabled: !selectedFolder || loading, className: "px-4 py-2 ml-auto bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded font-medium transition", children: loading ? 'Scanning...' : 'Find Duplicates' })] }), _jsx("div", { children: groups.length === 0 ? (_jsx("div", { className: "text-sm text-gray-500", children: "No duplicate groups found." })) : (_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "flex gap-2 mb-2", children: _jsx("button", { onClick: deleteSelected, className: "px-3 py-1 bg-red-600 text-white rounded", children: "Delete Selected" }) }), groups.map(group => (_jsxs("div", { className: "border rounded p-3", children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsxs("div", { className: "text-sm font-medium", children: ["Group: ", group.hash, " \u2014 ", group.files.length, " files"] }), _jsxs("div", { className: "text-sm text-gray-500", children: ["Total: ", group.totalSize, " bytes"] })] }), _jsx("div", { className: "space-y-1", children: group.files.map(f => (_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("input", { type: "checkbox", checked: f.selected, onChange: () => toggleFile(group.id, f.id) }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "text-sm", children: f.name }), _jsx("div", { className: "text-xs text-gray-500", children: f.path })] }), _jsxs("div", { className: "text-sm text-gray-600", children: [f.size, " bytes"] })] }, f.id))) })] }, group.id)))] })) })] })] }));
};
export default DuplicateFinder;
//# sourceMappingURL=DuplicateFinder.js.map