import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSelectedFolder } from '../context/SelectedFolderContext';

export const SmartSearch: React.FC = () => {
  const { selectedFolder } = useSelectedFolder();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [scanned, setScanned] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedFolder) {
      scanFolder();
    }
  }, [selectedFolder]);

  const scanFolder = async () => {
    if (!selectedFolder) return;
    setLoading(true);
    try {
      const files = await window.electronAPI.scanDirectory(selectedFolder);
      setScanned(files);
    } catch (e) {
      console.error('Scan failed', e);
    } finally {
      setLoading(false);
    }
  };

  const runSearch = () => {
    if (!scanned) return alert('No files scanned yet');
    const q = query.toLowerCase();
    const res = scanned.filter(f => f.name.toLowerCase().includes(q) || (f.extension||'').toLowerCase().includes(q));
    setResults(res.slice(0,200));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-6">
      <div className={`rounded-lg p-4 border-2 ${
        selectedFolder ? 'bg-green-50 border-green-300' : 'bg-yellow-50 border-yellow-300'
      }`}>
        <div>
          <p className="font-semibold text-gray-800">Searching in:</p>
          <p className="font-mono text-sm text-gray-700 mt-1">{selectedFolder ? selectedFolder : '❌ No folder selected - select from Dashboard'}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Smart Search</h2>

        <div className="flex gap-2 mb-4">
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name or extension" className="p-2 border rounded flex-1" />
          <button onClick={runSearch} className="px-3 py-1 bg-green-600 text-white rounded">Search</button>
        </div>

        <div>
          <h3 className="font-medium mb-2">Results</h3>
          {results.length === 0 ? <div className="text-sm text-gray-500">No results</div> : (
            <ul className="space-y-1 text-sm">
              {results.map(r => (
                <li key={r.path} className="flex justify-between">
                  <div>{r.name} <span className="text-xs text-gray-500">{r.path}</span></div>
                  <div className="text-xs text-gray-600">{r.size} bytes</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SmartSearch;
