import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Folder, File, Image, Music, Video, Archive, FileText, ChevronUp, ChevronDown, MoreVertical } from 'lucide-react';
export const FileList = ({ files, selectedFiles, onFileSelect, onFilePreview }) => {
    const [sortField, setSortField] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const toggleFileSelection = (fileId) => {
        const newSelected = new Set(selectedFiles);
        if (newSelected.has(fileId)) {
            newSelected.delete(fileId);
        }
        else {
            newSelected.add(fileId);
        }
        onFileSelect(newSelected);
    };
    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        }
        else {
            setSortField(field);
            setSortOrder('asc');
        }
    };
    const formatFileSize = (bytes) => {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        return `${size.toFixed(1)} ${units[unitIndex]}`;
    };
    const getFileIcon = (file) => {
        if (file.type === 'directory')
            return Folder;
        const extension = file.extension.toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.gif', '.bmp'].includes(extension))
            return Image;
        if (['.mp3', '.wav', '.flac', '.aac'].includes(extension))
            return Music;
        if (['.mp4', '.avi', '.mov', '.mkv'].includes(extension))
            return Video;
        if (['.zip', '.rar', '.7z', '.tar'].includes(extension))
            return Archive;
        if (['.pdf', '.doc', '.docx', '.txt'].includes(extension))
            return FileText;
        return File;
    };
    const sortedFiles = [...files].sort((a, b) => {
        let aVal = a[sortField];
        let bVal = b[sortField];
        if (sortField === 'name') {
            aVal = a.name.toLowerCase();
            bVal = b.name.toLowerCase();
        }
        else if (sortField === 'size') {
            aVal = a.size;
            bVal = b.size;
        }
        else if (sortField === 'type') {
            aVal = a.extension.toLowerCase();
            bVal = b.extension.toLowerCase();
        }
        if (aVal < bVal)
            return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal)
            return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });
    const SortIcon = ({ field }) => {
        if (sortField !== field)
            return _jsx("div", { className: "w-4 h-4" });
        return sortOrder === 'asc' ? _jsx(ChevronUp, { className: "w-4 h-4" }) : _jsx(ChevronDown, { className: "w-4 h-4" });
    };
    return (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-50 border-b border-gray-200", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-3 text-left", children: _jsx("input", { type: "checkbox", checked: selectedFiles.size === files.length && files.length > 0, onChange: () => {
                                        if (selectedFiles.size === files.length) {
                                            onFileSelect(new Set());
                                        }
                                        else {
                                            onFileSelect(new Set(files.map(f => f.id)));
                                        }
                                    }, className: "rounded border-gray-300" }) }), _jsx("th", { className: "px-4 py-3 text-left cursor-pointer hover:bg-gray-100", onClick: () => handleSort('name'), children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm font-semibold text-gray-700", children: "Name" }), _jsx(SortIcon, { field: "name" })] }) }), _jsx("th", { className: "px-4 py-3 text-left cursor-pointer hover:bg-gray-100", onClick: () => handleSort('type'), children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm font-semibold text-gray-700", children: "Type" }), _jsx(SortIcon, { field: "type" })] }) }), _jsx("th", { className: "px-4 py-3 text-right cursor-pointer hover:bg-gray-100", onClick: () => handleSort('size'), children: _jsxs("div", { className: "flex items-center justify-end gap-2", children: [_jsx("span", { className: "text-sm font-semibold text-gray-700", children: "Size" }), _jsx(SortIcon, { field: "size" })] }) }), _jsx("th", { className: "px-4 py-3 text-left cursor-pointer hover:bg-gray-100", onClick: () => handleSort('modifiedAt'), children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm font-semibold text-gray-700", children: "Modified" }), _jsx(SortIcon, { field: "modifiedAt" })] }) }), _jsx("th", { className: "px-4 py-3 text-right", children: _jsx("span", { className: "text-sm font-semibold text-gray-700", children: "Actions" }) })] }) }), _jsx("tbody", { children: sortedFiles.map((file, index) => {
                        const Icon = getFileIcon(file);
                        const isSelected = selectedFiles.has(file.id);
                        return (_jsxs(motion.tr, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: index * 0.02 }, className: `border-b border-gray-200 hover:bg-gray-50 transition-colors ${isSelected ? 'bg-primary-50' : ''}`, children: [_jsx("td", { className: "px-4 py-3", children: _jsx("input", { type: "checkbox", checked: isSelected, onChange: () => toggleFileSelection(file.id), className: "rounded border-gray-300" }) }), _jsx("td", { className: "px-4 py-3", children: _jsxs("div", { className: "flex items-center gap-3 cursor-pointer", onDoubleClick: () => onFilePreview(file), children: [_jsx("div", { className: `p-2 rounded ${file.type === 'directory'
                                                    ? 'bg-blue-50 text-blue-500'
                                                    : 'bg-gray-50 text-gray-500'}`, children: _jsx(Icon, { className: "w-4 h-4" }) }), _jsx("span", { className: "text-sm font-medium text-gray-900 truncate", children: file.name })] }) }), _jsx("td", { className: "px-4 py-3", children: _jsx("span", { className: "text-sm text-gray-600", children: file.type === 'directory' ? 'Folder' : file.extension.slice(1).toUpperCase() }) }), _jsx("td", { className: "px-4 py-3 text-right", children: _jsx("span", { className: "text-sm text-gray-600", children: file.type === 'directory' ? '-' : formatFileSize(file.size) }) }), _jsx("td", { className: "px-4 py-3", children: _jsxs("span", { className: "text-sm text-gray-600", children: [new Date(file.modifiedAt).toLocaleDateString(), " ", new Date(file.modifiedAt).toLocaleTimeString()] }) }), _jsx("td", { className: "px-4 py-3 text-right", children: _jsx("button", { className: "p-2 hover:bg-gray-200 rounded-lg transition-colors", children: _jsx(MoreVertical, { className: "w-4 h-4 text-gray-500" }) }) })] }, file.id));
                    }) })] }) }));
};
//# sourceMappingURL=FileList.js.map