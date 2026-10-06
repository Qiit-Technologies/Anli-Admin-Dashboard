import api from '@/lib/axios';
import { getAuthToken } from './auth/auth-token';

export async function printToIP(
    printData: string,
    type: 'receipt' | 'kot' | 'bot',
    printerIp?: string,
    printerPort?: number,
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const requestBody: {
            data: string;
            type: 'receipt' | 'kot' | 'bot';
            printerIp?: string;
            printerPort?: number;
        } = {
            data: printData,
            type: type,
        };

        if (printerIp) {
            requestBody.printerIp = printerIp;
        }
        if (printerPort) {
            requestBody.printerPort = printerPort;
        }

        const response = await api.post('/print/ip', requestBody, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            const error = await response.data;
            return {
                error: error.message || 'Failed to print. Try again.',
            };
        }

        const data = await response.data;
        return { data };
    } catch (error: any) {
        // Extract error message from response if available
        if (error.response?.data?.message) {
            return {
                error: error.response.data.message,
            };
        }
        if (error.response?.data?.error) {
            return {
                error: error.response.data.error,
            };
        }
        return {
            error:
                error.message ||
                'An unexpected error occurred during printing. Please try again.',
        };
    }
}

export async function testPrinterConnection() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.post(
            '/print/test-connection',
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
                    'Failed to test printer connection. Try again.',
            };
        }

        const data = await response.data;
        return { data };
    } catch (error: any) {
        return {
            error: 'An unexpected error occurred during printer test. Please try again.',
        };
    }
}

export async function printReportToIP(printData: string) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.post(
            '/print/ip',
            {
                data: printData,
                type: 'report',
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
                    error.message ||
                    'Failed to print report to thermal printer. Try again.',
            };
        }
        const data = await response.data;
        return { data };
    } catch (error: any) {
        return {
            error:
                error.response?.data?.message ||
                error.response?.data?.error ||
                'An unexpected error occurred during printing. Please try again.',
        };
    }
}

export async function printSalesReportToIP(reportData: string) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.post(
            '/print/ip',
            {
                data: reportData,
                type: 'sales-report',
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
                    error.message || 'Failed to print sales report. Try again.',
            };
        }

        const data = await response.data;
        return { data };
    } catch (error: any) {
        return {
            error: 'An unexpected error occurred during sales report printing. Please try again.',
        };
    }
}

export async function fetchPrintStatus() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.get('/print/status', {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        return { data: response.data };
    } catch (error: any) {
        return {
            error:
                error.response?.data?.message ||
                'Failed to load printer status.',
        };
    }
}

export async function retryFailedPrintJobs() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        const response = await api.post(
            '/print/retry-failed',
            {},
            {
                headers: { Authorization: `Bearer ${authToken}` },
            },
        );
        return { data: response.data };
    } catch (error: any) {
        return {
            error:
                error.response?.data?.message ||
                'Failed to retry print jobs.',
        };
    }
}
