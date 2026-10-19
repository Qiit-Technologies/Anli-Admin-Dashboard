import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function HeaderActions({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
      {children}
    </div>
  );
}

export function PageHeader({ children }: { children: ReactNode }) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      {children}
    </header>
  );
}

export function PageHeadertitle({
  title,
  subtitle,
  hasBack = false,
}: {
  title: string;
  subtitle?: string;
  hasBack?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      {hasBack && (
        <Link
          href="/dashboard/crm"
          aria-label="Back to leads"
          className="mt-1 rounded-md p-1 text-gray-500 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
      )}
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      </div>
    </div>
  );
}
