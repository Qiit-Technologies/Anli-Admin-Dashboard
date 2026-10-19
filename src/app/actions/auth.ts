"use server";

import { cookies } from "next/headers";

export async function setAuthCookie(token: string): Promise<void> {
  if (!token.trim()) {
    throw new Error("Authentication token is required.");
  }

  const cookieStore = await cookies();
  cookieStore.set("access_token", token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 2,
  });
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("access_token");
}
