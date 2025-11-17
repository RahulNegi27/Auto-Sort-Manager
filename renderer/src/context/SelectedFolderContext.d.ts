import React from 'react';
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
declare const SelectedFolderContext: React.Context<SelectedFolderContextValue | undefined>;
export declare const SelectedFolderProvider: React.FC<{
    children: React.ReactNode;
}>;
export declare const useSelectedFolder: () => SelectedFolderContextValue & SelectedFolderContextExtras;
export default SelectedFolderContext;
