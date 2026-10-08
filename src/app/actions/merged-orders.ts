import api from '@/lib/axios';
import { getAuthToken } from './auth/auth-token';

export interface MergeOrdersData {
    orderIds: number[];
    guestName: string;
    guestEmail?: string;
    guestPhoneNumber?: string;
    notes?: string;
}

export interface MergedOrder {
    id: number;
    guestName: string;
    guestEmail?: string;
    guestPhoneNumber?: string;
    notes?: string;
    status: 'ACTIVE' | 'CANCELLED' | 'COMPLETED';
    totalAmount: number;
    paidAmount: number;
    paymentStatus?: string;
    paymentMethod?: string;
    createdAt: Date;
    updatedAt: Date;
    items: MergedOrderItem[];
    createdBy?: {
        id: number;
        fullName: string;
    };
}

export interface MergedOrderItem {
    id: number;
    itemName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    notes?: string;
    specialInstructions?: string;
    menuItemId?: number;
}

export const mergeOrders = async (data: MergeOrdersData) => {
    console.log(data);
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.post('/orders/merge', data, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error: error.message || 'Failed to merge orders. Try again.',
            };
        }
        const responseData = await response.data;
        return { data: responseData };
    } catch (error: any) {
        console.error('Error merging orders:', error);
        throw error;
    }
};
