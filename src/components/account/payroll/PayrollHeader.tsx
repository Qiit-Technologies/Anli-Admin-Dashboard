'use client';

import { Search, Filter, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PayrollHeaderProps {
    searchValue: string;
    onSearchChange: (value: string) => void;
    onFiltersClick: () => void;
}

export function PayrollHeader({
    searchValue,
    onSearchChange,
    onFiltersClick,
}: PayrollHeaderProps) {
    return (
        <div className="space-y-6">
            {/* Title Section */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Payroll summary
                    </h1>
                    <p className="text-sm text-gray-600">
                        Manage non-food items and physical resources needed for
                        the event.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 md:w-8 md:h-8 lg:w-10 lg:h-10 rounded-full border border-[rgba(242,242,242,1)] bg-white"
                    >
                        <Bell className="h-4 w-4 text-[rgba(122,122,122,1)]" />
                    </Button>
                    <Button
                        variant="secondary"
                        size="sm"
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md"
                    >
                        Go
                    </Button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <Button
                    variant="outline"
                    onClick={onFiltersClick}
                    className="flex items-center gap-2 px-4 py-2 bg-transparent"
                >
                    <Filter className="h-4 w-4" />
                    Filters
                </Button>
            </div>
        </div>
    );
}
