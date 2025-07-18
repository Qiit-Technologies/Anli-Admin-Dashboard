"use server";

import { AxiosError } from "axios";
import { axiosGet, axiosPost, axiosPatch, axiosDelete } from "../lib/api";
import { getAuthToken } from "../lib/auth";
import { ErrorResponseData } from "../lib/types";

export interface Module {
  id: number;
  name: string;
  description?: string;
  createdAt: Date;
  deletedAt?: Date;
}

export interface CreateModuleDto {
  name: string;
  description?: string;
}

export interface UpdateModuleDto {
  name?: string;
  description?: string;
}

export type modulesResponse = {
  message: string;
  data: Module[];
};

export type moduleResponse = {
  message: string;
  data: Module;
};

// Get all modules
export default async function getModulesList(): Promise<Module[]> {
  try {
    const authToken = await getAuthToken();

    const url = `/modules`;

    const response = await axiosGet<Module[]>(url, {
      config: {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      },
    });

    if (!response) {
      return [];
    }

    return response;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    console.error("Error fetching modules:", axiosError);
    return [];
  }
}

// Create a new module
export async function createModule(
  moduleData: CreateModuleDto
): Promise<moduleResponse> {
  try {
    const authToken = await getAuthToken();

    if (!authToken) {
      throw new Error("No authentication token found");
    }

    const url = `/modules`;

    const response = await axiosPost<moduleResponse>(url, moduleData, {
      config: {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      },
    });

    if (!response) {
      throw new Error("No data received from API");
    }

    return response;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    const message =
      (axiosError.response?.data as ErrorResponseData)?.message ||
      "An unexpected error occurred";

    throw new Error(message);
  }
}

// Update a module
export async function updateModule(
  id: number,
  moduleData: UpdateModuleDto
): Promise<moduleResponse> {
  try {
    const authToken = await getAuthToken();

    const url = `/modules/${id}`;

    const response = await axiosPatch<moduleResponse>(url, moduleData, {
      config: {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      },
    });

    if (!response) {
      throw new Error("No data received");
    }

    return response;
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    const message =
      (axiosError.response?.data as ErrorResponseData)?.message ||
      "An unexpected error occurred";

    throw new Error(message);
  }
}

// Delete a module
export async function deleteModule(id: number): Promise<void> {
  try {
    const authToken = await getAuthToken();

    const url = `/modules/${id}`;

    await axiosDelete(url, {
      config: {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      },
    });
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    const message =
      (axiosError.response?.data as ErrorResponseData)?.message ||
      "An unexpected error occurred";

    throw new Error(message);
  }
}
