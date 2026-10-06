'use client';

import BrandButton from '@/components/common/Button';
import { cn } from '@/lib/utils';
import { groupEmptyShellClass } from './constants';

export function GroupReservationEmptyState({
    onCreate,
}: {
    onCreate: () => void;
}) {
    return (
        <div className="flex flex-1 items-center justify-center py-10">
            <div
                className={cn(
                    groupEmptyShellClass,
                    'max-w-[33rem] px-[4.25rem] py-10',
                )}
            >
                <img
                    src="/ge.png"
                    alt=""
                    aria-hidden
                    className="size-[12.5rem] object-contain"
                />
                <h2 className="mt-6 text-xl font-semibold tracking-tight text-foreground">
                    Group Bookings
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    You currently don&apos;t have any bookings please create one
                </p>
                <BrandButton
                    onClick={onCreate}
                    fullWidth
                    className="mt-8 h-12 rounded-lg text-[15px] font-semibold shadow-none"
                >
                    Create Bookings
                </BrandButton>
            </div>
        </div>
    );
}
