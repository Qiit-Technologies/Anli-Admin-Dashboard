import api from '@/lib/axios';

export interface NewsletterSubscriptionData {
    email: string;
    source?: string;
}

export async function subscribeToNewsletter(data: NewsletterSubscriptionData) {
    try {
        const response = await api.post('/newsletter/subscribe', data, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.status >= 400) {
            const error = await response.data;
            return {
                success: false,
                error:
                    error.message ||
                    'Failed to subscribe to newsletter. Please try again.',
            };
        }

        const responseData = await response.data;
        return {
            success: true,
            message:
                responseData.message ||
                'Successfully subscribed to newsletter!',
            data: responseData.data,
        };
    } catch (error: any) {
        return {
            success: false,
            error:
                error.response?.data?.message ||
                'An unexpected error occurred. Please try again.',
        };
    }
}

export async function unsubscribeFromNewsletter(email: string) {
    try {
        const response = await api.post(
            '/newsletter/unsubscribe',
            { email },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            },
        );

        if (response.status >= 400) {
            const error = await response.data;
            return {
                success: false,
                error:
                    error.message ||
                    'Failed to unsubscribe from newsletter. Please try again.',
            };
        }

        const responseData = await response.data;
        return {
            success: true,
            message:
                responseData.message ||
                'Successfully unsubscribed from newsletter!',
        };
    } catch (error: any) {
        return {
            success: false,
            error:
                error.response?.data?.message ||
                'An unexpected error occurred. Please try again.',
        };
    }
}
