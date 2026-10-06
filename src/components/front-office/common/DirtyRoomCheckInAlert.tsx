'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type DirtyRoomCheckInAlertProps = Readonly<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
    roomLabel: string;
    onConfirm: () => void;
}>;

export function DirtyRoomCheckInAlert({
    open,
    onOpenChange,
    roomLabel,
    onConfirm,
}: DirtyRoomCheckInAlertProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Dirty room</AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <p>
                                Room <span className="font-medium text-foreground">{roomLabel}</span>{' '}
                                is marked <span className="font-medium text-foreground">DIRTY</span>{' '}
                                and is not ready for guest occupancy.
                            </p>
                            <p>
                                Only continue if you intentionally override housekeeping
                                status. Cancel returns you to the previous step without
                                checking in.
                            </p>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => onConfirm()}
                    >
                        Confirm check-in
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
