"use client";

import useSWR from "swr";
import { useState, type MouseEvent } from "react";
import Image from "next/image";
import { Pagination } from "@/components/common/pagination";
import { useDebounce } from "@/hooks/useDebounce";
import getBusinessList, {
  createBusiness,
  reactivateBusiness,
} from "@/app/actions/business";
import SearchWithIcon from "@/components/common/searchWithIcon";
import { Spinner } from "@/components/ui/spinner";
import { useBusiness } from "@/context/businessContext";
import { BusinessDTO } from "@/types/business";
import { useRouter } from "next13-progressbar";
import { Button } from "@/components/ui/button";
import { Shield, Layers, Gift } from "lucide-react";
import { CustomDialog } from "@/components/common/CustomDialog";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

export default function BusinessList() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 400);
  const limit = 6;
  const { setBusiness, loading } = useBusiness();
  const router = useRouter();
  const [reactivatingId, setReactivatingId] = useState<number | null>(null);
  const [isAddBusinessOpen, setIsAddBusinessOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [newBusiness, setNewBusiness] = useState({
    name: "",
    address: "",
    businessType: "HOTEL",
    country: "Nigeria",
    state: "",
    ownerFirstName: "",
    ownerLastName: "",
    ownerEmail: "",
    ownerPhoneNumber: "",
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Always call hooks first
  const { data: response, isLoading, mutate } = useSWR(
    [`/super-admin/hotels`, page, limit, debouncedQuery],
    () => getBusinessList({ page, limit, searchTerm: debouncedQuery }),
  );

  const handleBusinessClick = (item: BusinessDTO) => {
    setBusiness(item);
    if (!loading) {
      router.push("/dashboard/business-overview");
    }
  };

  const handleReactivate = async (e: MouseEvent, hotelId: number) => {
    e.stopPropagation(); // Prevent card click
    setReactivatingId(hotelId);
    try {
      await reactivateBusiness(hotelId);
      toast.success("Business reactivated successfully!");
      // Refresh the list
      await mutate();
    } catch (error: any) {
      toast.error(
        error?.message || "Failed to reactivate business. Please try again.",
      );
    } finally {
      setReactivatingId(null);
    }
  };

  const validateBusinessForm = () => {
    const errors: Record<string, string> = {};
    if (!newBusiness.name.trim()) errors.name = "Business name is required";
    if (!newBusiness.address.trim()) errors.address = "Address is required";
    if (!newBusiness.businessType.trim())
      errors.businessType = "Business type is required";
    if (!newBusiness.country.trim()) errors.country = "Country is required";
    if (!newBusiness.state.trim()) errors.state = "State is required";
    if (!newBusiness.ownerFirstName.trim())
      errors.ownerFirstName = "Owner first name is required";
    if (!newBusiness.ownerEmail.trim()) {
      errors.ownerEmail = "Owner email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newBusiness.ownerEmail.trim())
    ) {
      errors.ownerEmail = "Enter a valid email address";
    }
    if (!newBusiness.ownerPhoneNumber.trim())
      errors.ownerPhoneNumber = "Owner phone number is required";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddBusiness = async () => {
    if (!validateBusinessForm()) {
      toast.error("Please fix the highlighted fields");
      return;
    }
    setCreating(true);
    try {
      const response = await createBusiness({
        ...newBusiness,
        ownerEmail: newBusiness.ownerEmail.trim(),
      });
      const newId =
        response?.data?.hotelId ?? response?.data?.id ?? response?.hotelId;
      toast.success(
        newId
          ? `Business created successfully! ID: ${newId}`
          : "Business created successfully!",
      );
      setIsAddBusinessOpen(false);
      setFieldErrors({});
      setNewBusiness({
        name: "",
        address: "",
        businessType: "HOTEL",
        country: "Nigeria",
        state: "",
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
    <div className="min-h-screen bg-white relative overflow-hidden px-4 py-6">
      {/* Background triangles */}
      <div className="absolute inset-0 overflow-hidden z-10">
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
        <div className="flex justify-between items-start mb-6">
          <div></div> {/* Left spacer */}
          <div className="flex gap-3">
            <Button
              onClick={() => setIsAddBusinessOpen(true)}
              className="bg-[#F47411] hover:bg-[#F47411]/90 text-white px-6 py-2 rounded-lg"
            >
              Add Business
            </Button>
            <Button
              onClick={() => router.push("/subscriptions")}
              className="bg-[#F47411] hover:bg-[#F47411]/90 text-white px-6 py-2 rounded-lg flex items-center gap-2"
            >
              <Gift size={16} />
              Subscriptions
            </Button>
            <Button
              onClick={() => router.push("/modules")}
              className="bg-[#F47411] hover:bg-[#F47411]/90 text-white px-6 py-2 rounded-lg flex items-center gap-2"
            >
              <Layers size={16} />
              Manage Modules
            </Button>
            <Button
              onClick={() => router.push("/permissions")}
              className="bg-[#F47411] hover:bg-[#F47411]/90 text-white px-6 py-2 rounded-lg flex items-center gap-2"
            >
              <Shield size={16} />
              Manage Permissions
            </Button>
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
          {businesses.map((b, idx) => (
            <div
              key={idx}
              className="bg-white border rounded-2xl py-4 px-5 text-center transition-all border-gray-200 hover:border-[#F47411] cursor-pointer"
              style={{
                boxShadow:
                  "0px 1px 3px 0px #F4E7DD0F, 0px 3px 2px 0px #0000001A",
              }}
              onClick={() => handleBusinessClick(b)}
            >
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
          ))}
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
        subTitle="Enter the business and owner details to onboard a new business."
        onSubmit={handleAddBusiness}
        loading={creating}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="businessName">Business Name *</label>
            <Input
              id="businessName"
              placeholder="e.g. Grand Hotel"
              value={newBusiness.name}
              onChange={(e) =>
                setNewBusiness({ ...newBusiness, name: e.target.value })
              }
              required
            />
            {fieldErrors.name && (
              <p className="text-xs text-red-600">{fieldErrors.name}</p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="businessType">Business Type *</label>
            <Input
              id="businessType"
              placeholder="e.g. HOTEL"
              value={newBusiness.businessType}
              onChange={(e) =>
                setNewBusiness({ ...newBusiness, businessType: e.target.value })
              }
            />
            {fieldErrors.businessType && (
              <p className="text-xs text-red-600">{fieldErrors.businessType}</p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="country">Country *</label>
            <Input
              id="country"
              placeholder="e.g. Nigeria"
              value={newBusiness.country}
              onChange={(e) =>
                setNewBusiness({ ...newBusiness, country: e.target.value })
              }
            />
            {fieldErrors.country && (
              <p className="text-xs text-red-600">{fieldErrors.country}</p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="state">State *</label>
            <Input
              id="state"
              placeholder="e.g. Lagos"
              value={newBusiness.state}
              onChange={(e) =>
                setNewBusiness({ ...newBusiness, state: e.target.value })
              }
            />
            {fieldErrors.state && (
              <p className="text-xs text-red-600">{fieldErrors.state}</p>
            )}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="address">Address *</label>
            <Input
              id="address"
              placeholder="Address"
              value={newBusiness.address}
              onChange={(e) =>
                setNewBusiness({ ...newBusiness, address: e.target.value })
              }
            />
            {fieldErrors.address && (
              <p className="text-xs text-red-600">{fieldErrors.address}</p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="ownerFirstName">Owner First Name *</label>
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
            {fieldErrors.ownerFirstName && (
              <p className="text-xs text-red-600">{fieldErrors.ownerFirstName}</p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="ownerLastName">Owner Last Name</label>
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
            <label htmlFor="ownerEmail">Owner Email *</label>
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
            {fieldErrors.ownerEmail && (
              <p className="text-xs text-red-600">{fieldErrors.ownerEmail}</p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="ownerPhoneNumber">Owner Phone Number *</label>
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
            {fieldErrors.ownerPhoneNumber && (
              <p className="text-xs text-red-600">
                {fieldErrors.ownerPhoneNumber}
              </p>
            )}
          </div>
        </div>
      </CustomDialog>
    </div>
  );
}
