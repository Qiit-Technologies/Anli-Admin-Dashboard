"use client";

import { Button } from "@/components/ui/button";
import { LayoutGridIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const BusinessListNavButton = () => {
  const pathname = usePathname();

  // Don't show if already on business-list page
  if (pathname === "/business-list" || pathname.startsWith("/business-list")) {
    return null;
  }

  return (
    <Link href="/business-list">
      <Button
        className="absolute top-8 -right-5 h-10 w-10 rounded-full bg-[#FF6F00] hover:bg-[#FF6F00]/90 text-white z-99 shadow-lg"
        title="Business List"
      >
        <LayoutGridIcon />
      </Button>
    </Link>
  );
};

export default BusinessListNavButton;
