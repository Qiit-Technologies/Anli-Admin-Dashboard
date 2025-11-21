"use server";

import { AxiosError } from "axios";
import { axiosGet, axiosPost, axiosPatch, axiosDelete } from "../lib/api";
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
    const url = `/modules`;

    const response = await axiosGet<Module[]>(url);

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
    const url = `/modules`;

    const response = await axiosPost<moduleResponse>(url, moduleData);

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
    const url = `/modules/${id}`;

    const response = await axiosPatch<moduleResponse>(url, moduleData);

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
    const url = `/modules/${id}`;

    await axiosDelete(url);
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    const message =
      (axiosError.response?.data as ErrorResponseData)?.message ||
      "An unexpected error occurred";

    throw new Error(message);
  }
}
