import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
export const NotFound = () => {
    const navigate = useNavigate();
    return (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100", children: _jsxs("div", { className: "text-center space-y-6 p-8", children: [_jsx("div", { className: "text-6xl", children: "\u26A0\uFE0F" }), _jsxs("div", { children: [_jsx("h1", { className: "text-4xl font-bold text-gray-900 mb-2", children: "Page Not Found" }), _jsx("p", { className: "text-lg text-gray-600", children: "The page you're looking for doesn't exist or there's a routing error." })] }), _jsxs("button", { onClick: () => navigate('/'), className: "inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all", children: [_jsx(Home, { className: "w-5 h-5" }), "Back to Dashboard"] })] }) }));
};
export default NotFound;
//# sourceMappingURL=NotFound.js.map