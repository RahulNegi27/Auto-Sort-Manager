import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSelectedFolder } from '../context/SelectedFolderContext';
export const SmartSearch = () => {
    const { selectedFolder } = useSelectedFolder();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [scanned, setScanned] = useState(null);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (selectedFolder) {
            scanFolder();
        }
    }, [selectedFolder]);
    const scanFolder = async () => {
        if (!selectedFolder)
            return;
        setLoading(true);
        try {
            const files = await window.electronAPI.scanDirectory(selectedFolder);
            setScanned(files);
        }
        catch (e) {
            console.error('Scan failed', e);
        }
        finally {
            setLoading(false);
        }
    };
    const runSearch = () => {
        if (!scanned)
            return alert('No files scanned yet');
        const q = query.toLowerCase();
        const res = scanned.filter(f => f.name.toLowerCase().includes(q) || (f.extension || '').toLowerCase().includes(q));
        setResults(res.slice(0, 200));
    };
    return (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "p-6 space-y-6", children: [_jsx("div", { className: `rounded-lg p-4 border-2 ${selectedFolder ? 'bg-green-50 border-green-300' : 'bg-yellow-50 border-yellow-300'}`, children: _jsxs("div", { children: [_jsx("p", { className: "font-semibold text-gray-800", children: "Searching in:" }), _jsx("p", { className: "font-mono text-sm text-gray-700 mt-1", children: selectedFolder ? selectedFolder : '❌ No folder selected - select from Dashboard' })] }) }), _jsxs("div", { className: "bg-white rounded-lg p-6", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Smart Search" }), _jsxs("div", { className: "flex gap-2 mb-4", children: [_jsx("input", { value: query, onChange: e => setQuery(e.target.value), placeholder: "Search by name or extension", className: "p-2 border rounded flex-1" }), _jsx("button", { onClick: runSearch, className: "px-3 py-1 bg-green-600 text-white rounded", children: "Search" })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-medium mb-2", children: "Results" }), results.length === 0 ? _jsx("div", { className: "text-sm text-gray-500", children: "No results" }) : (_jsx("ul", { className: "space-y-1 text-sm", children: results.map(r => (_jsxs("li", { className: "flex justify-between", children: [_jsxs("div", { children: [r.name, " ", _jsx("span", { className: "text-xs text-gray-500", children: r.path })] }), _jsxs("div", { className: "text-xs text-gray-600", children: [r.size, " bytes"] })] }, r.path))) }))] })] })] }));
};
export default SmartSearch;
//# sourceMappingURL=SmartSearch.js.map