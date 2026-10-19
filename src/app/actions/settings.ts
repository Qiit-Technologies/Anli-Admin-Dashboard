'use server';

/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  axiosGet,
  axiosPost,
  axiosPatch,
  isRedirectError,
} from '../lib/server-api';
import { AxiosError } from 'axios';
import { ErrorResponseData } from '../lib/types';

/**
 * HQ Settings server actions — admin-app half of the platform settings API.
 * All routes live under the backend's `/super-admin/settings` namespace,
 * guarded by AuthGuard('super-admin-jwt') + Roles('super-admin').
 */

function unwrap<T>(response: any): T {
  return (response?.data ?? response) as T;
}

function toError(error: unknown, fallback: string): never {
  if (isRedirectError(error)) throw error;
  const axiosError = error as AxiosError;
  const message =
    (axiosError.response?.data as ErrorResponseData)?.message || fallback;
  throw new Error(message);
}

export interface CompanyProfile {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
}

export interface EmailTemplate {
  slug: string;
  name: string;
  subject: string;
  body: string;
}

export interface SmsTemplate {
  slug: string;
  name: string;
  body: string;
}

export interface NotificationToggles {
  ticketAlerts: boolean;
  paymentAlerts: boolean;
  inactivityAlerts: boolean;
}

export interface Integration {
  id: number;
  name: string;
  provider: string;
  keyName: string;
  maskedSecret: string;
  isRevoked: boolean;
  createdAt: string;
  revokedAt: string | null;
}

/* ------------------------- company profile ------------------------- */

export async function getCompanyProfile(): Promise<CompanyProfile> {
  try {
    const response = await axiosGet('/super-admin/settings/company-profile', {
      currentPath: '/dashboard/settings',
    });
    return unwrap<CompanyProfile>(response);
  } catch (error: unknown) {
    toError(error, 'Failed to load company profile');
  }
}

export async function updateCompanyProfile(
  data: Partial<CompanyProfile>,
): Promise<CompanyProfile> {
  try {
    const response = await axiosPatch(
      '/super-admin/settings/company-profile',
      data,
      { currentPath: '/dashboard/settings' },
    );
    return unwrap<CompanyProfile>(response);
  } catch (error: unknown) {
    toError(error, 'Failed to update company profile');
  }
}

/* -------------------------- email templates -------------------------- */

export async function listEmailTemplates(): Promise<EmailTemplate[]> {
  try {
    const response = await axiosGet('/super-admin/settings/email-templates', {
      currentPath: '/dashboard/settings',
    });
    return unwrap<EmailTemplate[]>(response);
  } catch (error: unknown) {
    toError(error, 'Failed to load email templates');
  }
}

export async function updateEmailTemplate(
  slug: string,
  data: { subject?: string; body?: string },
): Promise<EmailTemplate> {
  try {
    const response = await axiosPatch(
      `/super-admin/settings/email-templates/${encodeURIComponent(slug)}`,
      data,
      { currentPath: '/dashboard/settings' },
    );
    return unwrap<EmailTemplate>(response);
  } catch (error: unknown) {
    toError(error, 'Failed to update email template');
  }
}

/* --------------------------- SMS templates --------------------------- */

export async function listSmsTemplates(): Promise<SmsTemplate[]> {
  try {
    const response = await axiosGet('/super-admin/settings/sms-templates', {
      currentPath: '/dashboard/settings',
    });
    return unwrap<SmsTemplate[]>(response);
  } catch (error: unknown) {
    toError(error, 'Failed to load SMS templates');
  }
}

export async function updateSmsTemplate(
  slug: string,
  data: { body?: string },
): Promise<SmsTemplate> {
  try {
    const response = await axiosPatch(
      `/super-admin/settings/sms-templates/${encodeURIComponent(slug)}`,
      data,
      { currentPath: '/dashboard/settings' },
    );
    return unwrap<SmsTemplate>(response);
  } catch (error: unknown) {
    toError(error, 'Failed to update SMS template');
  }
}

/* --------------------------- notifications --------------------------- */

export async function getNotificationToggles(): Promise<NotificationToggles> {
  try {
    const response = await axiosGet('/super-admin/settings/notifications', {
      currentPath: '/dashboard/settings',
    });
    return unwrap<NotificationToggles>(response);
  } catch (error: unknown) {
    toError(error, 'Failed to load notification settings');
  }
}

export async function updateNotificationToggles(
  data: Partial<NotificationToggles>,
): Promise<NotificationToggles> {
  try {
    const response = await axiosPatch(
      '/super-admin/settings/notifications',
      data,
      { currentPath: '/dashboard/settings' },
    );
    return unwrap<NotificationToggles>(response);
  } catch (error: unknown) {
    toError(error, 'Failed to update notification settings');
  }
}

/* --------------------------- integrations ---------------------------- */

export async function listIntegrations(): Promise<Integration[]> {
  try {
    const response = await axiosGet('/super-admin/settings/integrations', {
      currentPath: '/dashboard/settings',
    });
    return unwrap<Integration[]>(response);
  } catch (error: unknown) {
    toError(error, 'Failed to load integrations');
  }
}

export async function addIntegration(data: {
  name: string;
  provider: string;
  keyName: string;
  secretValue: string;
}): Promise<Integration> {
  try {
    const response = await axiosPost(
      '/super-admin/settings/integrations',
      data,
      { currentPath: '/dashboard/settings' },
    );
    return unwrap<Integration>(response);
  } catch (error: unknown) {
    toError(error, 'Failed to add integration');
  }
}

export async function revokeIntegration(id: number): Promise<Integration> {
  try {
    const response = await axiosPost(
      `/super-admin/settings/integrations/${id}/revoke`,
      {},
      { currentPath: '/dashboard/settings' },
    );
    return unwrap<Integration>(response);
  } catch (error: unknown) {
    toError(error, 'Failed to revoke integration');
  }
}

/* ------------------------- super-admin profile ------------------------ */

export interface SuperAdminMe {
  id: number;
  email: string;
  fullName: string;
  profileImage?: string | null;
  status?: string;
}

export async function getSuperAdminMe(): Promise<SuperAdminMe> {
  try {
    const response = await axiosGet('/super-admin/me', {
      currentPath: '/dashboard/settings',
    });
    return unwrap<SuperAdminMe>(response);
  } catch (error: unknown) {
    toError(error, 'Failed to load profile');
  }
}

export async function changeSuperAdminPassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  try {
    await axiosPost('/super-admin/change-password', data, {
      currentPath: '/dashboard/settings',
    });
  } catch (error: unknown) {
    toError(error, 'Failed to change password');
  }
}
