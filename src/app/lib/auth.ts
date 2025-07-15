import { cookies } from "next/headers";

export async function getAuthToken() {
  const _cookies = cookies();
  const token = (await _cookies).get("access_token");
  return token?.value ?? null;
}
