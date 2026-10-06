'use server';

import api from '@/lib/axios';
import { validatePhone } from '@/lib/helpers';
import { setAccessTokenCookie } from '@/lib/set-access-token-cookie';
import { cookies } from 'next/headers';

export async function signup(formData: FormData) {
    const name = formData.get('name');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const password = formData.get('password');
    const address = formData.get('address');
    const state = formData.get('state');
    const country = formData.get('country');
    // const registrationNumber = formData.get('registrationNumber');
    const businessType = formData.get('businessType');

    const form = {
        name,
        email,
        password,
        phone,
        address,
        state,
        country,
        // registrationNumber,
        businessType,
    };

    const missingFields = Object.entries(form)
        .filter(([value]) => value == null) // Checks for null or undefined
        .map(([key]) => key);

    if (missingFields.length > 0) {
        console.error(`Missing fields: ${missingFields.join(', ')}`);
        throw new Error('All fields are required');
    }

    if (phone !== null && !validatePhone(phone.toString())) {
        throw new Error('Invalid phone number');
    }

    try {
        const response = await api.post('/users', {
            fullName: null,
            orgName: name,
            email,
            phoneNumber: phone,
            password,
            address,
            state,
            country,
            // registrationNumber,
            businessType,
        });

        if (response.status !== 201) {
            const errorData = await response.data;
            throw new Error(errorData.message || 'Signup failed');
        }
        const data = await response.data;
        return { success: true, data };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        throw new Error(error.message || 'An error occurred during signup');
    }
}

export async function signin(formData: FormData) {
    const email = formData.get('email');
    const password = formData.get('password');

    try {
        const response = await api.post('/auth/login', { email, password });
        if (response.status !== 200) {
            const error = await response.data;
            return {
                message: error.message,
            };
        }

        const accessToken = response?.data?.access_token;
        if (accessToken) {
            await setAccessTokenCookie(accessToken);
        }

        return {
            message: 'Sign-in successful!',
            data: response?.data?.data,
            token: accessToken,
        };
    } catch (error: any) {
        return {
            message:
                (
                    error as unknown as {
                        response?: { data?: { message?: string } };
                    }
                )?.response?.data?.message ||
                'An unexpected error occurred. Please try again.',
        };
    }
}

export async function signout() {
    try {
        await api.post('/auth/logout');
    } catch (error: any) {
        if (error?.response?.status !== 401) {
            console.error('Logout API failed:', error);
        }
    }

    const cookieStore = await cookies();

    // Delete for all possible domains to prevent cookie bleeding
    const domains = [
        undefined, // Host-only
        '.weareanli.com', // Root production
        '.anli.solutions', // Root staging
        'localhost', // Local dev
    ];

    const tokens = ['access_token', 'authToken', 'token', 'access_tokrn'];

    // Also clear without domain (for host-only cookies)
    tokens.forEach((tokenName) => {
        cookieStore.set(tokenName, '', {
            path: '/',
            expires: new Date(0),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });
    });

    domains.forEach((domain) => {
        tokens.forEach((tokenName) => {
            cookieStore.set(tokenName, '', {
                path: '/',
                expires: new Date(0),
                domain: domain,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
            });
        });
    });

    return true;
}
