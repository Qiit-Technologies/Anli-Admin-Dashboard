'use client';

import BrandButton from '@/components/common/Button';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

export function GroupDeletePanel({
    groupName,
    onClose,
    onConfirm,
}: {
    groupName: string;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
}) {
    const [loading, setLoading] = useState(false);

    return (
        <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
                Permanently remove {groupName} and every guest booking under
                it. Only possible once nobody is still in-house. This cannot be
                undone.
            </p>
            <BrandButton
                fullWidth
                className="h-10 rounded-md bg-red-600 text-sm font-semibold shadow-none hover:bg-red-700"
                disabled={loading}
                onClick={async () => {
                    setLoading(true);
                    try {
                        await onConfirm();
                    } finally {
                        setLoading(false);
                    }
                }}
            >
                {loading ? 'Deleting…' : 'Delete group'}
            </BrandButton>
            <Button
                variant="outline"
                className="h-10 w-full rounded-md border-orion-blue text-sm font-semibold text-orion-blue shadow-none hover:bg-orion-blue/5"
                onClick={onClose}
            >
                Cancel
            </Button>
        </div>
    );
}

export function GroupVoidPanel({
    onClose,
    onConfirm,
}: {
    onClose: () => void;
    onConfirm: (voidReason: string) => void | Promise<void>;
}) {
    const [voidReason, setVoidReason] = useState('');
    const [loading, setLoading] = useState(false);
    const canSubmit = voidReason.trim().length >= 2;

    return (
        <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
                Void every guest reservation in this group using the same void
                flow as individual bookings (including approval when required).
                The group leaves the reservations list but stays on reports.
            </p>
            <div>
                <Label htmlFor="groupVoidReason" className="text-sm">
                    Void reason
                </Label>
                <Textarea
                    id="groupVoidReason"
                    value={voidReason}
                    onChange={(e) => setVoidReason(e.target.value)}
                    className="mt-1.5 min-h-[88px] resize-none text-sm"
                    placeholder="Why is this group being voided?"
                />
            </div>
            <BrandButton
                fullWidth
                className="h-10 rounded-md text-sm font-semibold shadow-none"
                disabled={loading || !canSubmit}
                onClick={async () => {
                    if (!canSubmit) return;
                    setLoading(true);
                    try {
                        await onConfirm(voidReason.trim());
                    } finally {
                        setLoading(false);
                    }
                }}
            >
                {loading ? 'Submitting…' : 'Void group'}
            </BrandButton>
            <Button
                variant="outline"
                className="h-10 w-full rounded-md border-orion-blue text-sm font-semibold text-orion-blue shadow-none hover:bg-orion-blue/5"
                onClick={onClose}
            >
                Cancel
            </Button>
        </div>
    );
}
