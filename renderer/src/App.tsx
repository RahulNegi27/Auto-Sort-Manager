import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './pages/Dashboard';
import { FileExplorer } from './pages/FileExplorer';
import { CompressionTool } from './pages/CompressionTool';
import { DuplicateFinder } from './pages/DuplicateFinder';
import { SmartSearch } from './pages/SmartSearch';
import { Analytics } from './pages/Analytics';
import { OSVisualizers } from './pages/OSVisualizers';
import { Settings } from './pages/Settings';
import { AutoSortEngine } from './components/autosort/AutoSortEngine';
import { History } from './pages/History';
// FileManager route removed; CRUD moved into File Explorer
import { NotFound } from './pages/NotFound';
import { SelectedFolderProvider } from './context/SelectedFolderContext';

export const App: React.FC = () => {
  return (
    <Router>
      <SelectedFolderProvider>
        <div className="flex h-screen bg-gray-50">
          <Sidebar />

          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />

            <main className="flex-1 overflow-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/files" element={<FileExplorer />} />
                <Route path="/compress" element={<CompressionTool />} />
                <Route path="/duplicates" element={<DuplicateFinder />} />
                <Route path="/search" element={<SmartSearch />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/visualizers" element={<OSVisualizers />} />
                <Route path="/autosort" element={<AutoSortEngine />} />
                <Route path="/history" element={<History />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </div>
      </SelectedFolderProvider>
    </Router>
  );
};
