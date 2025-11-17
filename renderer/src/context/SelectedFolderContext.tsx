import React, { createContext, useContext, useState, useEffect } from 'react';

interface SelectedFolderContextValue {
  selectedFolder: string | null;
  setSelectedFolder: (path: string | null) => void;
  clearSelectedFolder: () => void;
}

interface SelectedFolderContextExtras {
  recentFolders: string[];
  addRecentFolder: (path: string) => void;
  removeRecentFolder: (path: string) => void;
  clearRecentFolders: () => void;
}

const SelectedFolderContext = createContext<SelectedFolderContextValue | undefined>(undefined);

export const SelectedFolderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedFolder, setSelectedFolderState] = useState<string | null>(() => {
    try {
      return localStorage.getItem('selectedFolder') || null;
    } catch {
      return null;
    }
  });

  const [recentFolders, setRecentFolders] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('selectedFolder:recent');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      if (selectedFolder) localStorage.setItem('selectedFolder', selectedFolder);
      else localStorage.removeItem('selectedFolder');
    } catch {}
  }, [selectedFolder]);

  useEffect(() => {
    try {
      localStorage.setItem('selectedFolder:recent', JSON.stringify(recentFolders.slice(0,10)));
    } catch {}
  }, [recentFolders]);

  const setSelectedFolder = (path: string | null) => {
    setSelectedFolderState(path);
    if (path) {
      setRecentFolders(prev => {
        const dedup = [path, ...prev.filter(p => p !== path)];
        return dedup.slice(0, 10);
      });
    }
  };

  const clearSelectedFolder = () => setSelectedFolderState(null);

  const addRecentFolder = (path: string) => {
    setRecentFolders(prev => {
      const dedup = [path, ...prev.filter(p => p !== path)];
      return dedup.slice(0, 10);
    });
  };

  const removeRecentFolder = (path: string) => setRecentFolders(prev => prev.filter(p => p !== path));

  const clearRecentFolders = () => setRecentFolders([]);

  return (
    <SelectedFolderContext.Provider value={{ selectedFolder, setSelectedFolder, clearSelectedFolder, recentFolders, addRecentFolder, removeRecentFolder, clearRecentFolders } as any}>
      {children}
    </SelectedFolderContext.Provider>
  );
};

export const useSelectedFolder = (): SelectedFolderContextValue & SelectedFolderContextExtras => {
  const ctx = useContext(SelectedFolderContext) as any;
  if (!ctx) throw new Error('useSelectedFolder must be used within SelectedFolderProvider');
  return ctx;
};

export default SelectedFolderContext;
