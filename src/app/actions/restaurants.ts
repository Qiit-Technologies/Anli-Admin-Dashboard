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

  // Branding & Story
  headline?: string | null;
  description?: string | null;
  amenities?: string[] | string | null;

  // Contact & Web
  website?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;

  // Social Media
  twitterUrl?: string | null;
  linkedinUrl?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;

  // Location & Hours
  city?: string | null;
  neighborhood?: string | null;
  weekdayHours?: string | null;
  weekendHours?: string | null;
  closeTime?: string | null;

  // Pricing & Promo
  priceLevel?: string | null;
  averageCostForTwo?: number | null;
  promoTitle?: string | null;
  promoDescription?: string | null;

  // Dining Details
  whyDinersLoveUs?: string[] | string | null;
  serviceTypes?: string[] | string | null;
  dietaryPreferences?: string[] | string | null;
}

/** Serialise all fields to FormData so arrays/strings go as comma-separated strings */
function toFormData(
  data: Partial<RestaurantCatalogItem> & { file?: File | null },
): FormData {
  const fd = new FormData();

  const append = (key: string, value: string | number | boolean) =>
    fd.append(key, String(value));

  const appendArrayOrString = (
    key: string,
    val: string | string[] | null | undefined,
  ) => {
    if (val === undefined || val === null) return;
    if (Array.isArray(val)) {
      if (val.length > 0) append(key, val.join(","));
    } else if (typeof val === "string" && val.trim() !== "") {
      append(key, val);
    }
  };

  if (data.name) append("name", data.name);
  if (data.address !== undefined && data.address !== null)
    append("address", data.address);
  if (data.tags !== undefined && data.tags !== null) append("tags", data.tags);
  if (data.displayHours !== undefined && data.displayHours !== null)
    append("displayHours", data.displayHours);
  if (typeof data.rating === "number") append("rating", data.rating);
  if (typeof data.ratingCount === "number")
    append("ratingCount", data.ratingCount);
  if (typeof data.isBookable === "boolean") append("isBookable", data.isBookable);
  if (typeof data.isActive === "boolean") append("isActive", data.isActive);
  if (data.file) fd.append("file", data.file);

  // Branding & Story
  if (data.headline !== undefined && data.headline !== null)
    append("headline", data.headline);
  if (data.description !== undefined && data.description !== null)
    append("description", data.description);
  appendArrayOrString("amenities", data.amenities);

  // Contact & Web
  if (data.website !== undefined && data.website !== null)
    append("website", data.website);
  if (data.contactEmail !== undefined && data.contactEmail !== null)
    append("contactEmail", data.contactEmail);
  if (data.contactPhone !== undefined && data.contactPhone !== null)
    append("contactPhone", data.contactPhone);

  // Social Media
  if (data.twitterUrl !== undefined && data.twitterUrl !== null)
    append("twitterUrl", data.twitterUrl);
  if (data.linkedinUrl !== undefined && data.linkedinUrl !== null)
    append("linkedinUrl", data.linkedinUrl);
  if (data.instagramUrl !== undefined && data.instagramUrl !== null)
    append("instagramUrl", data.instagramUrl);
  if (data.facebookUrl !== undefined && data.facebookUrl !== null)
    append("facebookUrl", data.facebookUrl);

  // Location & Hours
  if (data.city !== undefined && data.city !== null) append("city", data.city);
  if (data.neighborhood !== undefined && data.neighborhood !== null)
    append("neighborhood", data.neighborhood);
  if (data.weekdayHours !== undefined && data.weekdayHours !== null)
    append("weekdayHours", data.weekdayHours);
  if (data.weekendHours !== undefined && data.weekendHours !== null)
    append("weekendHours", data.weekendHours);
  if (data.closeTime !== undefined && data.closeTime !== null)
    append("closeTime", data.closeTime);

  // Pricing & Promo
  if (data.priceLevel !== undefined && data.priceLevel !== null)
    append("priceLevel", data.priceLevel);
  if (typeof data.averageCostForTwo === "number")
    append("averageCostForTwo", data.averageCostForTwo);
  if (data.promoTitle !== undefined && data.promoTitle !== null)
    append("promoTitle", data.promoTitle);
  if (data.promoDescription !== undefined && data.promoDescription !== null)
    append("promoDescription", data.promoDescription);

  // Dining Details
  appendArrayOrString("whyDinersLoveUs", data.whyDinersLoveUs);
  appendArrayOrString("serviceTypes", data.serviceTypes);
  appendArrayOrString("dietaryPreferences", data.dietaryPreferences);

  return fd;
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
    const response = await axiosPost<{
      success: boolean;
      data: RestaurantCatalogItem;
      message: string;
    }>("/super-admin/hotels/scraped-restaurants", toFormData(data), {
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
    const response = await axiosPatch<{
      success: boolean;
      data: RestaurantCatalogItem;
      message: string;
    }>(`/super-admin/hotels/scraped-restaurants/${id}`, toFormData(data), {
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
