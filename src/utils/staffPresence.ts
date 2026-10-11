/**
 * Staff presence display (M10).
 *
 * The backend tracks `status` (online/offline) plus `lastLoginAt` /
 * `lastLogoutAt` on the staff record. Derive what the UI may honestly claim:
 * - online: status is online AND the login is fresh (session tokens live ~24h,
 *   so a stale "online" flag means the session has expired).
 * - offline: the staff member has logged in before but is not currently online.
 * - unknown: no login record at all — shown as "Unknown" instead of a
 *   hardcoded "offline".
 */

export type StaffPresence = "online" | "offline" | "unknown";

const SESSION_FRESH_HOURS = 24;

export function getStaffPresence(staff: {
  status?: string | null;
  lastLoginAt?: string | null;
}): StaffPresence {
  const status = (staff.status ?? "").toLowerCase();
  if (status === "online") {
    if (staff.lastLoginAt) {
      const ageHours =
        (Date.now() - new Date(staff.lastLoginAt).getTime()) / 3_600_000;
      if (Number.isFinite(ageHours) && ageHours <= SESSION_FRESH_HOURS) {
        return "online";
      }
      return "offline";
    }
    return "online";
  }
  if (staff.lastLoginAt) return "offline";
  return "unknown";
}

export const STAFF_PRESENCE_LABEL: Record<StaffPresence, string> = {
  online: "Online",
  offline: "Offline",
  unknown: "Unknown",
};

export function formatLastLogin(lastLoginAt?: string | null): string {
  if (!lastLoginAt) return "Never";
  const d = new Date(lastLoginAt);
  if (Number.isNaN(d.getTime())) return "Never";
  return d.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
