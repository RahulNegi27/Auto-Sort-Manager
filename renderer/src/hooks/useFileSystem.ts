import { useState } from 'react';

export const useFileSystem = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const scanDirectory = async (path: string) => {
    setIsLoading(true);
    try {
      // Mock implementation
      setFiles([
        { name: 'Document1.pdf', size: 2048, type: 'pdf', modified: new Date() },
        { name: 'Image.jpg', size: 4096, type: 'jpg', modified: new Date() },
        { name: 'Video.mp4', size: 1024000, type: 'mp4', modified: new Date() }
      ]);
      setCurrentPath(path);
      return files;
    } catch (error) {
      console.error('Failed to scan directory:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getFileStats = async (path: string) => {
    return { size: 0, modified: new Date() };
  };

  return {
    files,
    currentPath,
    isLoading,
    scanDirectory,
    getFileStats
  };
};
