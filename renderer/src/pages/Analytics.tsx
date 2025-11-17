import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useSelectedFolder } from '../context/SelectedFolderContext';
import { BarChart3, PieChart as PieIcon, TrendingUp, RefreshCw } from 'lucide-react';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'];

export const Analytics: React.FC = () => {
  const { selectedFolder } = useSelectedFolder();
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);

  useEffect(() => {
    if (selectedFolder) {
      runAnalysis();
    }
  }, [selectedFolder]);

  const runAnalysis = async () => {
    const folderToUse = selectedFolder;
    if (!folderToUse) return;

    setLoading(true);
    try {
      const files = await window.electronAPI.scanDirectory(folderToUse);
      const totalFiles = files.length;
      const totalSize = files.reduce((a: number, b: any) => a + (b.size || 0), 0);

      const byExt: Record<string, { count: number; size: number }> = {};
      for (const f of files) {
        const ext = f.extension || 'folder';
        if (!byExt[ext]) byExt[ext] = { count: 0, size: 0 };
        byExt[ext].count += 1;
        byExt[ext].size += f.size || 0;
      }

      // Prepare chart data (top 8 extensions)
      const chartDataArray = Object.entries(byExt)
        .map(([ext, data]) => ({
          name: ext,
          files: data.count,
          size: Math.round(data.size / 1024 / 1024), // MB
        }))
        .sort((a, b) => b.files - a.files)
        .slice(0, 8);

      // Prepare pie data (file count by extension)
      const pieDataArray = chartDataArray.map(d => ({
        name: d.name,
        value: d.files,
      }));

      const largest = [...files]
        .filter(f => f.type === 'file')
        .sort((a, b) => b.size - a.size)
        .slice(0, 10);

      setChartData(chartDataArray);
      setPieData(pieDataArray);
      setStats({ totalFiles, totalSize, byExt, largest });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full p-8 space-y-8 overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">📊 Analytics</h1>
        </div>
        <button
          onClick={runAnalysis}
          disabled={loading || !selectedFolder}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-all"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Analyzing...' : 'Refresh'}
        </button>
      </div>

      {/* Status bar */}
      {selectedFolder ? (
        <div className="bg-white rounded-lg p-4 border-l-4 border-green-500 shadow-sm">
          <p className="text-sm text-gray-600">Analyzing:</p>
          <p className="font-mono text-sm text-gray-900 mt-1 truncate">{selectedFolder}</p>
        </div>
      ) : (
        <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-500 shadow-sm">
          <p className="text-sm font-medium text-yellow-800">📂 No folder selected. Select one from the Dashboard.</p>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
            >
              <div className="text-sm font-medium text-gray-600">📁 Total Files</div>
              <div className="text-4xl font-bold text-gray-900 mt-2">{stats.totalFiles}</div>
              <p className="text-xs text-gray-500 mt-2">Files in folder</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
            >
              <div className="text-sm font-medium text-gray-600">💾 Total Size</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">{formatBytes(stats.totalSize)}</div>
              <p className="text-xs text-gray-500 mt-2">Combined file size</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
            >
              <div className="text-sm font-medium text-gray-600">📊 Types</div>
              <div className="text-4xl font-bold text-gray-900 mt-2">{Object.keys(stats.byExt).length}</div>
              <p className="text-xs text-gray-500 mt-2">File extensions</p>
            </motion.div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Bar Chart */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Files by Type
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} />
                  <YAxis label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="files" fill="#3b82f6" radius={[8, 8, 0, 0]} name="File Count" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Pie Chart */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-green-600" />
                Distribution
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name} (${entry.value})`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Largest Files Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              Top 10 Largest Files
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200">
                  <tr className="text-gray-600 font-semibold">
                    <th className="text-left py-3 px-2">File Name</th>
                    <th className="text-right py-3 px-2">Size</th>
                    <th className="text-right py-3 px-2">Modified</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.largest.map((f: any, i: number) => (
                    <motion.tr
                      key={f.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-2 truncate text-gray-900 font-medium">{f.name}</td>
                      <td className="py-3 px-2 text-right text-gray-700 font-semibold">{formatBytes(f.size)}</td>
                      <td className="py-3 px-2 text-right text-gray-500 text-xs">
                        {new Date(f.modifiedAt).toLocaleDateString()}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}

      {!stats && !loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center text-gray-500">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Select a folder and click Refresh to analyze</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Analytics;
