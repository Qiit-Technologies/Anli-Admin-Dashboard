'use client';
import { getStaff } from '@/app/actions/staff';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Staff } from '@/types/staff.types';
import { Check, ChevronsUpDown } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import ReportsCard, { ReportsCardProps } from './components/ReportsCard';
import useSWR from 'swr';
import { fetchWaiterPerformanceStat } from '@/hooks/fetcher';

const Selector = ({
    open,
    setOpen,
    placeholder,
    value,
    disabled = false,
    className = '',
    children,
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
    placeholder: string;
    value?: string;
    disabled?: boolean;
    className?: string;
    children: React.ReactNode;
}) => (
    <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
            <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                disabled={disabled}
                className={`w-fit bg-white shadow-none items-center justify-start h-10 ${className}`}
            >
                {value || placeholder}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-full p-0">
            {children}
        </PopoverContent>
    </Popover>
);

const WaiterReportComponent = () => {
    const [staffs, setStaff] = useState<Staff[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);
    const [staffSelectorOpen, setStaffSelectorOpen] = useState(false);
    const [selectedWaiter, setSelectedWaiter] = useState<number | null>(null);

    const fetchStaffData = async () => {
        setIsLoading(true);
        try {
            const response = (await getStaff(1)) as any;
            setStaff(response.data);
        } catch (err) {
            console.error('Error fetching staff:', err);
            setError(err as Error);
            setStaff([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStaffData();
    }, []);

    const { data: waiterStats } = useSWR(
        selectedWaiter
            ? `/orders/waiter-performance-stats?waiterId=${selectedWaiter}`
            : null,
        () => fetchWaiterPerformanceStat(selectedWaiter),
    );

    if (error) {
        return (
            <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold">Error</h2>
                <p className="text-gray-500">
                    An error occurred while fetching staff. Please try again
                    later.
                </p>
            </div>
        );
    }

    return (
        <div>
            <div>
                <Selector
                    open={staffSelectorOpen}
                    setOpen={setStaffSelectorOpen}
                    placeholder="Select waiter to view stats..."
                    value={
                        selectedWaiter
                            ? staffs?.find(
                                  (staff) => staff.id === selectedWaiter,
                              )?.fullName
                            : undefined
                    }
                    disabled={staffs?.length === 0 || isLoading}
                >
                    <Command>
                        <CommandInput
                            placeholder="Search staff..."
                            className="h-9"
                        />
                        <CommandList>
                            <CommandEmpty>No staff found.</CommandEmpty>
                            <CommandGroup>
                                {staffs?.map((staff) => (
                                    <CommandItem
                                        key={staff.id}
                                        value={staff.fullName}
                                        onSelect={() => {
                                            setSelectedWaiter(staff.id);
                                            setStaffSelectorOpen(false);
                                        }}
                                    >
                                        {staff.fullName}
                                        <Check
                                            className={cn(
                                                'ml-auto h-4 w-4',
                                                selectedWaiter === staff.id
                                                    ? 'opacity-100'
                                                    : 'opacity-0',
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </Selector>
            </div>

            {selectedWaiter ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    {waiterStats?.data.map(
                        (stat: ReportsCardProps, index: number) => (
                            <ReportsCard
                                title={stat.title}
                                value={stat.value}
                                percent={stat.percent}
                                trend={stat.trend as 'up' | 'down'}
                                key={index}
                            />
                        ),
                    )}
                </div>
            ) : (
                <div className="flex justify-center items-center h-40 text-gray-500">
                    Select a waiter to view their performance statistics
                </div>
            )}
        </div>
    );
};

export default WaiterReportComponent;
