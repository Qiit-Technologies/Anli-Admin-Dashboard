import { ReactNode } from 'react';
import { BiSearch } from 'react-icons/bi';
import { MdKeyboardArrowLeft } from 'react-icons/md';

interface SearchBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onRefresh: () => void;
    isLoading?: boolean;
    placeholder?: string;
    rightContent?: ReactNode;
}

export const SearchBar = ({
    searchQuery,
    onSearchChange,
    onRefresh,
    isLoading = false,
    placeholder = 'Search by name or reservation ID',
    rightContent,
}: SearchBarProps) => {
    return (
        <div className="flex items-center justify-between bg-white p-1.5 border rounded-xl">
            <div className="flex items-center gap-4">
                <button
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="p-2 hover:bg-gray-50 rounded-lg disabled:opacity-50"
                    title="Refresh"
                >
                    <MdKeyboardArrowLeft className="h-8 w-8 text-gray-600 border rounded-full p-1.5" />
                </button>
                <div className="relative">
                    <BiSearch className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                        type="search"
                        placeholder={placeholder}
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-10 pr-4 py-2.5 bg-gray-50 rounded-lg w-[320px] text-sm focus:outline-none focus:ring-1 focus:ring-gray-200"
                    />
                </div>
            </div>
            {rightContent && (
                <div className="flex gap-3 pr-2">{rightContent}</div>
            )}
        </div>
    );
};
