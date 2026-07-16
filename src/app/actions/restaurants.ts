"use server";

import { AxiosError } from "axios";
import { axiosGet, axiosPatch, axiosPost, isRedirectError } from "../lib/api";
import { ErrorResponseData } from "../lib/types";

export interface RestaurantCatalogItem {
  id: number;
  name: string;
  address?: string | null;
  coverImage?: string | null;
  images?: string[] | null;
  rating?: number | null;
  ratingCount?: number | null;
  tags?: string | null;
  displayHours?: string | null;
  isBookable?: boolean;
  isActive?: boolean;
  latitude?: number | null;
  longitude?: number | null;
}

export async function getScrapedRestaurants(): Promise<
  RestaurantCatalogItem[]
> {
  try {
    const response = await axiosGet<{
      success: boolean;
      data: RestaurantCatalogItem[];
      message: string;
    }>("/super-admin/hotels/scraped-restaurants", {
      currentPath: "/restaurants",
    });

    return Array.isArray(response?.data) ? response.data : [];
  } catch (error: unknown) {
    if (isRedirectError(error)) throw error;

    const axiosError = error as AxiosError;
    const message =
      (axiosError.response?.data as ErrorResponseData)?.message ||
      "An unexpected error occurred";
    throw new Error(message);
  }
}

export async function createScrapedRestaurant(
  data: Partial<RestaurantCatalogItem> & { file?: File | null },
) {
  try {
    const formData = new FormData();

    if (data.name) formData.append("name", data.name);
    if (data.address) formData.append("address", data.address);
    if (data.tags) formData.append("tags", data.tags);
    if (data.displayHours) formData.append("displayHours", data.displayHours);
    if (typeof data.rating === "number")
      formData.append("rating", String(data.rating));
    if (typeof data.ratingCount === "number")
      formData.append("ratingCount", String(data.ratingCount));
    if (typeof data.isBookable === "boolean")
      formData.append("isBookable", String(data.isBookable));
    if (typeof data.isActive === "boolean")
      formData.append("isActive", String(data.isActive));
    if (data.file) formData.append("file", data.file);

    const response = await axiosPost<{
      success: boolean;
      data: RestaurantCatalogItem;
      message: string;
    }>("/super-admin/hotels/scraped-restaurants", formData, {
      config: {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
      currentPath: "/restaurants",
    });

    return response?.data;
  } catch (error: unknown) {
    if (isRedirectError(error)) throw error;

    const axiosError = error as AxiosError;
    const message =
      (axiosError.response?.data as ErrorResponseData)?.message ||
      "Failed to create restaurant";
    throw new Error(message);
  }
}

export async function updateScrapedRestaurant(
  id: number,
  data: Partial<RestaurantCatalogItem> & { file?: File | null },
) {
  try {
    const formData = new FormData();

    if (data.name) formData.append("name", data.name);
    if (data.address) formData.append("address", data.address);
    if (data.tags) formData.append("tags", data.tags);
    if (data.displayHours) formData.append("displayHours", data.displayHours);
    if (typeof data.rating === "number")
      formData.append("rating", String(data.rating));
    if (typeof data.ratingCount === "number")
      formData.append("ratingCount", String(data.ratingCount));
    if (typeof data.isBookable === "boolean")
      formData.append("isBookable", String(data.isBookable));
    if (typeof data.isActive === "boolean")
      formData.append("isActive", String(data.isActive));
    if (data.file) formData.append("file", data.file);

    const response = await axiosPatch<{
      success: boolean;
      data: RestaurantCatalogItem;
      message: string;
    }>(`/super-admin/hotels/scraped-restaurants/${id}`, formData, {
      config: {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
      currentPath: "/restaurants",
    });

    return response?.data;
  } catch (error: unknown) {
    if (isRedirectError(error)) throw error;

    const axiosError = error as AxiosError;
    const message =
      (axiosError.response?.data as ErrorResponseData)?.message ||
      "Failed to update restaurant";
    throw new Error(message);
  }
}

export async function deleteScrapedRestaurant(id: number) {
  try {
    const response = await axiosPost<{ success: boolean; message: string }>(
      `/super-admin/hotels/scraped-restaurants/${id}/delete`,
      {},
      {
        currentPath: "/restaurants",
      },
    );

    return response;
  } catch (error: unknown) {
    if (isRedirectError(error)) throw error;

    const axiosError = error as AxiosError;
    const message =
      (axiosError.response?.data as ErrorResponseData)?.message ||
      "Failed to delete restaurant";
    throw new Error(message);
  }
}
