import { BASE_URL } from '@/constants/api';
import api from '@/lib/axios';
import {
    CheckInType,
    CreateBookingDto,
    Member,
    MemberStatus,
    OnboardMemberType,
    UpdateBookingDto,
} from '@/types/membership/membership';
import { getAuthToken } from './auth/auth-token';
import { safeResponseJson, safeResponseJsonOrNull, safeErrorJson } from '@/lib/api';

export async function joinMembershipModule() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL('/membership/opt-in', BASE_URL).toString();
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            credentials: 'include',
        });
        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message ||
                    'Failed to join membership module. Please try again.',
            };
        }

        const data = await safeResponseJson(response);
        return {
            message:
                data.message || 'Membership module added to plan successfully',
        };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function createMembershipPlan(formData: any) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL('/membership/create-plan', BASE_URL).toString();
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(formData),
            credentials: 'include',
        });
        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message ||
                    'Failed to create membership plan. Please try again.',
            };
        }

        const data = await safeResponseJson(response);
        return {
            message:
                data.message || "You've successfully created a membership plan",
        };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getMembershipPlans() {
    const authToken = await getAuthToken();
    const { data } = await api.get('/membership/plans', {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
        },
    });
    return data;
}

export async function getMembers(params?: {
    page?: number;
    limit?: number;
    statusFilter?: string;
    memberType?: string;
    expiringWithinDays?: number;
}) {
    const authToken = await getAuthToken();
    const { data } = await api.get('/membership/members', {
        params,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
        },
    });
    return data;
}

export async function sendMemberQrCodeByEmail(memberId: string) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.post(
            `/membership/member/${memberId}/send-qr-email`,
            {},
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );

        if (response.status >= 400) {
            return {
                error:
                    response.data?.message ??
                    'Failed to send QR code email. Try again.',
            };
        }

        return {
            success: true,
            message:
                response.data?.message ??
                'QR code sent to member email successfully',
        };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getAllMembersForBooking(pagination?: {
    page?: number;
    limit?: number;
}) {
    const authToken = await getAuthToken();
    const { data } = await api.get('/membership/members/all', {
        params: pagination,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
        },
    });
    return data;
}

export async function addMember(formData: any) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL('/membership/add-member', BASE_URL).toString();
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(formData),
            credentials: 'include',
        });
        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message || 'Failed to add member. Please try again.',
            };
        }

        const data = await safeResponseJson(response);
        return {
            data: data.data,
            message:
                data.message ||
                'Member information has been stored successfully',
        };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function addMemberIdentification(memberId: string, formData: any) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.patch(
            `/membership/add-member-id/${memberId}`,
            formData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );

        if (response.status >= 400) {
            return {
                error:
                    response.data?.message ??
                    'Failed to add member identification. Try again.',
            };
        }

        return {
            message: 'Member identification information added successfully',
        };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function assignPlanToMember(memberId: string, formData: any) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.patch(
            `/membership/assign-plan/${memberId}`,
            formData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );

        if (response.status >= 400) {
            return {
                error:
                    response.data?.message ??
                    'Failed to assign plan to member. Try again.',
            };
        }

        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function addReferral(memberId: string, formData: any) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.patch(
            `/membership/add-referrals/${memberId}`,
            formData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );

        if (response.status >= 400) {
            return {
                error:
                    response.data?.message ??
                    'Failed to add referrals. Try again.',
            };
        }

        return {
            data: response.data?.data,
            message: response.data?.message ?? 'Referrals added successfully',
        };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function addReferredMembers(
    principalMemberId: string,
    referredMembers: any[],
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.post(
            `/membership/add-referred-members/${principalMemberId}`,
            { referredMembers },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );

        if (response.status >= 400) {
            return {
                error:
                    response.data?.message ??
                    'Failed to add referred members. Try again.',
            };
        }

        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function createReferralTier(formData: any) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL('/membership/tier', BASE_URL).toString();
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(formData),
            credentials: 'include',
        });
        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message ||
                    'Failed to create referral tier. Please try again.',
            };
        }

        const data = await safeResponseJson(response);
        return {
            data: data.data,
            message: data.message || 'Referral tier created successfully',
        };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getReferralTiers() {
    const authToken = await getAuthToken();
    const { data } = await api.get('/membership/tiers', {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
        },
    });
    return data;
}

export async function getReferredMembers(pagination?: {
    page?: number;
    limit?: number;
}) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const params = new URLSearchParams();
        if (pagination?.page) params.append('page', pagination.page.toString());
        if (pagination?.limit)
            params.append('limit', pagination.limit.toString());

        const apiUrl = new URL('/membership/referred-members', BASE_URL);
        if (params.toString()) {
            apiUrl.search = params.toString();
        }

        const response = await fetch(apiUrl.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                success: false,
                message: error.message || 'Failed to fetch referred members.',
            };
        }

        const data = await safeResponseJson(response);
        return { success: true, data };
    } catch (error: any) {
        console.error('Error fetching referred members:', error);
        return {
            success: false,
            message:
                'An unexpected error occurred while fetching referred members.',
        };
    }
}

export async function createFacility(formData: any) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL('/membership/facility', BASE_URL).toString();
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(formData),
            credentials: 'include',
        });
        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message ||
                    'Failed to create facility. Please try again.',
            };
        }

        const data = await safeResponseJson(response);
        return {
            data: data.data,
            message: data.message || 'Facility added successfully',
        };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getFacilities() {
    const authToken = await getAuthToken();
    const { data } = await api.get('/membership/facility', {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
        },
    });
    return data;
}

export async function deleteFacility(facilityId: number) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.delete(
            `/membership/facility/${facilityId}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );

        if (response.status >= 400) {
            return {
                error:
                    response.data?.message ??
                    'Failed to delete facility. Try again.',
            };
        }

        return { message: 'Facility has been removed successfully' };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function editFacility(facilityId: number, formData: any) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.patch(
            `/membership/facility/${facilityId}`,
            formData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );

        if (response.status >= 400) {
            return {
                error:
                    response.data?.message ??
                    'Failed to update facility details. Try again.',
            };
        }

        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getMemberById(memberId: string) {
    const authToken = await getAuthToken();
    const { data } = await api.get(`/membership/member/${memberId}`, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
        },
    });
    return data;
}

export async function editMemberStatus(memberId: string, status: MemberStatus) {
    try {
        const authToken = await getAuthToken();
        const { data } = await api.patch(
            `/membership/member/${memberId}`,
            { status },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );
        return data;
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function editMember(memberId: string, formData: Partial<Member>) {
    try {
        const authToken = await getAuthToken();
        const { data } = await api.patch(
            `/membership/member/${memberId}/edit`,
            formData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );
        return { data: data?.data ?? data };
    } catch (error: any) {
        return {
            error:
                error.response?.data?.message ||
                'An unexpected error occurred. Please try again.',
        };
    }
}

export async function deleteMember(memberId: string) {
    try {
        const authToken = await getAuthToken();
        const { data } = await api.delete(`/membership/member/${memberId}`, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });
        return data;
    } catch (error: any) {
        return {
            error:
                error.response?.data?.message ||
                'An unexpected error occurred. Please try again.',
        };
    }
}

export async function editMembershipPlan(planId: number, formData: any) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(
            `/membership/edit-plan/${planId}`,
            BASE_URL,
        ).toString();
        const response = await fetch(apiUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(formData),
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message ||
                    'Failed to update membership plan. Please try again.',
            };
        }

        const data = await safeResponseJson(response);
        return {
            data: data.data,
            message: data.message || 'Membership plan updated successfully',
        };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function deleteMembershipPlan(planId: string) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(
            `/membership/delete-plan/${planId}`,
            BASE_URL,
        ).toString();
        const response = await fetch(apiUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                message:
                    error.message ||
                    'Failed to delete membership plan. Please try again.',
            };
        }

        const data = await safeResponseJson(response);
        return {
            message: data.message || 'Membership plan deleted successfully',
        };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function updateReferralTier(tierId: number, formData: any) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(
            `/membership/tier/${tierId}`,
            BASE_URL,
        ).toString();
        const response = await fetch(apiUrl, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify(formData),
        });

        if (!response.ok) {
            const errorData = await safeErrorJson(response);
            return {
                message: errorData.message || 'Failed to update referral tier.',
            };
        }

        const data = await safeResponseJson(response);
        return data;
    } catch (error: any) {
        console.error('Error updating referral tier:', error);
        return {
            message: 'An error occurred while updating the referral tier.',
        };
    }
}

export async function updatePlanFacilityAccess(
    planId: number,
    facilityAccessData: any,
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const { data: plansData } = await api.get('/membership/plans', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        const membershipPlans =
            plansData?.data?.membershipPlans ||
            plansData?.membershipPlans ||
            [];
        const plan = membershipPlans.find((p: any) => p.id === planId);
        if (!plan || !plan.referralTiers) {
            return { message: 'Plan or referral tiers not found.' };
        }

        const updatePromises = plan.referralTiers.map(async (tier: any) => {
            const tierName = tier.name;
            const facilityIds: number[] = [];

            Object.entries(facilityAccessData).forEach(
                ([facilityId, tierAccess]: [string, any]) => {
                    if (tierAccess[tierName]) {
                        facilityIds.push(parseInt(facilityId));
                    }
                },
            );

            return updateReferralTier(tier.id, { facilityIds });
        });

        await Promise.all(updatePromises);
        return {
            success: true,
            message: 'Facility access updated successfully',
        };
    } catch (error: any) {
        console.error('Error updating plan facility access:', error);
        return {
            message: 'An error occurred while updating facility access.',
        };
    }
}

export async function getExpiringMemberships(days: number = 7) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get(
            `/membership/expiring-memberships?days=${days}`,
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );

        if (response.status >= 400) {
            return {
                error:
                    response.data?.message ??
                    'Failed to fetch expiring memberships. Try again.',
            };
        }

        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getExpiredMemberships() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.get('/membership/expired-memberships', {
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 400) {
            return {
                error:
                    response.data?.message ??
                    'Failed to fetch expired memberships. Try again.',
            };
        }

        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function expireMemberships() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.post(
            '/membership/expire-memberships',
            {},
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );

        if (response.status >= 400) {
            return {
                error:
                    response.data?.message ??
                    'Failed to expire memberships. Try again.',
            };
        }

        return { data: response.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function onboardMember(formData: OnboardMemberType) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const safeDate = (dateString: string | undefined): Date | undefined => {
            if (!dateString || dateString.trim() === '') {
                return undefined;
            }
            const date = new Date(dateString);
            return Number.isNaN(date.getTime()) ? undefined : date;
        };

        console.log('[OnboardMember] Form data received:', {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            planId: formData.planId,
            hasPhotoUrl: !!formData.photoUrl,
            hasIdentificationUrl: !!formData.identificationUrl,
            referredMembersCount: formData.referredMembers?.length || 0,
            userAgent:
                typeof window !== 'undefined' ? navigator.userAgent : 'server',
        });

        const payload = {
            principalMember: {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                workAddress: formData.workAddress,
                workEmail: formData.workEmail,
                dateOfBirth: safeDate(formData.dateOfBirth),
                gender: formData.gender,
                nationality: formData.nationality,
                occupation: formData.occupation,
                photoUrl: formData.photoUrl,
                identificationUrl: formData.identificationUrl,
                startDate: safeDate(formData.startDate),
                endDate: safeDate(formData.endDate),
                membershipTier: 'principal',
            },
            planId: formData.planId,
            startDate: formData.startDate,
            endDate: formData.endDate,
            referredMembers:
                formData.referredMembers?.map((member) => ({
                    firstName: member.firstName,
                    lastName: member.lastName,
                    email: member.email,
                    phone: member.phone,
                    workAddress: member.workAddress,
                    workEmail: member.workEmail,
                    dateOfBirth: safeDate(member.dateOfBirth),
                    gender: member.gender || 'other',
                    nationality: member.nationality,
                    occupation: member.occupation,
                    photoUrl: member.photoUrl,
                    identificationUrl: member.identificationUrl,
                    startDate: safeDate(member.startDate || formData.startDate),
                    endDate: safeDate(member.endDate || formData.endDate),
                    relationshipToPlanOwner: member.relationshipToPlanOwner,
                    membershipTier: member.membershipTier || 'referred',
                    referralTierId: member.referralTierId,
                })) || [],
        };

        console.log('[OnboardMember] Payload prepared:', {
            principalMember: {
                firstName: payload.principalMember.firstName,
                lastName: payload.principalMember.lastName,
                hasDateOfBirth: !!payload.principalMember.dateOfBirth,
                hasStartDate: !!payload.principalMember.startDate,
                hasEndDate: !!payload.principalMember.endDate,
            },
            planId: payload.planId,
            referredMembersCount: payload.referredMembers.length,
        });

        const response = await api.post('/membership/onboard-member', payload, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 400) {
            console.error('[OnboardMember] API returned error status:', {
                status: response.status,
                data: response.data,
            });
            return {
                error:
                    response.data?.message ??
                    'Failed to onboard member. Try again.',
            };
        }

        return { data: response.data };
    } catch (error: any) {
        if (error?.response?.data?.message) {
            return { error: error.response.data.message };
        }

        if (
            error?.code === 'ECONNABORTED' ||
            error?.message?.includes('timeout')
        ) {
            return {
                error: 'Request timed out. Please check your connection and try again.',
            };
        }

        if (
            error?.code === 'ERR_NETWORK' ||
            error?.message?.includes('Network Error')
        ) {
            return {
                error: 'Network error. Please check your connection and try again.',
            };
        }

        return {
            error: error?.message || 'An error occurred. Please try again.',
        };
    }
}

export async function createBooking(bookingData: CreateBookingDto) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.post('/membership/booking', bookingData, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        const responseData = response.data;

        if (!responseData.success) {
            return {
                error:
                    responseData.message ||
                    'Failed to create booking. Try again.',
            };
        }

        if (responseData.data?.booking?.success === false) {
            return {
                error:
                    responseData.data.booking.message ||
                    'Booking validation failed.',
            };
        }

        return {
            data: responseData.data,
            message: responseData.message || 'Booking created successfully',
        };
    } catch (error: any) {
        if (error.response?.data) {
            const errorData = error.response.data;

            if (errorData.data?.booking?.success === false) {
                return {
                    error:
                        errorData.data.booking.message ||
                        'Booking validation failed.',
                };
            }

            return {
                error:
                    errorData.message || 'Failed to create booking. Try again.',
            };
        }

        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getBookings(pagination?: {
    page?: number;
    limit?: number;
}) {
    const authToken = await getAuthToken();
    const { data } = await api.get('/membership/booking', {
        params: pagination,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
        },
    });
    return data;
}

export async function getMemberBookings(
    memberId: string,
    pagination?: {
        page?: number;
        limit?: number;
    },
) {
    const authToken = await getAuthToken();
    const { data } = await api.get(`/membership/booking/member/${memberId}`, {
        params: pagination,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
        },
    });
    return data;
}

export async function getBookingById(bookingId: number) {
    const authToken = await getAuthToken();
    const { data } = await api.get(`/membership/booking/${bookingId}`, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
        },
    });
    return data;
}

export async function updateBooking(
    bookingId: number,
    updateData: UpdateBookingDto,
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.patch(
            `/membership/booking/${bookingId}`,
            updateData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );

        if (response.status >= 400) {
            return {
                error:
                    response.data?.message ??
                    'Failed to update booking. Try again.',
            };
        }

        return {
            data: response.data,
            message: 'Booking updated successfully',
        };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function cancelBooking(
    bookingId: number,
    data?: { reason?: string },
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const response = await api.delete(`/membership/booking/${bookingId}`, {
            data,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        if (response.status >= 400) {
            return {
                error:
                    response.data?.message ??
                    'Failed to cancel booking. Try again.',
            };
        }

        return {
            data: response.data,
            message: 'Booking cancelled successfully',
        };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getDashboardStatistics() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const apiUrl = new URL(
            '/membership/dashboard/statistics',
            BASE_URL,
        ).toString();
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                error: error.message || 'Failed to fetch dashboard statistics.',
            };
        }

        const data = await safeResponseJson(response);
        return { data: data.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getMembershipBreakdownByTier() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const apiUrl = new URL(
            '/membership/dashboard/breakdown-by-tier',
            BASE_URL,
        ).toString();
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                error:
                    error.message ||
                    'Failed to fetch membership breakdown by tier.',
            };
        }

        const data = await safeResponseJson(response);
        return { data: data.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getMembershipExpiryAlerts() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const apiUrl = new URL(
            '/membership/dashboard/expiry-alerts',
            BASE_URL,
        ).toString();
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                error:
                    error.message ||
                    'Failed to fetch membership expiry alerts.',
            };
        }

        const data = await safeResponseJson(response);
        return { data: data.data };
    } catch (error: any) {
        return { error: 'An unexpected error occurred. Please try again.' };
    }
}

export async function getMembershipNotificationLogs(params?: {
    startDate?: string;
    endDate?: string;
    type?: string;
}) {
    const authToken = await getAuthToken();
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    if (params?.type) searchParams.set('type', params.type);

    const { data } = await api.get(
        `/membership/reports/notification-logs${searchParams.toString() ? `?${searchParams.toString()}` : ''}`,
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        },
    );
    return data;
}

export async function getGuestHistory(
    memberId: string,
    pagination?: {
        page?: number;
        limit?: number;
        startDate?: string;
        endDate?: string;
        facilityId?: number;
    },
) {
    const authToken = await getAuthToken();
    const params = new URLSearchParams();

    if (pagination?.page) params.append('page', pagination.page.toString());
    if (pagination?.limit) params.append('limit', pagination.limit.toString());
    if (pagination?.startDate) params.append('startDate', pagination.startDate);
    if (pagination?.endDate) params.append('endDate', pagination.endDate);
    if (pagination?.facilityId)
        params.append('facilityId', pagination.facilityId.toString());

    const { data } = await api.get(
        `/membership/member/${memberId}/guest-history?${params}`,
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        },
    );
    return data;
}

export async function getServiceUsageSummary(
    memberId: string,
    pagination?: {
        page?: number;
        limit?: number;
    },
) {
    const authToken = await getAuthToken();
    const params = new URLSearchParams();

    if (pagination?.page) params.append('page', pagination.page.toString());
    if (pagination?.limit) params.append('limit', pagination.limit.toString());

    const { data } = await api.get(
        `/membership/member/${memberId}/service-usage-summary?${params}`,
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        },
    );
    return data;
}

export async function getVisitLogs(
    memberId: string,
    pagination?: {
        page?: number;
        limit?: number;
        startDate?: string;
        endDate?: string;
        checkInType?: string;
        accessResult?: string;
        facilityId?: number;
    },
) {
    const authToken = await getAuthToken();
    const params = new URLSearchParams();

    if (pagination?.page) params.append('page', pagination.page.toString());
    if (pagination?.limit) params.append('limit', pagination.limit.toString());
    if (pagination?.startDate) params.append('startDate', pagination.startDate);
    if (pagination?.endDate) params.append('endDate', pagination.endDate);
    if (pagination?.checkInType)
        params.append('checkInType', pagination.checkInType);
    if (pagination?.accessResult)
        params.append('accessResult', pagination.accessResult);
    if (pagination?.facilityId)
        params.append('facilityId', pagination.facilityId.toString());

    const { data } = await api.get(
        `/membership/member/${memberId}/visit-logs?${params}`,
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        },
    );
    return data;
}

export async function getPurchaseHistory(
    memberId: string,
    pagination?: {
        page?: number;
        limit?: number;
        startDate?: string;
        endDate?: string;
        facilityId?: number;
    },
) {
    const authToken = await getAuthToken();
    const params = new URLSearchParams();

    if (pagination?.page) params.append('page', pagination.page.toString());
    if (pagination?.limit) params.append('limit', pagination.limit.toString());
    if (pagination?.startDate) params.append('startDate', pagination.startDate);
    if (pagination?.endDate) params.append('endDate', pagination.endDate);
    if (pagination?.facilityId)
        params.append('facilityId', pagination.facilityId.toString());

    const { data } = await api.get(
        `/membership/member/${memberId}/purchase-history?${params}`,
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        },
    );
    return data;
}

export async function searchMembersForCheckIn(
    searchTerm: string,
    facilityId?: number,
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const queryParams = new URLSearchParams({
            searchTerm,
        });
        if (facilityId) {
            queryParams.append('facilityId', facilityId.toString());
        }

        const apiUrl = new URL(
            `/membership/search-members?${queryParams.toString()}`,
            BASE_URL,
        ).toString();
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                success: false,
                message: error.message || 'Failed to search members.',
            };
        }

        const data = await safeResponseJson(response);
        return { success: true, members: data.members };
    } catch (error: any) {
        console.error('Error searching members:', error);
        return {
            success: false,
            message: 'An unexpected error occurred during member search.',
        };
    }
}

export async function checkInMember(checkInDetails: {
    memberId: string;
    facilityId: number;
    checkInType: CheckInType;
    purposeOfVisit: string;
    notes?: string;
    qrCode?: string;
}) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL('/membership/check-in', BASE_URL).toString();
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            credentials: 'include',
            body: JSON.stringify(checkInDetails),
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                success: false,
                message: error.message || 'Failed to check in member.',
            };
        }

        const data = await safeResponseJson(response);
        return { success: true, data };
    } catch (error: any) {
        console.error('Error checking in member:', error);
        return {
            success: false,
            message: 'An unexpected error occurred during check-in.',
        };
    }
}

export async function validateQRCode(qrCode: string) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(
            '/membership/check-in/qr-validate',
            BASE_URL,
        ).toString();
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            credentials: 'include',
            body: JSON.stringify({ qrCode }),
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                success: false,
                message: error.message || 'QR code validation failed.',
            };
        }

        const data = await safeResponseJson(response);
        return { success: true, data };
    } catch (error: any) {
        console.error('Error validating QR code:', error);
        return {
            success: false,
            message: 'An unexpected error occurred during QR code validation.',
        };
    }
}

export async function generateMemberQrCode(memberId: string) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(
            `/membership/member/${memberId}/generate-qr`,
            BASE_URL,
        ).toString();
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                success: false,
                message: error.message || 'Failed to generate member QR code.',
            };
        }

        const data = await safeResponseJson(response);
        return {
            success: true,
            qrCode: data.data.qrCode,
            member: data.data.member,
            message: data.message,
        };
    } catch (error: any) {
        console.error('Error generating member QR code:', error);
        return {
            success: false,
            message: 'An error occurred while generating the QR code.',
        };
    }
}

export async function getMemberQrCode(memberId: string) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(`/qr/member/${memberId}`, BASE_URL).toString();
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                success: false,
                message: error.message || 'Failed to fetch member QR code.',
            };
        }

        const data = await safeResponseJson(response);
        return {
            success: true,
            qrCode: data.data.qrCode,
            message: data.message,
        };
    } catch (error: any) {
        console.error('Error fetching member QR code:', error);
        return {
            success: false,
            message: 'An error occurred while fetching the QR code.',
        };
    }
}

export async function getPrintOptimizedMemberQrCode(
    memberId: string,
    size: 'small' | 'medium' | 'large' = 'medium',
) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { message: 'Authentication token not found.' };
        }

        const apiUrl = new URL(
            `/qr/member/${memberId}/print/${size}`,
            BASE_URL,
        ).toString();
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await safeErrorJson(response);
            return {
                success: false,
                message:
                    error.message || 'Failed to fetch print-optimized QR code.',
            };
        }

        const data = await safeResponseJson(response);
        return {
            success: true,
            qrCode: data.data.qrCode,
            size: data.data.size,
            optimizedForPrint: data.data.optimizedForPrint,
            message: data.message,
        };
    } catch (error: any) {
        console.error('Error fetching print-optimized QR code:', error);
        return {
            success: false,
            message:
                'An error occurred while fetching the print-optimized QR code.',
        };
    }
}

export async function getCheckedInMembers(pagination?: {
    page?: number;
    limit?: number;
}) {
    const authToken = await getAuthToken();
    const params = new URLSearchParams();

    if (pagination?.page) params.append('page', pagination.page.toString());
    if (pagination?.limit) params.append('limit', pagination.limit.toString());

    const { data } = await api.get(`/membership/checked-in-members?${params}`, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
        },
    });
    return data;
}
export async function getTodaysBirthdays() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const { data } = await api.get('/membership/birthdays/today', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authToken}`,
            },
        });

        return data;
    } catch (error: any) {
        console.error("Error fetching today's birthdays:", error);
        return { error: "Failed to fetch today's birthdays" };
    }
}

export async function getUpcomingBirthdays(days: number = 7) {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const { data } = await api.get(
            `/membership/birthdays/upcoming?days=${days}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );

        return data;
    } catch (error: any) {
        console.error('Error fetching upcoming birthdays:', error);
        return { error: 'Failed to fetch upcoming birthdays' };
    }
}

export async function sendBirthdayNotifications() {
    try {
        const authToken = await getAuthToken();
        if (!authToken) {
            return { error: 'Authentication token not found.' };
        }

        const { data } = await api.post(
            '/membership/birthdays/send-notifications',
            {},
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
            },
        );

        return data;
    } catch (error: any) {
        console.error('Error sending birthday notifications:', error);
        return { error: 'Failed to send birthday notifications' };
    }
}
