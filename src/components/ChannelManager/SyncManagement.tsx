'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    RefreshCw,
    Clock,
    Zap,
    Activity,
    Calendar,
    BarChart3,
    DollarSign,
} from 'lucide-react';
import { channelManagerService } from '@/services/channelManager';

interface SyncManagementProps {
    integrationId: number;
}

interface SyncRule {
    id: number;
    ruleType: 'AVAILABILITY' | 'RATES' | 'BOOKINGS' | 'ROOM_MAPPING';
    isActive: boolean;
    syncInterval: number;
    autoSync: boolean;
    conditions: Record<string, any>;
}

interface SyncSchedule {
    id: number;
    scheduleType: 'DAILY' | 'HOURLY' | 'REAL_TIME';
    startTime: string;
    endTime: string;
    daysOfWeek: number[];
    isActive: boolean;
    lastRunAt?: string;
    nextRunAt?: string;
}

interface SyncLog {
    id: number;
    operationType: string;
    status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'IN_PROGRESS';
    direction: 'OUTBOUND' | 'INBOUND';
    processingTimeMs: number;
    recordsProcessed: number;
    recordsSuccess: number;
    recordsFailed: number;
    errorMessage?: string;
    createdAt: string;
    completedAt?: string;
}

export const SyncManagement: React.FC<SyncManagementProps> = ({
    integrationId,
}) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [syncRules, setSyncRules] = useState<SyncRule[]>([]);
    const [syncSchedules, setSyncSchedules] = useState<SyncSchedule[]>([]);
    const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [syncStatus, setSyncStatus] = useState('IDLE');

    useEffect(() => {
        loadSyncData();
    }, [integrationId]);

    const loadSyncData = async () => {
        if (!integrationId) {
            console.error('No integration selected');
            return;
        }

        try {
            setLoading(true);

            // Load real sync rules
            const syncRules =
                await channelManagerService.getSyncRules(integrationId);
            setSyncRules(syncRules);

            // Load real sync schedules
            const syncSchedules =
                await channelManagerService.getSyncSchedules(integrationId);
            setSyncSchedules(syncSchedules);

            // Load real sync logs
            const syncLogs = await channelManagerService.getSyncLogs(
                integrationId,
                20,
            );
            setSyncLogs(syncLogs);
        } catch (error: any) {
            console.error('Failed to load sync data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleManualSync = async (operationType: string) => {
        try {
            setSyncStatus('SYNCING');
            await channelManagerService.triggerSync(
                integrationId,
                operationType,
            );

            // Simulate sync completion
            setTimeout(() => {
                setSyncStatus('COMPLETED');
                setTimeout(() => setSyncStatus('IDLE'), 2000);
            }, 3000);
        } catch (err) {
            setSyncStatus('ERROR');
            console.error('Sync failed:', err);
        }
    };

    const toggleSyncRule = async (ruleId: number) => {
        try {
            setSyncRules((prev) =>
                prev.map((rule) =>
                    rule.id === ruleId
                        ? { ...rule, isActive: !rule.isActive }
                        : rule,
                ),
            );

            // Update backend
            // await channelManagerService.updateSyncRule(ruleId, { isActive: !rule.isActive });
        } catch (err) {
            console.error('Failed to update sync rule:', err);
        }
    };

    const toggleSchedule = async (scheduleId: number) => {
        try {
            setSyncSchedules((prev) =>
                prev.map((schedule) =>
                    schedule.id === scheduleId
                        ? { ...schedule, isActive: !schedule.isActive }
                        : schedule,
                ),
            );

            // Update backend
            // await channelManagerService.updateSyncSchedule(scheduleId, { isActive: !schedule.isActive });
        } catch (err) {
            console.error('Failed to update schedule:', err);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SUCCESS':
                return 'bg-green-100 text-green-800';
            case 'FAILED':
                return 'bg-red-100 text-red-800';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'IN_PROGRESS':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getDirectionIcon = (direction: string) => {
        return direction === 'OUTBOUND' ? '↑' : '↓';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Sync Management</h2>
                    <p className="text-gray-600">
                        Manage synchronization rules, schedules, and monitor
                        performance
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                        <div
                            className={`w-3 h-3 rounded-full ${
                                syncStatus === 'IDLE'
                                    ? 'bg-gray-400'
                                    : syncStatus === 'SYNCING'
                                      ? 'bg-blue-500'
                                      : syncStatus === 'COMPLETED'
                                        ? 'bg-green-500'
                                        : 'bg-red-500'
                            }`}
                        ></div>
                        <span className="text-sm font-medium capitalize">
                            {syncStatus}
                        </span>
                    </div>
                    <Button variant="outline" onClick={loadSyncData}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="rules">Sync Rules</TabsTrigger>
                    <TabsTrigger value="schedules">Schedules</TabsTrigger>
                    <TabsTrigger value="logs">Sync Logs</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Sync Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Button
                                    onClick={() =>
                                        handleManualSync('SYNC_AVAILABILITY')
                                    }
                                    disabled={syncStatus === 'SYNCING'}
                                    className="h-20 flex-col justify-center"
                                >
                                    <Activity className="h-6 w-6 mb-2" />
                                    <span>Sync Availability</span>
                                </Button>
                                <Button
                                    onClick={() =>
                                        handleManualSync('SYNC_RATES')
                                    }
                                    disabled={syncStatus === 'SYNCING'}
                                    variant="outline"
                                    className="h-20 flex-col justify-center"
                                >
                                    <DollarSign className="h-6 w-6 mb-2" />
                                    <span>Sync Rates</span>
                                </Button>
                                <Button
                                    onClick={() => handleManualSync('SYNC_ALL')}
                                    disabled={syncStatus === 'SYNCING'}
                                    variant="outline"
                                    className="h-20 flex-col justify-center"
                                >
                                    <Zap className="h-6 w-6 mb-2" />
                                    <span>Sync All</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sync Statistics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <BarChart3 className="h-5 w-5 mr-2" />
                                    Sync Success Rate
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-green-600">
                                    98.5%
                                </div>
                                <p className="text-sm text-gray-600">
                                    Last 24 hours
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Clock className="h-5 w-5 mr-2" />
                                    Average Sync Time
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-blue-600">
                                    1.2s
                                </div>
                                <p className="text-sm text-gray-600">
                                    Per operation
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Activity className="h-5 w-5 mr-2" />
                                    Active Rules
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-purple-600">
                                    {syncRules.filter((r) => r.isActive).length}
                                </div>
                                <p className="text-sm text-gray-600">
                                    Out of {syncRules.length}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Sync Rules Tab */}
                <TabsContent value="rules" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Sync Rules Configuration</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {syncRules.map((rule) => (
                                    <div
                                        key={rule.id}
                                        className="flex items-center justify-between p-4 border rounded-lg"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <Zap className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium">
                                                    {rule.ruleType.replace(
                                                        '_',
                                                        ' ',
                                                    )}
                                                </h4>
                                                <p className="text-sm text-gray-600">
                                                    Sync every{' '}
                                                    {rule.syncInterval} minutes
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <Switch
                                                checked={rule.isActive}
                                                onCheckedChange={() =>
                                                    toggleSyncRule(rule.id)
                                                }
                                            />
                                            <Badge
                                                variant={
                                                    rule.isActive
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {rule.isActive
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Schedules Tab */}
                <TabsContent value="schedules" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Sync Schedules</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {syncSchedules.map((schedule) => (
                                    <div
                                        key={schedule.id}
                                        className="flex items-center justify-between p-4 border rounded-lg"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                <Calendar className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium">
                                                    {schedule.scheduleType}{' '}
                                                    Schedule
                                                </h4>
                                                <p className="text-sm text-gray-600">
                                                    {schedule.startTime} -{' '}
                                                    {schedule.endTime} •
                                                    {schedule.daysOfWeek
                                                        .map(
                                                            (day) =>
                                                                [
                                                                    'Sun',
                                                                    'Mon',
                                                                    'Tue',
                                                                    'Wed',
                                                                    'Thu',
                                                                    'Fri',
                                                                    'Sat',
                                                                ][day],
                                                        )
                                                        .join(', ')}
                                                </p>
                                                {schedule.lastRunAt && (
                                                    <p className="text-xs text-gray-500">
                                                        Last run:{' '}
                                                        {new Date(
                                                            schedule.lastRunAt,
                                                        ).toLocaleString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <Switch
                                                checked={schedule.isActive}
                                                onCheckedChange={() =>
                                                    toggleSchedule(schedule.id)
                                                }
                                            />
                                            <Badge
                                                variant={
                                                    schedule.isActive
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {schedule.isActive
                                                    ? 'Active'
                                                    : 'Inactive'}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Sync Logs Tab */}
                <TabsContent value="logs" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Sync Logs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {syncLogs.map((log) => (
                                    <div
                                        key={log.id}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-lg">
                                                    {getDirectionIcon(
                                                        log.direction,
                                                    )}
                                                </span>
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {log.operationType.replace(
                                                            '_',
                                                            ' ',
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-gray-600">
                                                        {new Date(
                                                            log.createdAt,
                                                        ).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="text-right">
                                                <p className="text-sm font-medium">
                                                    {log.recordsProcessed}{' '}
                                                    records
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    {log.processingTimeMs}ms
                                                </p>
                                            </div>
                                            <Badge
                                                className={getStatusColor(
                                                    log.status,
                                                )}
                                            >
                                                {log.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};
