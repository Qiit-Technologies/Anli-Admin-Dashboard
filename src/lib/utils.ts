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

export function generateModuleArr(modulesString: string): string[] {
  const modules = modulesString.split(",");
  return modules.map((module) => module.trim());
}
