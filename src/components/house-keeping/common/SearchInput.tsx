import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import React from 'react';

interface SearChInputProps extends React.ComponentPropsWithoutRef<'input'> {
    containerClassname?: string;
}
const SearchInput = ({
    containerClassname,
    className,
    placeholder,
    ...props
}: SearChInputProps) => {
    return (
        <div className={cn('relative', containerClassname)}>
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Search size={18} />
            </span>
            <input
                {...props}
                type="text"
                className={cn(
                    className,
                    'pl-10 pr-4 py-2 border rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-brand focus:border-blue-500',
                )}
                placeholder={placeholder ?? 'Search'}
            />
        </div>
    );
};

export default SearchInput;
