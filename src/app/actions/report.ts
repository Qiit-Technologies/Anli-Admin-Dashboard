import api from '@/lib/axios';
import { getAuthToken } from './auth/auth-token';

export async function getReportsByHotelId() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get('/guests/reports', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            const error = await response.data;
            return {
                error: error.message || 'Failed to fetch reports. Try again.',
            };
        }

        const data = await response.data;

        return { data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getTransactionReport(
    startDate?: Date | string,
    endDate?: Date | string,
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }
        let url = '/accounts/transactions/report';
        const params = new URLSearchParams();

        if (startDate) {
            params.append(
                'start_date',
                new Date(startDate).toISOString().split('T')[0],
            );
        }

        if (endDate) {
            params.append(
                'end_date',
                new Date(endDate).toISOString().split('T')[0],
            );
        }

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const response = await api.get(url, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            return {
                error:
                    response.data?.message ??
                    'Failed to fetch transactions report. Try again.',
            };
        }
        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getSalesReport(
    startDate?: Date | string,
    endDate?: Date | string,
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        // Only include baseDate in URL if it's provided
        let url = '/accounts/sales/report';
        const params = new URLSearchParams();

        if (startDate) {
            params.append(
                'start_date',
                new Date(startDate).toISOString().split('T')[0],
            );
        }

        if (endDate) {
            params.append(
                'end_date',
                new Date(endDate).toISOString().split('T')[0],
            );
        }

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const response = await api.get(url, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            return {
                error:
                    response.data?.message ??
                    'Failed to fetch sales report. Try again.',
            };
        }
        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function fetchStockReport(
    startDate?: Date | string,
    endDate?: Date | string,
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        // Build URL with optional parameters
        let url = '/accounts/stock/report';
        const params = new URLSearchParams();

        if (startDate) {
            params.append(
                'start_date',
                new Date(startDate).toISOString().split('T')[0],
            );
        }

        if (endDate) {
            params.append(
                'end_date',
                new Date(endDate).toISOString().split('T')[0],
            );
        }

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const response = await api.get(url, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            return {
                error:
                    response.data?.message ??
                    'Failed to fetch stock report. Try again.',
            };
        }
        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function fetchPayrollReport(
    startDate?: Date | string,
    endDate?: Date | string,
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        // Only include baseDate in URL if it's provided
        let url = '/accounts/payroll/report';
        const params = new URLSearchParams();

        if (startDate) {
            params.append(
                'start_date',
                new Date(startDate).toISOString().split('T')[0],
            );
        }

        if (endDate) {
            params.append(
                'end_date',
                new Date(endDate).toISOString().split('T')[0],
            );
        }

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const response = await api.get(url, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            return {
                error:
                    response.data?.message ??
                    'Failed to fetch payroll report. Try again.',
            };
        }
        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function fetchGuestReport(
    startDate?: Date | string,
    endDate?: Date | string,
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        // Only include baseDate in URL if it's provided
        let url = '/accounts/guest/report';
        const params = new URLSearchParams();

        if (startDate) {
            params.append(
                'start_date',
                new Date(startDate).toISOString().split('T')[0],
            );
        }

        if (endDate) {
            params.append(
                'end_date',
                new Date(endDate).toISOString().split('T')[0],
            );
        }

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const response = await api.get(url, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            return {
                error:
                    response.data?.message ??
                    'Failed to fetch guest report. Try again.',
            };
        }
        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function fetchInvoiceReport(
    startDate?: Date | string,
    endDate?: Date | string,
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        // Only include baseDate in URL if it's provided
        let url = '/accounts/invoice/report';
        const params = new URLSearchParams();

        if (startDate) {
            params.append(
                'start_date',
                new Date(startDate).toISOString().split('T')[0],
            );
        }

        if (endDate) {
            params.append(
                'end_date',
                new Date(endDate).toISOString().split('T')[0],
            );
        }

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const response = await api.get(url, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            return {
                error:
                    response.data?.message ??
                    'Failed to fetch invoice report. Try again.',
            };
        }
        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function fetchExpensesReport(
    startDate?: Date | string,
    endDate?: Date | string,
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        // Only include baseDate in URL if it's provided
        let url = '/accounts/expenses/report';
        const params = new URLSearchParams();

        if (startDate) {
            params.append(
                'start_date',
                new Date(startDate).toISOString().split('T')[0],
            );
        }

        if (endDate) {
            params.append(
                'end_date',
                new Date(endDate).toISOString().split('T')[0],
            );
        }

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const response = await api.get(url, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            return {
                error:
                    response.data?.message ??
                    'Failed to fetch expenses report. Try again.',
            };
        }
        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function fetchPettyCashReport(
    startDate?: Date | string,
    endDate?: Date | string,
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        // Only include baseDate in URL if it's provided
        let url = '/accounts/pettycash/report';
        const params = new URLSearchParams();

        if (startDate) {
            params.append(
                'start_date',
                new Date(startDate).toISOString().split('T')[0],
            );
        }

        if (endDate) {
            params.append(
                'end_date',
                new Date(endDate).toISOString().split('T')[0],
            );
        }

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const response = await api.get(url, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            return {
                error:
                    response.data?.message ??
                    'Failed to fetch petty cash report. Try again.',
            };
        }
        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function fetchVendorsReport(
    startDate?: Date | string,
    endDate?: Date | string,
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        // Only include baseDate in URL if it's provided
        let url = '/accounts/vendor/report';
        const params = new URLSearchParams();

        if (startDate) {
            params.append(
                'start_date',
                new Date(startDate).toISOString().split('T')[0],
            );
        }

        if (endDate) {
            params.append(
                'end_date',
                new Date(endDate).toISOString().split('T')[0],
            );
        }

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const response = await api.get(url, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            return {
                error:
                    response.data?.message ??
                    'Failed to fetch vendors report. Try again.',
            };
        }
        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function fetchCashFlowReport(
    startDate?: Date | string,
    endDate?: Date | string,
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        // Only include baseDate in URL if it's provided
        let url = '/accounts/cash-flow/report';
        const params = new URLSearchParams();

        if (startDate) {
            params.append(
                'start_date',
                new Date(startDate).toISOString().split('T')[0],
            );
        }

        if (endDate) {
            params.append(
                'end_date',
                new Date(endDate).toISOString().split('T')[0],
            );
        }

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const response = await api.get(url, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 500) {
            return {
                error:
                    response.data?.message ??
                    'Failed to fetch cash flow report. Try again.',
            };
        }
        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}
