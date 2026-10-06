'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    BarChart3,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    Clock,
    DollarSign,
    Plus,
    RefreshCw,
    Settings,
    Activity,
} from 'lucide-react';
import {
    channelManagerService,
    DashboardSummary,
    PerformanceMetrics,
} from '@/services/channelManager';

interface DashboardProps {
    hotelId: number;
}

export const ChannelManagerDashboard: React.FC<DashboardProps> = ({
    hotelId,
}) => {
    const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(
        null,
    );
    const [performanceData, setPerformanceData] =
        useState<PerformanceMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadDashboardData();
    }, [hotelId]);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [summary, performance] = await Promise.all([
                channelManagerService.getDashboardSummary(hotelId),
                channelManagerService.getPerformanceMetrics(hotelId),
            ]);
            setDashboardData(summary);
            setPerformanceData(performance);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to load dashboard data',
            );
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={loadDashboardData} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Channel Manager Dashboard
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Manage your OTA connections and monitor performance
                    </p>
                </div>
                <div className="flex space-x-3">
                    <Button
                        onClick={loadDashboardData}
                        variant="outline"
                        size="sm"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Connect New OTA
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Integrations
                        </CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {dashboardData?.totalIntegrations || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Connected OTAs
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Active Integrations
                        </CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {dashboardData?.activeIntegrations || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Working properly
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Sync Success Rate
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {performanceData?.syncSuccessRate || 0}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Last 24 hours
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Revenue
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            ${dashboardData?.revenue?.toLocaleString() || '0'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            This month
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Activity className="h-5 w-5 mr-2" />
                            Performance Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                                Average Sync Time
                            </span>
                            <span className="font-medium">
                                {performanceData?.averageSyncTime || 0}ms
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                                Uptime
                            </span>
                            <span className="font-medium">
                                {performanceData?.uptime || 0}%
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                                Total Errors
                            </span>
                            <span className="font-medium text-red-600">
                                {performanceData?.totalErrors || 0}
                            </span>
                        </div>
                        <Separator />
                        <div className="text-sm text-gray-600">
                            Last error:{' '}
                            {performanceData?.lastErrorTime
                                ? new Date(
                                      performanceData.lastErrorTime,
                                  ).toLocaleString()
                                : 'No errors'}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Clock className="h-5 w-5 mr-2" />
                            Sync Frequency
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                                Daily Syncs
                            </span>
                            <span className="font-medium">
                                {performanceData?.syncFrequency?.daily || 0}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                                Weekly Syncs
                            </span>
                            <span className="font-medium">
                                {performanceData?.syncFrequency?.weekly || 0}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                                Monthly Syncs
                            </span>
                            <span className="font-medium">
                                {performanceData?.syncFrequency?.monthly || 0}
                            </span>
                        </div>
                        <Separator />
                        <div className="text-sm text-gray-600">
                            Last sync:{' '}
                            {dashboardData?.lastSyncTime
                                ? new Date(
                                      dashboardData.lastSyncTime,
                                  ).toLocaleString()
                                : 'Never'}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button
                            variant="outline"
                            className="h-20 flex-col justify-center"
                        >
                            <Plus className="h-6 w-6 mb-2" />
                            <span>Connect New OTA</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-20 flex-col justify-center"
                        >
                            <RefreshCw className="h-6 w-6 mb-2" />
                            <span>Manual Sync All</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-20 flex-col justify-center"
                        >
                            <Settings className="h-6 w-6 mb-2" />
                            <span>Manage Settings</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <div>
                                    <p className="text-sm font-medium">
                                        Booking.com sync completed
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        2 minutes ago
                                    </p>
                                </div>
                            </div>
                            <Badge variant="secondary">Success</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <AlertCircle className="h-4 w-4 text-red-600" />
                                <div>
                                    <p className="text-sm font-medium">
                                        Expedia rate update failed
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        15 minutes ago
                                    </p>
                                </div>
                            </div>
                            <Badge variant="destructive">Failed</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <Clock className="h-4 w-4 text-blue-600" />
                                <div>
                                    <p className="text-sm font-medium">
                                        Airbnb availability sync
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        1 hour ago
                                    </p>
                                </div>
                            </div>
                            <Badge variant="outline">Pending</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
