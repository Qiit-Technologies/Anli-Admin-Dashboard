import { redirect } from "next/navigation";

/**
 * The support ticket queue moved to the HQ command center at /dashboard/support.
 * This route now redirects there.
 */
export default function AdminSupportRedirect() {
  redirect("/dashboard/support");
}
