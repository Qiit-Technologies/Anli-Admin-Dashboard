'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Settings,
    Clock,
    AlertTriangle,
    CheckCircle,
    Save,
    TestTube,
} from 'lucide-react';
import {
    channelManagerService,
    ChannelIntegration,
} from '@/services/channelManager';
import ChannelIcon from './ChannelIcon';

interface EditIntegrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (updatedIntegration: ChannelIntegration) => void;
    integration: ChannelIntegration | null;
}

export default function EditIntegrationModal({
    isOpen,
    onClose,
    onSuccess,
    integration,
}: EditIntegrationModalProps) {
    const [formData, setFormData] = useState({
        channelName: '',
        status: 'INACTIVE' as 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'ERROR',
        channelPropertyId: '',
        isWebhookEnabled: false,
        syncIntervalMinutes: 15,
        isRealTimeSync: false,
        testMode: false,
    });

    const [loading, setLoading] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<{
        success: boolean;
        message?: string;
        error?: string;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (integration) {
            setFormData({
                channelName: integration.channelName || '',
                status: integration.status,
                channelPropertyId: integration.channelPropertyId || '',
                isWebhookEnabled: integration.isWebhookEnabled || false,
                syncIntervalMinutes: integration.syncIntervalMinutes || 15,
                isRealTimeSync: integration.isRealTimeSync || false,
                testMode: integration.testMode || false,
            });
        }
        setError(null);
        setTestResult(null);
    }, [integration]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!integration) return;

        try {
            setLoading(true);
            setError(null);

            const updatedIntegration =
                await channelManagerService.updateIntegration(
                    integration.id,
                    formData,
                );

            onSuccess(updatedIntegration);
            onClose();
        } catch (error: any) {
            setError(error.message || 'Failed to update integration');
        } finally {
            setLoading(false);
        }
    };

    const handleTestConnection = async () => {
        if (!integration) return;

        try {
            setTesting(true);
            setTestResult(null);

            const result = await channelManagerService.testIntegration(
                integration.id,
            );
            setTestResult(result);
        } catch (error: any) {
            setTestResult({
                success: false,
                error: error.message || 'Connection test failed',
            });
        } finally {
            setTesting(false);
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
        setTestResult(null); // Clear test results when credentials change
    };

    if (!integration) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <div className="p-2 bg-orion-blue/20 rounded-lg">
                            <ChannelIcon
                                channelType={integration.channelType}
                                size="sm"
                                className="text-orion-blue"
                            />
                        </div>
                        Edit Integration Settings
                        <Badge className="bg-orion-blue/10 text-orion-blue border-orion-blue/20">
                            {integration.channelType.replace('_', ' ')}
                        </Badge>
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="border border-red-200 bg-red-50 p-4 rounded-lg flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <span className="text-red-800">{error}</span>
                        </div>
                    )}

                    {/* Basic Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Settings className="h-5 w-5" />
                                Basic Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="channelName">
                                        Channel Name
                                    </Label>
                                    <Input
                                        id="channelName"
                                        value={formData.channelName}
                                        onChange={(e) =>
                                            handleInputChange(
                                                'channelName',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Enter channel name"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value) =>
                                            handleInputChange('status', value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ACTIVE">
                                                Active
                                            </SelectItem>
                                            <SelectItem value="INACTIVE">
                                                Inactive
                                            </SelectItem>
                                            <SelectItem value="PENDING">
                                                Pending
                                            </SelectItem>
                                            <SelectItem value="ERROR">
                                                Error
                                            </SelectItem>
                                            <SelectItem value="TESTING">
                                                Testing
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="channelPropertyId">
                                    Property ID
                                </Label>
                                <Input
                                    id="channelPropertyId"
                                    value={formData.channelPropertyId}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'channelPropertyId',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Channel property identifier"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Connection Test */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <TestTube className="h-5 w-5" />
                                Connection Test
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleTestConnection}
                                    disabled={testing}
                                    className="flex items-center gap-2"
                                >
                                    <TestTube className="h-4 w-4" />
                                    {testing ? 'Testing...' : 'Test Connection'}
                                </Button>

                                {testResult && (
                                    <div
                                        className={`flex items-center gap-2 ${
                                            testResult.success
                                                ? 'text-green-600'
                                                : 'text-red-600'
                                        }`}
                                    >
                                        {testResult.success ? (
                                            <CheckCircle className="h-4 w-4" />
                                        ) : (
                                            <AlertTriangle className="h-4 w-4" />
                                        )}
                                        <span className="text-sm font-medium">
                                            {testResult.message ||
                                                testResult.error}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sync Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Clock className="h-5 w-5" />
                                Sync Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label
                                        htmlFor="isRealTimeSync"
                                        className="text-base"
                                    >
                                        Real-time Sync
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Sync data immediately when changes occur
                                    </p>
                                </div>
                                <Switch
                                    id="isRealTimeSync"
                                    checked={formData.isRealTimeSync}
                                    onCheckedChange={(checked) =>
                                        handleInputChange(
                                            'isRealTimeSync',
                                            checked,
                                        )
                                    }
                                />
                            </div>

                            {!formData.isRealTimeSync && (
                                <div>
                                    <Label htmlFor="syncIntervalMinutes">
                                        Sync Interval (minutes)
                                    </Label>
                                    <Select
                                        value={formData.syncIntervalMinutes.toString()}
                                        onValueChange={(value) =>
                                            handleInputChange(
                                                'syncIntervalMinutes',
                                                parseInt(value),
                                            )
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
                                            <SelectItem value="180">
                                                Every 3 hours
                                            </SelectItem>
                                            <SelectItem value="360">
                                                Every 6 hours
                                            </SelectItem>
                                            <SelectItem value="720">
                                                Every 12 hours
                                            </SelectItem>
                                            <SelectItem value="1440">
                                                Daily
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label
                                        htmlFor="testMode"
                                        className="text-base"
                                    >
                                        Test Mode
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Use sandbox/test environment
                                    </p>
                                </div>
                                <Switch
                                    id="testMode"
                                    checked={formData.testMode}
                                    onCheckedChange={(checked) =>
                                        handleInputChange('testMode', checked)
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Separator />

                    {/* Actions */}
                    <div className="flex justify-end space-x-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-orion-blue flex items-center gap-2"
                        >
                            <Save className="h-4 w-4" />
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
