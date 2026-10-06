'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    PlusIcon,
    ArrowPathIcon,
    BellIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import {
    channelManagerService,
    ChannelIntegration,
    DashboardSummary,
    PerformanceMetrics,
} from '../../services/channelManager';
import CreateIntegrationModal from './CreateIntegrationModal';
import IntegrationCard from './IntegrationCard';
import WebhookSettingsModal from './WebhookSettingsModal';
import { useOrganization } from '@/context/useOrganization';
import { useUser } from '@/context/useUser';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ChannelManagerDashboard() {
    const [integrations, setIntegrations] = useState<ChannelIntegration[]>([]);
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [performance, setPerformance] = useState<PerformanceMetrics | null>(
        null,
    );
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showWebhookModal, setShowWebhookModal] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize] = useState(10);

    const {
        organization,
        loading: orgLoading,
        error: orgError,
    } = useOrganization();
    const { user } = useUser();

    // Get hotelId from organization context
    const hotelId = organization?.id;

    useEffect(() => {
        if (hotelId) {
            loadData(1); // Load first page
        }
    }, [hotelId]);

    const loadData = async (page: number = 1) => {
        if (!hotelId) {
            setError('No hotel selected. Please select a hotel to continue.');
            return;
        }

        // Type guard: hotelId is now guaranteed to be a number
        const currentHotelId = hotelId;

        try {
            setLoading(true);
            setError(null);
            const [integrationsData, summaryData, performanceData] =
                await Promise.all([
                    channelManagerService.getIntegrations(currentHotelId),
                    channelManagerService.getDashboardSummary(currentHotelId),
                    channelManagerService.getPerformanceMetrics(currentHotelId),
                ]);

            setIntegrations(integrationsData);
            setSummary(summaryData);
            setPerformance(performanceData);

            // Calculate total pages based on page size
            const total = integrationsData.length;
            const pages = Math.ceil(total / pageSize);
            setTotalPages(pages);
            setCurrentPage(page);
        } catch (error: any) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Failed to load channel manager data';
            setError(errorMessage);
            console.error('Failed to load channel manager data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        try {
            setRefreshing(true);
            setError(null);
            await loadData();
        } catch (error: any) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Failed to refresh data';
            setError(errorMessage);
        } finally {
            setRefreshing(false);
        }
    };

    const handleIntegrationCreated = (newIntegration: ChannelIntegration) => {
        setIntegrations((prev) => [...prev, newIntegration]);
        setShowCreateModal(false);
        loadData(); // Refresh summary data
    };

    const handleIntegrationUpdated = (
        updatedIntegration: ChannelIntegration,
    ) => {
        setIntegrations((prev) =>
            prev.map((integration) =>
                integration.id === updatedIntegration.id
                    ? updatedIntegration
                    : integration,
            ),
        );
    };

    const handleIntegrationDeleted = (integrationId: number) => {
        if (
            window.confirm(
                'Are you sure you want to delete this integration? This action cannot be undone.',
            )
        ) {
            setIntegrations((prev) =>
                prev.filter((integration) => integration.id !== integrationId),
            );
            loadData(); // Refresh summary data
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Error Display */}
            {error && (
                <Alert className="border-red-200 bg-red-50">
                    <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                        {error}
                    </AlertDescription>
                </Alert>
            )}

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Channel Manager
                    </h1>
                    <p className="text-gray-600">
                        Manage your OTA integrations and distribution channels
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-orion-blue hover:bg-orion-blue/90"
                    >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Add Integration
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setShowWebhookModal(true)}
                        className="border-gray-200 text-gray-700 hover:bg-gray-50"
                    >
                        <BellIcon className="w-4 h-4 mr-2" />
                        Webhooks
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="border-orion-blue text-orion-blue hover:bg-orion-blue/10"
                    >
                        <ArrowPathIcon
                            className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`}
                        />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="text-center">
                            <div className="text-2xl font-bold text-blue">
                                {summary.totalIntegrations}
                            </div>
                            <div className="text-sm text-gray-600">
                                Total Integrations
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {summary.activeIntegrations}
                            </div>
                            <div className="text-sm text-gray-600">
                                Active Integrations
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="text-center">
                            <div className="text-2xl font-bold text-red-600">
                                {summary.failedIntegrations}
                            </div>
                            <div className="text-sm text-gray-600">
                                Failed Integrations
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                                {summary.totalBookings}
                            </div>
                            <div className="text-sm text-gray-600">
                                Total Bookings
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Performance Metrics */}
            {performance && (
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-semibold">
                            Performance Overview
                        </h3>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {performance.syncSuccessRate}%
                                </div>
                                <div className="text-sm text-gray-600">
                                    Sync Success Rate
                                </div>
                            </div>

                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue">
                                    {performance.averageSyncTime}s
                                </div>
                                <div className="text-sm text-gray-600">
                                    Average Sync Time
                                </div>
                            </div>

                            <div className="text-center">
                                <div className="text-2xl font-bold text-red-600">
                                    {performance.totalErrors}
                                </div>
                                <div className="text-sm text-gray-600">
                                    Total Errors
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Integrations List */}
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold">
                        Channel Integrations
                    </h3>
                </CardHeader>
                <CardContent>
                    {integrations.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-gray-500 mb-4">
                                No integrations found
                            </div>
                            <Button
                                onClick={() => setShowCreateModal(true)}
                                className="bg-orion-blue hover:bg-orion-blue/90"
                            >
                                <PlusIcon className="w-4 h-4 mr-2" />
                                Create Your First Integration
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {integrations.map((integration) => (
                                <IntegrationCard
                                    key={integration.id}
                                    integration={integration}
                                    onUpdate={handleIntegrationUpdated}
                                    onDelete={handleIntegrationDeleted}
                                />
                            ))}

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center space-x-4 mt-6">
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            loadData(currentPage - 1)
                                        }
                                        disabled={currentPage <= 1}
                                        className="border-gray-200 text-gray-700 hover:bg-gray-50"
                                    >
                                        Previous
                                    </Button>

                                    <span className="text-sm text-gray-600">
                                        Page {currentPage} of {totalPages}
                                    </span>

                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            loadData(currentPage + 1)
                                        }
                                        disabled={currentPage >= totalPages}
                                        className="border-gray-200 text-gray-700 hover:bg-gray-50"
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create Integration Modal */}
            <CreateIntegrationModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={handleIntegrationCreated}
                hotelId={hotelId || 0}
            />

            <WebhookSettingsModal
                isOpen={showWebhookModal}
                onClose={() => setShowWebhookModal(false)}
                hotelId={hotelId || 0}
            />
        </div>
    );
}
