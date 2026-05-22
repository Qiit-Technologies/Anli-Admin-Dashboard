"use server";

import { AxiosError } from "axios";
import { axiosGet, axiosPatch, axiosPost, isRedirectError } from "../lib/api";
import { getBusinessListResponse, GetBusinessListOptions } from "./types";
import { ErrorResponseData } from "../lib/types";
import { BusinessDTO } from "@/types/business";

export default async function getBusinessList(
  options: GetBusinessListOptions = {}
): Promise<getBusinessListResponse> {
  const { page = 1, limit = 10, searchTerm } = options;

  try {
    const baseUrl = searchTerm
      ? `/super-admin/hotels/search/${encodeURIComponent(searchTerm)}`
      : `/super-admin/hotels`;

    const url = `${baseUrl}?page=${page}&limit=${limit}`;

    const response = await axiosGet<getBusinessListResponse>(url, {
      currentPath: "/business-list",
    });

    if (!response) {
      return {
        message: "No data received",
        data: {
          hotels: [],
        },
        page,
        limit,
        total: 0,
      };
    }

    return response;
  } catch (error: unknown) {
    if (isRedirectError(error)) throw error;

    const axiosError = error as AxiosError;

    // Don't return empty data on 401 - let the error propagate so the UI can handle it
    // This prevents the redirect from happening in the error handler
    if (axiosError.response?.status === 401) {
      throw error; // Re-throw 401 so it can be handled by the component
    }

    const message =
      (axiosError.response?.data as ErrorResponseData)?.message ||
      "An unexpected error occurred";

    return {
      message,
      data: {
        hotels: [],
      },
      page,
      limit,
      total: 0,
    };
  }
}

export async function updateHotelServices(hotelId: string, services: string) {
  try {
    const url = `/super-admin/hotels/${hotelId}`;
    const response = await axiosPatch(
      url,
      { services },
      {
        currentPath: "/dashboard/details",
      }
    );

    return response;
  } catch (error: unknown) {
    if (isRedirectError(error)) throw error;

    const axiosError = error as AxiosError;
    const message =
      (axiosError.response?.data as ErrorResponseData)?.message ||
      "An unexpected error occurred";
    throw new Error(message);
  }
}

export async function reactivateBusiness(hotelId: number) {
  try {
    const url = `/super-admin/${hotelId}/billing/reactivate`;
    const response = await axiosPost(
      url,
      {},
      {
        currentPath: "/business-list",
      }
    );

    return response;
  } catch (error: unknown) {
    if (isRedirectError(error)) throw error;

    const axiosError = error as AxiosError;
    const message =
      (axiosError.response?.data as ErrorResponseData)?.message ||
      "An unexpected error occurred";
    throw new Error(message);
  }
}

export async function createBusiness(data: {
  name: string;
  address: string;
  businessType: string;
  ownerEmail: string;
  ownerFirstName: string;
  ownerLastName: string;
  ownerPhoneNumber: string;
}) {
  try {
    const url = `/super-admin/hotels`;
    const response = await axiosPost(url, data, {
      currentPath: "/business-list",
    });

    return response;
  } catch (error: unknown) {
    if (isRedirectError(error)) throw error;

    const axiosError = error as AxiosError;
    const message =
      (axiosError.response?.data as ErrorResponseData)?.message ||
      "Failed to create business";
    throw new Error(message);
  }
}

export async function updateBusiness(hotelId: string, data: any) {
  try {
    const url = `/super-admin/hotels/${hotelId}`;
    const response = await axiosPatch(
      url,
      data,
      {
        currentPath: "/dashboard/details",
      }
    );

    return response;
  } catch (error: unknown) {
    if (isRedirectError(error)) throw error;

    const axiosError = error as AxiosError;
    const message =
      (axiosError.response?.data as ErrorResponseData)?.message ||
      "An unexpected error occurred";
    throw new Error(message);
  }
}

export async function uploadBusinessCoverImage(hotelId: string, formData: FormData): Promise<{ url: string } | undefined> {
  try {
    const url = `/super-admin/hotels/${hotelId}/cover-image`;
    const response = await axiosPost<{ url: string }>(
      url,
      formData,
      {
        config: {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
        currentPath: "/dashboard/details",
      }
    );

    return response;
  } catch (error: unknown) {
    if (isRedirectError(error)) throw error;

    const axiosError = error as AxiosError;
    const message =
      (axiosError.response?.data as ErrorResponseData)?.message ||
      "Failed to upload cover image";
    throw new Error(message);
  }
}

export async function uploadBusinessGalleryImage(hotelId: string, formData: FormData): Promise<{ url: string; images: string[] } | undefined> {
  try {
    const url = `/super-admin/hotels/${hotelId}/gallery-image`;
    const response = await axiosPost<{ url: string; images: string[] }>(
      url,
      formData,
      {
        config: {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
        currentPath: "/dashboard/details",
      }
    );

    return response;
  } catch (error: unknown) {
    if (isRedirectError(error)) throw error;

    const axiosError = error as AxiosError;
    const message =
      (axiosError.response?.data as ErrorResponseData)?.message ||
      "Failed to upload gallery image";
    throw new Error(message);
  }
}

export async function getBusinessDetails(hotelId: string): Promise<{ success: boolean; data: { hotel: BusinessDTO }; message: string } | undefined> {
  try {
    const url = `/super-admin/hotels/${hotelId}`;
    const response = await axiosGet<{ success: boolean; data: { hotel: BusinessDTO }; message: string }>(url, {
      currentPath: "/dashboard/details",
    });

    return response;
  } catch (error: unknown) {
    if (isRedirectError(error)) throw error;

    const axiosError = error as AxiosError;
    const message =
      (axiosError.response?.data as ErrorResponseData)?.message ||
      "Failed to fetch business details";
    throw new Error(message);
  }
}



