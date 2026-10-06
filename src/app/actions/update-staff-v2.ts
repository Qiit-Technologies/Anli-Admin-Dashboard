'use server';

import api from '@/lib/axios';
import { getAuthToken } from './auth/auth-token';

export interface UpdateStaffV2Payload {
    fullName?: string;
    email?: string;
    username?: string;
    roleId?: number;
    modules?: number[];
    permissions?: number[];
    pin?: string;
    isActive?: boolean;
}

export async function updateStaffV2(
    staffId: number,
    payload: UpdateStaffV2Payload,
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        // 1. Update the staff member
        // The backend @Patch(':id') handles fullName, email, roleId, modules, permissions
        const response = await api.patch(`/staff/${staffId}`, payload, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        const updatedStaff = response.data;

        // 2. If PIN is provided, update it via the specific PIN endpoint
        if (payload.pin) {
            try {
                await api.patch(
                    `/staff/${staffId}/pin`,
                    { newPin: payload.pin },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${authToken}`,
                        },
                    },
                );
            } catch (pinError) {
                console.error(
                    'Failed to update PIN during staff edit:',
                    pinError,
                );
                return {
                    message:
                        'Staff updated successfully, but PIN update failed.',
                    data: updatedStaff,
                };
            }
        }

        return { message: 'Staff updated successfully', data: updatedStaff };
    } catch (error: any) {
        console.error('UpdateStaffV2 Error:', error);
        return {
            message:
                error.response?.data?.message ||
                'Failed to update staff. Please try again.',
            error: error.message,
        };
    }
}
