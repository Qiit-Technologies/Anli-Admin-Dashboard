'use client';

import { updateStockRequestItems } from '@/app/actions/inventory';
import { itemOrderRejectedIllustration } from '@/components/house-keeping/common/illustrations';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { mutate } from 'swr';

interface SRRejctionDialogProps {
    id: string;
    trigeer: React.ReactNode;
}

export const handleStatusUpdate = async (
    id: string,
    status: string,
    reason?: string,
    issuedQuantity?: number,
    issuingRemarks?: string,
    lines?: Array<{ id: number; issuedQuantity?: number; remove?: boolean }>,
    managerPin?: string,
) => {
    const match = String(id).match(/(\d+)$/);
    const cleanId = match ? match[1] : String(id).replace(/^#RED-/, '');
    try {
        const response = await updateStockRequestItems(
            cleanId,
            status.trim(),
            reason?.trim(),
            issuedQuantity,
            issuingRemarks,
            lines,
            managerPin,
        );
        if (response) {
            const ok =
                response.message ===
                    'Stock request items updated successfully!' ||
                response.message ===
                    'Stock request approved with manager PIN!';
            if (ok) {
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={response.message}
                        type="success"
                    />
                ));
                mutate('/items/pending');
                return true;
            }
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description={response.message}
                    type="error"
                />
            ));
            return false;
        }
        return false;
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.log(err.message);
        } else {
            console.log('An unexpected error occurred');
        }
        return false;
    }
};

function SRRejctionDialog({ trigeer, id }: SRRejctionDialogProps) {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState('');
    const defaultTrigger = <Button>Add New Stock Item</Button>;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigeer ?? defaultTrigger}</DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="sr-only">
                        Reject Stock Request
                    </DialogTitle>
                    {/* <DialogDescription> */}
                    <div className="flex items-center justify-center gap-4 w-full h-full flex-col">
                        <div>{itemOrderRejectedIllustration}</div>
                        <h1 className="text-2xl font-bold text-black">
                            You rejected this order
                        </h1>
                        <span className="text-muted-foreground text-sm">
                            Please give reasons for rejection
                        </span>
                        <Input
                            type="text"
                            placeholder="Reason for rejection"
                            className="mt-4 border w-80 focus-visible:border-brand focus-visible:ring-brand h-14"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                        <Button
                            size={'lg'}
                            className="bg-orion-blue w-40 mt-3 hover:bg-orion-blue p-4 text-white rounded-md"
                            onClick={() => {
                                handleStatusUpdate(id, 'REJECTED', reason);
                                setOpen(false);
                            }}
                        >
                            Done
                        </Button>
                    </div>
                    {/* </DialogDescription> */}
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}

export function SRRejectionModal({ id, trigeer }: SRRejctionDialogProps) {
    return <SRRejctionDialog id={id} trigeer={trigeer} />;
}
