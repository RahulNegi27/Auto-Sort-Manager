import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAutoSort } from '../../hooks/useAutoSort';
import { useSelectedFolder } from '../../context/SelectedFolderContext';
import { useEffect } from 'react';
import {
  FolderOpen,
  Play,
  Pause,
  Square,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  X,
  Plus
} from 'lucide-react';

interface SortRule {
  id: string;
  name: string;
  category: string;
  conditions: SortCondition[];
  enabled: boolean;
  priority: number;
}

interface SortCondition {
  type: 'extension' | 'name' | 'size' | 'date' | 'content';
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'regex';
  value: string;
}

interface SortJob {
  id: string;
  name: string;
  status: 'pending' | 'scanning' | 'organizing' | 'completed' | 'error';
  progress: number;
  filesScanned: number;
  filesOrganized: number;
  sourcePath: string;
  startTime: Date;
  endTime?: Date;
  rulesApplied: number;
}

export const AutoSortEngine: React.FC = () => {
  const { startSorting, stopSorting, getPreview, isSorting, progress, statistics, updateStatistics } = useAutoSort();
  const { selectedFolder } = useSelectedFolder();
  const [activeJob, setActiveJob] = useState<SortJob | null>(null);
  const [useML, setUseML] = useState(false);
  const [folderPath, setFolderPath] = useState<string | null>(null);
  const [preview, setPreview] = useState<any | null>(null);
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [showDryRunPreview, setShowDryRunPreview] = useState(false);
  const [dryRunResults, setDryRunResults] = useState<any>(null);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleCategory, setNewRuleCategory] = useState('');
  const [newRuleConditionType, setNewRuleConditionType] = useState<'extension' | 'size' | 'date' | 'name' | 'content'>('extension');
  const [newRuleConditionValue, setNewRuleConditionValue] = useState('');
  const [sortRules, setSortRules] = useState<SortRule[]>([
    {
      id: '1',
      name: 'Document Files',
      category: 'documents',
      enabled: true,
      priority: 1,
      conditions: [
        { type: 'extension', operator: 'equals', value: '.pdf' },
        { type: 'extension', operator: 'equals', value: '.doc' },
        { type: 'extension', operator: 'equals', value: '.docx' },
        { type: 'extension', operator: 'equals', value: '.txt' }
      ]
    },
    {
      id: '2',
      name: 'Image Files',
      category: 'images',
      enabled: true,
      priority: 1,
      conditions: [
        { type: 'extension', operator: 'equals', value: '.jpg' },
        { type: 'extension', operator: 'equals', value: '.png' },
        { type: 'extension', operator: 'equals', value: '.gif' },
        { type: 'extension', operator: 'equals', value: '.bmp' }
      ]
    },
    {
      id: '3',
      name: 'Audio Files',
      category: 'audio',
      enabled: true,
      priority: 1,
      conditions: [
        { type: 'extension', operator: 'equals', value: '.mp3' },
        { type: 'extension', operator: 'equals', value: '.wav' },
        { type: 'extension', operator: 'equals', value: '.flac' }
      ]
    },
    {
      id: '4',
      name: 'Video Files',
      category: 'video',
      enabled: true,
      priority: 1,
      conditions: [
        { type: 'extension', operator: 'equals', value: '.mp4' },
        { type: 'extension', operator: 'equals', value: '.avi' },
        { type: 'extension', operator: 'equals', value: '.mov' }
      ]
    },
    {
      id: '5',
      name: 'Large Files',
      category: 'large_files',
      enabled: true,
      priority: 2,
      conditions: [
        { type: 'size', operator: 'greater', value: '100000000' } // 100MB
      ]
    },
    {
      id: '6',
      name: 'Recent Files',
      category: 'recent',
      enabled: true,
      priority: 3,
      conditions: [
        { type: 'date', operator: 'greater', value: '7' } // Last 7 days
      ]
    }
  ]);

  const handleStart = useCallback(async () => {
    const pathToUse = folderPath || selectedFolder;
    if (!pathToUse) return;
    const enabledRules = sortRules.filter(r => r.enabled);

    // Prevent running a real sort if no rules enabled and AI is off
    if (!useML && enabledRules.length === 0) {
      alert('Please enable at least one sorting rule or enable AI classification before running AutoSort.');
      return;
    }

    await startSorting(pathToUse, { dryRun: false, useML: useML, rules: enabledRules });
  }, [folderPath, selectedFolder, useML, startSorting]);

  const handleBrowse = async () => {
    try {
      const selected = await (window as any).electronAPI.selectFolder();
      if (selected) {
        setFolderPath(selected);
        const p = await getPreview(selected);
        setPreview(p);
      }
    } catch (err) {
      console.error('Folder select error', err);
    }
  };

  // Sync with global selected folder: if user selects a folder in Dashboard, reflect it here
  useEffect(() => {
    if (selectedFolder) {
      setFolderPath(selectedFolder);
      (async () => {
        try {
          const p = await getPreview(selectedFolder);
          setPreview(p);
        } catch (e) {
          console.warn('Preview load failed for selectedFolder', e);
        }
      })();
    }
  }, [selectedFolder]);

  // Load statistics on mount
  useEffect(() => {
    updateStatistics();
  }, [updateStatistics]);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const items = e.dataTransfer.items;
    if (items && items.length > 0) {
      const path = (e.dataTransfer.items[0] as any).getAsFileSystemHandle?.();
      // Fallback: try first file path
      const file = e.dataTransfer.files[0];
      if (file) {
        const folder = (file as any).path || file.name;
        setFolderPath(folder);
        try {
          const p = await getPreview(folder);
          setPreview(p);
        } catch (err) {
          console.warn('Preview fetch failed for dropped folder', err);
        }
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleAddRule = () => {
    if (!newRuleName || !newRuleCategory || !newRuleConditionValue) {
      alert('Please fill in all fields');
      return;
    }

    const newRule: SortRule = {
      id: Date.now().toString(),
      name: newRuleName,
      category: newRuleCategory,
      enabled: true,
      priority: 1,
      conditions: [
        {
          type: newRuleConditionType,
          operator: newRuleConditionType === 'size' ? 'greater' : 'equals',
          value: newRuleConditionValue
        }
      ]
    };

    setSortRules([...sortRules, newRule]);
    setShowAddRuleModal(false);
    setNewRuleName('');
    setNewRuleCategory('');
    setNewRuleConditionValue('');
    alert('Rule added successfully!');
  };

  const handleDeleteRule = (id: string) => {
    if (confirm('Delete this rule?')) {
      setSortRules(sortRules.filter(r => r.id !== id));
    }
  };

  const simulateAutoSort = async (job: SortJob) => {
    // Phase 1: Scanning
    for (let progress = 0; progress <= 40; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setActiveJob(prev => prev ? {
        ...prev,
        progress,
        filesScanned: Math.floor(progress * 25)
      } : null);
    }

    // Phase 2: Organizing
    setActiveJob(prev => prev ? { ...prev, status: 'organizing' } : null);
    
    for (let progress = 40; progress <= 90; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setActiveJob(prev => prev ? {
        ...prev,
        progress,
        filesOrganized: Math.floor((progress - 40) * 20)
      } : null);
    }

    // Phase 3: Completion
    setActiveJob(prev => prev ? {
      ...prev,
      status: 'completed',
      progress: 100,
      filesOrganized: 1000,
      endTime: new Date()
    } : null);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      documents: 'blue',
      images: 'green',
      audio: 'purple',
      video: 'orange',
      archives: 'red',
      large_files: 'yellow',
      recent: 'indigo'
    };
    return colors[category] || 'gray';
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AutoSort Engine</h1>
          <p className="text-gray-600 mt-2">Automatically organize files using AI-powered classification</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Dry Run Mode removed - UI always runs real sort after confirmation */}

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useML}
              onChange={(e) => setUseML(e.target.checked)}
              className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Zap className="w-4 h-4 text-blue-600" />
              Use AI Classification
            </span>
          </label>
          
          <div className="flex items-center gap-3">
            {!selectedFolder && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBrowse}
                className="bg-white border border-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 transition-colors"
              >
                <FolderOpen className="w-5 h-5 text-primary-600" />
                <span>Browse Folder</span>
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStart}
              disabled={!(folderPath || selectedFolder)}
              className={`px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 transition-colors ${(folderPath || selectedFolder) ? 'bg-primary-500 hover:bg-primary-600 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
            >
              <Play className="w-5 h-5" />
              <span>Start AutoSort</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Drag & Drop / Selected Folder */}
      <div className="bg-white border border-dashed border-gray-200 rounded-lg p-6">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="flex items-center justify-between gap-4"
        >
          <div>
            <p className="text-sm text-gray-600">Drag & drop a folder here, or use the Dashboard to select a folder.</p>
            <p className="text-sm text-gray-700 font-mono mt-2">{folderPath || selectedFolder || 'No folder selected'}</p>
          </div>

          <div className="flex items-center gap-3">
            {!selectedFolder && (
              <button onClick={handleBrowse} className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">Browse</button>
            )}
            <button onClick={handleStart} disabled={!(folderPath || selectedFolder)} className={`px-3 py-2 rounded ${(folderPath || selectedFolder) ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-400'}`}>Start</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Job Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Status */}
          {activeJob && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{activeJob.name}</h3>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  activeJob.status === 'completed' ? 'bg-green-100 text-green-800' :
                  activeJob.status === 'error' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {activeJob.status.charAt(0).toUpperCase() + activeJob.status.slice(1)}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{activeJob.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${activeJob.progress}%` }}
                      className={`h-3 rounded-full ${
                        activeJob.status === 'completed' ? 'bg-green-500' :
                        activeJob.status === 'error' ? 'bg-red-500' :
                        'bg-blue-500'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{activeJob.filesScanned}</p>
                    <p className="text-sm text-gray-600">Files Scanned</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{activeJob.filesOrganized}</p>
                    <p className="text-sm text-gray-600">Files Organized</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{activeJob.rulesApplied}</p>
                    <p className="text-sm text-gray-600">Rules Applied</p>
                  </div>
                </div>

                <div className="flex justify-between text-sm text-gray-500">
                  <span>Started: {activeJob.startTime.toLocaleTimeString()}</span>
                  {activeJob.endTime && (
                    <span>Completed: {activeJob.endTime.toLocaleTimeString()}</span>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Sort Rules */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Sorting Rules</h3>
              <p className="text-gray-600 text-sm mt-1">Configure how files should be automatically organized</p>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {sortRules.map((rule, index) => (
                  <motion.div
                    key={rule.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full bg-${getCategoryColor(rule.category)}-500`} />
                      
                      <div>
                        <p className="font-medium text-gray-900">{rule.name}</p>
                        <p className="text-sm text-gray-500 capitalize">{rule.category.replace('_', ' ')}</p>
                        <p className="text-xs text-gray-400">
                          {rule.conditions.length} condition{rule.conditions.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">Priority {rule.priority}</p>
                        <p className="text-xs text-gray-500">
                          {rule.enabled ? 'Active' : 'Disabled'}
                        </p>
                      </div>
                      
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rule.enabled}
                          onChange={(e) => {
                            const updated = [...sortRules];
                            updated[index].enabled = e.target.checked;
                            setSortRules(updated);
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>

                      {rule.priority > 1 || index > 5 ? (
                        <button onClick={() => handleDeleteRule(rule.id)} className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors">
                          <X className="w-5 h-5" />
                        </button>
                      ) : null}
                    </div>
                  </motion.div>
                ))}
              </div>

              <button className="w-full mt-4 border-2 border-dashed border-gray-300 rounded-lg py-4 text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors flex items-center justify-center space-x-2" onClick={() => setShowAddRuleModal(true)}>
                <Plus className="w-5 h-5" />
                <span>Add Custom Rule</span>
              </button>
            </div>
          </div>

      {/* Preview Panel */}
      {preview && (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">Preview Organization</h3>
              <p className="text-sm text-gray-600">Estimated organization for <span className="font-mono">{folderPath || selectedFolder}</span></p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Estimated time: {preview.estimatedTime}s</div>
              <div className="text-sm text-gray-500">Avg confidence: {(preview.confidenceScore || 0).toFixed(2)}</div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(preview.proposedStructure || {}).map(([cat, count]: any) => (
              <div key={cat} className="p-3 bg-gray-50 rounded flex flex-col items-center">
                <div className="text-sm text-gray-600">{cat}</div>
                <div className="text-lg font-bold">{count}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-end items-center gap-3">
            <button onClick={async () => {
              const target = folderPath || selectedFolder;
              if (!target) {
                alert('No folder selected to refresh preview');
                return;
              }
              try {
                const p = await getPreview(target);
                setPreview(p);
                alert('Preview refreshed');
              } catch (e) {
                console.error('Preview failed', e);
                alert('Failed to refresh preview');
              }
            }} className="px-3 py-2 bg-gray-100 rounded">Refresh</button>

            <button onClick={async () => {
              const pathToUse = folderPath || selectedFolder;
              if (!pathToUse) return;
                const enabledRules = sortRules.filter(r => r.enabled);
                if (!confirm('Apply organization? This will move files on disk. Proceed?')) return;
                if (!useML && enabledRules.length === 0) {
                  alert('Please enable at least one sorting rule or enable AI classification before applying organization.');
                  return;
                }
                try {
                  await startSorting(pathToUse, { dryRun: false, useML: useML, rules: enabledRules, organizeBy: 'category' });
                  alert('AutoSort started — check progress in UI');
                } catch (e) {
                  console.error('Apply failed', e);
                  alert('Failed to apply organization');
                }
            }} className="px-4 py-2 bg-red-600 text-white rounded">Apply Organization</button>
          </div>
        </div>
      )}
        </div>

        {/* Quick Actions & Stats */}
        <div className="space-y-6">
          {/* Statistics */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">AutoSort Statistics</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Total Files Organized</span>
                <span className="font-bold text-gray-900">{statistics.totalFilesOrganized.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Space Optimized</span>
                <span className="font-bold text-green-600">{statistics.spaceSaved}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Accuracy Rate</span>
                <span className="font-bold text-blue-600">{statistics.accuracy}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Time Saved</span>
                <span className="font-bold text-purple-600">{statistics.timeSaved}</span>
              </div>
            </div>
          </div>

          {/* Dry Run Notice */}
          {/* Dry Run UI removed */}

          {/* AI Classification Notice */}
          {useML && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center space-x-3">
                <Zap className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-semibold text-blue-800">AI Classification Enabled</p>
                  <p className="text-sm text-blue-600">
                    Using multi-strategy ML with file signatures, content analysis & heuristics for accurate classification.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Rule Modal */}
      {showAddRuleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Add Custom Sorting Rule</h2>
              <button onClick={() => setShowAddRuleModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rule Name</label>
                <input
                  type="text"
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  placeholder="e.g., Source Code Files"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Category</label>
                <input
                  type="text"
                  value={newRuleCategory}
                  onChange={(e) => setNewRuleCategory(e.target.value)}
                  placeholder="e.g., code, backups, work"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Condition Type</label>
                <select
                  value={newRuleConditionType}
                  onChange={(e) => setNewRuleConditionType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="extension">File Extension</option>
                  <option value="size">File Size</option>
                  <option value="name">File Name</option>
                  <option value="date">Modification Date</option>
                  <option value="content">Content Type</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {newRuleConditionType === 'extension' && 'Extension (e.g., .js, .ts, .py)'}
                  {newRuleConditionType === 'size' && 'Size in bytes (e.g., 1000000 for 1MB)'}
                  {newRuleConditionType === 'name' && 'Name pattern or keyword'}
                  {newRuleConditionType === 'date' && 'Days (e.g., 30 for last 30 days)'}
                  {newRuleConditionType === 'content' && 'Content pattern'}
                </label>
                <input
                  type="text"
                  value={newRuleConditionValue}
                  onChange={(e) => setNewRuleConditionValue(e.target.value)}
                  placeholder="Enter value"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowAddRuleModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRule}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Rule
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Dry Run Preview Modal */}
      {/* Dry Run preview modal removed — dry-run feature removed from UI */}
    </div>
  );
};
