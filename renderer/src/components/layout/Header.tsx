import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, Settings, LogOut, FolderOpen, X, ChevronDown, Trash2 } from 'lucide-react';
import { useSelectedFolder } from '../../context/SelectedFolderContext';

export const Header: React.FC = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRecentMenu, setShowRecentMenu] = useState(false);
  const { selectedFolder, setSelectedFolder, clearSelectedFolder, recentFolders, removeRecentFolder, clearRecentFolders } = useSelectedFolder();

  const pickFolder = async () => {
    try {
      const p = await (window as any).electronAPI.selectFolder();
      if (p) setSelectedFolder(p);
    } catch (e) {
      console.warn('Folder pick cancelled or failed', e);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search files, settings, or ask AI..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4 ml-6">
          <div className="flex items-center gap-3">
            <FolderOpen className="w-5 h-5 text-blue-600" />
            {selectedFolder ? (
              <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 px-3 py-1 rounded-lg">
                <div className="text-xs text-gray-600">Working on</div>
                <div className="font-mono text-sm text-gray-800 max-w-[320px] truncate" title={selectedFolder}>{selectedFolder}</div>
                <button onClick={pickFolder} className="px-2 py-1 text-sm bg-white border border-gray-200 rounded ml-2 hover:bg-gray-50">Change</button>
                <button onClick={() => setShowRecentMenu(s => !s)} className="p-1 text-gray-500 hover:bg-gray-100 rounded ml-2" aria-label="Recent folders" title="Recent folders"><ChevronDown className="w-4 h-4" /></button>
                <button onClick={() => { clearSelectedFolder(); }} className="p-1 text-gray-500 hover:bg-gray-100 rounded ml-1" aria-label="Clear selection" title="Clear selection"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-500">No folder selected</div>
                <button onClick={pickFolder} className="px-4 py-2 text-sm bg-blue-600 text-white rounded ml-2 shadow-md">Select</button>
              </div>
            )}
          </div>

          <AnimatePresence>
            {showRecentMenu && recentFolders && recentFolders.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="absolute left-6 top-14 z-50">
                <div className="w-72 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                  <div className="px-3 py-1 text-xs text-gray-500 flex items-center justify-between">
                    <span>Recent folders</span>
                    <button onClick={() => { clearRecentFolders(); setShowRecentMenu(false); }} className="text-red-500 p-1 hover:bg-gray-50 rounded" title="Clear recent"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <div className="max-h-48 overflow-auto">
                    {recentFolders.map((p) => (
                      <div key={p} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer">
                        <div onClick={() => { setSelectedFolder(p); setShowRecentMenu(false); }} className="text-sm font-mono truncate max-w-[520px]">{p}</div>
                        <button onClick={(e) => { e.stopPropagation(); removeRecentFolder(p); }} className="text-gray-400 p-1 hover:text-red-500" title="Remove">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                >
                  <button className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                  <div className="border-t border-gray-200 my-1"></div>
                  <button className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors">
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};
