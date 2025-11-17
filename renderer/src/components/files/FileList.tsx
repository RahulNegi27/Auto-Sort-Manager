import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Folder, File, Image, Music, Video, Archive, FileText, ChevronUp, ChevronDown, MoreVertical } from 'lucide-react';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'directory';
  extension: string;
  size: number;
  path?: string;
  createdAt: string;
  modifiedAt: string;
}

interface FileListProps {
  files: FileItem[];
  selectedFiles: Set<string>;
  onFileSelect: (selected: Set<string>) => void;
  onFilePreview: (file: FileItem) => void;
}

type SortField = 'name' | 'size' | 'type' | 'modifiedAt';
type SortOrder = 'asc' | 'desc';

export const FileList: React.FC<FileListProps> = ({
  files,
  selectedFiles,
  onFileSelect,
  onFilePreview
}) => {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const toggleFileSelection = (fileId: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    onFileSelect(newSelected);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const formatFileSize = (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const getFileIcon = (file: FileItem) => {
    if (file.type === 'directory') return Folder;
    
    const extension = file.extension.toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.gif', '.bmp'].includes(extension)) return Image;
    if (['.mp3', '.wav', '.flac', '.aac'].includes(extension)) return Music;
    if (['.mp4', '.avi', '.mov', '.mkv'].includes(extension)) return Video;
    if (['.zip', '.rar', '.7z', '.tar'].includes(extension)) return Archive;
    if (['.pdf', '.doc', '.docx', '.txt'].includes(extension)) return FileText;
    
    return File;
  };

  const sortedFiles = [...files].sort((a, b) => {
    let aVal: any = a[sortField];
    let bVal: any = b[sortField];

    if (sortField === 'name') {
      aVal = a.name.toLowerCase();
      bVal = b.name.toLowerCase();
    } else if (sortField === 'size') {
      aVal = a.size;
      bVal = b.size;
    } else if (sortField === 'type') {
      aVal = a.extension.toLowerCase();
      bVal = b.extension.toLowerCase();
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <div className="w-4 h-4" />;
    return sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-4 py-3 text-left">
              <input
                type="checkbox"
                checked={selectedFiles.size === files.length && files.length > 0}
                onChange={() => {
                  if (selectedFiles.size === files.length) {
                    onFileSelect(new Set());
                  } else {
                    onFileSelect(new Set(files.map(f => f.id)));
                  }
                }}
                className="rounded border-gray-300"
              />
            </th>
            <th
              className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">Name</span>
                <SortIcon field="name" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('type')}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">Type</span>
                <SortIcon field="type" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-right cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('size')}
            >
              <div className="flex items-center justify-end gap-2">
                <span className="text-sm font-semibold text-gray-700">Size</span>
                <SortIcon field="size" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('modifiedAt')}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">Modified</span>
                <SortIcon field="modifiedAt" />
              </div>
            </th>
            <th className="px-4 py-3 text-right">
              <span className="text-sm font-semibold text-gray-700">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedFiles.map((file, index) => {
            const Icon = getFileIcon(file);
            const isSelected = selectedFiles.has(file.id);

            return (
              <motion.tr
                key={file.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.02 }}
                className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                  isSelected ? 'bg-primary-50' : ''
                }`}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleFileSelection(file.id)}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3 cursor-pointer" onDoubleClick={() => onFilePreview(file)}>
                    <div className={`p-2 rounded ${
                      file.type === 'directory'
                        ? 'bg-blue-50 text-blue-500'
                        : 'bg-gray-50 text-gray-500'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-gray-900 truncate">{file.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-600">
                    {file.type === 'directory' ? 'Folder' : file.extension.slice(1).toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-sm text-gray-600">
                    {file.type === 'directory' ? '-' : formatFileSize(file.size)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-600">
                    {new Date(file.modifiedAt).toLocaleDateString()} {new Date(file.modifiedAt).toLocaleTimeString()}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                    <MoreVertical className="w-4 h-4 text-gray-500" />
                  </button>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
