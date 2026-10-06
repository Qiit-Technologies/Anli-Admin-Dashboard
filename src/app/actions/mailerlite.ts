import api from '@/lib/axios';

export interface CampaignData {
    subject: string;
    html: string;
}

export async function sendNewsletterCampaign(campaignData: CampaignData) {
    try {
        const response = await api.post(
            '/newsletter/mailerlite/campaign',
            campaignData,
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
                    'Failed to send newsletter campaign. Please try again.',
            };
        }

        const responseData = await response.data;
        return {
            success: true,
            message:
                responseData.message ||
                'Newsletter campaign sent successfully!',
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

export async function getMailerLiteSubscribers() {
    try {
        const response = await api.get('/newsletter/mailerlite/subscribers', {
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
                    'Failed to fetch subscribers. Please try again.',
            };
        }

        const responseData = await response.data;
        return {
            success: true,
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
