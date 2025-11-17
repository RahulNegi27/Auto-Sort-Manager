import React from 'react';
import { motion } from 'framer-motion';
import { FolderOpen, TrendingUp, Sparkles, Zap, HardDrive, Activity, FileText, Image, Music, Video, Archive, Code } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../hooks/useDashboard';
import { useSelectedFolder } from '../context/SelectedFolderContext';
import { useEffect, useState } from 'react';

interface FileStats {
  total: number;
  size: number;
  byType: Record<string, number>;
  bySizeRange: { small: number; medium: number; large: number; huge: number };
  topFiles: Array<{ name: string; size: number; type: string }>;
}

export const Dashboard: React.FC = () => {
  const { stats, systemUsage, isLoading } = useDashboard();
  const { selectedFolder, setSelectedFolder, clearSelectedFolder } = useSelectedFolder();
  const [folderStats, setFolderStats] = useState<FileStats | null>(null);
  const [onboardDismissed, setOnboardDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('autosort:onboardDismissed') === '1';
    } catch (e) {
      return false;
    }
  });
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    (async () => {
      if (!selectedFolder) {
        setFolderStats(null);
        return;
      }
      setLoadingStats(true);
      try {
        const files = await window.electronAPI.scanDirectory(selectedFolder);
        const total = files.length;
        const totalSize = files.reduce((a: number, b: any) => a + (b.size || 0), 0);

        // Count by file type
        const byType: Record<string, number> = {};
        const bySizeRange = { small: 0, medium: 0, large: 0, huge: 0 };
        const topFiles = files
          .sort((a: any, b: any) => (b.size || 0) - (a.size || 0))
          .slice(0, 5)
          .map((f: any) => ({ name: f.name, size: f.size, type: f.extension || 'folder' }));

        files.forEach((f: any) => {
          const ext = f.extension || 'folder';
          byType[ext] = (byType[ext] || 0) + 1;

          const size = f.size || 0;
          if (size < 1024 * 1024) bySizeRange.small++;
          else if (size < 10 * 1024 * 1024) bySizeRange.medium++;
          else if (size < 100 * 1024 * 1024) bySizeRange.large++;
          else bySizeRange.huge++;
        });

        setFolderStats({ total, size: totalSize, byType, bySizeRange, topFiles });
      } catch (e) {
        console.error('Failed to scan folder:', e);
        setFolderStats(null);
      } finally {
        setLoadingStats(false);
      }
    })();
  }, [selectedFolder]);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        const path = (file as any).path;
        if (path) {
          setSelectedFolder(path);
          setConfirmVisible(true);
          setTimeout(() => setConfirmVisible(false), 3000);
        }
      }
    } catch (err) {
      console.warn('Drop handling failed', err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full p-8 space-y-8 overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100"
    >
      {/* MASSIVE Folder Selection Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`rounded-2xl border-4 border-dashed p-12 text-center transition-all ${
          selectedFolder
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-400'
            : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-400 hover:shadow-xl'
        }`}
      >
        <div className="space-y-6">
          {!selectedFolder ? (
            <>
              <div className="text-6xl">📁</div>
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-3">Select Your Folder</h2>
                <p className="text-xl text-gray-700 mb-2">Drag a folder here or click to browse</p>
                <p className="text-sm text-gray-600">All AutoSort tools will use this folder automatically</p>
              </div>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={async () => {
                    const p = await window.electronAPI.selectFolder();
                    if (p) {
                      setSelectedFolder(p);
                      setConfirmVisible(true);
                      setTimeout(() => setConfirmVisible(false), 3000);
                    }
                  }}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-105"
                >
                  📂 BROWSE FOLDER
                </button>
              </div>
              {!onboardDismissed && (
                <div className="bg-white/90 rounded-lg p-4 border border-blue-200 max-w-xl mx-auto">
                  <p className="text-sm text-gray-700">
                    💡 <span className="font-semibold">Tip:</span> Select a folder once. AutoSort, Analysis, Compression, Duplicates and other tools will all work with this folder automatically.
                  </p>
                  <button onClick={() => { setOnboardDismissed(true); try { localStorage.setItem('autosort:onboardDismissed','1'); } catch(e){} }} className="text-xs text-gray-500 mt-2 underline">Dismiss</button>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="text-6xl">✓</div>
              <div>
                <h2 className="text-4xl font-bold text-green-700 mb-3">Folder Selected!</h2>
                <div className="bg-white rounded-xl p-6 mb-4 border border-green-300 max-w-2xl mx-auto">
                  <p className="font-mono text-sm text-gray-800 break-all mb-3">{selectedFolder}</p>
                  {loadingStats ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                      <span className="text-sm text-gray-600">Loading folder details...</span>
                    </div>
                  ) : folderStats ? (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-gray-600 text-xs">Total Files</p>
                        <p className="text-2xl font-bold text-green-700">{folderStats.total}</p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-gray-600 text-xs">Total Size</p>
                        <p className="text-2xl font-bold text-blue-700">
                          {folderStats.size > 1024 * 1024 * 1024
                            ? (folderStats.size / 1024 / 1024 / 1024).toFixed(2) + ' GB'
                            : (folderStats.size / 1024 / 1024).toFixed(2) + ' MB'}
                        </p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <p className="text-gray-600 text-xs">Avg File Size</p>
                        <p className="text-2xl font-bold text-purple-700">
                          {folderStats.total > 0
                            ? (folderStats.size / folderStats.total / 1024).toFixed(1) + ' KB'
                            : 'N/A'}
                        </p>
                      </div>
                      <div className="bg-orange-50 p-3 rounded-lg">
                        <p className="text-gray-600 text-xs">File Types</p>
                        <p className="text-2xl font-bold text-orange-700">{Object.keys(folderStats.byType).length}</p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={async () => {
                    const p = await window.electronAPI.selectFolder();
                    if (p) setSelectedFolder(p);
                  }}
                  className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg transition-all"
                >
                  📂 CHANGE FOLDER
                </button>
                <button
                  onClick={() => clearSelectedFolder()}
                  className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-lg transition-all"
                >
                  🗑️ CLEAR
                </button>
              </div>
            </>
          )}
          {confirmVisible && (
            <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-xl font-bold text-green-600">
              ✓ Folder Selected!
            </motion.div>
          )}
        </div>
      </div>

      {/* Detailed Folder Stats Section */}
      {selectedFolder && folderStats && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">📊 Folder Analysis</h2>
          
          {/* Size Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-6">📈 File Size Distribution</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Tiny (&lt;1MB)</span>
                    <span className="text-sm font-bold text-gray-900">{folderStats.bySizeRange.small}</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ width: `${(folderStats.bySizeRange.small / folderStats.total) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Small (1-10MB)</span>
                    <span className="text-sm font-bold text-gray-900">{folderStats.bySizeRange.medium}</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full" 
                      style={{ width: `${(folderStats.bySizeRange.medium / folderStats.total) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Large (10-100MB)</span>
                    <span className="text-sm font-bold text-gray-900">{folderStats.bySizeRange.large}</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-500 rounded-full" 
                      style={{ width: `${(folderStats.bySizeRange.large / folderStats.total) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Huge (&gt;100MB)</span>
                    <span className="text-sm font-bold text-gray-900">{folderStats.bySizeRange.huge}</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500 rounded-full" 
                      style={{ width: `${(folderStats.bySizeRange.huge / folderStats.total) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* File Types */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-6">📁 File Types</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {Object.entries(folderStats.byType)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 10)
                  .map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">
                        {type || 'folder'} {type === '' && '(Folders)'}
                      </span>
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                        {count}
                      </span>
                    </div>
                  ))}
              </div>
            </motion.div>
          </div>

          {/* Top Files */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-6">🏆 Largest Files</h3>
            <div className="space-y-3">
              {folderStats.topFiles.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-600">{file.type || 'folder'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      {file.size > 1024 * 1024
                        ? (file.size / 1024 / 1024).toFixed(2) + ' MB'
                        : (file.size / 1024).toFixed(2) + ' KB'}
                    </p>
                    <div className="w-32 h-2 bg-gray-300 rounded-full mt-1 overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${(file.size / folderStats.size) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">📁 Total Files</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{folderStats ? folderStats.total : (stats?.totalFiles ?? '—')}</p>
              {folderStats && <p className="text-xs text-gray-500 mt-2">In selected folder</p>}
            </div>
            <div className="text-4xl opacity-30">📂</div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all">
          <div>
            <p className="text-sm font-medium text-gray-600">💾 Storage</p>
            <div className="mt-3">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  {folderStats ? (
                    <>
                      <p className="text-2xl font-bold text-gray-900">{(folderStats.size / 1024 / 1024 / 1024).toFixed(2)} GB</p>
                      <p className="text-xs text-gray-600 mt-1">Folder total</p>
                    </>
                  ) : (
                    <>
                      <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden">
                        <div className="h-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" style={{ width: `${stats?.diskUsage ?? 0}%` }} />
                      </div>
                      <p className="text-xs text-gray-600 mt-2 font-semibold">{stats?.diskUsage ?? 0}% System Used</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all">
          <div>
            <p className="text-sm font-medium text-gray-600">📊 File Types</p>
            <div className="mt-3 space-y-1 text-xs text-gray-700">
              {folderStats ? (
                Object.entries(folderStats.byType || {})
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 3)
                  .map(([type, count]) => (
                    <div key={type} className="flex justify-between">
                      <div className="capitalize font-medium">{type || 'folder'}</div>
                      <div className="font-bold">{count}</div>
                    </div>
                  ))
              ) : (
                <>
                  {stats?.diskUsageByType && Object.entries(stats.diskUsageByType).slice(0, 3).map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <div className="capitalize font-medium">{k.replace('_',' ')}</div>
                      <div className="font-bold">{String(v)}</div>
                    </div>
                  ))}
                  {!stats?.diskUsageByType && <div className="text-gray-400">No data</div>}
                </>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all">
          <div>
            <p className="text-sm font-medium text-gray-600">🎯 Space Saved</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{stats?.spaceSaved ?? '—'}</p>
            <p className="text-xs text-gray-500 mt-2">From organization & compression</p>
          </div>
        </motion.div>
      </div>

      {/* Tools Overview Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: 'File Explorer (CRUD)', desc: 'Browse & perform CRUD operations on files', emoji: '📂', path: '/files', color: 'blue' },
            { name: 'AutoSort', desc: 'Automatically organize files by type & rules', emoji: '⚡', path: '/autosort', color: 'yellow' },
            { name: 'Duplicate Finder', desc: 'Find and remove duplicate files', emoji: '👥', path: '/duplicates', color: 'purple' },
            { name: 'Compression', desc: 'Compress files and save space', emoji: '📦', path: '/compress', color: 'green' },
            { name: 'Smart Search', desc: 'Find files using natural language', emoji: '🔍', path: '/search', color: 'pink' },
            { name: 'Analytics', desc: 'Analyze file distribution & usage', emoji: '📊', path: '/analytics', color: 'indigo' },
          ].map((tool, i) => (
            <motion.button
              key={tool.name}
              onClick={() => navigate(tool.path)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl hover:border-blue-400 transition-all text-left transform hover:scale-105"
            >
              <div className="text-4xl mb-3">{tool.emoji}</div>
              <h3 className="font-bold text-lg text-gray-900">{tool.name}</h3>
              <p className="text-sm text-gray-600 mt-2">{tool.desc}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
