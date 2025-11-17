import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Folder, Edit3, Eye, Plus, Copy, CheckCircle, AlertCircle, X, FolderOpen } from 'lucide-react';
import { useSelectedFolder } from '../context/SelectedFolderContext';

interface FileOperationResult {
  type: 'success' | 'error';
  message: string;
  data?: any;
}

export const FileOperations: React.FC<{ path?: string }> = ({ path = '' }) => {
  const { selectedFolder } = useSelectedFolder();
  const [activeTab, setActiveTab] = useState<'create' | 'read' | 'update' | 'delete'>('create');
  const [filePath, setFilePath] = useState(path || selectedFolder || '');
  const [fileContent, setFileContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<FileOperationResult | null>(null);

  // Sync with global selectedFolder when it changes
  useEffect(() => {
    if (selectedFolder && !path) {
      setFilePath(selectedFolder);
    }
  }, [selectedFolder, path]);

  const showResult = (type: 'success' | 'error', message: string, data?: any) => {
    setResult({ type, message, data });
    setTimeout(() => setResult(null), 4000);
  };

  const handleBrowseFolder = async () => {
    try {
      const folder = await window.electronAPI.selectFolder();
      if (folder) {
        setFilePath(folder);
      }
    } catch (err) {
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
    } catch (error) {
      showResult('error', `Failed to create file: ${error}`);
    } finally {
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
    } catch (error) {
      showResult('error', `Failed to create folder: ${error}`);
    } finally {
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
    } catch (error: any) {
      console.error('Read file error:', error);
      showResult('error', `Failed to read file: ${error?.message || error}`);
    } finally {
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
    } catch (error: any) {
      console.error('Read metadata error:', error);
      showResult('error', `Failed to read metadata: ${error?.message || error}`);
    } finally {
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
    } catch (error: any) {
      console.error('Update file error:', error);
      showResult('error', `Failed to update file: ${error?.message || error}`);
    } finally {
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
    } catch (error: any) {
      console.error('Append file error:', error);
      showResult('error', `Failed to append content: ${error?.message || error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {(['create', 'read', 'update', 'delete'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Result notification */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`flex items-center gap-2 p-3 rounded-lg ${
            result.type === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {result.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="text-sm font-medium">{result.message}</span>
          <button
            onClick={() => setResult(null)}
            className="ml-auto hover:opacity-70"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Tab Content */}
      <div className="space-y-4">
        {/* CREATE Tab */}
        {activeTab === 'create' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Folder Path
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={filePath}
                  onChange={(e) => setFilePath(e.target.value)}
                  placeholder="e.g., C:\Users\Documents"
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleBrowseFolder}
                  className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors flex items-center gap-1"
                  title="Browse folders"
                >
                  <FolderOpen className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="e.g., myfile.txt or newfolder"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                File Content (optional)
              </label>
              <textarea
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                placeholder="Leave empty to create empty file"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCreateFile}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Create File
              </button>
              <button
                onClick={handleCreateFolder}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                <Folder className="w-4 h-4" />
                Create Folder
              </button>
            </div>
          </div>
        )}

        {/* READ Tab */}
        {activeTab === 'read' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800"><strong>📝 Note:</strong> You must provide the <strong>full path to a FILE</strong> (e.g., <code className="bg-blue-100 px-1 rounded">C:\Documents\file.txt</code>), not just a folder path.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                File Path (e.g., C:\Users\Documents\file.txt)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={filePath}
                  onChange={(e) => setFilePath(e.target.value)}
                  placeholder="e.g., C:\Users\Documents\file.txt"
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleBrowseFolder}
                  className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors flex items-center gap-1"
                  title="Browse files"
                >
                  <FolderOpen className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleReadFile}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Read File
              </button>
              <button
                onClick={handleReadMetadata}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Read Metadata
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Content / Info (Read-Only)
              </label>
              <textarea
                value={fileContent}
                readOnly
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 h-40 resize-none font-mono text-sm"
              />
            </div>
          </div>
        )}

        {/* UPDATE Tab */}
        {activeTab === 'update' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800"><strong>📝 Note:</strong> Provide a <strong>full file path</strong> (e.g., <code className="bg-blue-100 px-1 rounded">C:\Documents\file.txt</code>). <strong>Update</strong> replaces entire content; <strong>Append</strong> adds to the end.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                File Path (e.g., C:\Users\Documents\file.txt)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={filePath}
                  onChange={(e) => setFilePath(e.target.value)}
                  placeholder="e.g., C:\Users\Documents\file.txt"
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleBrowseFolder}
                  className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors flex items-center gap-1"
                  title="Browse files"
                >
                  <FolderOpen className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Content to Write / Append
              </label>
              <textarea
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                placeholder="Enter text to write or append to the file"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none font-mono text-sm"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleUpdateFile}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                title="Replace entire file content"
              >
                <Edit3 className="w-4 h-4" />
                Update File
              </button>
              <button
                onClick={handleAppendFile}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:bg-gray-400 transition-colors"
                title="Add content to the end of file"
              >
                <Plus className="w-4 h-4" />
                Append
              </button>
            </div>
          </div>
        )}

        {/* DELETE Tab */}
        {activeTab === 'delete' && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800 font-medium">⚠️ Caution: This operation cannot be undone</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                File/Folder Path
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={filePath}
                  onChange={(e) => setFilePath(e.target.value)}
                  placeholder="e.g., C:\Users\Documents\file.txt"
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                  onClick={handleBrowseFolder}
                  className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors flex items-center gap-1"
                  title="Browse files"
                >
                  <FolderOpen className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              onClick={async () => {
                if (!filePath) {
                  showResult('error', 'Please provide path');
                  return;
                }
                if (!window.confirm(`Are you sure you want to delete:\n${filePath}`)) return;
                
                setIsLoading(true);
                try {
                  await window.electronAPI.deleteFile(filePath);
                  showResult('success', 'Item deleted successfully');
                  setFilePath('');
                } catch (error) {
                  showResult('error', `Failed to delete: ${error}`);
                } finally {
                  setIsLoading(false);
                }
              }}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors"
            >
              <Copy className="w-4 h-4" />
              Delete Permanently
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileOperations;
