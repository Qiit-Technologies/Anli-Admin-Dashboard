'use client';

import { useState, useRef, useEffect } from 'react';
import { Calendar } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

// Type assertion to fix TypeScript compatibility issue
const CalendarComponent = Calendar as any;

export default function CalendarPicker({
    handleSelection,
    currentDate,
}: {
    handleSelection: (date: Date) => void;
    currentDate: Date;
}) {
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
                value={new Date(currentDate).toLocaleDateString()}
                onClick={() => setOpen((prev) => !prev)}
                className="w-[80px] h-fit text-[12px] p-1 border border-gray-300 rounded-md cursor-pointer"
            />

            {open && (
                <div className="absolute -right-[50px] mt-2 z-50 bg-white shadow-lg rounded-md">
                    <CalendarComponent
                        date={currentDate}
                        onChange={(selectedDate: Date) => {
                            setTimeout(() => {
                                setOpen(false);
                                handleSelection(selectedDate);
                            }, 300);
                        }}
                        maxDate={new Date()}
                        color="#FF6F00"
                    />
                </div>
            )}
        </div>
    );
}
