"use client";
import Image from "next/image";
import Header from "../components/layout/header";
import Sidebar from "../components/layout/sidebar";
import { useBusiness } from "@/context/businessContext";
import { useState, useEffect, useMemo } from "react";
import { Calendar, LayoutGrid, MapPin, Phone, Plus, Trash2, Upload, Loader2 } from "lucide-react";
import {
  capitalize,
  formatDate,
  generateModuleArr,
  removeUnderscore,
} from "@/utils/utils";
import { CustomDialog } from "@/components/common/CustomDialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  updateHotelServices,
  updateBusiness,
  uploadBusinessCoverImage,
  uploadBusinessGalleryImage,
  getBusinessDetails,
} from "@/app/actions/business";
import getModulesList, { Module } from "@/app/actions/modules";
import { useRouter } from "next/navigation";

export default function BusinessDetailsPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isManageModulesOpen, setIsManageModulesOpen] = useState(false);
  const [availableModules, setAvailableModules] = useState<Module[]>([]);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const { business, setBusiness, loading, refresh } = useBusiness();
  const router = useRouter();

  useEffect(() => {
    if (business?.id) {
      getBusinessDetails(business.id.toString())
        .then((res) => {
          if (res?.data?.hotel) {
            setBusiness(res.data.hotel);
          }
        })
        .catch((err) => {
          console.error("Failed to load business details:", err);
        });
    }
  }, [business?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentModules = useMemo(() => {
    if (!business?.services) return [];
    return generateModuleArr(business.services);
  }, [business?.services]);

  useEffect(() => {
    if (isManageModulesOpen) {
      setLoadingModules(true);
      getModulesList()
        .then((modules) => {
          setAvailableModules(modules);
          // Pre-select currently assigned modules
          const currentModuleNames = currentModules.map((m) => m.toLowerCase());
          const selected = modules
            .filter((m) => currentModuleNames.includes(m.name.toLowerCase()))
            .map((m) => m.name);
          setSelectedModules(selected);
        })
        .catch((error) => {
          console.error("Failed to load modules:", error);
          toast.error("Failed to load available modules");
        })
        .finally(() => {
          setLoadingModules(false);
        });
    }
  }, [isManageModulesOpen, currentModules]);

  const handleModuleToggle = (moduleName: string) => {
    setSelectedModules((prev) =>
      prev.includes(moduleName)
        ? prev.filter((m) => m !== moduleName)
        : [...prev, moduleName],
    );
  };

  const handleSaveModules = async () => {
    if (!business?.id) {
      toast.error("No business selected");
      return;
    }

    setSaving(true);
    try {
      const servicesString = selectedModules.join(",");
      await updateHotelServices(business.id.toString(), servicesString);
      toast.success("Modules updated successfully");
      setIsManageModulesOpen(false);
      // Refresh business data
      refresh();
      router.refresh();
    } catch (error: any) {
      console.error("Failed to update modules:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update modules";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-screen w-screen flex flex-col sm:flex-row overflow-hidden">
      <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        <Header
          isOpen={menuOpen}
          setIsOpen={setMenuOpen}
          title="General Info"
        />
        <main className="px-3 sm:px-4 md:px-6 lg:px-10 py-4 sm:py-6 md:py-10 space-y-4 sm:space-y-6 bg-white overflow-y-auto overflow-x-hidden flex-1 min-h-0">
          <div className="w-full p-4 sm:p-6 md:p-10 shadow-lg text-start flex flex-col gap-4 sm:gap-6 rounded-2xl">
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-8">
              <div className="relative group border-4 border-white rounded-full flex-shrink-0 overflow-hidden w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] bg-gray-50 flex items-center justify-center shadow-md">
                <Image
                  src={business?.coverImage || "/sample-company.png"}
                  alt="Company Logo"
                  width={150}
                  height={150}
                  className="w-full h-full object-contain"
                />
                <label className={`absolute inset-0 bg-black/60 flex flex-col items-center justify-center cursor-pointer transition-opacity duration-200 text-white text-xs text-center p-2 font-medium ${uploadingCover ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                  {uploadingCover ? (
                    <Loader2 className="h-6 w-6 animate-spin mb-1 text-[#FF6F00]" />
                  ) : (
                    <Upload className="h-6 w-6 mb-1 text-[#FF6F00]" />
                  )}
                  {uploadingCover ? "Uploading..." : "Change Logo / Cover"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingCover}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file || !business?.id) return;
                      
                      setUploadingCover(true);
                      try {
                        const formData = new FormData();
                        formData.append("file", file);
                        const res = await uploadBusinessCoverImage(business.id.toString(), formData);
                        if (res?.url) {
                          setBusiness({ ...business, coverImage: res.url });
                          toast.success("Cover image updated successfully");
                        } else {
                          throw new Error("Invalid response from server");
                        }
                      } catch (error: any) {
                        console.error("Cover upload error:", error);
                        toast.error(error.message || "Failed to upload cover image");
                      } finally {
                        setUploadingCover(false);
                        e.target.value = "";
                      }
                    }}
                  />
                </label>
              </div>
              <div className="flex flex-col gap-2 text-center sm:text-left">
                <h2 className="text-2xl sm:text-4xl font-semibold text-[#0B0B0B] break-words">
                  {business?.name}
                </h2>

                <span
                  className={`w-fit mx-auto sm:mx-0 rounded-full text-sm font-semibold text-white px-4 py-1 ${
                    business?.isActive ? "bg-green-500" : "bg-red-500"
                  }`}
                >
                  {business?.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-sm text-[#0B0B0B]">
              <div className="flex items-center gap-2">
                <MapPin size={18} color={"gray"} className="flex-shrink-0" />
                <span className="break-words">
                  {business?.address ? capitalize(business.address) : "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={18} color={"gray"} className="flex-shrink-0" />
                <span>{business?.owner?.phoneNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <LayoutGrid
                  size={18}
                  color={"gray"}
                  className="flex-shrink-0"
                />
                <span className="break-words">{business?.businessType}</span>
              </div>
              <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-1">
                <Calendar size={18} color={"gray"} className="flex-shrink-0" />
                <span>
                  Joined{" "}
                  {business?.createdAt ? formatDate(business.createdAt) : "N/A"}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:gap-4">
              <span className="text-lg sm:text-xl font-bold text-[#0B0B0B]">
                Assigned Modules
              </span>
              <div className="flex flex-wrap gap-2 sm:gap-4">
                {business?.services
                  ? generateModuleArr(business.services).map(
                      (module, index) => (
                        <span
                          key={index}
                          className="bg-gray-200 rounded-full px-3 py-1 text-xs sm:text-sm font-medium text-gray-800"
                        >
                          {capitalize(removeUnderscore(module))}
                        </span>
                      ),
                    )
                  : null}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Button
                onClick={() => setIsManageModulesOpen(true)}
                className="rounded-[10px] bg-[#FF6F00] hover:bg-[#FF6F00]/90 text-white w-full sm:w-fit py-3 sm:py-2 px-4 font-semibold cursor-pointer flex items-center justify-center gap-2"
              >
                Manage Modules <Plus size={18} />
              </Button>
            </div>

            {business && (
              <div className="border-t border-gray-100 pt-6 mt-6 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-[#0B0B0B]">
                      {business.businessType?.toUpperCase() === "RESTAURANT"
                        ? "Restaurant Images Gallery"
                        : "Business Images Gallery"}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Upload and manage the public images of this business.
                    </p>
                  </div>
                  <label className={`bg-[#FF6F00] hover:bg-[#FF6F00]/90 text-white font-semibold text-sm px-4 py-2 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm w-full sm:w-auto h-10 ${uploadingGallery ? "opacity-50 pointer-events-none" : ""}`}>
                    {uploadingGallery ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        <span>Upload Image</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      disabled={uploadingGallery}
                      onChange={async (e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length === 0 || !business?.id) return;

                        setUploadingGallery(true);
                        let updatedBusiness = { ...business };
                        let successCount = 0;
                        let failCount = 0;

                        try {
                          for (const file of files) {
                            const formData = new FormData();
                            formData.append("file", file);
                            try {
                              const res = await uploadBusinessGalleryImage(business.id.toString(), formData);
                              if (res?.images) {
                                updatedBusiness = { ...updatedBusiness, images: res.images };
                                setBusiness(updatedBusiness);
                                successCount++;
                              } else {
                                failCount++;
                              }
                            } catch (err) {
                              console.error(`Error uploading ${file.name}:`, err);
                              failCount++;
                            }
                          }

                          if (successCount > 0) {
                            toast.success(`Successfully uploaded ${successCount} image(s)`);
                          }
                          if (failCount > 0) {
                            toast.error(`Failed to upload ${failCount} image(s)`);
                          }
                        } finally {
                          setUploadingGallery(false);
                          e.target.value = "";
                        }
                      }}
                    />
                  </label>
                </div>

                {/* Images Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-2">
                  {business.images && business.images.length > 0 ? (
                    business.images.map((imgUrl, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-xl overflow-hidden group border border-gray-100 bg-gray-50"
                      >
                        <Image
                          src={imgUrl}
                          alt={`Restaurant Gallery ${index + 1}`}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                          className="object-cover"
                        />
                        {/* Hover Overlay Delete */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={async () => {
                              const updatedImages = (business.images || []).filter((_, idx) => idx !== index);
                              try {
                                await updateBusiness(business.id.toString(), { images: updatedImages });
                                setBusiness({ ...business, images: updatedImages });
                                toast.success("Image deleted from gallery");
                              } catch (error: any) {
                                console.error("Delete image error:", error);
                                toast.error(error.message || "Failed to delete image");
                              }
                            }}
                            className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white shadow transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center text-gray-500">
                      <Image
                        src="/sample-company.png"
                        alt="No Images"
                        width={60}
                        height={60}
                        className="opacity-40 grayscale mb-2"
                      />
                      <span className="text-sm font-medium text-gray-600">No images uploaded</span>
                      <span className="text-xs text-gray-400 mt-1">Upload photos to show in the restaurant menu & listing</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <CustomDialog
        open={isManageModulesOpen}
        onOpenChange={setIsManageModulesOpen}
        title="Manage Modules"
        onSubmit={handleSaveModules}
        loading={saving}
        trigger={<></>}
      >
        <div className="space-y-4">
          {loadingModules ? (
            <div className="text-center py-4">Loading modules...</div>
          ) : availableModules.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No modules available
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {availableModules.map((module) => (
                <div
                  key={module.id}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50"
                >
                  <Checkbox
                    id={`module-${module.id}`}
                    checked={selectedModules.includes(module.name)}
                    onCheckedChange={() => handleModuleToggle(module.name)}
                  />
                  <Label
                    htmlFor={`module-${module.id}`}
                    className="flex-1 cursor-pointer font-normal"
                  >
                    {capitalize(removeUnderscore(module.name))}
                    {module.description && (
                      <span className="text-xs text-gray-500 block mt-1">
                        {module.description}
                      </span>
                    )}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>
      </CustomDialog>
    </div>
  );
}
