import { safeResponseJson, safeResponseJsonOrNull, safeErrorJson } from '@/lib/api';
const CHANNEL_MANAGER_BASE_URL =
    process.env.NEXT_PUBLIC_CHANNEL_MANAGER_BASE_URL ||
    'http://localhost:4000/api/v1';

export interface ChannelIntegration {
    id: number;
    hotelId: number;
    channelType:
        | 'BOOKING_COM'
        | 'EXPEDIA'
        | 'AIRBNB'
        | 'HOTELS_COM'
        | 'TRIPADVISOR'
        | 'AGODA'
        | 'HOTELBEDS'
        | 'WAKANOW'
        | 'CUSTOM';
    channelName: string;
    apiKey?: string; // Managed by PMS, not required from hotels
    channelPropertyId: string;
    status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'ERROR';
    isWebhookEnabled: boolean;
    syncIntervalMinutes: number;
    isRealTimeSync: boolean;
    lastSyncAt?: string;
    lastSuccessfulSync?: string;
    testMode: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateChannelIntegrationDto {
    hotelId: number;
    channelType?: ChannelIntegration['channelType']; // Optional - user must select
    channelName: string;
    channelPropertyId?: string; // Optional - PMS will auto-generate if not provided
    isWebhookEnabled: boolean;
    syncIntervalMinutes: number;
    isRealTimeSync: boolean;
    testMode: boolean;
}

export interface ChannelMapping {
    id: number;
    integrationId: number;
    roomtypeId: number;
    channelRoomTypeId: string;
    channelRoomTypeName: string;
    channelAmenities: string[];
    channelDescription: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateChannelMappingDto {
    integrationId: number;
    roomtypeId: number;
    channelRoomTypeId: string;
    channelRoomTypeName: string;
    channelAmenities: string[];
    channelDescription: string;
    isActive?: boolean;
}

export interface ChannelAvailability {
    id: number;
    integrationId: number;
    roomtypeId: number;
    date: string;
    availableRooms: number;
    totalRooms: number;
    price: number;
    currency: string;
    isAvailable: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface SyncAvailabilityDto {
    integrationId: number;
    roomtypeId: number;
    date: string;
    availableRooms: number;
    totalRooms: number;
    price: number;
    currency: string;
}

export interface ChannelSyncLog {
    id: number;
    integrationId: number;
    operationType:
        | 'SYNC_AVAILABILITY'
        | 'SYNC_RATES'
        | 'SYNC_BOOKINGS'
        | 'TEST_CONNECTION';
    status: 'SUCCESS' | 'FAILED' | 'PENDING';
    message: string;
    errorDetails?: string;
    startTime: string;
    endTime?: string;
    recordsProcessed?: number;
    createdAt: string;
}

export interface ChannelType {
    BOOKING_COM: 'BOOKING_COM';
    EXPEDIA: 'EXPEDIA';
    AIRBNB: 'AIRBNB';
    HOTELS_COM: 'HOTELS_COM';
    TRIPADVISOR: 'TRIPADVISOR';
    AGODA: 'AGODA';
    HOTELBEDS: 'HOTELBEDS';
    CORNICHE: 'CORNICHE';
    SEVEN: 'SEVEN';
    WAKANOW: 'WAKANOW';
    CUSTOM: 'CUSTOM';
}

export interface DashboardSummary {
    totalIntegrations: number;
    activeIntegrations: number;
    failedIntegrations: number;
    lastSyncTime: string;
    totalBookings: number;
    revenue: number;
    syncSuccessRate: number;
    averageSyncTime: number;
    totalErrors: number;
    lastErrorTime?: string;
}

export interface PerformanceMetrics {
    syncSuccessRate: number;
    averageSyncTime: number;
    totalErrors: number;
    lastErrorTime?: string;
    uptime: number;
    syncFrequency: {
        daily: number;
        weekly: number;
        monthly: number;
    };
}

export interface SyncRule {
    id: number;
    integrationId: number;
    ruleType: 'AVAILABILITY' | 'RATES' | 'BOOKINGS' | 'ROOM_MAPPING';
    isActive: boolean;
    syncInterval: number; // minutes
    autoSync: boolean;
    conditions: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}

export interface RoomMapping {
    id: number;
    integrationId: number;
    anliRoomTypeId: number;
    anliRoomTypeName: string;
    otaRoomTypeId: string;
    otaRoomTypeName: string;
    amenities: string[];
    description: string;
    isActive: boolean;
    lastMappedAt: string;
    createdAt: string;
    updatedAt: string;
}

export interface RatePlanMapping {
    id: number;
    integrationId: number;
    anliRatePlanId: number;
    anliRatePlanName: string;
    otaRatePlanId: string;
    otaRatePlanName: string;
    baseRate: number;
    currency: string;
    isActive: boolean;
    lastMappedAt: string;
    createdAt: string;
    updatedAt: string;
}

export interface SyncSchedule {
    id: number;
    integrationId: number;
    scheduleType: 'DAILY' | 'HOURLY' | 'REAL_TIME';
    startTime: string;
    endTime: string;
    daysOfWeek: number[]; // 0-6 (Sunday-Saturday)
    isActive: boolean;
    lastRunAt?: string;
    nextRunAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface WebhookConfig {
    id: number;
    integrationId: number;
    webhookUrl: string;
    webhookSecret: string;
    events: string[]; // ['booking.created', 'rate.updated', etc.]
    isActive: boolean;
    lastTriggeredAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface BulkOperation {
    id: number;
    operationType: 'UPDATE_AVAILABILITY' | 'UPDATE_RATES' | 'SYNC_ALL';
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
    totalRecords: number;
    processedRecords: number;
    failedRecords: number;
    startedAt: string;
    completedAt?: string;
    errorMessage?: string;
    createdAt: string;
}

class ChannelManagerService {
    private baseUrl: string;
    private apiKey: string;

    constructor() {
        this.baseUrl = CHANNEL_MANAGER_BASE_URL;
        this.apiKey =
            process.env.NEXT_PUBLIC_CHANNEL_MANAGER_API_KEY ||
            '84efbf4545db91758fa4be594a31e8f191f4a1a7dceade75a0a19dad58a5f459';
    }

    private getHeaders() {
        return {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
        };
    }

    // Channel Integration Methods
    async createIntegration(
        data: CreateChannelIntegrationDto,
    ): Promise<ChannelIntegration> {
        const response = await fetch(
            `${this.baseUrl}/channel-manager/integrations`,
            {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(data),
            },
        );

        if (!response.ok) {
            const error = await safeErrorJson(response);
            throw new Error(error.message || 'Failed to create integration');
        }

        return safeResponseJson(response);
    }

    async getIntegrations(hotelId?: number): Promise<ChannelIntegration[]> {
        const url = hotelId
            ? `${this.baseUrl}/channel-manager/integrations?hotelId=${hotelId}`
            : `${this.baseUrl}/channel-manager/integrations`;

        const response = await fetch(url, {
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch integrations');
        }

        return safeResponseJson(response);
    }

    async getIntegration(id: number): Promise<ChannelIntegration> {
        const response = await fetch(
            `${this.baseUrl}/channel-manager/integrations/${id}`,
            {
                headers: this.getHeaders(),
            },
        );

        if (!response.ok) {
            throw new Error('Failed to fetch integration');
        }

        return safeResponseJson(response);
    }

    async updateIntegration(
        id: number,
        data: Partial<ChannelIntegration>,
    ): Promise<ChannelIntegration> {
        const response = await fetch(
            `${this.baseUrl}/channel-manager/integrations/${id}`,
            {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(data),
            },
        );

        if (!response.ok) {
            const error = await safeErrorJson(response);
            throw new Error(error.message || 'Failed to update integration');
        }

        return safeResponseJson(response);
    }

    async deleteIntegration(id: number): Promise<void> {
        const response = await fetch(
            `${this.baseUrl}/channel-manager/integrations/${id}`,
            {
                method: 'DELETE',
                headers: this.getHeaders(),
            },
        );

        if (!response.ok) {
            throw new Error('Failed to delete integration');
        }
    }

    async getAvailableIntegrationTypes(
        hotelId: number,
    ): Promise<ChannelIntegration['channelType'][]> {
        const response = await fetch(
            `${this.baseUrl}/channel-manager/integrations/available-types/${hotelId}`,
            {
                headers: this.getHeaders(),
            },
        );

        if (!response.ok) {
            throw new Error('Failed to fetch available integration types');
        }

        return safeResponseJson(response);
    }

    // Channel Mapping Methods
    async createMapping(
        data: CreateChannelMappingDto,
    ): Promise<ChannelMapping> {
        const response = await fetch(
            `${this.baseUrl}/channel-manager/mappings`,
            {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(data),
            },
        );

        if (!response.ok) {
            const error = await safeErrorJson(response);
            throw new Error(error.message || 'Failed to create mapping');
        }

        return safeResponseJson(response);
    }

    async getMappings(integrationId: number): Promise<ChannelMapping[]> {
        const response = await fetch(
            `${this.baseUrl}/channel-manager/integrations/${integrationId}/mappings`,
            {
                headers: this.getHeaders(),
            },
        );

        if (!response.ok) {
            throw new Error('Failed to fetch mappings');
        }

        return safeResponseJson(response);
    }

    async updateMapping(
        id: number,
        data: Partial<ChannelMapping>,
    ): Promise<ChannelMapping> {
        const response = await fetch(
            `${this.baseUrl}/channel-manager/mappings/${id}`,
            {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(data),
            },
        );

        if (!response.ok) {
            const error = await safeErrorJson(response);
            throw new Error(error.message || 'Failed to update mapping');
        }

        return safeResponseJson(response);
    }

    // Availability Methods
    async syncAvailability(
        data: SyncAvailabilityDto,
    ): Promise<ChannelAvailability> {
        const response = await fetch(
            `${this.baseUrl}/channel-manager/availability/sync`,
            {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(data),
            },
        );

        if (!response.ok) {
            const error = await safeErrorJson(response);
            throw new Error(error.message || 'Failed to sync availability');
        }

        return safeResponseJson(response);
    }

    async getAvailability(
        integrationId: number,
        roomtypeId: number,
        startDate: string,
        endDate: string,
    ): Promise<ChannelAvailability[]> {
        const response = await fetch(
            `${this.baseUrl}/channel-manager/availability?integrationId=${integrationId}&roomtypeId=${roomtypeId}&startDate=${startDate}&endDate=${endDate}`,
            {
                headers: this.getHeaders(),
            },
        );

        if (!response.ok) {
            throw new Error('Failed to fetch availability');
        }

        return safeResponseJson(response);
    }

    // Sync Management
    async triggerManualSync(
        integrationId: number,
        operationType: string,
    ): Promise<void> {
        const response = await fetch(
            `${this.baseUrl}/channel-manager/integrations/${integrationId}/sync`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ operationType }),
            },
        );

        if (!response.ok) {
            throw new Error('Failed to trigger sync');
        }
    }

    // Guest Integration
    async handleGuestCheckIn(guestId: number): Promise<void> {
        const response = await fetch(
            `${this.baseUrl}/channel-manager/guests/${guestId}/check-in`,
            {
                method: 'POST',
                headers: this.getHeaders(),
            },
        );

        if (!response.ok) {
            throw new Error('Failed to handle guest check-in');
        }
    }

    async handleGuestCheckOut(guestId: number): Promise<void> {
        const response = await fetch(
            `${this.baseUrl}/channel-manager/guests/${guestId}/check-out`,
            {
                method: 'POST',
                headers: this.getHeaders(),
            },
        );

        if (!response.ok) {
            throw new Error('Failed to handle guest check-out');
        }
    }

    async testIntegration(
        integrationId: number,
    ): Promise<{ success: boolean; message: string }> {
        const response = await fetch(
            `${this.baseUrl}/channel-manager/integrations/${integrationId}/test`,
            {
                method: 'POST',
            },
        );

        if (!response.ok) {
            throw new Error('Failed to test integration');
        }

        return safeResponseJson(response);
    }

    async getIntegrationStats(integrationId: number): Promise<{
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
    }> {
        const response = await fetch(
            `${this.baseUrl}/channel-manager/integrations/${integrationId}/stats`,
            {
                headers: this.getHeaders(),
            },
        );

        if (!response.ok) {
            throw new Error('Failed to fetch integration statistics');
        }

        return safeResponseJson(response);
    }

    async getSyncLogs(
        integrationId: number,
        limit = 50,
    ): Promise<
        {
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
        }[]
    > {
        const response = await fetch(
            `${this.baseUrl}/channel-manager/integrations/${integrationId}/logs?limit=${limit}`,
            {
                headers: this.getHeaders(),
            },
        );

        if (!response.ok) {
            throw new Error('Failed to fetch sync logs');
        }

        return safeResponseJson(response);
    }

    // Dashboard & Analytics
    async getDashboardSummary(hotelId: number): Promise<DashboardSummary> {
        const response = await fetch(
            `${this.baseUrl}/channel-manager/dashboard/summary?hotelId=${hotelId}`,
            {
                headers: this.getHeaders(),
            },
        );

        if (!response.ok) {
            throw new Error('Failed to fetch dashboard summary');
        }

        return safeResponseJson(response);
    }

    async getPerformanceMetrics(hotelId: number): Promise<PerformanceMetrics> {
        const response = await fetch(
            `${this.baseUrl}/channel-manager/dashboard/performance?hotelId=${hotelId}`,
            {
                headers: this.getHeaders(),
            },
        );

        if (!response.ok) {
            throw new Error('Failed to fetch performance metrics');
        }

        return safeResponseJson(response);
    }

    async getRevenueAnalytics(
        hotelId: number,
        dateRange: string,
    ): Promise<any> {
        const response = await fetch(
            `${this.baseUrl}/channel-manager/analytics/revenue?hotelId=${hotelId}&dateRange=${dateRange}`,
            {
                headers: this.getHeaders(),
            },
        );

        if (!response.ok) {
            throw new Error('Failed to fetch revenue analytics');
        }

        return safeResponseJson(response);
    }

    // OTA Connection Management
    async initiateOAuthConnection(
        channelType: string,
        hotelId: number,
    ): Promise<{ authUrl: string; state: string }> {
        const response = await fetch(
            `${this.baseUrl}/channel-manager/oauth/initiate`,
            {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ channelType, hotelId }),
            },
        );

        if (!response.ok) {
            throw new Error('Failed to initiate OAuth connection');
        }

        return safeResponseJson(response);
    }

    async completeOAuthConnection(
        state: string,
        code: string,
    ): Promise<ChannelIntegration> {
        const response = await fetch(
            `${this.baseUrl}/channel-manager/oauth/complete`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ state, code }),
            },
        );

        if (!response.ok) {
            throw new Error('Failed to complete OAuth connection');
        }

        return safeResponseJson(response);
    }

    async testConnection(
        integrationId: number,
    ): Promise<{ success: boolean; message: string; details?: any }> {
        const response = await fetch(
            `${this.baseUrl}/channel-manager/integrations/${integrationId}/test`,
            {
                method: 'POST',
            },
        );

        if (!response.ok) {
            const error = await safeErrorJson(response);
            throw new Error(error.message || 'Failed to test connection');
        }

        return safeResponseJson(response);
    }

    // Room & Rate Mapping
    async getRoomMappings(integrationId: number): Promise<RoomMapping[]> {
        const response = await fetch(
            `${this.baseUrl}/channel-manager/integrations/${integrationId}/room-mappings`,
        );

        if (!response.ok) {
            throw new Error('Failed to fetch room mappings');
        }

        return safeResponseJson(response);
    }

    async createRoomMapping(data: Partial<RoomMapping>): Promise<RoomMapping> {
        const response = await fetch(
            `${this.baseUrl}/channel-manager/room-mappings`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            },
        );

        if (!response.ok) {
            const error = await safeErrorJson(response);
            throw new Error(error.message || 'Failed to create room mapping');
        }

        return safeResponseJson(response);
    }

    async updateRoomMapping(
        id: number,
        data: Partial<RoomMapping>,
    ): Promise<RoomMapping> {
        const response = await fetch(
            `${this.baseUrl}/channel-manager/room-mappings/${id}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            },
        );

        if (!response.ok) {
            const error = await safeErrorJson(response);
            throw new Error(error.message || 'Failed to update room mapping');
        }

        return safeResponseJson(response);
    }

    async getRatePlanMappings(
        integrationId: number,
    ): Promise<RatePlanMapping[]> {
        const response = await fetch(
            `${this.baseUrl}/channel-manager/integrations/${integrationId}/rate-plan-mappings`,
            {
                headers: this.getHeaders(),
            },
        );

        if (!response.ok) {
            throw new Error('Failed to fetch rate plan mappings');
        }

        return safeResponseJson(response);
    }

    async createRatePlanMapping(
        data: Partial<RatePlanMapping>,
    ): Promise<RatePlanMapping> {
        const response = await fetch(
            `${this.baseUrl}/channel-manager/rate-plan-mappings`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            },
        );

        if (!response.ok) {
            const error = await safeErrorJson(response);
            throw new Error(
                error.message || 'Failed to create rate plan mapping',
            );
        }

        return safeResponseJson(response);
    }

    // Sync Operations
    async triggerSync(
        integrationId: number,
        operationType?: string,
    ): Promise<{ success: boolean; message: string }> {
        const response = await fetch(
            `${this.baseUrl}/channel-manager/integrations/${integrationId}/sync`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ operationType }),
            },
        );

        if (!response.ok) {
            const error = await safeErrorJson(response);
            throw new Error(error.message || 'Failed to trigger sync');
        }

        return safeResponseJson(response);
    }

    async getSyncStatus(
        integrationId: number,
    ): Promise<{ status: string; lastSync: string; nextSync?: string }> {
        const response = await fetch(
            `${this.baseUrl}/channel-manager/integrations/${integrationId}/sync-status`,
        );

        if (!response.ok) {
            throw new Error('Failed to fetch sync status');
        }

        return safeResponseJson(response);
    }

    async pauseSync(integrationId: number): Promise<void> {
        const response = await fetch(
            `${this.baseUrl}/channel-manager/integrations/${integrationId}/pause-sync`,
            {
                method: 'POST',
            },
        );

        if (!response.ok) {
            throw new Error('Failed to pause sync');
        }
    }

    async resumeSync(integrationId: number): Promise<void> {
        const response = await fetch(
            `${this.baseUrl}/channel-manager/integrations/${integrationId}/resume-sync`,
            {
                method: 'POST',
            },
        );

        if (!response.ok) {
            throw new Error('Failed to resume sync');
        }
    }

    // Sync Rules & Scheduling
    async getSyncRules(integrationId: number): Promise<SyncRule[]> {
        const response = await fetch(
            `${this.baseUrl}/channel-manager/integrations/${integrationId}/sync-rules`,
        );

        if (!response.ok) {
            throw new Error('Failed to fetch sync rules');
        }

        return safeResponseJson(response);
    }

    async createSyncRule(data: Partial<SyncRule>): Promise<SyncRule> {
        const response = await fetch(
            `${this.baseUrl}/channel-manager/sync-rules`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            },
        );

        if (!response.ok) {
            const error = await safeErrorJson(response);
            throw new Error(error.message || 'Failed to create sync rule');
        }

        return safeResponseJson(response);
    }

    async getSyncSchedules(integrationId: number): Promise<SyncSchedule[]> {
        const response = await fetch(
            `${this.baseUrl}/channel-manager/integrations/${integrationId}/sync-schedules`,
        );

        if (!response.ok) {
            throw new Error('Failed to fetch sync schedules');
        }

        return safeResponseJson(response);
    }

    // Webhook Management
    async getWebhookConfig(integrationId: number): Promise<WebhookConfig> {
        const response = await fetch(
            `${this.baseUrl}/channel-manager/integrations/${integrationId}/webhook-config`,
        );

        if (!response.ok) {
            throw new Error('Failed to fetch webhook configuration');
        }

        return safeResponseJson(response);
    }

    async updateWebhookConfig(
        integrationId: number,
        data: Partial<WebhookConfig>,
    ): Promise<WebhookConfig> {
        const response = await fetch(
            `${this.baseUrl}/channel-manager/integrations/${integrationId}/webhook-config`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            },
        );

        if (!response.ok) {
            const error = await safeErrorJson(response);
            throw new Error(
                error.message || 'Failed to update webhook configuration',
            );
        }

        return safeResponseJson(response);
    }

    async getHotelWebhookConfig(hotelId: number): Promise<any> {
        const response = await fetch(
            `${this.baseUrl}/channel-manager/hotels/${hotelId}/webhook-config`,
            {
                headers: this.getHeaders(),
            },
        );

        if (!response.ok) {
            throw new Error('Failed to fetch hotel webhook configuration');
        }

        return safeResponseJson(response);
    }

    async updateHotelWebhookConfig(hotelId: number, data: any): Promise<any> {
        const response = await fetch(
            `${this.baseUrl}/channel-manager/hotels/${hotelId}/webhook-config`,
            {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(data),
            },
        );

        if (!response.ok) {
            const error = await safeErrorJson(response);
            throw new Error(
                error.message || 'Failed to update hotel webhook configuration',
            );
        }

        return safeResponseJson(response);
    }

    async testWebhookConnection(
        hotelId: number,
        eventType: string = 'TEST',
    ): Promise<any> {
        const response = await fetch(
            `${this.baseUrl}/channel-manager/hotels/${hotelId}/webhook-test`,
            {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ eventType }),
            },
        );

        if (!response.ok) {
            const error = await safeErrorJson(response);
            throw new Error(
                error.message || 'Failed to test webhook connection',
            );
        }

        return safeResponseJson(response);
    }

    // Bulk Operations
    async startBulkOperation(data: {
        operationType: string;
        integrationId: number;
        records: any[];
    }): Promise<BulkOperation> {
        const response = await fetch(
            `${this.baseUrl}/channel-manager/bulk-operations`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            },
        );

        if (!response.ok) {
            const error = await safeErrorJson(response);
            throw new Error(error.message || 'Failed to start bulk operation');
        }

        return safeResponseJson(response);
    }

    async getBulkOperationStatus(operationId: number): Promise<BulkOperation> {
        const response = await fetch(
            `${this.baseUrl}/channel-manager/bulk-operations/${operationId}`,
        );

        if (!response.ok) {
            throw new Error('Failed to fetch bulk operation status');
        }

        return safeResponseJson(response);
    }

    // Calendar & Availability Management
    async getAvailabilityCalendar(
        integrationId: number,
        startDate: string,
        endDate: string,
    ): Promise<any> {
        const response = await fetch(
            `${this.baseUrl}/channel-manager/integrations/${integrationId}/availability-calendar?startDate=${startDate}&endDate=${endDate}`,
        );

        if (!response.ok) {
            throw new Error('Failed to fetch availability calendar');
        }

        return safeResponseJson(response);
    }

    async updateAvailability(
        integrationId: number,
        roomTypeId: number,
        date: string,
        availability: any,
    ): Promise<void> {
        const response = await fetch(
            `${this.baseUrl}/channel-manager/integrations/${integrationId}/availability`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ roomTypeId, date, availability }),
            },
        );

        if (!response.ok) {
            const error = await safeErrorJson(response);
            throw new Error(error.message || 'Failed to update availability');
        }
    }

    async updateRates(
        integrationId: number,
        roomTypeId: number,
        date: string,
        rates: any,
    ): Promise<void> {
        const response = await fetch(
            `${this.baseUrl}/channel-manager/integrations/${integrationId}/rates`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ roomTypeId, date, rates }),
            },
        );

        if (!response.ok) {
            const error = await safeErrorJson(response);
            throw new Error(error.message || 'Failed to update rates');
        }
    }

    // Advanced Features
    async getIntegrationHealth(integrationId: number): Promise<{
        status: string;
        issues: string[];
        recommendations: string[];
    }> {
        const response = await fetch(
            `${this.baseUrl}/channel-manager/integrations/${integrationId}/health`,
        );

        if (!response.ok) {
            throw new Error('Failed to fetch integration health');
        }

        return safeResponseJson(response);
    }

    async retryFailedSync(
        syncLogId: number,
    ): Promise<{ success: boolean; message: string }> {
        const response = await fetch(
            `${this.baseUrl}/channel-manager/sync-logs/${syncLogId}/retry`,
            {
                method: 'POST',
            },
        );

        if (!response.ok) {
            const error = await safeErrorJson(response);
            throw new Error(error.message || 'Failed to retry failed sync');
        }

        return safeResponseJson(response);
    }

    async getChannelFeatures(channelType: string): Promise<string[]> {
        const response = await fetch(
            `${this.baseUrl}/channel-manager/channels/${channelType}/features`,
        );

        if (!response.ok) {
            throw new Error('Failed to fetch channel features');
        }

        return safeResponseJson(response);
    }

    async getSupportedChannels(): Promise<string[]> {
        const response = await fetch(
            `${this.baseUrl}/channel-manager/channels/supported`,
        );

        if (!response.ok) {
            throw new Error('Failed to fetch supported channels');
        }

        return safeResponseJson(response);
    }
}

export const channelManagerService = new ChannelManagerService();
