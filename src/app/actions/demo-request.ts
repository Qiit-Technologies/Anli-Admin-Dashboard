import api from '@/lib/axios';

export async function CreateDemoRequest(formData: any) {
    try {
        const response = await api.post('/demo-request', formData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (response.status >= 500) {
            const error = await response.data;
            return {
                error:
                    error.message ||
                    'Failed to create demo request. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}
