import { cookies } from "next/headers";

export async function getAuthToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token");
  } else {
    const cookieStore = await cookies();
    return cookieStore.get("access_token")?.value || null;
  }
}

export async function getAuthHeaders(): Promise<{ Authorization: string }> {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("Authentication token not found.");
  }

  return { Authorization: `Bearer ${token}` };
}

export async function getServerAuthToken() {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value || null;
}
