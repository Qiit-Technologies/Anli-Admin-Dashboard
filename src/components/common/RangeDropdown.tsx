/* eslint-disable @typescript-eslint/ban-ts-comment */
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { DateRange, RangeKeyDict } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

interface DateRangeDropdownProps {
    handleSelection: (selection: {
        startDate: string;
        endDate: string;
        key: string;
    }) => void;
}

export default function DateRangeDropdown({
    handleSelection,
}: DateRangeDropdownProps) {
    const [state, setState] = useState([
        {
            startDate: new Date(),
            endDate: new Date(),
            key: 'selection',
        },
    ]);
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // close on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [ref]);

    return (
        <div className="relative inline-block max-w-[250px]" ref={ref}>
            <input
                readOnly
                value={`${state[0].startDate.toLocaleDateString()} - ${state[0].endDate.toLocaleDateString()}`}
                onClick={() => setOpen((prev) => !prev)}
                className="w-[168px] h-fit text-[12px] p-1 px-2 border border-gray-300 rounded-md cursor-pointer"
            />

            {open && (
                <div className="absolute -right-[50px] mt-2 z-50 bg-white shadow-lg rounded-md">
                    {React.createElement(DateRange as any, {
                        editableDateInputs: true,
                        onChange: (item: RangeKeyDict) => {
                            // Ensure we have valid dates before updating state
                            if (
                                item.selection?.startDate &&
                                item.selection?.endDate
                            ) {
                                setState([
                                    {
                                        startDate: item.selection.startDate,
                                        endDate: item.selection.endDate,
                                        key: item.selection.key || 'selection',
                                    },
                                ]);

                                if (
                                    item.selection.startDate.getTime() !==
                                    item.selection.endDate.getTime()
                                ) {
                                    setTimeout(() => {
                                        setOpen(false);
                                        // Convert Date objects to ISO strings for consistency
                                        // At this point we know both dates exist due to the if check above
                                        const selection = {
                                            startDate:
                                                item.selection.startDate!.toISOString(),
                                            endDate:
                                                item.selection.endDate!.toISOString(),
                                            key:
                                                item.selection.key ||
                                                'selection',
                                        };
                                        handleSelection(selection);
                                    }, 500);
                                }
                            }
                        },
                        moveRangeOnFirstSelection: false,
                        ranges: state,
                        rangeColors: ['#FF6F00'],
                        maxDate: new Date(),
                    })}
                </div>
            )}
        </div>
    );
}
