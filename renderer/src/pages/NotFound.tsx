import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100"
    >
      <div className="text-center space-y-6 p-8">
        <div className="text-6xl">⚠️</div>
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Page Not Found</h1>
          <p className="text-lg text-gray-600">The page you're looking for doesn't exist or there's a routing error.</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
        >
          <Home className="w-5 h-5" />
          Back to Dashboard
        </button>
      </div>
    </motion.div>
  );
};

export default NotFound;
