'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Plus,
    Settings,
    BarChart3,
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle,
    Building2,
    Activity,
    Calendar,
    Zap,
    Webhook,
} from 'lucide-react';
import {
    channelManagerService,
    ChannelIntegration,
} from '@/services/channelManager';
import CreateIntegrationModal from '@/components/ChannelManager/CreateIntegrationModal';
import EditIntegrationModal from '@/components/ChannelManager/EditIntegrationModal';
import IntegrationMetricsModal from '@/components/ChannelManager/IntegrationMetricsModal';
import { SyncManagement } from '@/components/ChannelManager/SyncManagement';
import { AvailabilityCalendar } from '@/components/ChannelManager/AvailabilityCalendar';
import ChannelIcon from '@/components/ChannelManager/ChannelIcon';
import WebhookSettingsModal from '@/components/ChannelManager/WebhookSettingsModal';
import useHotel from '@/hooks/useHotel';

export default function AdminChannelManagerPage() {
    const [integrations, setIntegrations] = useState<ChannelIntegration[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showMetricsModal, setShowMetricsModal] = useState(false);
    const [showWebhookModal, setShowWebhookModal] = useState(false);
    const [selectedIntegration, setSelectedIntegration] =
        useState<ChannelIntegration | null>(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0,
        error: 0,
    });

    const { organization: hotel } = useHotel();
    const hotelId = hotel?.id; // Use hotel ID from context

    const loadData = useCallback(async () => {
        if (!hotelId) return;
        try {
            setLoading(true);
            const data = await channelManagerService.getIntegrations(hotelId);
            setIntegrations(data);

            // Calculate stats
            const total = data.length;
            const active = data.filter((i) => i.status === 'ACTIVE').length;
            const inactive = data.filter((i) => i.status === 'INACTIVE').length;
            const error = data.filter((i) => i.status === 'ERROR').length;

            setStats({ total, active, inactive, error });
        } catch (error: any) {
            console.error('Failed to load channel manager data:', error);
        } finally {
            setLoading(false);
        }
    }, [hotelId]);

    useEffect(() => {
        if (hotelId) {
            loadData();
        }
    }, [hotelId, loadData]);

    const handleIntegrationCreated = (newIntegration: ChannelIntegration) => {
        setIntegrations((prev) => [...prev, newIntegration]);
        setShowCreateModal(false);
        loadData(); // Refresh data
    };

    const handleEditIntegration = (integration: ChannelIntegration) => {
        setSelectedIntegration(integration);
        setShowEditModal(true);
    };

    const handleViewMetrics = (integration: ChannelIntegration) => {
        setSelectedIntegration(integration);
        setShowMetricsModal(true);
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
        setShowEditModal(false);
        setSelectedIntegration(null);
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setSelectedIntegration(null);
    };

    const handleCloseMetricsModal = () => {
        setShowMetricsModal(false);
        setSelectedIntegration(null);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'INACTIVE':
                return <XCircle className="w-4 h-4 text-gray-600" />;
            case 'PENDING':
                return <Clock className="w-4 h-4 text-yellow-600" />;
            case 'ERROR':
                return <AlertTriangle className="w-4 h-4 text-red-600" />;
            default:
                return <Clock className="w-4 h-4 text-gray-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-green-100 text-green-800';
            case 'INACTIVE':
                return 'bg-gray-100 text-gray-800';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'ERROR':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Building2 className="h-6 w-6 text-orion-blue" />
                        <h1 className="text-3xl font-bold tracking-tight">
                            Channel Manager
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <p className="text-muted-foreground">
                            Managing integrations for:
                        </p>
                        <Badge
                            variant="outline"
                            className="bg-orion-blue/10 text-orion-blue border-orion-blue/20"
                        >
                            {hotel?.name || 'Loading...'}
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        Anli manages all OTA partnerships - hotels just select
                        channels and everything is automatically configured
                        using existing Anli data
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={() => setShowWebhookModal(true)}
                        className="border-orion-blue text-orion-blue hover:bg-orion-blue/5"
                    >
                        <Webhook className="mr-2 h-4 w-4" />
                        Webhooks
                    </Button>
                    <Button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-orion-blue"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Integration
                    </Button>
                </div>
            </div>

            {/* Main Navigation Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger
                        value="overview"
                        className="flex items-center space-x-2"
                    >
                        <Building2 className="h-4 w-4" />
                        <span>Overview</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="sync"
                        className="flex items-center space-x-2"
                    >
                        <Zap className="h-4 w-4" />
                        <span>Sync Management</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="availability"
                        className="flex items-center space-x-2"
                    >
                        <Calendar className="h-4 w-4" />
                        <span>Availability & Rates</span>
                    </TabsTrigger>
                    <TabsTrigger
                        value="integrations"
                        className="flex items-center space-x-2"
                    >
                        <Activity className="h-4 w-4" />
                        <span>Integrations</span>
                    </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    {/* Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Integrations
                                </CardTitle>
                                <ChannelIcon
                                    channelType="CUSTOM"
                                    size="sm"
                                    className="text-muted-foreground"
                                />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {stats.total}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    All channel connections
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Active
                                </CardTitle>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">
                                    {stats.active}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Working integrations
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Inactive
                                </CardTitle>
                                <XCircle className="h-4 w-4 text-gray-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-600">
                                    {stats.inactive}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Disabled integrations
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Errors
                                </CardTitle>
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">
                                    {stats.error}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Failed integrations
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Sync Management Tab */}
                <TabsContent value="sync" className="space-y-6">
                    {integrations.length > 0 ? (
                        <SyncManagement integrationId={integrations[0].id} />
                    ) : (
                        <div className="text-center py-12">
                            <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No integrations available
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Create an integration first to manage sync
                                settings
                            </p>
                            <Button
                                onClick={() => setShowCreateModal(true)}
                                className="bg-orion-blue"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Create Integration
                            </Button>
                        </div>
                    )}
                </TabsContent>

                {/* Availability & Rates Tab */}
                <TabsContent value="availability" className="space-y-6">
                    {integrations.length > 0 ? (
                        <AvailabilityCalendar
                            integrationId={integrations[0].id}
                            hotelId={hotelId || 0}
                        />
                    ) : (
                        <div className="text-center py-12">
                            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No integrations available
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Create an integration first to manage
                                availability and rates
                            </p>
                            <Button
                                onClick={() => setShowCreateModal(true)}
                                className="bg-orion-blue"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Create Integration
                            </Button>
                        </div>
                    )}
                </TabsContent>

                {/* Integrations Tab */}
                <TabsContent value="integrations" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Channel Integrations</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {integrations.length === 0 ? (
                                <div className="text-center py-12">
                                    <ChannelIcon
                                        channelType="CUSTOM"
                                        size="lg"
                                        className="mx-auto text-muted-foreground mb-4"
                                    />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        No integrations yet
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        Get started by creating your first
                                        channel integration
                                    </p>
                                    <Button
                                        onClick={() => setShowCreateModal(true)}
                                        className="bg-orion-blue"
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Your First Integration
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {integrations.map((integration) => (
                                        <div
                                            key={integration.id}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="p-2 bg-orion-blue/20 rounded-lg">
                                                    <ChannelIcon
                                                        channelType={
                                                            integration.channelType
                                                        }
                                                        size="md"
                                                        className="text-orion-blue"
                                                    />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">
                                                        {
                                                            integration.channelName
                                                        }
                                                    </h4>
                                                    <p className="text-sm text-gray-600">
                                                        {integration.channelType.replace(
                                                            '_',
                                                            ' ',
                                                        )}{' '}
                                                        • Property ID:{' '}
                                                        {
                                                            integration.channelPropertyId
                                                        }
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-4">
                                                <Badge
                                                    className={getStatusColor(
                                                        integration.status,
                                                    )}
                                                >
                                                    {getStatusIcon(
                                                        integration.status,
                                                    )}
                                                    <span className="ml-1">
                                                        {integration.status}
                                                    </span>
                                                </Badge>

                                                <div className="flex space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleEditIntegration(
                                                                integration,
                                                            )
                                                        }
                                                    >
                                                        <Settings className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleViewMetrics(
                                                                integration,
                                                            )
                                                        }
                                                    >
                                                        <BarChart3 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Create Integration Modal */}
            {hotelId && (
                <CreateIntegrationModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={handleIntegrationCreated}
                    hotelId={hotelId}
                />
            )}

            {/* Edit Integration Modal */}
            <EditIntegrationModal
                isOpen={showEditModal}
                onClose={handleCloseEditModal}
                onSuccess={handleIntegrationUpdated}
                integration={selectedIntegration}
            />

            {/* Integration Metrics Modal */}
            <IntegrationMetricsModal
                isOpen={showMetricsModal}
                onClose={handleCloseMetricsModal}
                integration={selectedIntegration}
            />

            {/* Webhook Settings Modal */}
            {hotelId && (
                <WebhookSettingsModal
                    isOpen={showWebhookModal}
                    onClose={() => setShowWebhookModal(false)}
                    hotelId={hotelId}
                />
            )}
        </div>
    );
}
