'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    BarChart3,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    TrendingUp,
    Activity,
    Calendar,
    RefreshCw,
    Download,
    Eye,
} from 'lucide-react';
import {
    ChannelIntegration,
    channelManagerService,
} from '../../services/channelManager';

interface IntegrationMetricsModalProps {
    isOpen: boolean;
    onClose: () => void;
    integration: ChannelIntegration | null;
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

interface IntegrationStats {
    totalSyncs: number;
    successfulSyncs: number;
    failedSyncs: number;
    avgProcessingTime: number;
    lastSyncAt?: string;
    lastSuccessfulSync?: string;
    uptime: number;
    syncFrequency: {
        daily: number;
        weekly: number;
        monthly: number;
    };
}

export default function IntegrationMetricsModal({
    isOpen,
    onClose,
    integration,
}: IntegrationMetricsModalProps) {
    const [stats, setStats] = useState<IntegrationStats | null>(null);
    const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'logs'>('overview');

    const loadMetrics = useCallback(async () => {
        if (!integration) return;
        try {
            setLoading(true);

            // Load real integration stats
            const stats = await channelManagerService.getIntegrationStats(
                integration.id,
            );
            setStats(stats);

            // Load real sync logs
            const logs = await channelManagerService.getSyncLogs(
                integration.id,
                20,
            );
            setSyncLogs(logs);
        } catch (error: any) {
            console.error('Failed to load metrics:', error);
        } finally {
            setLoading(false);
        }
    }, [integration]);

    useEffect(() => {
        if (integration && isOpen) {
            loadMetrics();
        }
    }, [integration, isOpen, loadMetrics]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'SUCCESS':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'FAILED':
                return <XCircle className="h-4 w-4 text-red-600" />;
            case 'PENDING':
                return <Clock className="h-4 w-4 text-yellow-600" />;
            default:
                return <AlertTriangle className="h-4 w-4 text-gray-600" />;
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
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'FULL_SYNC':
                return <RefreshCw className="h-4 w-4" />;
            case 'RATE_UPDATE':
                return <TrendingUp className="h-4 w-4" />;
            case 'AVAILABILITY_SYNC':
                return <Calendar className="h-4 w-4" />;
            default:
                return <Activity className="h-4 w-4" />;
        }
    };

    if (!integration) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <div className="p-2 bg-orion-blue/20 rounded-lg">
                            <BarChart3 className="h-6 w-6 text-orion-blue" />
                        </div>
                        Integration Metrics
                        <Badge className="bg-orion-blue/10 text-orion-blue border-orion-blue/20">
                            {integration.channelType.replace('_', ' ')}
                        </Badge>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Tab Navigation */}
                    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                        <Button
                            variant={
                                activeTab === 'overview' ? 'default' : 'ghost'
                            }
                            onClick={() => setActiveTab('overview')}
                            className={`rounded-md px-4 py-2 ${
                                activeTab === 'overview'
                                    ? 'bg-white shadow-sm text-gray-900'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            Overview
                        </Button>
                        <Button
                            variant={activeTab === 'logs' ? 'default' : 'ghost'}
                            onClick={() => setActiveTab('logs')}
                            className={`rounded-md px-4 py-2 ${
                                activeTab === 'logs'
                                    ? 'bg-white shadow-sm text-gray-900'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <Activity className="h-4 w-4 mr-2" />
                            Sync Logs
                        </Button>
                    </div>

                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Key Metrics */}
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Total Syncs
                                        </CardTitle>
                                        <RefreshCw className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {stats?.totalSyncs || 0}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            All sync operations
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Success Rate
                                        </CardTitle>
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-green-600">
                                            {stats
                                                ? Math.round(
                                                      (stats.successfulSyncs /
                                                          stats.totalSyncs) *
                                                          100,
                                                  )
                                                : 0}
                                            %
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Successful operations
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Avg Duration
                                        </CardTitle>
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {stats?.avgProcessingTime || 0}s
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Per sync operation
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Failed Syncs
                                        </CardTitle>
                                        <XCircle className="h-4 w-4 text-red-600" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-red-600">
                                            {stats?.failedSyncs || 0}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Failed operations
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Sync Timeline */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5" />
                                        Sync Timeline
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                                <span className="text-sm font-medium text-gray-700">
                                                    Last Sync
                                                </span>
                                            </div>
                                            <div className="pl-5">
                                                <div className="text-lg font-semibold text-gray-900">
                                                    {stats?.lastSyncAt
                                                        ? new Date(
                                                              stats.lastSyncAt,
                                                          ).toLocaleString()
                                                        : 'Never'}
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    Most recent successful sync
                                                </p>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                                <span className="text-sm font-medium text-gray-700">
                                                    Next Sync
                                                </span>
                                            </div>
                                            <div className="pl-5">
                                                <div className="text-lg font-semibold text-gray-900">
                                                    {stats?.lastSuccessfulSync
                                                        ? new Date(
                                                              stats.lastSuccessfulSync,
                                                          ).toLocaleString()
                                                        : 'Not scheduled'}
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    Upcoming scheduled sync
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'logs' && (
                        <div className="space-y-6">
                            {/* Sync Logs */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Activity className="h-5 w-5" />
                                            Recent Sync Logs
                                        </div>
                                        <Button variant="outline" size="sm">
                                            <Download className="h-4 w-4 mr-2" />
                                            Export
                                        </Button>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {syncLogs.map((log) => (
                                            <div
                                                key={log.id}
                                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 bg-gray-100 rounded-lg">
                                                        {getTypeIcon(
                                                            log.operationType,
                                                        )}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-gray-900">
                                                                {log.operationType.replace(
                                                                    '_',
                                                                    ' ',
                                                                )}
                                                            </span>
                                                            <Badge
                                                                className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                                                                    log.status,
                                                                )}`}
                                                            >
                                                                {getStatusIcon(
                                                                    log.status,
                                                                )}
                                                                <span className="ml-1">
                                                                    {log.status}
                                                                </span>
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-gray-600">
                                                            {log.errorMessage ||
                                                                'No message available'}
                                                        </p>
                                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                                            <span>
                                                                {new Date(
                                                                    log.createdAt,
                                                                ).toLocaleString()}
                                                            </span>
                                                            {log.processingTimeMs && (
                                                                <span>
                                                                    Duration:{' '}
                                                                    {(
                                                                        log.processingTimeMs /
                                                                        1000
                                                                    ).toFixed(
                                                                        2,
                                                                    )}
                                                                    s
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>

                <Separator className="my-6" />

                {/* Actions */}
                <div className="flex justify-end space-x-4">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                    <Button
                        onClick={loadMetrics}
                        disabled={loading}
                        className="bg-orion-blue"
                    >
                        <RefreshCw
                            className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
                        />
                        {loading ? 'Refreshing...' : 'Refresh Data'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
