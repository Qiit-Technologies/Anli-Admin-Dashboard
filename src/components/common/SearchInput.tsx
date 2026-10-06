import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import { ChangeEvent } from 'react';
import { Input } from '../ui/input';

function SearchInput({
    placeholder = 'Search...',
    value,
    onChange,
    className,
    disabled,
}: {
    placeholder?: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    className?: string;
    disabled?: boolean;
}) {
    return (
        <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                value={value}
                onChange={onChange}
                type="search"
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                    'pl-10 w-full h-10 shadow-none focus-visible:ring-hexbrand',
                    className,
                )}
            />
        </div>
    );
}

export default SearchInput;
