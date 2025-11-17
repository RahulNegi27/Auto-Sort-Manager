import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSelectedFolder } from '../context/SelectedFolderContext';
export const CompressionTool = () => {
    const { selectedFolder } = useSelectedFolder();
    const [files, setFiles] = useState([]);
    const [format, setFormat] = useState('zip');
    const [output, setOutput] = useState('archive.zip');
    const [running, setRunning] = useState(false);
    const runCompress = async () => {
        if (!selectedFolder)
            return alert('Select a folder from Dashboard');
        if (files.length === 0) {
            // Auto-load files from selected folder
            const scanned = await window.electronAPI.scanDirectory(selectedFolder);
            const fileList = scanned.filter((f) => f.type === 'file').slice(0, 200).map((f) => f.path);
            setFiles(fileList);
            if (fileList.length === 0)
                return alert('No files to compress');
        }
        setRunning(true);
        try {
            const outPath = output || `archive.${format}`;
            await window.electronAPI.compressFiles(files.length > 0 ? files : [], outPath, format);
            alert('Compression completed');
        }
        catch (e) {
            console.error(e);
            alert('Compression failed');
        }
        finally {
            setRunning(false);
        }
    };
    return (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "p-6 space-y-6", children: [_jsx("div", { className: `rounded-lg p-4 border-2 ${selectedFolder ? 'bg-green-50 border-green-300' : 'bg-yellow-50 border-yellow-300'}`, children: _jsxs("div", { children: [_jsx("p", { className: "font-semibold text-gray-800", children: "Working on:" }), _jsx("p", { className: "font-mono text-sm text-gray-700 mt-1", children: selectedFolder ? selectedFolder : '❌ No folder selected - select from Dashboard' })] }) }), _jsxs("div", { className: "bg-white rounded-lg p-6", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Compression Tool" }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-sm", children: "Format" }), _jsxs("select", { value: format, onChange: e => setFormat(e.target.value), className: "p-2 border rounded", children: [_jsx("option", { value: "zip", children: "ZIP" }), _jsx("option", { value: "tar", children: "TAR" }), _jsx("option", { value: "gzip", children: "GZIP" }), _jsx("option", { value: "7z", children: "7Z" })] })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-sm", children: "Output file" }), _jsx("input", { value: output, onChange: e => setOutput(e.target.value), className: "p-2 border rounded w-64" })] }), _jsx("div", { className: "mb-4", children: _jsx("button", { onClick: runCompress, disabled: running || !(selectedFolder), className: "px-3 py-1 bg-green-600 text-white rounded", children: running ? 'Running...' : 'Compress' }) }), _jsxs("div", { children: [_jsx("h3", { className: "font-medium mb-2", children: "Files (sample)" }), _jsx("ul", { className: "list-disc pl-6 text-sm", children: files.slice(0, 200).map(f => _jsx("li", { children: f }, f)) })] })] })] }));
};
export default CompressionTool;
//# sourceMappingURL=CompressionTool.js.map