import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(fullName: string): string {
  if (!fullName) return "";

  const names = fullName.trim().split(" ");
  const initials = names
    .filter((n) => n.length > 0)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");

  return initials;
}

export function capitalize(str: string) {
  console.log(str);
  const strArr = str.split("");
  strArr[0] = strArr[0].toUpperCase();

  return strArr.join("");
}

export function removeUnderscore(str: string) {
  return str.replace("_", " ");
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

export function formatPlanRenewalDate(renewal_date: string): string {
  // Parse the ISO date string into a Date object
  const renewalDate = new Date(renewal_date);
  const today = new Date();

  // Format the date into "Month Day, Year"
  const formattedDate = renewalDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Calculate the difference in days (ignoring time of day)
  const msPerDay = 1000 * 60 * 60 * 24;
  const diffInMs = renewalDate.getTime() - today.getTime();
  const diffInDays = Math.ceil(diffInMs / msPerDay);

  // Decide whether it's in the future or past
  if (diffInDays > 0) {
    return `${formattedDate}, ${diffInDays} day${diffInDays > 1 ? "s" : ""} left`;
  } else if (diffInDays === 0) {
    return `${formattedDate}, today`;
  } else {
    const daysPast = Math.abs(diffInDays);
    return `${formattedDate}, ${daysPast} day${daysPast > 1 ? "s" : ""} past`;
  }
}

export function generateModuleArr(modulesString: string): string[] {
  const modules = modulesString.split(",");
  return modules.map((module) => module.trim());
}
