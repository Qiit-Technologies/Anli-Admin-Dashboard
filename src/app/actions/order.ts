import { BASE_URL } from '@/constants/api';
import api from '@/lib/axios';
import { getAuthToken } from './auth/auth-token';
import {
    safeResponseJson,
    safeResponseJsonOrNull,
    safeErrorJson,
} from '@/lib/api';

export async function createOrder(order: any) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.post('/orders', order, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error: error.message || 'Failed to create order. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function createGuestPendingOrder(order: any, hotelId: string) {
    try {
        const payload = {
            guestName: order.guestName,
            guestPhoneNumber: order.phoneNumber,
            guestEmail: order.guestEmail,
            orderType: order.orderType,
            totalPrice: order.totalAmount,
            items: order.items,
            table: order.table,
            room: order.room,
            kitchenId: order?.kitchen,
        };

        const response = await api.post(
            `/orders/${hotelId}/guest-pending-order`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        );
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error: error.message || 'Failed to create order. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function createGuestPaidOrder(order: any, hotelId: string) {
    try {
        const payload = {
            guestName: order.guestName,
            guestPhoneNumber: order.phoneNumber,
            guestEmail: order.guestEmail,
            orderType: order.orderType,
            totalPrice: order.totalAmount,
            items: order.items,
            table: order.table,
            room: order.room,
        };

        const response = await api.post(
            `/orders/${hotelId}/guest-paid-order`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        );
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error: error.message || 'Failed to create order. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function updateOrder(id: number, order: any) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.patch(`/orders/${id}`, order, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.response.data.message ||
                    'Failed to update order. Try again.',
            };
        } else {
            const data = await response.data;
            return { data };
        }
    } catch (error: any) {
        return {
            error: error
                ? (error as any)?.response.data.message
                : 'An unexpected error occurred. Please try again.',
        };
    }
}

export async function updatePublicOrder(id: number, order: any) {
    try {
        console.log(order);
        const response = await api.patch(`/orders/${id}`, order, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error: error.message || 'Failed to update order. Try again.',
            };
        } else {
            const data = await response.data;
            return { data };
        }
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function markAsReady(id: number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.patch(
            `/orders/${id}/mark-ready`,
            {},
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to mark order as ready. Try again.',
            };
        } else {
            const data = await response.data;
            return { data };
        }
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getOrders() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/orders', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error: error.message || 'Failed to get orders. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getOrderById(id: number) {
    try {
        // Validate the ID before making the request
        if (!id || isNaN(id) || id <= 0) {
            return {
                error: `Invalid order ID: "${id}". Order ID must be a valid positive number.`,
            };
        }

        const response = await api.get(`/orders/${id}`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error: error.message || 'Failed to get order. Try again.',
            };
        } else {
            const data = await response.data;
            return { data };
        }
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getOrderByType(type: string) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get(`/orders/order-type?orderType=${type}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error: error.message || 'Failed to get orders. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getPostedRoomBills(params?: {
    businessDate?: string;
    workPeriodId?: number;
}) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const qs = new URLSearchParams();
        if (params?.businessDate)
            qs.append('businessDate', params.businessDate);
        if (params?.workPeriodId != null)
            qs.append('workPeriodId', String(params.workPeriodId));

        const response = await api.get(
            `/orders/posted-room-bills${qs.toString() ? `?${qs.toString()}` : ''}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error: error.message || 'Failed to get posted room bills.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getOrdersByTableId(tableId: number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get(`/orders/table/${tableId}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ??
                    'Failed to get order by table ID. Try again.',
            };
        } else {
            const data = await response.data;
            return { data };
        }
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getIncomingOrders() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/orders/incoming', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to get incoming orders. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getMergeableOrders() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/orders/mergeable', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to get mergeable orders. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getSentOrders() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/orders/sent', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error: error.message || 'Failed to get sent orders. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function addOrderToBill(
    id: number,
    roomId?: number,
    roomComp = false,
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.patch(
            `/orders/add-to-bill`,
            {
                id,
                ...(roomId != null && !Number.isNaN(roomId) ? { roomId } : {}),
                ...(roomComp ? { roomComp: true } : {}),
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message || 'Failed to add order to bill. Try again.',
            };
        } else {
            const data = await response.data;
            return { data };
        }
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function removeOrderFromBill(id: number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.patch(
            `/orders/remove-from-bill`,
            { id },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to remove order from bill. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getIncomingOrderStats() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/orders/incoming-stats', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to get incoming orders stats. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function cancelOrder(id: number, cancelledReason: string) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const apiUrl = new URL(`/orders/cancel-order`, BASE_URL).toString();
        const response = await fetch(apiUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ id, cancelledReason }),
            credentials: 'include',
        });

        if (!response.ok) {
            const errorData = await safeErrorJson(response);
            return {
                error:
                    errorData.message || 'Failed to cancel order. Try again.',
            };
        }

        return { message: 'Order cancelled successfully!' };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function voidOrder(id: number, voidReason: string) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const apiUrl = new URL(`/orders/void-order`, BASE_URL).toString();
        const response = await fetch(apiUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({ id, voidReason }),
            credentials: 'include',
        });

        if (!response.ok) {
            const errorData = await safeErrorJson(response);
            return {
                error:
                    errorData.message || 'Failed to void order. Try again.',
            };
        }

        const data = await safeResponseJsonOrNull(response);
        return { data, message: 'Order voided successfully!' };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getRoomOrders() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/orders/room-service', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error: error.message || 'Failed to get room orders. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getHomeDeliveryStats() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/orders/home-delivery-stats', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to get home delivery orders stats. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getOrderManagementMetrics() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/orders/management-metrics', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to get orders management metrics. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getOrderSalesMetrics() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/orders/sales-metrics', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to get orders sales metrics. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getSalesByDineInAreaMetrics() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/orders/sales-by-dine-in-metrics', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to get orders sales by dine in area metrics. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getWaiterStats() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/orders/waiter-stats', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to get orders by waiter stats. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getRevenueGeneratedPerWaiter() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/orders/waiter-revenue', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to get orders by waiter. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getItemStats() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/orders/item-stats', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error: error.message || 'Failed to get item stats. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getItemStatsInDepth() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/orders/item-depth-stats', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to get item depth stats. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getMenuCategoryStats() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/orders/menu-category-stats', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to get menu category stats. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getCategoryData() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/orders/menu-category-data', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to get menu category data. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getDineAreaStats() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/orders/dine-in-area-stats', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to get dine in area stats. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getHourlySalesBreakdown() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/orders/hourly-sales-breakdown', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to get hourly sales breakdown. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getCardStatInDepth() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/orders/card-stats', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error: error.message || 'Failed to get card stats. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getKitchenStaffStats() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/orders/kitchen-staff-stats', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to get kitchen staff stats. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}
export async function getKitchenStaffReport() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/orders/kitchen-staff-report', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to get kitchen staff report. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getWaiterPerformanceStats(waiterId: number | null) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get(
            `/orders/waiter-performance-stats?waiterId=${waiterId}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to get kitchen staff report. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getStaffPerformanceOverview() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/orders/waiter-performance-overview', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to get staff performance overview. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}
export async function getStaffRevenueData() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/orders/waiter-revenue-data', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to get waiter revenue data. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getKDSPerformanceData() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/orders/kds-performance-data', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to get kds performance data. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getPaymentMethodStats() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/orders/payment-method-stats', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to get kds performance data. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function markItemAsReady(id: string | number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.patch(
            `/orders/item/${Number(id)}/ready`,
            {},
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to mark item order as ready. Try again.',
            };
        } else {
            const data = await response.data;
            return { data };
        }
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function findPastGuests() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/orders/past-guests', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error: error.message || 'Failed to get past guests. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function markItemAsComplete(id: string | number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.patch(
            `/orders/${Number(id)}/mark-as-complete`,
            {},
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to mark item order as completed. Try again.',
            };
        } else {
            const data = await response.data;
            return { data };
        }
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getOrderHistory(workPeriodId?: string | number | null) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const url = '/orders/order-history';
        const response = await api.get(url, {
            params: workPeriodId ? { workPeriodId } : {},
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message || 'Failed to get order history. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function searchOrders(query: string) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/orders/search', {
            params: { q: query },
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error: error.message || 'Failed to search orders. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getDailySalesReport() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/orders/daily-sales-report', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            const error = await response.data;
            return {
                error: error.message || 'Failed to get daily sales report.',
            };
        } else {
            const data = await response.data;
            return { data };
        }
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getHalfDaySalesReport() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/orders/half-day-sales-report', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            const error = await response.data;
            return {
                error: error.message || 'Failed to get half day sales report.',
            };
        } else {
            const data = await response.data;
            return { data };
        }
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getOrderSummary() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/orders/query/summary', {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to fetch order summary. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getRunningOrders() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/orders/query/running', {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to fetch running orders. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getSettledOrders() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/orders/query/settled', {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to fetch settled orders. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getAllOrdersToday() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/orders/query/all', {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error: error.message || 'Failed to fetch orders. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getOrderCounts() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/orders/query/counts', {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message || 'Failed to fetch order counts. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getReadyOrders() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/orders/query/ready', {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message || 'Failed to fetch ready orders. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getItemHourlySalesBreakdown(params?: {
    startDate?: string;
    endDate?: string;
    menuType?: string;
    includeCancelled?: boolean;
}) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const qs = new URLSearchParams();
        if (params?.startDate) qs.append('startDate', params.startDate);
        if (params?.endDate) qs.append('endDate', params.endDate);
        if (params?.menuType) qs.append('menuType', params.menuType);
        if (params?.includeCancelled !== undefined)
            qs.append('includeCancelled', String(params.includeCancelled));

        const url = `/orders/item-hourly-sales-breakdown${qs.toString() ? `?${qs.toString()}` : ''}`;

        const response = await api.get(url, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to get item hourly sales breakdown. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getCashierSalesReport(params: {
    startDate: string;
    startTime?: string;
    endDate: string;
    endTime?: string;
    outletId?: string | number;
    cashierId?: string | number;
    orderType?: string;
    menuType?: string;
    showVoidedReceipts?: boolean;
    showDetailedReceiptList?: boolean;
    showMenuItemBreakdown?: boolean;
}) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const qs = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== '') {
                qs.append(key, String(value));
            }
        });

        const url = `/orders/cashier-sales-report${qs.toString() ? `?${qs.toString()}` : ''}`;

        const response = await api.get(url, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to get cashier sales report. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return {
            error:
                (error as any)?.response?.data?.message ||
                'An unexpected error occurred. Please try again.',
        };
    }
}

export async function getWorkPeriodReport(params: {
    startDate: string;
    startTime?: string;
    endDate: string;
    endTime?: string;
    orderType?: string;
}) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const qs = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== '') {
                qs.append(key, String(value));
            }
        });
        const url = `/orders/work-period-report${qs.toString() ? `?${qs.toString()}` : ''}`;
        const response = await api.get(url, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to get work period report. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return {
            error:
                (error as any)?.response?.data?.message ||
                'An unexpected error occurred. Please try again.',
        };
    }
}

export async function getWorkPeriodControlSheet(
    workPeriodId?: number | string | null,
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get(`/orders/work-period-control-sheet`, {
            params: workPeriodId ? { workPeriodId } : {},
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message || 'Failed to get control sheet. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return {
            error:
                (error as any)?.response?.data?.message ||
                'An unexpected error occurred. Please try again.',
        };
    }
}

export async function getMenuItemListSalesReport(params: {
    startDate: string;
    startTime?: string;
    endDate: string;
    endTime?: string;
    orderType?: string;
    dineAreaId?: number;
}) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const qs = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== '') {
                qs.append(key, String(value));
            }
        });
        const url = `/orders/menu-item-list-sales-report${qs.toString() ? `?${qs.toString()}` : ''}`;
        const response = await api.get(url, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to get menu item list sales report. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return {
            error:
                (error as any)?.response?.data?.message ||
                'An unexpected error occurred. Please try again.',
        };
    }
}

export async function getTopLowSellingItemsReport(params: {
    period?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
    startDate?: string;
    startTime?: string;
    endDate?: string;
    endTime?: string;
    orderType?: string;
    dineAreaId?: number;
    limit?: number;
}) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const qs = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== '') {
                qs.append(key, String(value));
            }
        });
        const url = `/orders/top-low-selling-items-report${qs.toString() ? `?${qs.toString()}` : ''}`;
        const response = await api.get(url, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to get top and low selling items report. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return {
            error:
                (error as any)?.response?.data?.message ||
                'An unexpected error occurred. Please try again.',
        };
    }
}

export async function printKOT(orderId: number, newItemsOnly: boolean = false) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.post(
            `/orders/${orderId}/print/kot`,
            { printNewItemsOnly: newItemsOnly },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );

        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to generate KOT print data. Try again.',
            };
        }

        const data = await response.data;
        return { data };
    } catch (error: any) {
        return {
            error: 'An unexpected error occurred while printing KOT. Please try again.',
        };
    }
}

export async function printBOT(orderId: number, newItemsOnly: boolean = false) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.post(
            `/orders/${orderId}/print/bot`,
            { printNewItemsOnly: newItemsOnly },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );

        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to generate BOT print data. Try again.',
            };
        }

        const data = await response.data;
        return { data };
    } catch (error: any) {
        return {
            error: 'An unexpected error occurred while printing BOT. Please try again.',
        };
    }
}

export async function printReceipt(orderId: number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.post(
            `/orders/${orderId}/print/receipt`,
            {},
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );

        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to generate receipt print data. Try again.',
            };
        }

        const data = await response.data;
        return { data };
    } catch (error: any) {
        return {
            error: 'An unexpected error occurred while printing receipt. Please try again.',
        };
    }
}

export type ComplimentOrderPayload = {
    orderItemIds: number[];
    staffId: number;
    complimentReason: string;
    pin?: string;
    complimentaryAmount?: number;
};

function formatNestErrorMessage(data: unknown): string | undefined {
    if (!data || typeof data !== 'object') return undefined;
    const message = (data as { message?: string | string[] }).message;
    if (typeof message === 'string') return message;
    if (Array.isArray(message)) return message.filter(Boolean).join(', ');
    return undefined;
}

export async function complimentOrder(
    orderId: number,
    payload: ComplimentOrderPayload,
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.patch(
            `/orders/${orderId}/compliment`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );

        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    formatNestErrorMessage(error) ||
                    'Failed to apply no charge. Try again.',
            };
        }

        const data = await response.data;
        return { data };
    } catch (error: unknown) {
        const data =
            error &&
            typeof error === 'object' &&
            'response' in error &&
            (error as { response?: { data?: unknown } }).response?.data;
        return {
            error:
                formatNestErrorMessage(data) ||
                'An unexpected error occurred while applying no charge. Please try again.',
        };
    }
}

export async function getComplimentOrderStats() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/orders/compliment/stat', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message || 'Failed to get order history. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getComplimentOrderHistory(query: string) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get(`/orders/compliment/history${query}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message || 'Failed to get order history. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function applyOrderDiscount(
    orderId: number,
    data: {
        discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
        discountValue: number;
        discountReason: string;
    },
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.patch(`/orders/${orderId}/discount`, data, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 400) {
            const error = response.data;
            return {
                error:
                    error?.message ||
                    'Failed to apply discount. Try again.',
            };
        }
        return { data: response.data };
    } catch (error: any) {
        return {
            error:
                (error as any)?.response?.data?.message ||
                'An unexpected error occurred while applying discount.',
        };
    }
}

export async function applyOrderWaiver(
    orderId: number,
    data: {
        vat?: boolean;
        serviceCharge?: boolean;
        tip?: boolean;
        customCharges?: boolean;
        waiverReason?: string;
    },
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.patch(`/orders/${orderId}/waive`, data, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error: error.message || 'Failed to apply waiver. Try again.',
            };
        }
        const result = await response.data;
        return { data: result };
    } catch (error: any) {
        return {
            error:
                (error as any)?.response?.data?.message ||
                'An unexpected error occurred while applying waiver.',
        };
    }
}
