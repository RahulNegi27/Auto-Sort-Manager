import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Folder, Edit3, Eye, Plus, Copy, CheckCircle, AlertCircle, X, FolderOpen } from 'lucide-react';
import { useSelectedFolder } from '../context/SelectedFolderContext';
export const FileOperations = ({ path = '' }) => {
    const { selectedFolder } = useSelectedFolder();
    const [activeTab, setActiveTab] = useState('create');
    const [filePath, setFilePath] = useState(path || selectedFolder || '');
    const [fileContent, setFileContent] = useState('');
    const [fileName, setFileName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    // Sync with global selectedFolder when it changes
    useEffect(() => {
        if (selectedFolder && !path) {
            setFilePath(selectedFolder);
        }
    }, [selectedFolder, path]);
    const showResult = (type, message, data) => {
        setResult({ type, message, data });
        setTimeout(() => setResult(null), 4000);
    };
    const handleBrowseFolder = async () => {
        try {
            const folder = await window.electronAPI.selectFolder();
            if (folder) {
                setFilePath(folder);
            }
        }
        catch (err) {
            showResult('error', `Failed to browse folder: ${err}`);
        }
    };
    // CREATE operations
    const handleCreateFile = async () => {
        if (!filePath || !fileName) {
            showResult('error', 'Please provide folder path and file name');
            return;
        }
        setIsLoading(true);
        try {
            const fullPath = `${filePath}/${fileName}`;
            await window.electronAPI.createFile(fullPath, fileContent);
            showResult('success', `File created: ${fileName}`);
            setFileName('');
            setFileContent('');
        }
        catch (error) {
            showResult('error', `Failed to create file: ${error}`);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleCreateFolder = async () => {
        if (!filePath || !fileName) {
            showResult('error', 'Please provide folder path and folder name');
            return;
        }
        setIsLoading(true);
        try {
            const fullPath = `${filePath}/${fileName}`;
            await window.electronAPI.createDirectory(fullPath);
            showResult('success', `Folder created: ${fileName}`);
            setFileName('');
        }
        catch (error) {
            showResult('error', `Failed to create folder: ${error}`);
        }
        finally {
            setIsLoading(false);
        }
    };
    // READ operations
    const handleReadFile = async () => {
        if (!filePath) {
            showResult('error', 'Please provide file path');
            return;
        }
        setIsLoading(true);
        try {
            const content = await window.electronAPI.readFile(filePath);
            // Handle both direct string response and object with content property
            setFileContent(typeof content === 'string' ? content : (content?.content || ''));
            showResult('success', 'File read successfully');
        }
        catch (error) {
            console.error('Read file error:', error);
            showResult('error', `Failed to read file: ${error?.message || error}`);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleReadMetadata = async () => {
        if (!filePath) {
            showResult('error', 'Please provide file path');
            return;
        }
        setIsLoading(true);
        try {
            const response = await window.electronAPI.readFileMetadata(filePath);
            const metadata = response?.metadata || response;
            const info = `
Name: ${metadata.name}
Type: ${metadata.type}
Size: ${(metadata.size / 1024).toFixed(2)} KB
Created: ${new Date(metadata.createdAt).toLocaleString()}
Modified: ${new Date(metadata.modifiedAt).toLocaleString()}
Permissions: ${metadata.permissions}
      `.trim();
            setFileContent(info);
            showResult('success', 'Metadata read successfully');
        }
        catch (error) {
            console.error('Read metadata error:', error);
            showResult('error', `Failed to read metadata: ${error?.message || error}`);
        }
        finally {
            setIsLoading(false);
        }
    };
    // UPDATE operations
    const handleUpdateFile = async () => {
        if (!filePath || !fileContent) {
            showResult('error', 'Please provide file path and content');
            return;
        }
        setIsLoading(true);
        try {
            const response = await window.electronAPI.updateFile(filePath, fileContent);
            showResult('success', response?.message || 'File updated successfully');
        }
        catch (error) {
            console.error('Update file error:', error);
            showResult('error', `Failed to update file: ${error?.message || error}`);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleAppendFile = async () => {
        if (!filePath || !fileContent) {
            showResult('error', 'Please provide file path and content');
            return;
        }
        setIsLoading(true);
        try {
            const response = await window.electronAPI.appendFile(filePath, fileContent);
            showResult('success', response?.message || 'Content appended successfully');
            setFileContent('');
        }
        catch (error) {
            console.error('Append file error:', error);
            showResult('error', `Failed to append content: ${error?.message || error}`);
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsxs("div", { className: "w-full space-y-4", children: [_jsx("div", { className: "flex gap-2 border-b border-slate-200", children: ['create', 'read', 'update', 'delete'].map((tab) => (_jsx("button", { onClick: () => setActiveTab(tab), className: `px-4 py-2 font-medium capitalize transition-colors ${activeTab === tab
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-slate-600 hover:text-slate-900'}`, children: tab }, tab))) }), result && (_jsxs(motion.div, { initial: { opacity: 0, y: -10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, className: `flex items-center gap-2 p-3 rounded-lg ${result.type === 'success'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'}`, children: [result.type === 'success' ? (_jsx(CheckCircle, { className: "w-5 h-5" })) : (_jsx(AlertCircle, { className: "w-5 h-5" })), _jsx("span", { className: "text-sm font-medium", children: result.message }), _jsx("button", { onClick: () => setResult(null), className: "ml-auto hover:opacity-70", children: _jsx(X, { className: "w-4 h-4" }) })] })), _jsxs("div", { className: "space-y-4", children: [activeTab === 'create' && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Folder Path" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "text", value: filePath, onChange: (e) => setFilePath(e.target.value), placeholder: "e.g., C:\\Users\\Documents", className: "flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" }), _jsx("button", { onClick: handleBrowseFolder, className: "px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors flex items-center gap-1", title: "Browse folders", children: _jsx(FolderOpen, { className: "w-4 h-4" }) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Name" }), _jsx("input", { type: "text", value: fileName, onChange: (e) => setFileName(e.target.value), placeholder: "e.g., myfile.txt or newfolder", className: "w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "File Content (optional)" }), _jsx("textarea", { value: fileContent, onChange: (e) => setFileContent(e.target.value), placeholder: "Leave empty to create empty file", className: "w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("button", { onClick: handleCreateFile, disabled: isLoading, className: "flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors", children: [_jsx(FileText, { className: "w-4 h-4" }), "Create File"] }), _jsxs("button", { onClick: handleCreateFolder, disabled: isLoading, className: "flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors", children: [_jsx(Folder, { className: "w-4 h-4" }), "Create Folder"] })] })] })), activeTab === 'read' && (_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-3", children: _jsxs("p", { className: "text-sm text-blue-800", children: [_jsx("strong", { children: "\uD83D\uDCDD Note:" }), " You must provide the ", _jsx("strong", { children: "full path to a FILE" }), " (e.g., ", _jsx("code", { className: "bg-blue-100 px-1 rounded", children: "C:\\Documents\\file.txt" }), "), not just a folder path."] }) }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "File Path (e.g., C:\\Users\\Documents\\file.txt)" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "text", value: filePath, onChange: (e) => setFilePath(e.target.value), placeholder: "e.g., C:\\Users\\Documents\\file.txt", className: "flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" }), _jsx("button", { onClick: handleBrowseFolder, className: "px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors flex items-center gap-1", title: "Browse files", children: _jsx(FolderOpen, { className: "w-4 h-4" }) })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("button", { onClick: handleReadFile, disabled: isLoading, className: "flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors", children: [_jsx(Eye, { className: "w-4 h-4" }), "Read File"] }), _jsxs("button", { onClick: handleReadMetadata, disabled: isLoading, className: "flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors", children: [_jsx(Eye, { className: "w-4 h-4" }), "Read Metadata"] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Content / Info (Read-Only)" }), _jsx("textarea", { value: fileContent, readOnly: true, className: "w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 h-40 resize-none font-mono text-sm" })] })] })), activeTab === 'update' && (_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-3", children: _jsxs("p", { className: "text-sm text-blue-800", children: [_jsx("strong", { children: "\uD83D\uDCDD Note:" }), " Provide a ", _jsx("strong", { children: "full file path" }), " (e.g., ", _jsx("code", { className: "bg-blue-100 px-1 rounded", children: "C:\\Documents\\file.txt" }), "). ", _jsx("strong", { children: "Update" }), " replaces entire content; ", _jsx("strong", { children: "Append" }), " adds to the end."] }) }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "File Path (e.g., C:\\Users\\Documents\\file.txt)" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "text", value: filePath, onChange: (e) => setFilePath(e.target.value), placeholder: "e.g., C:\\Users\\Documents\\file.txt", className: "flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" }), _jsx("button", { onClick: handleBrowseFolder, className: "px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors flex items-center gap-1", title: "Browse files", children: _jsx(FolderOpen, { className: "w-4 h-4" }) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "Content to Write / Append" }), _jsx("textarea", { value: fileContent, onChange: (e) => setFileContent(e.target.value), placeholder: "Enter text to write or append to the file", className: "w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none font-mono text-sm" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs("button", { onClick: handleUpdateFile, disabled: isLoading, className: "flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors", title: "Replace entire file content", children: [_jsx(Edit3, { className: "w-4 h-4" }), "Update File"] }), _jsxs("button", { onClick: handleAppendFile, disabled: isLoading, className: "flex-1 flex items-center justify-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:bg-gray-400 transition-colors", title: "Add content to the end of file", children: [_jsx(Plus, { className: "w-4 h-4" }), "Append"] })] })] })), activeTab === 'delete' && (_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: _jsx("p", { className: "text-sm text-red-800 font-medium", children: "\u26A0\uFE0F Caution: This operation cannot be undone" }) }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-700 mb-1", children: "File/Folder Path" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "text", value: filePath, onChange: (e) => setFilePath(e.target.value), placeholder: "e.g., C:\\Users\\Documents\\file.txt", className: "flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" }), _jsx("button", { onClick: handleBrowseFolder, className: "px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors flex items-center gap-1", title: "Browse files", children: _jsx(FolderOpen, { className: "w-4 h-4" }) })] })] }), _jsxs("button", { onClick: async () => {
                                    if (!filePath) {
                                        showResult('error', 'Please provide path');
                                        return;
                                    }
                                    if (!window.confirm(`Are you sure you want to delete:\n${filePath}`))
                                        return;
                                    setIsLoading(true);
                                    try {
                                        await window.electronAPI.deleteFile(filePath);
                                        showResult('success', 'Item deleted successfully');
                                        setFilePath('');
                                    }
                                    catch (error) {
                                        showResult('error', `Failed to delete: ${error}`);
                                    }
                                    finally {
                                        setIsLoading(false);
                                    }
                                }, disabled: isLoading, className: "w-full flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors", children: [_jsx(Copy, { className: "w-4 h-4" }), "Delete Permanently"] })] }))] })] }));
};
export default FileOperations;
//# sourceMappingURL=FileOperations.js.map