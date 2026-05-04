/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import useSWR from "swr";
import { useState } from "react";
import Image from "next/image";
import { Pagination } from "@/components/common/pagination";
import { useDebounce } from "@/hooks/useDebounce";
import getBusinessList from "@/app/actions/business";
import SearchWithIcon from "@/components/common/searchWithIcon";
import { Spinner } from "@/components/ui/spinner";
import { useBusiness } from "@/context/businessContext";
import { BusinessDTO } from "@/types/business";
import { useRouter } from "next13-progressbar";
import { Button } from "@/components/ui/button";
import { Plus, Shield, Layers, Gift, RefreshCw, Menu, X } from "lucide-react";
import { createBusiness, reactivateBusiness } from "@/app/actions/business";
import { CustomDialog } from "@/components/common/CustomDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";

export default function BusinessList() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query);
  const limit = 6;
  const { setBusiness, loading } = useBusiness();
  const router = useRouter();
  const [reactivatingId, setReactivatingId] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAddBusinessOpen, setIsAddBusinessOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newBusiness, setNewBusiness] = useState({
    name: "",
    address: "",
    businessType: "HOTEL",
    ownerFirstName: "",
    ownerLastName: "",
    ownerEmail: "",
    ownerPhoneNumber: "",
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Always call hooks first
  const {
    data: response,
    isLoading,
    mutate,
  } = useSWR(
    [`/super-admin/hotels`, page, limit, debouncedQuery],
    () => getBusinessList({ page, limit, searchTerm: debouncedQuery }),
    {
      onError: (error) => {
        // Handle 401 errors - token might not be in cookies yet
        const status = (error as any)?.response?.status;
        if (status === 401) {
          // Token might not be in cookies yet, try to get from localStorage
          const token = localStorage.getItem("access_token");
          if (token) {
            // Cookie might not be set yet - try to set it and retry
            document.cookie = `access_token=${token}; path=/; secure; samesite=lax; max-age=${
              60 * 60 * 24 * 7
            }`;
            console.warn("401 error - retrying after setting cookie");
          } else {
            // No token at all - redirect to login
            router.push("/login");
          }
        }
      },
      shouldRetryOnError: (error) => {
        const status = (error as any)?.response?.status;
        // Retry once on 401 if we have a token in localStorage
        if (status === 401) {
          const token = localStorage.getItem("access_token");
          return !!token;
        }
        return status !== 401;
      },
      errorRetryCount: 1, // Only retry once
    }
  );

  const handleBusinessClick = (item: BusinessDTO) => {
    setBusiness(item);
    if (!loading) {
      router.push("/dashboard");
    }
  };

  const handleReactivate = async (e: React.MouseEvent, hotelId: number) => {
    e.stopPropagation(); // Prevent card click
    setReactivatingId(hotelId);
    try {
      await reactivateBusiness(hotelId);
      toast.success("Business reactivated successfully!");
      // Refresh the list
      await mutate();
    } catch (error: any) {
      toast.error(
        error?.message || "Failed to reactivate business. Please try again."
      );
    } finally {
      setReactivatingId(null);
    }
  };

  const handleAddBusiness = async () => {
    if (!newBusiness.name || !newBusiness.ownerEmail) {
      toast.error("Please fill in required fields");
      return;
    }
    setCreating(true);
    try {
      await createBusiness(newBusiness);
      toast.success("Business created successfully!");
      setIsAddBusinessOpen(false);
      setNewBusiness({
        name: "",
        address: "",
        businessType: "HOTEL",
        ownerFirstName: "",
        ownerLastName: "",
        ownerEmail: "",
        ownerPhoneNumber: "",
      });
      await mutate(); // Refresh the list
    } catch (error: any) {
      toast.error(error?.message || "Failed to create business");
    } finally {
      setCreating(false);
    }
  };

  const businesses = response?.data?.hotels ?? [];
  const totalPages = response?.totalPages ?? 1;

  return (
    <div className="min-h-screen bg-white relative overflow-x-hidden overflow-y-auto px-4 py-6">
      {/* Background triangles */}
      <div className="fixed inset-0 overflow-hidden z-10 pointer-events-none">
        <div
          className="absolute top-0 left-0 w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] bg-[#FFE2CC]"
          style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
        />
        <div
          className="absolute bottom-0 right-0 w-[200px] h-[200px] sm:w-[250px] sm:h-[250px] bg-[#CDE9F4]"
          style={{ clipPath: "polygon(100% 100%, 0 100%, 100% 0)" }}
        />
      </div>

      {/* Header */}
      <div className="text-center mb-8 z-20 relative px-4">
        <div className="flex justify-end mb-6 gap-2">
          <Button
            onClick={() => setIsAddBusinessOpen(true)}
            className="bg-[#007BFF] hover:bg-[#007BFF]/90 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Add Business</span>
          </Button>
          <div className="relative">
            <Button
              onClick={() => setMenuOpen(!menuOpen)}
              className="bg-[#F47411] hover:bg-[#F47411]/90 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
              <span className="hidden sm:inline">Menu</span>
            </Button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30 sm:hidden"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-40 py-2">
                  <button
                    onClick={() => {
                      router.push("/subscriptions");
                      setMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors"
                  >
                    <Gift size={18} className="text-[#F47411]" />
                    <span className="text-sm font-medium text-gray-700">
                      Subscriptions
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      router.push("/modules");
                      setMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors"
                  >
                    <Layers size={18} className="text-[#F47411]" />
                    <span className="text-sm font-medium text-gray-700">
                      Manage Modules
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      router.push("/permissions");
                      setMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors"
                  >
                    <Shield size={18} className="text-[#F47411]" />
                    <span className="text-sm font-medium text-gray-700">
                      Manage Permissions
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        <Image
          src="/logo.svg"
          alt="Anli logo"
          width={120}
          height={70}
          className="mx-auto mb-5"
        />
        <h1 className="text-2xl sm:text-[32px] font-medium text-black">
          Welcome Back
        </h1>
        <p className="text-sm sm:text-md text-black font-medium">
          All Businesses in our system
        </p>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto mb-10 z-20 relative">
        <SearchWithIcon
          onChange={(e) => setQuery(e.target.value)}
          value={query}
        />
      </div>

      {/* Business Grid */}
      {businesses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto z-20 relative px-4">
          {businesses.map((b, idx) => {
            const isExpired =
              b.subscription?.status === "expired" ||
              b.subscription?.isExpired ||
              false;
            const isReactivating = reactivatingId === b.id;

            return (
              <div
                key={idx}
                className={`bg-white border rounded-2xl py-4 px-5 text-center transition-all ${
                  isExpired
                    ? "border-red-300 hover:border-red-400"
                    : "border-gray-200 hover:border-[#F47411]"
                } cursor-pointer relative`}
                style={{
                  boxShadow:
                    "0px 1px 3px 0px #F4E7DD0F, 0px 3px 2px 0px #0000001A",
                }}
                onClick={() => handleBusinessClick(b)}
              >
                {isExpired && (
                  <div className="absolute top-2 right-2">
                    <Button
                      size="sm"
                      onClick={(e) => handleReactivate(e, b.id)}
                      disabled={isReactivating}
                      className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 h-auto"
                    >
                      {isReactivating ? (
                        <>
                          <Spinner size="sm" className="mr-1" />
                          Reactivating...
                        </>
                      ) : (
                        <>
                          <RefreshCw size={12} className="mr-1" />
                          Reactivate
                        </>
                      )}
                    </Button>
                  </div>
                )}
                {isExpired && (
                  <div className="absolute top-2 left-2">
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                      Expired
                    </span>
                  </div>
                )}
                <Image
                  src={b?.coverImage || "/sample-company.png"}
                  alt={b.name}
                  width={70}
                  height={70}
                  className="mx-auto mb-3 object-contain"
                />
                <h2 className="font-medium text-lg sm:text-xl text-black hover:text-[#F47411]">
                  {b.name}
                </h2>
                <p className="text-sm sm:text-md text-gray-500 font-normal">
                  {b.address}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center text-gray-500 z-20 relative">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <Spinner size="md" />
              <span>Loading businesses...</span>
            </div>
          ) : (
            <p>No businesses found</p>
          )}
        </div>
      )}

      {/* Pagination */}
      {businesses.length > 0 && (
        <>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {/* Add Business Modal */}
      <CustomDialog
        open={isAddBusinessOpen}
        onOpenChange={setIsAddBusinessOpen}
        title="Add New Business"
        subTitle="Enter the business and owner details to onboarding a new business."
        onSubmit={handleAddBusiness}
        loading={creating}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name *</Label>
            <Input
              id="businessName"
              placeholder="e.g. Grand Hotel"
              value={newBusiness.name}
              onChange={(e) =>
                setNewBusiness({ ...newBusiness, name: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessType">Business Type</Label>
            <Input
              id="businessType"
              placeholder="e.g. HOTEL"
              value={newBusiness.businessType}
              onChange={(e) =>
                setNewBusiness({ ...newBusiness, businessType: e.target.value })
              }
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              placeholder="Address"
              value={newBusiness.address}
              onChange={(e) =>
                setNewBusiness({ ...newBusiness, address: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ownerFirstName">Owner First Name</Label>
            <Input
              id="ownerFirstName"
              placeholder="First Name"
              value={newBusiness.ownerFirstName}
              onChange={(e) =>
                setNewBusiness({
                  ...newBusiness,
                  ownerFirstName: e.target.value,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ownerLastName">Owner Last Name</Label>
            <Input
              id="ownerLastName"
              placeholder="Last Name"
              value={newBusiness.ownerLastName}
              onChange={(e) =>
                setNewBusiness({
                  ...newBusiness,
                  ownerLastName: e.target.value,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ownerEmail">Owner Email *</Label>
            <Input
              id="ownerEmail"
              type="email"
              placeholder="Email"
              value={newBusiness.ownerEmail}
              onChange={(e) =>
                setNewBusiness({ ...newBusiness, ownerEmail: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ownerPhoneNumber">Owner Phone Number</Label>
            <Input
              id="ownerPhoneNumber"
              placeholder="Phone Number"
              value={newBusiness.ownerPhoneNumber}
              onChange={(e) =>
                setNewBusiness({
                  ...newBusiness,
                  ownerPhoneNumber: e.target.value,
                })
              }
            />
          </div>
        </div>
      </CustomDialog>
    </div>
  );
}
