import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
const SelectedFolderContext = createContext(undefined);
export const SelectedFolderProvider = ({ children }) => {
    const [selectedFolder, setSelectedFolderState] = useState(() => {
        try {
            return localStorage.getItem('selectedFolder') || null;
        }
        catch {
            return null;
        }
    });
    const [recentFolders, setRecentFolders] = useState(() => {
        try {
            const raw = localStorage.getItem('selectedFolder:recent');
            return raw ? JSON.parse(raw) : [];
        }
        catch {
            return [];
        }
    });
    useEffect(() => {
        try {
            if (selectedFolder)
                localStorage.setItem('selectedFolder', selectedFolder);
            else
                localStorage.removeItem('selectedFolder');
        }
        catch { }
    }, [selectedFolder]);
    useEffect(() => {
        try {
            localStorage.setItem('selectedFolder:recent', JSON.stringify(recentFolders.slice(0, 10)));
        }
        catch { }
    }, [recentFolders]);
    const setSelectedFolder = (path) => {
        setSelectedFolderState(path);
        if (path) {
            setRecentFolders(prev => {
                const dedup = [path, ...prev.filter(p => p !== path)];
                return dedup.slice(0, 10);
            });
        }
    };
    const clearSelectedFolder = () => setSelectedFolderState(null);
    const addRecentFolder = (path) => {
        setRecentFolders(prev => {
            const dedup = [path, ...prev.filter(p => p !== path)];
            return dedup.slice(0, 10);
        });
    };
    const removeRecentFolder = (path) => setRecentFolders(prev => prev.filter(p => p !== path));
    const clearRecentFolders = () => setRecentFolders([]);
    return (_jsx(SelectedFolderContext.Provider, { value: { selectedFolder, setSelectedFolder, clearSelectedFolder, recentFolders, addRecentFolder, removeRecentFolder, clearRecentFolders }, children: children }));
};
export const useSelectedFolder = () => {
    const ctx = useContext(SelectedFolderContext);
    if (!ctx)
        throw new Error('useSelectedFolder must be used within SelectedFolderProvider');
    return ctx;
};
export default SelectedFolderContext;
//# sourceMappingURL=SelectedFolderContext.js.map