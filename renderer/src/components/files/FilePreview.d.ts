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
interface FilePreviewProps {
    file: FileItem | null;
    onClose: () => void;
}
export declare const FilePreview: React.FC<FilePreviewProps>;
export {};
