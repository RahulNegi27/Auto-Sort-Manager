import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSelectedFolder } from '../context/SelectedFolderContext';

export const CompressionTool: React.FC = () => {
  const { selectedFolder } = useSelectedFolder();
  const [files, setFiles] = useState<string[]>([]);
  const [format, setFormat] = useState<'zip'|'tar'|'gzip'|'7z'>('zip');
  const [output, setOutput] = useState<string>('archive.zip');
  const [running, setRunning] = useState(false);

  const runCompress = async () => {
    if (!selectedFolder) return alert('Select a folder from Dashboard');
    if (files.length === 0) {
      // Auto-load files from selected folder
      const scanned = await window.electronAPI.scanDirectory(selectedFolder);
      const fileList = (scanned as any[]).filter((f: any) => f.type === 'file').slice(0,200).map((f: any) => f.path);
      setFiles(fileList);
      if (fileList.length === 0) return alert('No files to compress');
    }
    setRunning(true);
    try {
      const outPath = output || `archive.${format}`;
      await window.electronAPI.compressFiles(files.length > 0 ? files : [], outPath, format);
      alert('Compression completed');
    } catch (e) {
      console.error(e);
      alert('Compression failed');
    } finally {
      setRunning(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-6">
      {/* Status Bar */}
      <div className={`rounded-lg p-4 border-2 ${
        selectedFolder ? 'bg-green-50 border-green-300' : 'bg-yellow-50 border-yellow-300'
      }`}>
        <div>
          <p className="font-semibold text-gray-800">Working on:</p>
          <p className="font-mono text-sm text-gray-700 mt-1">{selectedFolder ? selectedFolder : '❌ No folder selected - select from Dashboard'}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Compression Tool</h2>

        <div className="mb-4">
          <label className="block text-sm">Format</label>
          <select value={format} onChange={e => setFormat(e.target.value as any)} className="p-2 border rounded">
            <option value="zip">ZIP</option>
            <option value="tar">TAR</option>
            <option value="gzip">GZIP</option>
            <option value="7z">7Z</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm">Output file</label>
          <input value={output} onChange={e => setOutput(e.target.value)} className="p-2 border rounded w-64" />
        </div>

        <div className="mb-4">
          <button onClick={runCompress} disabled={running || !(selectedFolder)} className="px-3 py-1 bg-green-600 text-white rounded">{running ? 'Running...' : 'Compress'}</button>
        </div>

        <div>
          <h3 className="font-medium mb-2">Files (sample)</h3>
          <ul className="list-disc pl-6 text-sm">
            {files.slice(0,200).map(f => <li key={f}>{f}</li>)}
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default CompressionTool;
