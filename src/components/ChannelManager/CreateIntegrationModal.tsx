'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import useHotel from '../../hooks/useHotel';
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from '../ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '../ui/dialog';
import { Switch } from '../ui/switch';
import {
    channelManagerService,
    CreateChannelIntegrationDto,
} from '../../services/channelManager';
import ChannelIcon from './ChannelIcon';

interface CreateIntegrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (integration: any) => void;
    hotelId: number;
}

const CHANNEL_TYPES = [
    {
        key: 'BOOKING_COM',
        label: 'Booking.com',
        description: 'Global hotel booking platform',
    },
    {
        key: 'EXPEDIA',
        label: 'Expedia',
        description: 'Travel booking and hotel reservations',
    },
    {
        key: 'AIRBNB',
        label: 'Airbnb',
        description: 'Vacation rentals and unique stays',
    },
    {
        key: 'HOTELS_COM',
        label: 'Hotels.com',
        description: 'Hotel booking and deals',
    },
    {
        key: 'TRIPADVISOR',
        label: 'TripAdvisor',
        description: 'Travel reviews and bookings',
    },
    { key: 'AGODA', label: 'Agoda', description: 'Asia-focused hotel booking' },
    {
        key: 'WAKANOW',
        label: 'Wakanow',
        description: 'African travel booking platform',
    },
    {
        key: 'CUSTOM',
        label: 'Custom',
        description: 'Custom integration or API',
    },
];

export default function CreateIntegrationModal({
    isOpen,
    onClose,
    onSuccess,
    hotelId,
}: CreateIntegrationModalProps) {
    const { organization: hotel } = useHotel();
    const [formData, setFormData] = useState<CreateChannelIntegrationDto>({
        hotelId,
        channelType: undefined,
        channelName: '',
        channelPropertyId: '',
        isWebhookEnabled: false,
        syncIntervalMinutes: 15,
        isRealTimeSync: true,
        testMode: false,
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [selectedChannel, setSelectedChannel] = useState<
        (typeof CHANNEL_TYPES)[0] | null
    >(null);

    useEffect(() => {
        if (isOpen) {
            setFormData({
                hotelId,
                channelType: undefined,
                channelName: '',
                channelPropertyId: '',
                isWebhookEnabled: false,
                syncIntervalMinutes: 15,
                isRealTimeSync: true,
                testMode: false,
            });
            setErrors({});
        }
    }, [isOpen, hotelId]);

    const handleInputChange = (
        field: keyof CreateChannelIntegrationDto,
        value: any,
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.channelType) {
            newErrors.channelType = 'Channel type is required';
        }

        if (!formData.channelName?.trim()) {
            newErrors.channelName =
                'Integration name is required - please select a channel type first';
        }

        // Property ID is optional - Anli will auto-generate if not provided

        if (
            formData.syncIntervalMinutes < 1 ||
            formData.syncIntervalMinutes > 1440
        ) {
            newErrors.syncIntervalMinutes =
                'Sync interval must be between 1 and 1440 minutes';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            const integration =
                await channelManagerService.createIntegration(formData);
            onSuccess(integration);
        } catch (error: any) {
            console.error('Failed to create integration:', error);
            setErrors({
                submit: error.message || 'Failed to create integration',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChannelTypeChange = (value: string) => {
        const channel = CHANNEL_TYPES.find((c) => c.key === value);
        if (channel) {
            setSelectedChannel(channel);
            handleInputChange('channelType', value as any);

            // Auto-generate Property ID as HotelName_OTAName
            const hotelName = hotel?.name || 'Hotel';
            const otaName = channel.label.replace(/\s+/g, ''); // Remove spaces
            const propertyId = `${hotelName}_${otaName}`;

            handleInputChange('channelPropertyId', propertyId);
            handleInputChange('channelName', propertyId);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">
                            {selectedChannel ? (
                                <ChannelIcon
                                    channelType={selectedChannel.key}
                                    size="lg"
                                />
                            ) : (
                                <ChannelIcon channelType="CUSTOM" size="lg" />
                            )}
                        </span>
                        <div>
                            <DialogTitle className="text-xl font-semibold">
                                Create New Integration
                            </DialogTitle>
                            <DialogDescription className="text-sm text-gray-600 mt-1">
                                {selectedChannel
                                    ? `Connect your hotel to ${selectedChannel.label} - Integration will be named: ${formData.channelName}`
                                    : 'Select a channel type to get started'}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6 flex-1 overflow-y-auto px-1">
                    {/* Channel Type Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-700">
                            Channel Type *
                        </label>
                        <div className="text-xs text-gray-500 mb-2">
                            Available channels: {CHANNEL_TYPES.length} options
                        </div>
                        <Select
                            value={formData.channelType}
                            onValueChange={(value) =>
                                handleChannelTypeChange(value)
                            }
                        >
                            <SelectTrigger className="w-full h-12">
                                <SelectValue placeholder="Select a channel type" />
                            </SelectTrigger>
                            <SelectContent>
                                {CHANNEL_TYPES.map((channel) => (
                                    <SelectItem
                                        key={channel.key}
                                        value={channel.key}
                                    >
                                        <div className="flex items-center gap-3 py-1">
                                            <ChannelIcon
                                                channelType={channel.key}
                                                size="md"
                                            />
                                            <div>
                                                <div className="font-medium">
                                                    {channel.label}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {channel.description}
                                                </div>
                                            </div>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="text-xs text-gray-500">
                            {formData.channelType
                                ? `Selected: ${formData.channelType}`
                                : 'Please select a channel type'}
                        </div>
                        {errors.channelType && (
                            <p className="text-sm text-red-600 mt-1">
                                {errors.channelType}
                            </p>
                        )}
                    </div>

                    {/* Channel Name */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-700">
                            Integration Name *
                        </label>
                        <Input
                            placeholder="Will be auto-generated as HotelName_OTAName"
                            value={formData.channelName}
                            onChange={(e) =>
                                handleInputChange('channelName', e.target.value)
                            }
                            className="h-12 bg-gray-50"
                            readOnly
                        />
                        <p className="text-xs text-gray-500">
                            Integration name is automatically generated as
                            HotelName_OTAName format
                        </p>
                        {errors.channelName && (
                            <p className="text-sm text-red-600 mt-1">
                                {errors.channelName}
                            </p>
                        )}
                    </div>

                    {/* Auto-Setup Information */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Automatic Setup
                        </label>
                        <div className="p-4 bg-orion-blue/10 border border-orion-blue/20 rounded-lg">
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-orion-blue/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-orion-blue text-sm font-bold">
                                        ✓
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-orion-blue">
                                        Anli will automatically set up
                                        everything using your existing Anli
                                        data:
                                    </p>
                                    <ul className="text-xs text-orion-blue/80 space-y-1">
                                        <li>• Room types and configurations</li>
                                        <li>• Inventory and availability</li>
                                        <li>• Rates and pricing</li>
                                        <li>• Real-time sync with OTAs</li>
                                    </ul>
                                    <p className="text-xs text-orion-blue font-medium">
                                        No manual configuration needed - just
                                        select your channels! Anli handles
                                        everything.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Property ID Info */}
                    <div className="space-y-2">
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <p className="text-xs text-gray-600">
                                <strong>Property ID:</strong> Will be
                                automatically generated as{' '}
                                <code className="bg-gray-200 px-1 rounded">
                                    HotelName_OTAName
                                </code>{' '}
                                format
                            </p>
                        </div>
                    </div>

                    {/* Sync Settings */}
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-gray-700">
                            Sync Settings
                        </h4>

                        <div className="flex items-center justify-between py-2">
                            <div>
                                <label className="text-sm text-gray-700">
                                    Real-time Sync
                                </label>
                                <p className="text-xs text-gray-500">
                                    Sync changes immediately
                                </p>
                            </div>
                            <Switch
                                checked={formData.isRealTimeSync}
                                onCheckedChange={(value) =>
                                    handleInputChange('isRealTimeSync', value)
                                }
                            />
                        </div>

                        {!formData.isRealTimeSync && (
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-gray-700">
                                    Sync Interval (minutes)
                                </label>
                                <Input
                                    type="number"
                                    min={1}
                                    max={1440}
                                    placeholder="15"
                                    value={formData.syncIntervalMinutes}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'syncIntervalMinutes',
                                            parseInt(e.target.value),
                                        )
                                    }
                                    className="h-12"
                                />
                                {errors.syncIntervalMinutes && (
                                    <p className="text-sm text-red-600 mt-1">
                                        {errors.syncIntervalMinutes}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm text-gray-700">
                                    Webhook Support
                                </label>
                                <p className="text-xs text-gray-500">
                                    Receive real-time updates
                                </p>
                            </div>
                            <Switch
                                checked={formData.isWebhookEnabled}
                                onCheckedChange={(value) =>
                                    handleInputChange('isWebhookEnabled', value)
                                }
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm text-gray-700">
                                    Test Mode
                                </label>
                                <p className="text-xs text-gray-500">
                                    Use test credentials first
                                </p>
                            </div>
                            <Switch
                                checked={formData.testMode}
                                onCheckedChange={(value) =>
                                    handleInputChange('testMode', value)
                                }
                            />
                        </div>
                    </div>

                    {/* Error Display */}
                    {errors.submit && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-600">
                                {errors.submit}
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="min-w-[140px] bg-orion-blue hover:bg-orion-blue/90"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Creating...
                            </div>
                        ) : (
                            'Create Integration'
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
