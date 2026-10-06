import { SearchIcon } from 'lucide-react';
import React from 'react';

type SearchWithIconProps = {
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    value: string;
    placeholder?: string;
    className?: string;
};

export default function SearchWithIcon({
    onChange,
    value,
    placeholder = 'Search',
    className = '',
}: SearchWithIconProps) {
    return (
        <div className={`${className}`}>
            <div className="flex items-center gap-2 border border-gray-300 rounded-md py-2 px-3 h-12">
                <SearchIcon className="text-gray-400 w-4 h-4" />
                <input
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className="border-0 outline-none ring-0 focus:ring-0 focus-visible:ring-0 px-0 font-normal w-full placeholder:text-md placeholder:font-normal placeholder:text-[#667085]"
                />
            </div>
        </div>
    );
}
