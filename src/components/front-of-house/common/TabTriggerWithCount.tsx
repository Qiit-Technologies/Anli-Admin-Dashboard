'use client';

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface TabTriggerWithCountProps {
    label: string;
    count: number;
    value: string;
    stat?: {
        currentValue: number;
        previousValue: number;
        title: string;
    };
}

const TabTriggerWithCount = ({ label, count }: TabTriggerWithCountProps) => {
    return (
        <div className="bg-white p-2 sm:p-4 w-full transition-all duration-200 cursor-pointer">
            <div className="flex gap-1 sm:gap-3 items-center min-h-[2rem]">
                <div className="text-xs sm:text-sm text-gray-600 font-medium flex-1 truncate">
                    {label}
                </div>
                <div className="flex items-center justify-center w-4 h-4 sm:w-6 sm:h-6 flex-shrink-0">
                    {count > 0 ? (
                        <div className="text-[10px] sm:text-xs text-white rounded-full bg-hexbrand w-4 h-4 sm:w-6 sm:h-6 flex items-center justify-center font-medium">
                            {count > 99 ? '99+' : count}
                        </div>
                    ) : (
                        <div className="w-4 h-4 sm:w-6 sm:h-6" />
                    )}
                </div>
            </div>
        </div>
    );
};

interface MobileTabSelectProps {
    tabs: Array<{
        label: string;
        count: number;
        value: string;
    }>;
    activeTab: string;
    onTabChange: (value: string) => void;
}

export const MobileTabSelect = ({
    tabs,
    activeTab,
    onTabChange,
}: MobileTabSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const activeTabData = tabs.find((tab) => tab.value === activeTab);

    return (
        <div className="relative w-full sm:hidden mb-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between text-left shadow-sm"
            >
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                        {activeTabData?.label}
                    </span>
                    {activeTabData && activeTabData.count > 0 && (
                        <div className="text-xs text-white rounded-full bg-hexbrand w-5 h-5 flex items-center justify-center font-medium">
                            {activeTabData.count > 99
                                ? '99+'
                                : activeTabData.count}
                        </div>
                    )}
                </div>
                <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {tabs.map((tab) => (
                            <div
                                key={tab.value}
                                className={`p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                                    tab.value === activeTab
                                        ? 'bg-blue-50 border-l-4 border-l-hexbrand'
                                        : ''
                                }`}
                                onClick={() => {
                                    onTabChange(tab.value);
                                    setIsOpen(false);
                                }}
                            >
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-700">
                                        {tab.label}
                                    </span>
                                    {tab.count > 0 && (
                                        <div className="text-xs text-white rounded-full bg-hexbrand w-5 h-5 flex items-center justify-center font-medium">
                                            {tab.count > 99 ? '99+' : tab.count}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default TabTriggerWithCount;
