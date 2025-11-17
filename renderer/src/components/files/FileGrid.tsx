import React from 'react';
import { motion } from 'framer-motion';
import { Folder, File, Image, Music, Video, Archive, FileText } from 'lucide-react';

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

interface FileGridProps {
  files: FileItem[];
  selectedFiles: Set<string>;
  onFileSelect: (selected: Set<string>) => void;
  onFilePreview: (file: FileItem) => void;
}

export const FileGrid: React.FC<FileGridProps> = ({
  files,
  selectedFiles,
  onFileSelect,
  onFilePreview
}) => {
  const toggleFileSelection = (fileId: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    onFileSelect(newSelected);
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

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 p-4">
      {files.map((file, index) => {
        const Icon = getFileIcon(file);
        const isSelected = selectedFiles.has(file.id);

        return (
          <motion.div
            key={file.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`relative group cursor-pointer ${
              isSelected ? 'ring-2 ring-primary-500 ring-offset-2' : ''
            }`}
            onClick={() => toggleFileSelection(file.id)}
            onDoubleClick={() => file.type === 'directory' || onFilePreview(file)}
          >
            <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200">
              <div className="flex flex-col items-center text-center">
                <div className={`p-3 rounded-lg mb-3 ${
                  file.type === 'directory' 
                    ? 'bg-blue-50 text-blue-500' 
                    : 'bg-gray-50 text-gray-500'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                
                <div className="w-full">
                  <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {file.type === 'directory' ? 'Folder' : formatFileSize(file.size)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(file.modifiedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            
            {isSelected && (
              <div className="absolute top-2 right-2 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};
