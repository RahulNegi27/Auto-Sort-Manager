import React, { useState } from 'react';

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ value, onValueChange, children, className = '' }) => {
  return (
    <div data-testid="tabs" className={className}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child as React.ReactElement<any>, {
          value,
          onValueChange,
        });
      })}
    </div>
  );
};

export const TabsList: React.FC<TabsListProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`inline-flex items-center justify-center rounded-lg bg-gray-100 p-1 ${className}`}
      role="tablist"
    >
      {children}
    </div>
  );
};

export const TabsTrigger: React.FC<TabsTriggerProps & { value?: string; onValueChange?: (value: string) => void }> = ({
  value: triggerValue,
  onValueChange,
  children,
  className = '',
}) => {
  const isActive = triggerValue === triggerValue;

  return (
    <button
      onClick={() => onValueChange?.(triggerValue || '')}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
        isActive
          ? 'bg-white text-primary-600 shadow-sm'
          : 'text-gray-600 hover:text-gray-900'
      } ${className}`}
      role="tab"
    >
      {children}
    </button>
  );
};

export const TabsContent: React.FC<TabsContentProps & { value?: string }> = ({
  value: contentValue,
  children,
  className = '',
  value: tabValue,
}) => {
  const isActive = contentValue === tabValue;

  if (!isActive) return null;

  return (
    <div className={className} role="tabpanel">
      {children}
    </div>
  );
};
