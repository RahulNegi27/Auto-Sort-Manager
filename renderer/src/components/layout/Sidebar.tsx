import React from 'react';
import { motion } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  Search,
  Archive,
  Copy,
  BarChart3,
  Cpu,
  Settings,
  Sparkles,
  Zap,
  Clock,
  FileText
} from 'lucide-react';

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

export const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col h-screen"
    >
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-primary-500 to-purple-600 rounded-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">AutoSort</h1>
            <p className="text-xs text-gray-500">File Intelligence</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;

          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 border border-primary-200 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`
              }
            >
              <Icon
                className={`w-5 h-5 transition-colors ${
                  location.pathname === item.href
                    ? 'text-primary-600'
                    : 'text-gray-400 group-hover:text-gray-600'
                }`}
              />
              <span className="font-medium">{item.name}</span>

              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="w-1.5 h-1.5 bg-primary-500 rounded-full ml-auto"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-lg p-4 border border-primary-200">
          <div className="flex items-center space-x-3 mb-2">
            <Sparkles className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-semibold text-primary-700">Pro Tip</span>
          </div>
          <p className="text-xs text-primary-600">
            Use Smart Search for natural language file queries
          </p>
        </div>
      </div>
    </motion.div>
  );
};
