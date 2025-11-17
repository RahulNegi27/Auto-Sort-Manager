import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
export const Tabs = ({ value, onValueChange, children, className = '' }) => {
    return (_jsx("div", { "data-testid": "tabs", className: className, children: React.Children.map(children, (child) => {
            if (!React.isValidElement(child))
                return child;
            return React.cloneElement(child, {
                value,
                onValueChange,
            });
        }) }));
};
export const TabsList = ({ children, className = '' }) => {
    return (_jsx("div", { className: `inline-flex items-center justify-center rounded-lg bg-gray-100 p-1 ${className}`, role: "tablist", children: children }));
};
export const TabsTrigger = ({ value: triggerValue, onValueChange, children, className = '', }) => {
    const isActive = triggerValue === triggerValue;
    return (_jsx("button", { onClick: () => onValueChange?.(triggerValue || ''), className: `inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${isActive
            ? 'bg-white text-primary-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'} ${className}`, role: "tab", children: children }));
};
export const TabsContent = ({ value: contentValue, children, className = '', value: tabValue, }) => {
    const isActive = contentValue === tabValue;
    if (!isActive)
        return null;
    return (_jsx("div", { className: className, role: "tabpanel", children: children }));
};
//# sourceMappingURL=Tabs.js.map