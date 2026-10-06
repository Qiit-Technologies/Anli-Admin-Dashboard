'use client';

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ChevronDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';

interface SubMenuItem {
    label: string;
    href?: string;
    icon?: string;
    description?: string;
}

interface MenuItem {
    label: string;
    submenu: SubMenuItem[];
}

export function HoverPopover({ item }: { item: MenuItem }) {
    const [open, setOpen] = React.useState(false);
    const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setOpen(false);
        }, 200);
    };

    return (
        <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button className="flex items-center gap-1 focus-visible:outline-none focus-visible:ring-0 hover:text-gray-800 text-gray-500 transition-colors duration-200">
                        <span className="text-base font-medium">
                            {item.label}
                        </span>
                        <ChevronDown
                            className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                        />
                    </button>
                </PopoverTrigger>
                <PopoverContent
                    align="start"
                    className="w-fit ring-1 ring-hexbrand p-0 shadow-lg border border-gray-100 rounded-lg animate-in fade-in-50 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
                    sideOffset={8}
                >
                    <div className="grid gap-1 p-2">
                        {item.submenu.map((subitem, subindex) => {
                            return (
                                <Link
                                    href={subitem.href || '#'}
                                    key={subindex}
                                    className="flex items-start justify-start gap-3 rounded-md p-2 hover:bg-hexbrand/10 text-gray-700 transition-colors duration-150"
                                >
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white">
                                        <Image
                                            src={
                                                subitem.icon ??
                                                '/landing/cleaner-broom.svg'
                                            }
                                            alt={subitem.label}
                                            height={24}
                                            width={24}
                                            priority
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-base font-medium">
                                            {subitem.label}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            {subitem.description}
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}
