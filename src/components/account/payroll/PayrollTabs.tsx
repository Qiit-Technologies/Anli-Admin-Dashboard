'use client';

import { cn } from '@/lib/utils';

interface PayrollTabsProps {
    activeTab: 'All' | 'Months' | 'Weeks' | 'Daily';
    onTabChange: (tab: 'All' | 'Months' | 'Weeks' | 'Daily') => void;
}

export function PayrollTabs({ activeTab, onTabChange }: PayrollTabsProps) {
    const tabs = [
        { id: 'All' as const, label: 'All' },
        { id: 'Months' as const, label: 'Months' },
        { id: 'Weeks' as const, label: 'Weeks' },
        { id: 'Daily' as const, label: 'Daily' },
    ];

    return (
        <div className="border-b border-gray-200">
            <nav className="flex space-x-8 overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={cn(
                            'whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors',
                            activeTab === tab.id
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>
        </div>
    );
}
