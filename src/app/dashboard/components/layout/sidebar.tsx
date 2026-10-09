"use client";
import {
  Building2,
  ChartNoAxesColumn,
  CreditCard,
  Landmark,
  Layers,
  LayoutDashboard,
  LifeBuoy,
  SquareCheckBig,
  Utensils,
  Users,
  Wallet,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import BusinessListNavButton from "@/components/common/BusinessListNavButton";
import { useBusiness } from "@/context/businessContext";

/* HQ-level navigation — always visible in the command center. */
const hqNavItems = [
  { name: "Command Center", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Businesses", icon: Building2, href: "/business-list" },
  { name: "Support Tickets", icon: LifeBuoy, href: "/dashboard/support" },
  { name: "Billing", icon: Wallet, href: "/dashboard/billing" },
  { name: "Users", icon: Users, href: "/dashboard/users" },
];

/* Per-business deep-dive navigation — only meaningful when a business is selected. */
const businessNavItems = [
  { name: "General Info", icon: ChartNoAxesColumn, href: "/dashboard/details" },
  { name: "Restaurant Details", icon: Utensils, href: "/dashboard/restaurant-details" },
  { name: "Issues", icon: Layers, href: "/dashboard/issues" },
  { name: "Current Plan", icon: SquareCheckBig, href: "/dashboard/plan" },
  { name: "Payment History", icon: CreditCard, href: "/dashboard/payments" },
  { name: "Booking Payment", icon: Landmark, href: "/dashboard/booking-payments" },
  { name: "Staffs", icon: Users, href: "/dashboard/staffs" },
];

const linkCls = (isActive: boolean) =>
  `flex items-center gap-2 sm:gap-3 text-sm sm:text-base font-medium transition-all duration-200 ease-in-out py-2.5 sm:py-3 px-2 sm:px-3 rounded-md ${
    isActive
      ? "bg-[#FDEFE5] text-[#FF6F00]"
      : "hover:bg-[#FDEFE5] hover:text-[#FF6F00] text-gray-300"
  }`;

const Sidebar = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}) => {
  const pathname = usePathname(); // make sure this is imported
  const { business } = useBusiness();
  const hasBusiness = !!business && Object.keys(business).length > 0;

  const renderItems = (
    items: typeof hqNavItems,
    exactOnlyFor: string[] = [],
  ) =>
    items.map(({ name, icon: Icon, href }) => {
      const isActive = exactOnlyFor.includes(href)
        ? pathname === href
        : pathname === href || pathname.startsWith(href + "/");
      return (
        <Link
          key={name}
          href={href}
          onClick={() => setIsOpen(false)}
          className={linkCls(isActive)}
        >
          <Icon size={18} className="sm:w-5 sm:h-5 flex-shrink-0" />
          <span className="truncate">{name}</span>
        </Link>
      );
    });

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed sm:static inset-y-0 left-0 bg-black text-white z-50 sm:z-auto transition-transform duration-300 ease-in-out transform sm:translate-x-0
    ${
      isOpen ? "translate-x-0" : "-translate-x-full"
    } w-64 sm:w-60 px-3 sm:px-4 py-4 sm:py-6 flex flex-col justify-between`}
      >
        <div>
          {/* Business List Navigation Button - Top Right */}
          <div className="mb-4">
            <BusinessListNavButton />
          </div>

          <div className="flex relative justify-center items-center mb-8 sm:mb-12">
            <Image
              src="/logo-white.svg"
              alt="Logo"
              width={100}
              height={24}
              className="h-6 sm:h-6"
            />
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-0 text-white sm:hidden p-1 hover:bg-white/10 rounded"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <nav className="space-y-1 sm:space-y-2 flex-1 overflow-y-auto -mx-3 sm:-mx-4 px-3 sm:px-4">
          <p className="px-2 sm:px-3 pb-1 text-[11px] font-semibold uppercase tracking-widest text-gray-500">
            HQ
          </p>
          {renderItems(hqNavItems, ["/dashboard"])}

          {hasBusiness && (
            <>
              <p className="px-2 sm:px-3 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-widest text-gray-500">
                Business · {business?.name}
              </p>
              {renderItems(businessNavItems)}
            </>
          )}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
