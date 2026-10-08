'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle,
    AlertCircle,
    MapPin,
} from 'lucide-react';
import {
    channelManagerService,
    ChannelIntegration,
} from '@/services/channelManager';

interface OTAConnectionWizardProps {
    hotelId: number;
    onClose: () => void;
    onSuccess: (integration: ChannelIntegration) => void;
}

const steps = [
    {
        id: 1,
        title: 'Select OTA',
        description: 'Choose which OTA you want to connect',
    },
    {
        id: 2,
        title: 'Authentication',
        description: 'Connect your OTA account securely',
    },
    {
        id: 3,
        title: 'Room Mapping',
        description: 'Map your rooms to OTA room types',
    },
    { id: 4, title: 'Rate Plans', description: 'Configure your rate plans' },
    { id: 5, title: 'Sync Rules', description: 'Set up automatic sync rules' },
    {
        id: 6,
        title: 'Test & Confirm',
        description: 'Test the connection and finalize',
    },
];

export const OTAConnectionWizard: React.FC<OTAConnectionWizardProps> = ({
    hotelId,
    onClose,
    onSuccess,
}) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [availableOTAs, setAvailableOTAs] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        channelType: '',
        channelName: '',
        apiKey: '',
        apiSecret: '',
        channelPropertyId: '',
        isWebhookEnabled: false,
        syncIntervalMinutes: 15,
        isRealTimeSync: false,
        testMode: true,
    });

    useEffect(() => {
        loadAvailableOTAs();
    }, []);

    const loadAvailableOTAs = async () => {
        try {
            const otas =
                await channelManagerService.getAvailableIntegrationTypes(
                    hotelId,
                );
            setAvailableOTAs(otas);
        } catch (err) {
            setError('Failed to load available OTAs');
        }
    };

    const handleNext = () => {
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError(null);

            const integration = await channelManagerService.createIntegration({
                ...formData,
                hotelId,
                channelType: formData.channelType as any,
            });

            onSuccess(integration);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to create integration',
            );
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div>
                            <Label className="text-base font-medium">
                                Select OTA Platform
                            </Label>
                            <p className="text-sm text-gray-600 mt-1">
                                Choose which online travel agency you want to
                                connect with
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {availableOTAs.map((ota) => (
                                <Card
                                    key={ota}
                                    className={`cursor-pointer transition-all hover:shadow-md ${
                                        formData.channelType === ota
                                            ? 'ring-2 ring-blue-500 bg-blue-50'
                                            : ''
                                    }`}
                                    onClick={() =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            channelType: ota,
                                        }))
                                    }
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <MapPin className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium">
                                                    {ota.replace('_', ' ')}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    Connect to{' '}
                                                    {ota.replace('_', ' ')}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <div>
                            <Label className="text-base font-medium">
                                Integration Name
                            </Label>
                            <p className="text-sm text-gray-600 mt-1">
                                Give this integration a memorable name for easy
                                identification
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="channelName">
                                    Display Name
                                </Label>
                                <Input
                                    id="channelName"
                                    placeholder="e.g., Main Booking.com Connection"
                                    value={formData.channelName}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            channelName: e.target.value,
                                        }))
                                    }
                                />
                            </div>

                            <div>
                                <Label htmlFor="syncInterval">
                                    Sync Interval
                                </Label>
                                <Select
                                    value={formData.syncIntervalMinutes.toString()}
                                    onValueChange={(value) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            syncIntervalMinutes:
                                                parseInt(value),
                                        }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="5">
                                            Every 5 minutes
                                        </SelectItem>
                                        <SelectItem value="15">
                                            Every 15 minutes
                                        </SelectItem>
                                        <SelectItem value="30">
                                            Every 30 minutes
                                        </SelectItem>
                                        <SelectItem value="60">
                                            Every hour
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-medium">
                                Room Type Mapping
                            </h3>
                            <p className="text-sm text-gray-600">
                                Map your hotel rooms to the OTA room categories
                            </p>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium mb-2">
                                Sample Room Types
                            </h4>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between p-2 bg-white rounded">
                                    <span>Standard Room</span>
                                    <Badge variant="outline">Mapped</Badge>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-white rounded">
                                    <span>Deluxe Room</span>
                                    <Badge variant="outline">Mapped</Badge>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-white rounded">
                                    <span>Suite</span>
                                    <Badge variant="outline">Mapped</Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-medium">
                                Rate Plan Configuration
                            </h3>
                            <p className="text-sm text-gray-600">
                                Set up your rate plans and pricing structure
                            </p>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium mb-2">
                                Default Rate Plans
                            </h4>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between p-2 bg-white rounded">
                                    <span>Standard Rate</span>
                                    <span className="text-green-600 font-medium">
                                        $100/night
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-white rounded">
                                    <span>Weekend Rate</span>
                                    <span className="text-green-600 font-medium">
                                        $120/night
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 5:
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-medium">
                                Sync Rules & Automation
                            </h3>
                            <p className="text-sm text-gray-600">
                                Configure how and when data should be
                                synchronized
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <h4 className="font-medium">
                                        Auto-sync Availability
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        Automatically update room availability
                                    </p>
                                </div>
                                <Switch
                                    defaultChecked
                                    onCheckedChange={() => {}}
                                />
                            </div>

                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <h4 className="font-medium">
                                        Auto-sync Rates
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        Automatically update pricing
                                    </p>
                                </div>
                                <Switch
                                    defaultChecked
                                    onCheckedChange={() => {}}
                                />
                            </div>
                        </div>
                    </div>
                );

            case 6:
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                            <h3 className="text-lg font-medium">
                                Ready to Connect!
                            </h3>
                            <p className="text-sm text-gray-600">
                                Review your settings and test the connection
                            </p>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-blue-900 mb-2">
                                What happens next?
                            </h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>
                                    • Your OTA account will be connected
                                    securely
                                </li>
                                <li>
                                    • Room types and rate plans will be mapped
                                    automatically
                                </li>
                                <li>
                                    • Initial sync will begin to establish the
                                    connection
                                </li>
                                <li>
                                    • You will receive notifications about sync
                                    status
                                </li>
                            </ul>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h2 className="text-2xl font-bold">Connect New OTA</h2>
                        <p className="text-gray-600">
                            Step {currentStep} of {steps.length}
                        </p>
                    </div>
                    <Button variant="ghost" onClick={onClose}>
                        ✕
                    </Button>
                </div>

                {/* Progress Steps */}
                <div className="px-6 py-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <React.Fragment key={step.id}>
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                            step.id === currentStep
                                                ? 'bg-blue-600 text-white'
                                                : step.id < currentStep
                                                  ? 'bg-green-600 text-white'
                                                  : 'bg-gray-300 text-gray-600'
                                        }`}
                                    >
                                        {step.id < currentStep ? (
                                            <CheckCircle className="h-4 w-4" />
                                        ) : (
                                            step.id
                                        )}
                                    </div>
                                    <span className="text-xs mt-1 text-center max-w-20">
                                        {step.title}
                                    </span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div
                                        className={`flex-1 h-0.5 ${
                                            step.id < currentStep
                                                ? 'bg-green-600'
                                                : 'bg-gray-300'
                                        }`}
                                    />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Step Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {renderStepContent()}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t bg-gray-50">
                    <Button
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={currentStep === 1}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Previous
                    </Button>

                    <div className="flex space-x-3">
                        {currentStep < steps.length ? (
                            <Button
                                onClick={handleNext}
                                disabled={!formData.channelType}
                            >
                                Next
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        ) : (
                            <Button onClick={handleSubmit} disabled={loading}>
                                {loading ? 'Creating...' : 'Create Integration'}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="px-6 pb-6">
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center space-x-2">
                                <AlertCircle className="h-4 w-4 text-red-600" />
                                <span className="text-sm text-red-800">
                                    {error}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
