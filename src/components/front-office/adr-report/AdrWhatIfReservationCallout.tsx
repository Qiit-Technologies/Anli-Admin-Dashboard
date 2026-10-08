'use client';

import AdrWhatIfPanel from '@/components/front-office/adr-report/AdrWhatIfPanel';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { LineChart } from 'lucide-react';

type AdrWhatIfReservationCalloutProps = {
    /** First night of stay, YYYY-MM-DD */
    stayDateYmd: string;
    /** Nightly room rate before discount (from room / plan). */
    nightlyRoomRate: number;
};

export default function AdrWhatIfReservationCallout({
    stayDateYmd,
    nightlyRoomRate,
}: Readonly<AdrWhatIfReservationCalloutProps>) {
    return (
        <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-slate-900">
                        Check ADR before you discount
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                        Opens the same what-if calculator as the ADR page, with
                        this stay’s first night and nightly rate prefilled.
                    </p>
                </div>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="shrink-0 gap-2"
                        >
                            <LineChart className="h-4 w-4" />
                            ADR impact
                        </Button>
                    </SheetTrigger>
                    <SheetContent
                        side="right"
                        className="w-full sm:max-w-md overflow-y-auto"
                    >
                        <SheetHeader>
                            <SheetTitle>Rate vs ADR (what-if)</SheetTitle>
                        </SheetHeader>
                        <div className="mt-4 pr-1">
                            <AdrWhatIfPanel
                                variant="embedded"
                                initialDate={stayDateYmd}
                                initialRatePerNight={
                                    nightlyRoomRate > 0
                                        ? nightlyRoomRate
                                        : undefined
                                }
                                initialAdditionalNights={1}
                            />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    );
}
