import React from 'react';
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
export declare const Tabs: React.FC<TabsProps>;
export declare const TabsList: React.FC<TabsListProps>;
export declare const TabsTrigger: React.FC<TabsTriggerProps & {
    value?: string;
    onValueChange?: (value: string) => void;
}>;
export declare const TabsContent: React.FC<TabsContentProps & {
    value?: string;
}>;
export {};
