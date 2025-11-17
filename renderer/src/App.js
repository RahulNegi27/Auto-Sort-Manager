import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
export const App = () => {
    return (_jsx(Router, { children: _jsx(SelectedFolderProvider, { children: _jsxs("div", { className: "flex h-screen bg-gray-50", children: [_jsx(Sidebar, {}), _jsxs("div", { className: "flex-1 flex flex-col overflow-hidden", children: [_jsx(Header, {}), _jsx("main", { className: "flex-1 overflow-auto", children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "/files", element: _jsx(FileExplorer, {}) }), _jsx(Route, { path: "/compress", element: _jsx(CompressionTool, {}) }), _jsx(Route, { path: "/duplicates", element: _jsx(DuplicateFinder, {}) }), _jsx(Route, { path: "/search", element: _jsx(SmartSearch, {}) }), _jsx(Route, { path: "/analytics", element: _jsx(Analytics, {}) }), _jsx(Route, { path: "/visualizers", element: _jsx(OSVisualizers, {}) }), _jsx(Route, { path: "/autosort", element: _jsx(AutoSortEngine, {}) }), _jsx(Route, { path: "/history", element: _jsx(History, {}) }), _jsx(Route, { path: "/settings", element: _jsx(Settings, {}) }), _jsx(Route, { path: "*", element: _jsx(NotFound, {}) })] }) })] })] }) }) }));
};
//# sourceMappingURL=App.js.map