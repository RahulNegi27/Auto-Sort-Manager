import React from 'react';
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
export declare const FileGrid: React.FC<FileGridProps>;
export {};
