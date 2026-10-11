'use client';

import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { createSupportTicket } from '@/app/actions/super-admin-support';
import { useBusinessDirectory } from '../hq/useHqData';

const CATEGORY_OPTIONS = [
    { value: 'technical', label: 'Technical' },
    { value: 'billing', label: 'Billing' },
    { value: 'feature_request', label: 'Feature request' },
    { value: 'account', label: 'Account' },
    { value: 'other', label: 'Other' },
];

const PRIORITY_OPTIONS = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
];

export function NewTicketDialog({
    open,
    onOpenChange,
    onCreated,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreated: () => void;
}) {
    const directory = useBusinessDirectory();
    const hotels = useMemo(
        () =>
            (directory.data ?? [])
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name)),
        [directory.data],
    );

    const [subject, setSubject] = useState('');
    const [category, setCategory] = useState('technical');
    const [priority, setPriority] = useState('medium');
    const [hotelId, setHotelId] = useState('');
    const [message, setMessage] = useState('');
    const [saving, setSaving] = useState(false);

    const reset = () => {
        setSubject('');
        setCategory('technical');
        setPriority('medium');
        setHotelId('');
        setMessage('');
    };

    const close = () => {
        if (saving) return;
        reset();
        onOpenChange(false);
    };

    const submit = async () => {
        if (subject.trim().length < 5) {
            toast.error('Subject must be at least 5 characters');
            return;
        }
        if (!hotelId) {
            toast.error('Select the business this ticket is about');
            return;
        }
        if (message.trim().length < 10) {
            toast.error('Message must be at least 10 characters');
            return;
        }
        setSaving(true);
        try {
            const ticket = await createSupportTicket({
                subject: subject.trim(),
                category,
                priority,
                hotelId: Number(hotelId),
                description: message.trim(),
            });
            toast.success(
                `Ticket ${ticket.ticketNumber || ''} created`.trim(),
            );
            reset();
            onOpenChange(false);
            onCreated();
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Failed to create ticket',
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && close()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>New support ticket</DialogTitle>
                    <DialogDescription>
                        Log a ticket on behalf of a business. The support
                        team is notified by email.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label htmlFor="ticket-subject">Subject</Label>
                        <Input
                            id="ticket-subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="e.g. Guests can't check in on the front desk"
                            disabled={saving}
                        />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="ticket-category">Category</Label>
                            <Select
                                value={category}
                                onValueChange={setCategory}
                                disabled={saving}
                            >
                                <SelectTrigger id="ticket-category">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORY_OPTIONS.map((o) => (
                                        <SelectItem
                                            key={o.value}
                                            value={o.value}
                                        >
                                            {o.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="ticket-priority">Priority</Label>
                            <Select
                                value={priority}
                                onValueChange={setPriority}
                                disabled={saving}
                            >
                                <SelectTrigger id="ticket-priority">
                                    <SelectValue placeholder="Priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    {PRIORITY_OPTIONS.map((o) => (
                                        <SelectItem
                                            key={o.value}
                                            value={o.value}
                                        >
                                            {o.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="ticket-business">Business</Label>
                        <Select
                            value={hotelId}
                            onValueChange={setHotelId}
                            disabled={saving || directory.isLoading}
                        >
                            <SelectTrigger id="ticket-business">
                                <SelectValue
                                    placeholder={
                                        directory.isLoading
                                            ? 'Loading businesses…'
                                            : 'Select a business…'
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {hotels.map((h) => (
                                    <SelectItem
                                        key={h.id}
                                        value={String(h.id)}
                                    >
                                        {h.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="ticket-message">Message</Label>
                        <Textarea
                            id="ticket-message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Describe the issue with enough detail for the support team to act…"
                            rows={5}
                            disabled={saving}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={close}
                        disabled={saving}
                    >
                        Cancel
                    </Button>
                    <Button onClick={submit} disabled={saving}>
                        {saving && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Create ticket
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
