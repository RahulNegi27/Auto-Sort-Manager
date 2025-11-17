import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share2, Copy, Eye, ExternalLink } from 'lucide-react';

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

interface FilePreviewProps {
  file: FileItem | null;
  onClose: () => void;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ file, onClose }) => {
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

  const formatDate = (date: string): string => {
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  };

  return (
    <AnimatePresence>
      {file && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-2xl z-50 overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">File Details</h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              {/* Preview Section */}
              <div className="mb-6">
                <div className="w-full h-48 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg flex items-center justify-center mb-4">
                  {file.type === 'directory' ? (
                    <div className="text-center">
                      <div className="text-6xl mb-2">📁</div>
                      <p className="text-gray-600">Folder</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-6xl mb-2">📄</div>
                      <p className="text-gray-600">{file.extension.slice(1).toUpperCase()}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* File Information */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Name</label>
                  <p className="text-gray-900 break-all">{file.name}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700">Type</label>
                  <p className="text-gray-600">{file.type === 'directory' ? 'Folder' : 'File'}</p>
                </div>

                {file.type !== 'directory' && (
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Extension</label>
                    <p className="text-gray-600">{file.extension}</p>
                  </div>
                )}

                {file.type !== 'directory' && (
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Size</label>
                    <p className="text-gray-600">{formatFileSize(file.size)}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-semibold text-gray-700">Created</label>
                  <p className="text-gray-600">{formatDate(file.createdAt)}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700">Modified</label>
                  <p className="text-gray-600">{formatDate(file.modifiedAt)}</p>
                </div>

                {file.path && (
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Path</label>
                    <p className="text-gray-600 text-xs break-all font-mono">{file.path}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button className="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg transition-colors">
                  <Eye className="w-4 h-4" />
                  Open with Default App
                </button>

                <button className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                  Download
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg transition-colors">
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>
                  <button className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg transition-colors">
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </div>

              {/* Advanced Properties */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Properties</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hidden</span>
                    <span className="text-gray-900">No</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Read-only</span>
                    <span className="text-gray-900">No</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Indexed</span>
                    <span className="text-gray-900">Yes</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
