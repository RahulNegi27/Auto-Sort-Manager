import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileGrid } from '../components/files/FileGrid';
import { FileList } from '../components/files/FileList';
import { FilePreview } from '../components/files/FilePreview';
import { LayoutGrid, List, ChevronRight, Home, Folder, FolderOpen, AlertCircle, Plus } from 'lucide-react';
import { FileOperations } from '../components/FileOperations';
import { useSelectedFolder } from '../context/SelectedFolderContext';
export const FileExplorer = () => {
    const [viewMode, setViewMode] = useState('grid');
    const [selectedFiles, setSelectedFiles] = useState(new Set());
    const [previewFile, setPreviewFile] = useState(null);
    const { selectedFolder, setSelectedFolder } = useSelectedFolder();
    const [currentPath, setCurrentPath] = useState(selectedFolder);
    const [files, setFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showCrudPanel, setShowCrudPanel] = useState(false);
    const [showFolderSelector, setShowFolderSelector] = useState(!currentPath);
    const loadFolderContents = async (folderPath) => {
        setIsLoading(true);
        try {
            const items = await window.electronAPI.scanDirectory(folderPath);
            // Map to local FileItem shape safely
            const mapped = items.map((it) => ({
                id: it.id || encodeURIComponent(it.path || it.name || String(Math.random())),
                name: it.name,
                type: it.type || (it.isDirectory ? 'directory' : 'file'),
                extension: it.extension || (it.name ? (it.name.includes('.') ? `.${it.name.split('.').pop()}` : '') : ''),
                size: it.size || 0,
                path: it.path || null,
                createdAt: (it.createdAt && typeof it.createdAt === 'string') ? it.createdAt : (it.createdAt ? new Date(it.createdAt).toISOString() : new Date().toISOString()),
                modifiedAt: (it.modifiedAt && typeof it.modifiedAt === 'string') ? it.modifiedAt : (it.modifiedAt ? new Date(it.modifiedAt).toISOString() : new Date().toISOString())
            }));
            setFiles(mapped);
            setSelectedFiles(new Set());
        }
        catch (err) {
            console.error('Failed to load folder contents', err);
            setFiles([]);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleSelectFolder = async () => {
        setIsLoading(true);
        try {
            const selectedPath = await window.electronAPI.selectFolder();
            if (selectedPath) {
                setSelectedFolder(selectedPath);
                setCurrentPath(selectedPath);
                await loadFolderContents(selectedPath);
                setShowFolderSelector(false);
            }
        }
        catch (err) {
            console.error('Folder select error', err);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleChangeFolder = () => {
        setShowFolderSelector(true);
    };
    const handleSelectRecentFolder = (path) => {
        setCurrentPath(path);
        loadFolderContents(path);
        setShowFolderSelector(false);
    };
    const breadcrumbs = currentPath ? currentPath.split(/[\\\/]/).filter(Boolean) : [];
    // When global selectedFolder changes (from Dashboard), load its contents here
    useEffect(() => {
        if (selectedFolder) {
            setCurrentPath(selectedFolder);
            setShowFolderSelector(false);
            loadFolderContents(selectedFolder).catch(err => console.warn('Failed to load selectedFolder', err));
        }
    }, [selectedFolder]);
    // Folder Selector Modal
    if (showFolderSelector || !currentPath) {
        return (_jsx("div", { className: "h-full flex items-center justify-center bg-gray-50", children: _jsxs("div", { className: "bg-white rounded-lg shadow-lg p-12 max-w-md w-full mx-4", children: [_jsx("div", { className: "flex justify-center mb-6", children: _jsx(FolderOpen, { className: "w-16 h-16 text-primary-500" }) }), _jsx("h2", { className: "text-2xl font-bold text-gray-900 text-center mb-2", children: "Select a Folder" }), _jsx("p", { className: "text-gray-600 text-center mb-8", children: "Choose a folder to browse and manage files" }), isLoading ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "animate-spin inline-block w-8 h-8 border-4 border-gray-300 border-t-primary-500 rounded-full" }), _jsx("p", { className: "text-gray-600 mt-4", children: "Loading..." })] })) : (_jsxs("div", { className: "space-y-3", children: [_jsxs("button", { onClick: handleSelectFolder, className: "w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2", children: [_jsx(Folder, { className: "w-5 h-5" }), "Browse Folders"] }), _jsxs("div", { className: "text-sm text-gray-600 text-center", children: [_jsx("p", { className: "mb-3 font-semibold text-gray-700", children: "Recently used:" }), _jsxs("div", { className: "space-y-2", children: [_jsx("button", { onClick: () => handleSelectRecentFolder('C:\\Users\\John\\Documents'), className: "block w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-gray-700 transition-colors", children: "\uD83D\uDCC4 Documents" }), _jsx("button", { onClick: () => handleSelectRecentFolder('C:\\Users\\John\\Downloads'), className: "block w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-gray-700 transition-colors", children: "\uD83D\uDCE5 Downloads" }), _jsx("button", { onClick: () => handleSelectRecentFolder('C:\\Users\\John\\Pictures'), className: "block w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-gray-700 transition-colors", children: "\uD83D\uDDBC\uFE0F Pictures" }), _jsx("button", { onClick: () => handleSelectRecentFolder('D:\\Projects'), className: "block w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-gray-700 transition-colors", children: "\uD83D\uDCBC Projects" }), _jsx("button", { onClick: () => handleSelectRecentFolder('E:\\Media'), className: "block w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-gray-700 transition-colors", children: "\uD83C\uDFAC Media" })] })] })] }))] }) }));
    }
    // Main File Explorer View
    return (_jsxs("div", { className: "h-full flex flex-col bg-gray-50", children: [_jsxs("div", { className: "bg-white border-b border-gray-200 px-6 py-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "File Explorer" }), _jsx("p", { className: "text-gray-600 text-sm font-mono mt-1", children: currentPath })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("button", { onClick: handleChangeFolder, className: "px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-2 font-medium", title: "Change folder", children: [_jsx(FolderOpen, { className: "w-4 h-4" }), "Change Folder"] }), _jsxs("button", { onClick: () => setShowCrudPanel(!showCrudPanel), disabled: isLoading || !selectedFolder, className: "ml-2 flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors", children: [_jsx(Plus, { className: "w-4 h-4" }), "CRUD"] }), _jsxs("div", { className: "flex items-center gap-2 bg-gray-100 p-1 rounded-lg", children: [_jsx("button", { onClick: () => setViewMode('grid'), className: `p-2 rounded transition-colors ${viewMode === 'grid'
                                                    ? 'bg-white text-primary-600 shadow-sm'
                                                    : 'text-gray-600 hover:text-gray-900'}`, title: "Grid view", children: _jsx(LayoutGrid, { className: "w-5 h-5" }) }), _jsx("button", { onClick: () => setViewMode('list'), className: `p-2 rounded transition-colors ${viewMode === 'list'
                                                    ? 'bg-white text-primary-600 shadow-sm'
                                                    : 'text-gray-600 hover:text-gray-900'}`, title: "List view", children: _jsx(List, { className: "w-5 h-5" }) })] })] })] }), _jsxs("div", { className: "flex items-center gap-2 text-sm", children: [_jsxs("button", { onClick: handleChangeFolder, className: "flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors", children: [_jsx(Home, { className: "w-4 h-4" }), "Home"] }), breadcrumbs.slice(0, -1).map((crumb, idx) => (_jsxs(React.Fragment, { children: [_jsx(ChevronRight, { className: "w-4 h-4 text-gray-400" }), _jsx("span", { className: "text-gray-600", children: crumb })] }, idx))), breadcrumbs.length > 0 && (_jsxs(_Fragment, { children: [_jsx(ChevronRight, { className: "w-4 h-4 text-gray-400" }), _jsx("span", { className: "text-gray-900 font-semibold", children: breadcrumbs[breadcrumbs.length - 1] })] }))] })] }), _jsxs("div", { className: "bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4", children: [_jsxs("div", { className: "flex items-center gap-2 text-sm", children: [_jsx("span", { className: "text-gray-600", children: "Total items:" }), _jsx("span", { className: "font-semibold text-gray-900", children: files.length })] }), _jsxs("div", { className: "flex items-center gap-2 text-sm", children: [_jsx("span", { className: "text-gray-600", children: "Selected:" }), _jsx("span", { className: "font-semibold text-gray-900", children: selectedFiles.size })] }), _jsx("div", { className: "flex-1" }), _jsx("button", { className: "px-3 py-1 text-sm bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors font-medium", children: "New Folder" })] }), _jsx("div", { className: "flex-1 overflow-auto", children: files.length === 0 ? (_jsx("div", { className: "flex items-center justify-center h-full", children: _jsxs("div", { className: "text-center", children: [_jsx(AlertCircle, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "No files in this folder" })] }) })) : viewMode === 'grid' ? (_jsx(FileGrid, { files: files, selectedFiles: selectedFiles, onFileSelect: setSelectedFiles, onFilePreview: setPreviewFile })) : (_jsx(FileList, { files: files, selectedFiles: selectedFiles, onFileSelect: setSelectedFiles, onFilePreview: setPreviewFile })) }), _jsx(FilePreview, { file: previewFile, onClose: () => setPreviewFile(null) }), showCrudPanel && selectedFolder && (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "flex-shrink-0 max-h-[50vh] overflow-y-auto bg-white border-t border-slate-200 px-6 py-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-lg font-semibold text-slate-900", children: "File Operations (CRUD)" }), _jsx("button", { onClick: () => setShowCrudPanel(false), className: "text-slate-400 hover:text-slate-600", children: "\u2715" })] }), _jsx(FileOperations, { path: currentPath || selectedFolder })] }))] }));
};
export default FileExplorer;
//# sourceMappingURL=FileExplorer.js.map