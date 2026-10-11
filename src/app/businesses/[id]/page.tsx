"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/context/userContext";
import { useBusiness } from "@/context/businessContext";
import { getBusinessDetails } from "@/app/actions/business";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next13-progressbar";

/**
 * H4: deep-linkable business route — /superadmin/businesses/:id
 * (basePath '/superadmin' is applied automatically).
 *
 * Establishes the business context from the URL param, then hands off to
 * the existing General Info page. The context-sidebar flow is untouched:
 * context is still persisted to localStorage by useBusiness, so every
 * /dashboard/* page keeps working as before.
 */
export default function BusinessDeepLinkPage() {
  const params = useParams<{ id: string }>();
  const { user, loading: userLoading } = useUser();
  const { setBusiness } = useBusiness();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userLoading && (!user || Object.keys(user).length < 1)) {
      router.replace("/login");
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    const id = params?.id;
    if (userLoading || !user || !id) return;
    let cancelled = false;
    getBusinessDetails(String(id))
      .then((res) => {
        if (cancelled) return;
        const hotel = res?.data?.hotel;
        if (hotel) {
          setBusiness(hotel);
          router.replace("/dashboard/details");
        } else {
          setError("Business not found.");
        }
      })
      .catch(() => {
        if (!cancelled) setError("Could not load this business.");
      });
    return () => {
      cancelled = true;
    };
  }, [params?.id, user, userLoading, setBusiness, router]);

  if (userLoading || (!error && user && Object.keys(user).length > 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="md" className="mx-auto mb-4" />
          <p>Loading business...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-800 mb-2">{error}</p>
          <Link
            href="/business-list"
            className="text-[#F47411] hover:underline text-sm font-medium"
          >
            Back to business list
          </Link>
        </div>
      </div>
    );
  }

  return null; // Will redirect to login
}
