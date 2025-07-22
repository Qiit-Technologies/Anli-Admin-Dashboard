import { cookies } from "next/headers";

export async function getAuthToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token");
  } else {
    const cookieStore = await cookies();
    return cookieStore.get("access_token")?.value || null;
  }
}

export async function getServerAuthToken() {
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value || null;
}
