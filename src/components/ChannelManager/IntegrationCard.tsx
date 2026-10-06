'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import ChannelIcon from './ChannelIcon';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    EllipsisVerticalIcon,
    PencilIcon,
    TrashIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    XCircleIcon,
    ClockIcon,
} from '@heroicons/react/24/outline';
import {
    channelManagerService,
    ChannelIntegration,
} from '../../services/channelManager';

interface IntegrationCardProps {
    integration: ChannelIntegration;
    onUpdate: (integration: ChannelIntegration) => void;
    onDelete: (integrationId: number) => void;
}

export default function IntegrationCard({
    integration,
    onUpdate,
    onDelete,
}: IntegrationCardProps) {
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [testing, setTesting] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [editData, setEditData] = useState({
        channelName: integration.channelName,
        isWebhookEnabled: integration.isWebhookEnabled,
        syncIntervalMinutes: integration.syncIntervalMinutes,
        isRealTimeSync: integration.isRealTimeSync,
        testMode: integration.testMode,
    });

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return <CheckCircleIcon className="w-4 h-4" />;
            case 'INACTIVE':
                return <XCircleIcon className="w-4 h-4" />;
            case 'PENDING':
                return <ClockIcon className="w-4 h-4" />;
            case 'ERROR':
                return <ExclamationTriangleIcon className="w-4 h-4" />;
            default:
                return <ClockIcon className="w-4 h-4" />;
        }
    };

    const handleTestConnection = async () => {
        try {
            setTesting(true);
            const result = await channelManagerService.testIntegration(
                integration.id,
            );
            if (result.success) {
                // Update integration status if test was successful
                onUpdate({ ...integration, status: 'ACTIVE' });
            }
        } catch (error: any) {
            console.error('Test failed:', error);
        } finally {
            setTesting(false);
        }
    };

    const handleManualSync = async () => {
        try {
            setSyncing(true);
            await channelManagerService.triggerManualSync(
                integration.id,
                'SYNC_AVAILABILITY',
            );
            // Refresh the integration data
            const updatedIntegration =
                await channelManagerService.getIntegration(integration.id);
            onUpdate(updatedIntegration);
        } catch (error: any) {
            console.error('Sync failed:', error);
        } finally {
            setSyncing(false);
        }
    };

    const handleUpdate = async () => {
        try {
            setLoading(true);
            const updatedIntegration =
                await channelManagerService.updateIntegration(
                    integration.id,
                    editData,
                );
            onUpdate(updatedIntegration);
            setShowEditModal(false);
        } catch (error: any) {
            console.error('Update failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            setLoading(true);
            await channelManagerService.deleteIntegration(integration.id);
            onDelete(integration.id);
            setShowDeleteModal(false);
        } catch (error: any) {
            console.error('Delete failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <>
            <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <ChannelIcon
                            channelType={integration.channelType}
                            size="lg"
                        />
                        <div>
                            <h4 className="font-semibold text-gray-900">
                                {integration.channelName}
                            </h4>
                            <p className="text-sm text-gray-600">
                                {integration.channelType.replace('_', ' ')} •
                                Property ID: {integration.channelPropertyId}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge
                            variant="outline"
                            className={`${
                                integration.status === 'ACTIVE'
                                    ? 'bg-green-100 text-green-800 border-green-200'
                                    : integration.status === 'INACTIVE'
                                      ? 'bg-gray-100 text-gray-800 border-gray-200'
                                      : integration.status === 'PENDING'
                                        ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                        : 'bg-red-100 text-red-800 border-red-200'
                            }`}
                        >
                            {getStatusIcon(integration.status)}
                            <span className="ml-1">{integration.status}</span>
                        </Badge>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <EllipsisVerticalIcon className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem
                                    onClick={() => setShowEditModal(true)}
                                >
                                    <PencilIcon className="w-4 h-4 mr-2" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={handleTestConnection}
                                    disabled={testing}
                                >
                                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                                    {testing ? 'Testing...' : 'Test Connection'}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={handleManualSync}
                                    disabled={syncing}
                                >
                                    <ArrowPathIcon className="w-4 h-4 mr-2" />
                                    {syncing ? 'Syncing...' : 'Manual Sync'}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setShowDeleteModal(true)}
                                    className="text-red-600"
                                >
                                    <TrashIcon className="w-4 h-4 mr-2" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">
                                    Sync Mode:
                                </span>
                                <span className="font-medium">
                                    {integration.isRealTimeSync
                                        ? 'Real-time'
                                        : `${integration.syncIntervalMinutes}min intervals`}
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Webhooks:</span>
                                <Badge
                                    variant="outline"
                                    className={`${
                                        integration.isWebhookEnabled
                                            ? 'bg-green-100 text-green-800 border-green-200'
                                            : 'bg-gray-100 text-gray-800 border-gray-200'
                                    }`}
                                >
                                    {integration.isWebhookEnabled
                                        ? 'Enabled'
                                        : 'Disabled'}
                                </Badge>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">
                                    Test Mode:
                                </span>
                                <Badge
                                    variant="outline"
                                    className={`${
                                        integration.testMode
                                            ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                            : 'bg-gray-100 text-gray-800 border-gray-200'
                                    }`}
                                >
                                    {integration.testMode
                                        ? 'Active'
                                        : 'Production'}
                                </Badge>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">
                                    Last Sync:
                                </span>
                                <span className="font-medium">
                                    {integration.lastSyncAt
                                        ? formatDate(integration.lastSyncAt)
                                        : 'Never'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">
                                    Last Success:
                                </span>
                                <span className="font-medium">
                                    {integration.lastSuccessfulSync
                                        ? formatDate(
                                              integration.lastSuccessfulSync,
                                          )
                                        : 'Never'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Created:</span>
                                <span className="font-medium">
                                    {formatDate(integration.createdAt)}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Edit Modal */}
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Integration</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Integration Name
                            </label>
                            <Input
                                value={editData.channelName}
                                onChange={(e) =>
                                    setEditData((prev) => ({
                                        ...prev,
                                        channelName: e.target.value,
                                    }))
                                }
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    Real-time Sync
                                </label>
                                <p className="text-xs text-gray-500">
                                    Sync changes immediately
                                </p>
                            </div>
                            <Switch
                                checked={editData.isRealTimeSync}
                                onCheckedChange={(value) =>
                                    setEditData((prev) => ({
                                        ...prev,
                                        isRealTimeSync: value,
                                    }))
                                }
                            />
                        </div>

                        {!editData.isRealTimeSync && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Sync Interval (minutes)
                                </label>
                                <Input
                                    type="number"
                                    min={1}
                                    max={1440}
                                    value={editData.syncIntervalMinutes}
                                    onChange={(e) =>
                                        setEditData((prev) => ({
                                            ...prev,
                                            syncIntervalMinutes: parseInt(
                                                e.target.value,
                                            ),
                                        }))
                                    }
                                />
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    Webhook Support
                                </label>
                                <p className="text-xs text-gray-500">
                                    Receive real-time updates
                                </p>
                            </div>
                            <Switch
                                checked={editData.isWebhookEnabled}
                                onCheckedChange={(value) =>
                                    setEditData((prev) => ({
                                        ...prev,
                                        isWebhookEnabled: value,
                                    }))
                                }
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    Test Mode
                                </label>
                                <p className="text-xs text-gray-500">
                                    Use test credentials
                                </p>
                            </div>
                            <Switch
                                checked={editData.testMode}
                                onCheckedChange={(value) =>
                                    setEditData((prev) => ({
                                        ...prev,
                                        testMode: value,
                                    }))
                                }
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowEditModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdate}
                            disabled={loading}
                            className="bg-orion-blue hover:bg-orion-blue/90"
                        >
                            {loading ? 'Updating...' : 'Update'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Integration</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        Are you sure you want to delete the &quot;
                        {integration.channelName}&quot; integration? This action
                        cannot be undone.
                    </DialogDescription>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={loading}
                        >
                            {loading ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
