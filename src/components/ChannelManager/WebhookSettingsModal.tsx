'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { channelManagerService } from '../../services/channelManager';
import { toast } from 'react-hot-toast';

interface WebhookSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    hotelId: number;
}

const EVENT_TYPES = [
    { id: 'BOOKING_NEW', label: 'New Booking' },
    { id: 'BOOKING_CANCEL', label: 'Booking Cancelled' },
    { id: 'BOOKING_MODIFY', label: 'Booking Modified' },
    { id: 'BOOKING_NO_SHOW', label: 'No Show' },
    { id: 'AVAILABILITY_CHANGE', label: 'Availability Changed' },
    { id: 'RATE_CHANGE', label: 'Rate Changed' },
    { id: 'CHECK_IN', label: 'Guest Checked-In' },
    { id: 'CHECK_OUT', label: 'Guest Checked-Out' },
];

export default function WebhookSettingsModal({
    isOpen,
    onClose,
    hotelId,
}: WebhookSettingsModalProps) {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState({
        url: '',
        secret: '',
        verb: 'POST',
        isEnabled: false,
        events: [] as string[],
    });

    useEffect(() => {
        if (isOpen) {
            fetchConfig();
        }
    }, [isOpen]);

    const fetchConfig = async () => {
        try {
            setLoading(true);
            const data =
                await channelManagerService.getHotelWebhookConfig(hotelId);
            if (data) {
                setConfig({
                    url: data.url || '',
                    secret: data.secret || '',
                    verb: data.verb || 'POST',
                    isEnabled: data.isEnabled || false,
                    events: data.events || [],
                });
            }
        } catch (error: any) {
            console.error('Failed to fetch webhook config:', error);
            // Don't show toast for 404/empty config
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await channelManagerService.updateHotelWebhookConfig(
                hotelId,
                config,
            );
            toast.success('Webhook configuration saved successfully');
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'Failed to save configuration');
        } finally {
            setSaving(false);
        }
    };

    const toggleEvent = (eventId: string) => {
        setConfig((prev) => ({
            ...prev,
            events: prev.events.includes(eventId)
                ? prev.events.filter((id) => id !== eventId)
                : [...prev.events, eventId],
        }));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-width-[500px]">
                <DialogHeader>
                    <DialogTitle>Global Webhook Settings</DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orion-blue"></div>
                    </div>
                ) : (
                    <div className="space-y-6 py-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isEnabled"
                                checked={config.isEnabled}
                                onCheckedChange={(checked) =>
                                    setConfig((prev) => ({
                                        ...prev,
                                        isEnabled: checked as boolean,
                                    }))
                                }
                            />
                            <Label
                                htmlFor="isEnabled"
                                className="text-sm font-medium"
                            >
                                Enable Webhook Notifications
                            </Label>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="url">Webhook URL</Label>
                            <Input
                                id="url"
                                placeholder="Enter webhook URL"
                                value={config.url}
                                onChange={(e) =>
                                    setConfig((prev) => ({
                                        ...prev,
                                        url: e.target.value,
                                    }))
                                }
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="verb">HTTP Verb</Label>
                                <Select
                                    value={config.verb}
                                    onValueChange={(value) =>
                                        setConfig((prev) => ({
                                            ...prev,
                                            verb: value,
                                        }))
                                    }
                                >
                                    <SelectTrigger id="verb">
                                        <SelectValue placeholder="Select verb" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="POST">
                                            POST
                                        </SelectItem>
                                        <SelectItem value="PUT">PUT</SelectItem>
                                        <SelectItem value="PATCH">
                                            PATCH
                                        </SelectItem>
                                        <SelectItem value="GET">GET</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="secret">Webhook Secret</Label>
                                <Input
                                    id="secret"
                                    type="password"
                                    placeholder="Enter webhook signature secret"
                                    value={config.secret}
                                    onChange={(e) =>
                                        setConfig((prev) => ({
                                            ...prev,
                                            secret: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-base font-semibold">
                                Trigger Events
                            </Label>
                            <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                                {EVENT_TYPES.map((event) => (
                                    <div
                                        key={event.id}
                                        className="flex items-center space-x-2"
                                    >
                                        <Checkbox
                                            id={event.id}
                                            checked={config.events.includes(
                                                event.id,
                                            )}
                                            onCheckedChange={() =>
                                                toggleEvent(event.id)
                                            }
                                        />
                                        <Label
                                            htmlFor={event.id}
                                            className="text-sm font-normal cursor-pointer"
                                        >
                                            {event.label}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={saving}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving || !config.url}
                        className="bg-orion-blue"
                    >
                        {saving ? 'Saving...' : 'Save Configuration'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
