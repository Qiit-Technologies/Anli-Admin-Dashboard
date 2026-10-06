export async function getAuthToken() {
  if (typeof window !== "undefined") {
    // Client-side: get from localStorage
    return localStorage.getItem("access_token");
  } else {
    // Server-side: dynamically import cookies to avoid client-side bundling
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    return cookieStore.get("access_token")?.value || null;
  }
}

export async function getServerAuthToken() {
  // This should only be called on the server
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  return cookieStore.get("access_token")?.value || null;
}
