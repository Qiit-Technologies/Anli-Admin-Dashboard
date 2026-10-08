import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalendarCheck, Gift, Percent, Ticket, Users } from 'lucide-react';
import { FormDataType } from './types';

/**
 * Group stays in this modal but swaps to the group wizard. It is not a flag
 * the regular guest step form can carry.
 */
export type ReservationTypeChoice =
    | 'REGULAR'
    | 'COMPLIMENTARY'
    | 'DISCOUNT'
    | 'GROUP';

interface ReservationTypeSelectorProps {
    isAdmin: boolean;
    setReservationType: (type: ReservationTypeChoice) => void;
    setFormFlags: (flags: Partial<FormDataType>) => void;
}

export function ReservationTypeSelector({
    isAdmin,
    setReservationType,
    setFormFlags,
}: ReservationTypeSelectorProps) {
    return (
        <div
            className={cn(
                'p-6 space-y-6 mx-auto',
                isAdmin ? 'max-w-xl' : 'max-w-md',
            )}
        >
            <h2 className="text-xl font-semibold flex items-center gap-2">
                <CalendarCheck className="w-5 h-5" />
                Reservation Type
            </h2>
            <div className="grid grid-cols-2 gap-4">
                <Button
                    variant="outline"
                    className="flex flex-col items-center justify-center h-24 gap-2"
                    onClick={() => {
                        setReservationType('REGULAR');
                        setFormFlags({});
                    }}
                >
                    <Ticket className="w-6 h-6" />
                    <span>Regular</span>
                </Button>

                <Button
                    variant="outline"
                    className="flex flex-col items-center justify-center h-24 gap-2"
                    onClick={() => {
                        setReservationType('COMPLIMENTARY');
                        setFormFlags({ isComplimentary: true });
                    }}
                >
                    <Gift className="w-6 h-6" />
                    <span>Complimentary</span>
                </Button>

                <Button
                    variant="outline"
                    className="flex flex-col items-center justify-center h-24 gap-2"
                    onClick={() => {
                        setReservationType('DISCOUNT');
                        setFormFlags({ discountType: 'PERCENTAGE' });
                    }}
                >
                    <Percent className="w-6 h-6" />
                    <span>Discount</span>
                </Button>

                <Button
                    variant="outline"
                    className="flex flex-col items-center justify-center h-24 gap-2"
                    onClick={() => setReservationType('GROUP')}
                >
                    <Users className="w-6 h-6" />
                    <span>Group</span>
                </Button>
            </div>
        </div>
    );
}
