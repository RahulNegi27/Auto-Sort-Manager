import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, FolderOpen, Search, Archive, Copy, BarChart3, Cpu, Settings, Sparkles, Zap, Clock } from 'lucide-react';
const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'File Explorer', href: '/files', icon: FolderOpen },
    // File Manager removed: CRUD operations moved into File Explorer
    { name: 'AutoSort', href: '/autosort', icon: Zap },
    { name: 'Smart Search', href: '/search', icon: Search },
    { name: 'Compression', href: '/compress', icon: Archive },
    { name: 'Duplicate Finder', href: '/duplicates', icon: Copy },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'OS Visualizers', href: '/visualizers', icon: Cpu },
    { name: 'History', href: '/history', icon: Clock },
    { name: 'Settings', href: '/settings', icon: Settings }
];
export const Sidebar = () => {
    const location = useLocation();
    return (_jsxs(motion.div, { initial: { x: -100, opacity: 0 }, animate: { x: 0, opacity: 1 }, className: "w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col h-screen", children: [_jsx("div", { className: "p-6 border-b border-gray-200", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "p-2 bg-gradient-to-r from-primary-500 to-purple-600 rounded-lg", children: _jsx(Sparkles, { className: "w-6 h-6 text-white" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-xl font-bold text-gray-900", children: "AutoSort" }), _jsx("p", { className: "text-xs text-gray-500", children: "File Intelligence" })] })] }) }), _jsx("nav", { className: "flex-1 p-4 space-y-2 overflow-y-auto", children: navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;
                    return (_jsxs(NavLink, { to: item.href, className: ({ isActive }) => `flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 group ${isActive
                            ? 'bg-primary-50 text-primary-700 border border-primary-200 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`, children: [_jsx(Icon, { className: `w-5 h-5 transition-colors ${location.pathname === item.href
                                    ? 'text-primary-600'
                                    : 'text-gray-400 group-hover:text-gray-600'}` }), _jsx("span", { className: "font-medium", children: item.name }), isActive && (_jsx(motion.div, { layoutId: "activeIndicator", className: "w-1.5 h-1.5 bg-primary-500 rounded-full ml-auto", transition: { type: 'spring', stiffness: 500, damping: 30 } }))] }, item.name));
                }) }), _jsx("div", { className: "p-4 border-t border-gray-200", children: _jsxs("div", { className: "bg-gradient-to-r from-primary-50 to-purple-50 rounded-lg p-4 border border-primary-200", children: [_jsxs("div", { className: "flex items-center space-x-3 mb-2", children: [_jsx(Sparkles, { className: "w-4 h-4 text-primary-600" }), _jsx("span", { className: "text-sm font-semibold text-primary-700", children: "Pro Tip" })] }), _jsx("p", { className: "text-xs text-primary-600", children: "Use Smart Search for natural language file queries" })] }) })] }));
};
//# sourceMappingURL=Sidebar.js.map