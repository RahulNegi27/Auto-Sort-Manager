import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSelectedFolder } from '../context/SelectedFolderContext';

interface DupFile {
  id: string;
  path: string;
  name: string;
  size: number;
  modified: string | Date;
  selected: boolean;
  isOriginal: boolean;
}

interface DupGroup {
  id: string;
  files: DupFile[];
  totalSize: number;
  hash: string;
  type: 'exact' | 'similar';
}

export const DuplicateFinder: React.FC = () => {
  const { selectedFolder } = useSelectedFolder();
  const [groups, setGroups] = useState<DupGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [minSize, setMinSize] = useState<number>(1);

  const runFind = async () => {
    if (!selectedFolder) return alert('Select a folder from Dashboard');
    setLoading(true);
    try {
      const res = await window.electronAPI.findDuplicates(selectedFolder, { minSize });
      // Normalize modified dates and selected flag
      const normalized: DupGroup[] = (res as any[]).map(g => ({
        id: g.id,
        files: g.files.map((f: any) => ({ ...f, selected: false })),
        totalSize: g.totalSize,
        hash: g.hash,
        type: g.type
      }));
      setGroups(normalized);
    } catch (e) {
      console.error('Find duplicates failed', e);
      alert('Failed to find duplicates: ' + String(e));
    } finally {
      setLoading(false);
    }
  };

  const toggleFile = (groupId: string, fileId: string) => {
    setGroups(gs => gs.map(g => {
      if (g.id !== groupId) return g;
      return { ...g, files: g.files.map(f => f.id === fileId ? { ...f, selected: !f.selected } : f) };
    }));
  };

  const deleteSelected = async () => {
    const toDelete: DupFile[] = [];
    groups.forEach(g => g.files.forEach(f => { if (f.selected) toDelete.push(f); }));
    if (toDelete.length === 0) {
      alert('No files selected');
      return;
    }

    if (!confirm(`Delete ${toDelete.length} files? This cannot be undone.`)) return;

    // Check settings to decide whether to move to quarantine or delete
    const settings = await window.electronAPI.getSettings();
    const useQuarantine = !!settings?.enableTrash;

    for (const f of toDelete) {
      try {
        if (useQuarantine && (window as any).electronAPI.moveToQuarantine) {
          await (window as any).electronAPI.moveToQuarantine(f.path);
        } else {
          await window.electronAPI.deleteFile(f.path);
        }
      } catch (e) {
        console.error('Delete/Quarantine failed', f.path, e);
      }
    }

    // Refresh groups by removing processed files locally
    setGroups(gs => gs.map(g => ({ ...g, files: g.files.filter(f => !f.selected) })).filter(g => g.files.length > 1));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 space-y-6"
    >
      {/* Status Bar */}
      <div className={`rounded-lg p-4 border-2 transition ${
        selectedFolder ? 'bg-green-50 border-green-300' : 'bg-yellow-50 border-yellow-300'
      }`}>
        <div>
          <p className="font-semibold text-gray-800">Analyzing:</p>
          <p className="font-mono text-sm text-gray-700 mt-1">
            {selectedFolder ? selectedFolder : '❌ No folder selected - select from Dashboard'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Duplicate Finder</h2>

        <div className="flex items-center gap-3 mb-4">
          <div className="text-sm text-gray-600">Min size (bytes):</div>
          <input type="number" value={minSize} onChange={e => setMinSize(Number(e.target.value))} className="border rounded px-2 py-1 w-32" />
          <button onClick={runFind} disabled={!selectedFolder || loading} className="px-4 py-2 ml-auto bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded font-medium transition">{loading ? 'Scanning...' : 'Find Duplicates'}</button>
        </div>

        <div>
          {groups.length === 0 ? (
            <div className="text-sm text-gray-500">No duplicate groups found.</div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-2 mb-2">
                <button onClick={deleteSelected} className="px-3 py-1 bg-red-600 text-white rounded">Delete Selected</button>
              </div>

              {groups.map(group => (
                <div key={group.id} className="border rounded p-3">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-sm font-medium">Group: {group.hash} — {group.files.length} files</div>
                    <div className="text-sm text-gray-500">Total: {group.totalSize} bytes</div>
                  </div>

                  <div className="space-y-1">
                    {group.files.map(f => (
                      <div key={f.id} className="flex items-center gap-3">
                        <input type="checkbox" checked={f.selected} onChange={() => toggleFile(group.id, f.id)} />
                        <div className="flex-1">
                          <div className="text-sm">{f.name}</div>
                          <div className="text-xs text-gray-500">{f.path}</div>
                        </div>
                        <div className="text-sm text-gray-600">{f.size} bytes</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default DuplicateFinder;
