'use client';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ListFilter } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface TableFilterProps {
    table: any;
    filters?: Filter[];
}
interface Filter {
    id: string;
    label: string;
    options: { value: string; label: string }[];
    subFilters?: {
        triggerValue: string;
        filter: Filter;
    }[];
}

const TableFilter = ({ table, filters = [] }: TableFilterProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleFilterChange = (
        filterId: string,
        value: string,
        currentFilter?: Filter,
    ) => {
        const finalValue = value === 'all' ? '' : value;

        table.getColumn(filterId)?.setFilterValue(finalValue);

        const params = new URLSearchParams(searchParams.toString());
        if (finalValue) {
            params.set(filterId, finalValue);
        } else {
            params.delete(filterId);
        }

        // Recursively clear any subFilter data (from table and URL) if the parent value changes
        if (currentFilter?.subFilters) {
            currentFilter.subFilters.forEach((sub) => {
                if (sub.triggerValue !== finalValue) {
                    const clearSubFilters = (f: Filter) => {
                        table.getColumn(f.id)?.setFilterValue('');
                        params.delete(f.id);
                        f.subFilters?.forEach((child) =>
                            clearSubFilters(child.filter),
                        );
                    };
                    clearSubFilters(sub.filter);
                }
            });
        }

        router.push(`?${params.toString()}`, { scroll: false });
    };

    const handleClearFilters = () => {
        table.resetColumnFilters();
        const params = new URLSearchParams(searchParams.toString());

        const clearAllFilters = (f: Filter) => {
            params.delete(f.id);
            f.subFilters?.forEach((sub) => clearAllFilters(sub.filter));
        };

        filters.forEach(clearAllFilters);
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const FilterItem = ({ filter }: { filter: Filter }) => {
        const currentValue = (
            table.getColumn(filter.id)?.getFilterValue() || ''
        ).toString();

        return (
            <div className="space-y-4">
                <div className="space-y-2">
                    <label
                        className="text-muted-foreground"
                        htmlFor={filter.id}
                    >
                        {filter.label}
                    </label>
                    <Select
                        value={currentValue}
                        onValueChange={(value) =>
                            handleFilterChange(filter.id, value, filter)
                        }
                    >
                        <SelectTrigger
                            className="bg-gray-100 border-none focus:ring-brand focus-visible:ring-brand focus-within:ring-brand"
                            id={filter.id}
                        >
                            <SelectValue
                                placeholder={`Select ${filter.label}`}
                            />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            {filter.options.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {filter.subFilters?.map(
                    (sub) =>
                        currentValue === sub.triggerValue && (
                            <FilterItem
                                key={sub.filter.id}
                                filter={sub.filter}
                            />
                        ),
                )}
            </div>
        );
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className=" md:ml-auto">
                    <ListFilter className="mr-2 h-4 w-4" />
                    More filters
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 rounded-xl" align="end">
                <div className="flex flex-col space-y-4">
                    {filters.map((filter) => (
                        <FilterItem key={filter.id} filter={filter} />
                    ))}
                    <Button
                        className="bg-orion-blue hover:bg-orion-blue text-white"
                        onClick={handleClearFilters}
                    >
                        Clear
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default TableFilter;
