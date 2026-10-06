'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Building2 } from 'lucide-react';
import {
    channelManagerService,
    ChannelIntegration,
} from '@/services/channelManager';
import CreateIntegrationModal from '@/components/ChannelManager/CreateIntegrationModal';
import IntegrationCard from '@/components/ChannelManager/IntegrationCard';
import ChannelIcon from '@/components/ChannelManager/ChannelIcon';
import useHotel from '@/hooks/useHotel';
import { Badge } from '@/components/ui/badge';

export default function AdminIntegrationsPage() {
    const [integrations, setIntegrations] = useState<ChannelIntegration[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const { organization: hotel } = useHotel();
    const hotelId = hotel?.id || 1; // Use hotel ID from context or default to 1

    useEffect(() => {
        loadIntegrations();
    }, []);

    const loadIntegrations = async () => {
        try {
            setLoading(true);
            const data = await channelManagerService.getIntegrations(hotelId);
            setIntegrations(data);
        } catch (error: any) {
            console.error('Failed to load integrations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleIntegrationCreated = (newIntegration: ChannelIntegration) => {
        setIntegrations((prev) => [...prev, newIntegration]);
        setShowCreateModal(false);
        loadIntegrations(); // Refresh data
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
        loadIntegrations(); // Refresh data
    };

    const handleIntegrationDeleted = (integrationId: number) => {
        setIntegrations((prev) =>
            prev.filter((integration) => integration.id !== integrationId),
        );
        loadIntegrations(); // Refresh data
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
                            Channel Integrations
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
                <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Integration
                </Button>
            </div>

            {/* Integrations List */}
            <Card>
                <CardHeader>
                    <CardTitle>All Integrations</CardTitle>
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
                                Get started by creating your first channel
                                integration
                            </p>
                            <Button onClick={() => setShowCreateModal(true)}>
                                <Plus className="mr-2 h-4 w-4" />
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
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create Integration Modal */}
            <CreateIntegrationModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={handleIntegrationCreated}
                hotelId={hotelId}
            />
        </div>
    );
}
