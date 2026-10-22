'use server';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { axiosGet, axiosPatch } from '../lib/server-api';

/**
 * Career Applications server actions — admin-app half of the careers module.
 *
 * The backend routes (`GET /career-applications`, `PATCH
 * /career-applications/admin/applications/:id/status`) are guarded by
 * `AuthGuard('super-admin-jwt')`; the super-admin JWT is attached
 * automatically by the server-api auth wrapper. Applications are submitted
 * publicly from the marketing site's careers page — this section is where
 * the team receives and processes them.
 */

export type CareerApplicationStatus =
    | 'pending'
    | 'reviewing'
    | 'interview'
    | 'hired'
    | 'rejected';

export interface CareerApplication {
    id: string;
    fullName: string;
    email: string;
    positionId: string;
    positionTitle: string;
    linkedinUrl?: string | null;
    portfolioUrl?: string | null;
    cvFilePath?: string | null;
    currentLocation: string;
    projectExperience: string;
    whyAnli: string;
    availability: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export async function getCareerApplications(): Promise<{
    data?: CareerApplication[];
    error?: string;
}> {
    try {
        const data = await axiosGet<CareerApplication[]>('/career-applications');
        return { data: data ?? [] };
    } catch (error: any) {
        return {
            error: error?.message || 'Failed to fetch career applications.',
        };
    }
}

export async function updateCareerApplicationStatus(
    id: string,
    status: CareerApplicationStatus,
): Promise<{ data?: CareerApplication; error?: string }> {
    try {
        const data = await axiosPatch<CareerApplication>(
            `/career-applications/admin/applications/${id}/status`,
            { status },
        );
        return { data };
    } catch (error: any) {
        return {
            error: error?.message || 'Failed to update application status.',
        };
    }
}
