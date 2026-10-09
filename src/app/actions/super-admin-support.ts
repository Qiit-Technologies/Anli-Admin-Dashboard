/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { AxiosError } from "axios";
import {
  axiosGet,
  axiosPatch,
  axiosPost,
  isRedirectError,
} from "../lib/api";
import { ErrorResponseData } from "../lib/types";

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";

export type TicketSenderType = "hotel_staff" | "super_admin";

export interface TicketMessage {
  id: string | number;
  senderType: TicketSenderType;
  senderName: string;
  message: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string | number;
  ticketNumber: string;
  hotelId: string | number;
  hotelName: string;
  createdByName: string;
  createdByEmail: string;
  subject: string;
  category: string;
  priority: string;
  description: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}

export interface TicketListResponse {
  data: SupportTicket[];
  total: number;
  page: number;
  limit: number;
}

export interface TicketFilters {
  status?: string;
  priority?: string;
  search?: string;
  hotelId?: string | number;
  page?: number;
  limit?: number;
}

function toErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as AxiosError;
  return (
    (axiosError.response?.data as ErrorResponseData)?.message || fallback
  );
}

export async function getSupportTickets(
  filters: TicketFilters = {},
): Promise<TicketListResponse> {
  try {
    const params: Record<string, string | number> = {};
    if (filters.status) params.status = filters.status;
    if (filters.priority) params.priority = filters.priority;
    if (filters.search) params.search = filters.search;
    if (filters.hotelId !== undefined && filters.hotelId !== "")
      params.hotelId = filters.hotelId;
    params.page = filters.page ?? 1;
    params.limit = filters.limit ?? 20;

    const response = await axiosGet<TicketListResponse>(
      "/super-admin/support/tickets",
      { params, currentPath: "/admin/support" },
    );

    if (!response) {
      return { data: [], total: 0, page: params.page as number, limit: params.limit as number };
    }

    return response;
  } catch (error: unknown) {
    if (isRedirectError(error)) throw error;
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 401) {
      throw error;
    }
    throw new Error(toErrorMessage(error, "Failed to load support tickets"));
  }
}

export async function getSupportTicket(
  id: string | number,
): Promise<SupportTicket> {
  try {
    const response = await axiosGet<SupportTicket>(
      `/super-admin/support/tickets/${id}`,
      { currentPath: "/admin/support" },
    );

    if (!response) {
      throw new Error("Ticket not found");
    }

    return response;
  } catch (error: unknown) {
    if (isRedirectError(error)) throw error;
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 401) {
      throw error;
    }
    throw new Error(toErrorMessage(error, "Failed to load ticket details"));
  }
}

export async function updateTicketStatus(
  id: string | number,
  status: TicketStatus,
): Promise<SupportTicket | undefined> {
  try {
    const response = await axiosPatch<SupportTicket>(
      `/super-admin/support/tickets/${id}/status`,
      { status },
      { currentPath: "/admin/support" },
    );

    return response;
  } catch (error: unknown) {
    if (isRedirectError(error)) throw error;
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 401) {
      throw error;
    }
    throw new Error(toErrorMessage(error, "Failed to update ticket status"));
  }
}

export async function replyToTicket(
  id: string | number,
  message: string,
): Promise<TicketMessage | undefined> {
  try {
    const response = await axiosPost<TicketMessage>(
      `/super-admin/support/tickets/${id}/messages`,
      { message },
      { currentPath: "/admin/support" },
    );

    return response;
  } catch (error: unknown) {
    if (isRedirectError(error)) throw error;
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 401) {
      throw error;
    }
    throw new Error(toErrorMessage(error, "Failed to send reply"));
  }
}
