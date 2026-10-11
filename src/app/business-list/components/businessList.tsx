/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import useSWR from "swr";
import { useMemo, useState } from "react";
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
import {
  Archive,
  ArchiveRestore,
  Ban,
  Eye,
  Gift,
  Layers,
  Menu,
  MoreVertical,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Shield,
  Trash2,
  UtensilsCrossed,
  X,
} from "lucide-react";
import {
  createBusiness,
  reactivateBusiness,
  suspendBusiness,
  unsuspendBusiness,
  archiveBusiness,
  deleteBusiness,
  unarchiveBusiness,
} from "@/app/actions/business";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmationModal } from "@/components/common/ConfirmationModal";
import EditBusinessDialog from "./EditBusinessDialog";
import { CustomDialog } from "@/components/common/CustomDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";

export default function BusinessList() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 400);
  const limit = 6;
  const { setBusiness, loading } = useBusiness();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  // H3/H4: pending lifecycle confirmations
  const [confirmTarget, setConfirmTarget] = useState<{
    business: BusinessDTO;
    action: "reactivate" | "suspend" | "unsuspend";
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<BusinessDTO | null>(null);
  const [archiveConfirmText, setArchiveConfirmText] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<BusinessDTO | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [unarchiveTarget, setUnarchiveTarget] = useState<BusinessDTO | null>(
    null
  );
  const [editingBusiness, setEditingBusiness] = useState<BusinessDTO | null>(
    null
  );
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
  // H1: search now filters client-side over the full list (same pattern as
  // the HQ dashboard BusinessDirectory), instead of the unreliable
  // server-side search endpoint.
  const searchTerm = debouncedQuery.trim();
  const isSearching = searchTerm.length > 0;

  const {
    data: response,
    isLoading,
    mutate,
  } = useSWR(
    isSearching ? null : [`/super-admin/hotels`, page, limit],
    () => getBusinessList({ page, limit }),
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
            // No token at all - redirect to sign-in (canonical URL, M4)
            router.push("/signin");
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

  // Full list used only while searching; filtered client-side below.
  const {
    data: searchData,
    isLoading: isSearchLoading,
    mutate: mutateSearch,
  } = useSWR(
    isSearching ? [`/super-admin/hotels`, "all-for-search"] : null,
    () => getBusinessList({ page: 1, limit: 500 }),
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  const refreshLists = async () => {
    await mutate();
    await mutateSearch();
  };

  const searchableBusinesses = useMemo<BusinessDTO[]>(
    () => searchData?.data?.hotels ?? [],
    [searchData]
  );

  const filteredBusinesses = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return searchableBusinesses.filter((b) =>
      (b.name ?? "").toLowerCase().includes(q)
    );
  }, [searchableBusinesses, searchTerm]);

  const handleBusinessClick = (item: BusinessDTO) => {
    setBusiness(item);
    if (!loading) {
      router.push("/dashboard");
    }
  };

  // H3: reactivate / suspend / unsuspend all go through a confirmation dialog.
  const handleLifecycleConfirm = async () => {
    if (!confirmTarget) return;
    const { business, action } = confirmTarget;
    setActionLoading(true);
    try {
      if (action === "reactivate") {
        await reactivateBusiness(business.id);
        toast.success("Business reactivated successfully!");
      } else if (action === "suspend") {
        await suspendBusiness(business.id);
        toast.success("Business deactivated successfully!");
      } else {
        await unsuspendBusiness(business.id);
        toast.success("Business re-activated successfully!");
      }
      setConfirmTarget(null);
      await refreshLists();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Action failed. Please try again.";
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  const lifecycleCopy = confirmTarget
    ? {
        reactivate: {
          title: "Reactivate Business",
          description: `Are you sure you want to reactivate ${confirmTarget.business.name}?`,
          confirmLabel: "Reactivate",
        },
        suspend: {
          title: "Deactivate Business",
          description: `Are you sure you want to deactivate ${confirmTarget.business.name}? The business will be deactivated immediately.`,
          confirmLabel: "Deactivate",
        },
        unsuspend: {
          title: "Re-activate Business",
          description: `Are you sure you want to re-activate ${confirmTarget.business.name}?`,
          confirmLabel: "Re-activate",
        },
      }[confirmTarget.action]
    : null;

  // H4: archive requires typing the business name; unarchive is a confirm.
  const handleArchiveConfirm = async () => {
    if (!archiveTarget) return;
    setArchiving(true);
    try {
      await archiveBusiness(archiveTarget.id);
      toast.success(`"${archiveTarget.name}" archived.`);
      setArchiveTarget(null);
      setArchiveConfirmText("");
      await refreshLists();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to archive business.";
      toast.error(message);
    } finally {
      setArchiving(false);
    }
  };

  const handleUnarchiveConfirm = async () => {
    if (!unarchiveTarget) return;
    setActionLoading(true);
    try {
      await unarchiveBusiness(unarchiveTarget.id);
      toast.success(`"${unarchiveTarget.name}" restored from archive.`);
      setUnarchiveTarget(null);
      await refreshLists();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to restore business from archive.";
      toast.error(message);
    } finally {
      setActionLoading(false);
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
      const response = (await createBusiness({
        ...newBusiness,
        ownerEmail: newBusiness.ownerEmail.trim(),
      })) as any;
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

  const businesses: BusinessDTO[] = isSearching
    ? filteredBusinesses
    : (response?.data?.hotels ?? []);
  const totalPages = response?.totalPages ?? 1;
  const listLoading = isSearching ? isSearchLoading : isLoading;

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
                  <button
                    onClick={() => {
                      router.push("/restaurants");
                      setMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 transition-colors"
                  >
                    <UtensilsCrossed size={18} className="text-[#F47411]" />
                    <span className="text-sm font-medium text-gray-700">
                      Restaurant Catalog
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
            const isArchived = b.isArchived === true;

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
                {/* H4: per-business action menu */}
                <div
                  className="absolute top-2 right-2 z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-gray-500 hover:text-gray-800"
                        aria-label={`Actions for ${b.name}`}
                      >
                        <MoreVertical size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuItem
                        onClick={() => router.push(`/businesses/${b.id}`)}
                      >
                        <Eye size={14} className="mr-2" />
                        View details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setEditingBusiness(b)}
                      >
                        <Pencil size={14} className="mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {!b.isActive ? (
                        <DropdownMenuItem
                          className="text-green-700 focus:text-green-700"
                          onClick={() =>
                            setConfirmTarget({
                              business: b,
                              action: isExpired ? "reactivate" : "unsuspend",
                            })
                          }
                        >
                          <Play size={14} className="mr-2" />
                          Activate
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          className="text-amber-700 focus:text-amber-700"
                          onClick={() =>
                            setConfirmTarget({ business: b, action: "suspend" })
                          }
                        >
                          <Ban size={14} className="mr-2" />
                          Deactivate
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      {isArchived ? (
                        <DropdownMenuItem
                          className="text-green-700 focus:text-green-700"
                          onClick={() => setUnarchiveTarget(b)}
                        >
                          <ArchiveRestore size={14} className="mr-2" />
                          Restore from archive
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => {
                            setArchiveTarget(b);
                            setArchiveConfirmText("");
                          }}
                        >
                          <Archive size={14} className="mr-2" />
                          Archive
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => {
                          setDeleteTarget(b);
                          setDeleteConfirmText("");
                        }}
                      >
                        <Trash2 size={14} className="mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {isExpired && (
                  <div className="absolute top-12 right-2">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click
                        setConfirmTarget({ business: b, action: "reactivate" });
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 h-auto"
                    >
                      <RefreshCw size={12} className="mr-1" />
                      Reactivate
                    </Button>
                  </div>
                )}
                <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                  {isExpired && (
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                      Expired
                    </span>
                  )}
                  {isArchived && (
                    <span className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-1 rounded">
                      Archived
                    </span>
                  )}
                </div>
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
          {listLoading ? (
            <div className="flex items-center justify-center gap-2">
              <Spinner size="md" />
              <span>Loading businesses...</span>
            </div>
          ) : (
            <p>
              {isSearching
                ? "No businesses match your search."
                : "No businesses found"}
            </p>
          )}
        </div>
      )}

      {/* Pagination (hidden while searching — search filters the full list) */}
      {businesses.length > 0 && !isSearching && (
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
        description="Enter the business and owner details to onboarding a new business."
        onConfirm={handleAddBusiness}
        isLoading={creating}
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
            {fieldErrors.name && (
              <p className="text-xs text-red-600">{fieldErrors.name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessType">Business Type *</Label>
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
            <Label htmlFor="country">Country *</Label>
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
            <Label htmlFor="state">State *</Label>
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
            <Label htmlFor="address">Address *</Label>
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
            <Label htmlFor="ownerFirstName">Owner First Name *</Label>
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
            {fieldErrors.ownerEmail && (
              <p className="text-xs text-red-600">{fieldErrors.ownerEmail}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="ownerPhoneNumber">Owner Phone Number *</Label>
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

      {/* H3: activate / suspend / unsuspend confirmation */}
      {lifecycleCopy && (
        <ConfirmationModal
          isOpen={!!confirmTarget}
          onClose={() => setConfirmTarget(null)}
          onConfirm={handleLifecycleConfirm}
          title={lifecycleCopy.title}
          description={lifecycleCopy.description}
          confirmLabel={lifecycleCopy.confirmLabel}
          cancelLabel="Cancel"
          variant={confirmTarget?.action === "suspend" ? "danger" : "primary"}
          isLoading={actionLoading}
        />
      )}

      {/* Delete — typed confirmation (IRREVERSIBLE, no data retained) */}
      <CustomDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
            setDeleteConfirmText("");
          }
        }}
        title="Delete business permanently?"
        description={`This will permanently delete ${deleteTarget?.name ?? "this business"} and its subscription record. This cannot be undone. Type the business name below to confirm.`}
      >
        <div className="space-y-4">
          <Input
            placeholder={deleteTarget?.name ?? "Business name"}
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            className="w-full"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteTarget(null);
                setDeleteConfirmText("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={
                deleting || deleteConfirmText.trim() !== deleteTarget?.name?.trim()
              }
              onClick={async () => {
                if (!deleteTarget) return;
                setDeleting(true);
                try {
                  await deleteBusiness(deleteTarget.id);
                  toast.success("Business deleted permanently.");
                  setDeleteTarget(null);
                  setDeleteConfirmText("");
                  router.refresh();
                } catch (err) {
                  toast.error(
                    err instanceof Error ? err.message : "Failed to delete business"
                  );
                } finally {
                  setDeleting(false);
                }
              }}
            >
              {deleting ? "Deleting…" : "Delete permanently"}
            </Button>
          </div>
        </div>
      </CustomDialog>

      {/* H4: archive — typed confirmation (reversible, no data deleted) */}
      <CustomDialog
        open={!!archiveTarget}
        onOpenChange={(open) => {
          if (!open) {
            setArchiveTarget(null);
            setArchiveConfirmText("");
          }
        }}
        title="Archive Business"
        description={
          archiveTarget
            ? `This will archive "${archiveTarget.name}". The business and all of its data are kept and can be restored at any time. Type the business name below to confirm.`
            : undefined
        }
        onConfirm={handleArchiveConfirm}
        isLoading={archiving}
        confirmText="Archive"
        confirmDisabled={
          archiveTarget ? archiveConfirmText !== archiveTarget.name : true
        }
      >
        <div className="space-y-2">
          <Label htmlFor="archiveConfirmName">Business name</Label>
          <Input
            id="archiveConfirmName"
            placeholder={archiveTarget?.name ?? ""}
            value={archiveConfirmText}
            onChange={(e) => setArchiveConfirmText(e.target.value)}
          />
        </div>
      </CustomDialog>

      {/* H4: restore-from-archive confirmation */}
      <ConfirmationModal
        isOpen={!!unarchiveTarget}
        onClose={() => setUnarchiveTarget(null)}
        onConfirm={handleUnarchiveConfirm}
        title="Restore from Archive"
        description={
          unarchiveTarget
            ? `Are you sure you want to restore ${unarchiveTarget.name} from the archive?`
            : ""
        }
        confirmLabel="Restore"
        cancelLabel="Cancel"
        isLoading={actionLoading}
      />

      {/* H2/H4: edit business details */}
      <EditBusinessDialog
        business={editingBusiness}
        open={!!editingBusiness}
        onOpenChange={(open) => {
          if (!open) setEditingBusiness(null);
        }}
        onSaved={() => refreshLists()}
      />
    </div>
  );
}
