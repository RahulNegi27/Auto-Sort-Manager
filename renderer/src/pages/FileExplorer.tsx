import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileGrid } from '../components/files/FileGrid';
import { FileList } from '../components/files/FileList';
import { FilePreview } from '../components/files/FilePreview';
import { LayoutGrid, List, ChevronRight, Home, Folder, FolderOpen, AlertCircle, Plus } from 'lucide-react';
import { FileOperations } from '../components/FileOperations';
import { useSelectedFolder } from '../context/SelectedFolderContext';

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

export const FileExplorer: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const { selectedFolder, setSelectedFolder } = useSelectedFolder();
  const [currentPath, setCurrentPath] = useState<string | null>(selectedFolder);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCrudPanel, setShowCrudPanel] = useState(false);
  const [showFolderSelector, setShowFolderSelector] = useState(!currentPath);

  const loadFolderContents = async (folderPath: string) => {
    setIsLoading(true);
    try {
      const items = await window.electronAPI.scanDirectory(folderPath);
      // Map to local FileItem shape safely
      const mapped = items.map((it: any) => ({
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
    } catch (err) {
      console.error('Failed to load folder contents', err);
      setFiles([]);
    } finally {
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
    } catch (err) {
      console.error('Folder select error', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeFolder = () => {
    setShowFolderSelector(true);
  };

  const handleSelectRecentFolder = (path: string) => {
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
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg p-12 max-w-md w-full mx-4">
          <div className="flex justify-center mb-6">
            <FolderOpen className="w-16 h-16 text-primary-500" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Select a Folder</h2>
          <p className="text-gray-600 text-center mb-8">Choose a folder to browse and manage files</p>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-gray-300 border-t-primary-500 rounded-full"></div>
              <p className="text-gray-600 mt-4">Loading...</p>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={handleSelectFolder}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Folder className="w-5 h-5" />
                Browse Folders
              </button>
              
              <div className="text-sm text-gray-600 text-center">
                <p className="mb-3 font-semibold text-gray-700">Recently used:</p>
                <div className="space-y-2">
                  <button
                    onClick={() => handleSelectRecentFolder('C:\\Users\\John\\Documents')}
                    className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-gray-700 transition-colors"
                  >
                    📄 Documents
                  </button>
                  <button
                    onClick={() => handleSelectRecentFolder('C:\\Users\\John\\Downloads')}
                    className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-gray-700 transition-colors"
                  >
                    📥 Downloads
                  </button>
                  <button
                    onClick={() => handleSelectRecentFolder('C:\\Users\\John\\Pictures')}
                    className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-gray-700 transition-colors"
                  >
                    🖼️ Pictures
                  </button>
                  <button
                    onClick={() => handleSelectRecentFolder('D:\\Projects')}
                    className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-gray-700 transition-colors"
                  >
                    💼 Projects
                  </button>
                  <button
                    onClick={() => handleSelectRecentFolder('E:\\Media')}
                    className="block w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-gray-700 transition-colors"
                  >
                    🎬 Media
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main File Explorer View
  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">File Explorer</h1>
            <p className="text-gray-600 text-sm font-mono mt-1">{currentPath}</p>
          </div>

          {/* View Mode & Folder Selection */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleChangeFolder}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-2 font-medium"
              title="Change folder"
            >
              <FolderOpen className="w-4 h-4" />
              Change Folder
            </button>

            <button
              onClick={() => setShowCrudPanel(!showCrudPanel)}
              disabled={isLoading || !selectedFolder}
              className="ml-2 flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
            >
              <Plus className="w-4 h-4" />
              CRUD
            </button>

            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="List view"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={handleChangeFolder}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Home className="w-4 h-4" />
            Home
          </button>

          {breadcrumbs.slice(0, -1).map((crumb, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{crumb}</span>
            </React.Fragment>
          ))}

          {breadcrumbs.length > 0 && (
            <>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900 font-semibold">{breadcrumbs[breadcrumbs.length - 1]}</span>
            </>
          )}
        </div>
      </div>

      {/* File Stats Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Total items:</span>
          <span className="font-semibold text-gray-900">{files.length}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">Selected:</span>
          <span className="font-semibold text-gray-900">{selectedFiles.size}</span>
        </div>
        <div className="flex-1" />
        <button className="px-3 py-1 text-sm bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors font-medium">
          New Folder
        </button>
      </div>

      {/* Files Container */}
      <div className="flex-1 overflow-auto">
        {files.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No files in this folder</p>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <FileGrid
            files={files}
            selectedFiles={selectedFiles}
            onFileSelect={setSelectedFiles}
            onFilePreview={setPreviewFile}
          />
        ) : (
          <FileList
            files={files}
            selectedFiles={selectedFiles}
            onFileSelect={setSelectedFiles}
            onFilePreview={setPreviewFile}
          />
        )}
      </div>

      {/* File Preview Panel */}
      <FilePreview file={previewFile} onClose={() => setPreviewFile(null)} />
      {/* CRUD Panel inserted into File Explorer */}
      {showCrudPanel && selectedFolder && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-shrink-0 max-h-[50vh] overflow-y-auto bg-white border-t border-slate-200 px-6 py-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">File Operations (CRUD)</h2>
            <button
              onClick={() => setShowCrudPanel(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>
          <FileOperations path={currentPath || selectedFolder} />
        </motion.div>
      )}
    </div>
  );
};

export default FileExplorer;
