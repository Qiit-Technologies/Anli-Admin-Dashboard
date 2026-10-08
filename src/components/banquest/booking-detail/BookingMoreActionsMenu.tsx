'use client';

import BookingActionsMenu from '@/components/banquest/tables/BookingActionsMenu';
import { BookingForm } from '@/components/banquest/types';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

export default function BookingMoreActionsMenu({
    booking,
}: {
    booking: BookingForm;
}) {
    return (
        <div className="flex flex-col items-start gap-1">
            <span className="text-xs text-muted-foreground">Actions</span>
            <BookingActionsMenu
                booking={booking}
                trigger={
                    <Button
                        type="button"
                        variant="outline"
                        className="gap-2"
                    >
                        More Action
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                }
            />
        </div>
    );
}
