"use client";
import Image from "next/image";
import Header from "../components/layout/header";
import Sidebar from "../components/layout/sidebar";
import { useBusiness } from "@/context/businessContext";
import { useState, useEffect, useMemo } from "react";
import { Calendar, LayoutGrid, MapPin, Phone, Plus } from "lucide-react";
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
import { updateHotelServices } from "@/app/actions/business";
import getModulesList, { Module } from "@/app/actions/modules";
import { useRouter } from "next/navigation";

export default function BusinessDetailsPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isManageModulesOpen, setIsManageModulesOpen] = useState(false);
  const [availableModules, setAvailableModules] = useState<Module[]>([]);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const [saving, setSaving] = useState(false);
  const { business, loading, refresh } = useBusiness();
  const router = useRouter();

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
        : [...prev, moduleName]
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
    } catch (error) {
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
    <div className="h-screen flex flex-col sm:flex-row overflow-hidden">
      <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          isOpen={menuOpen}
          setIsOpen={setMenuOpen}
          title="General Info"
        />
        <main className="px-4 sm:px-10 py-4 sm:py-10 space-y-6 bg-white overflow-y-auto overflow-x-hidden flex-1">
          <div className="w-full p-4 sm:p-10 shadow-lg text-start flex flex-col gap-4 sm:gap-6 rounded-2xl">
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-8">
              <div className="border-4 border-white rounded-full flex-shrink-0">
                <Image
                  src="/sample-company.png"
                  alt="Company Logo"
                  width={120}
                  height={120}
                  className="sm:w-[150px] sm:h-[150px]"
                />
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
                      )
                    )
                  : null}
              </div>
            </div>
            <Button
              onClick={() => setIsManageModulesOpen(true)}
              className="rounded-[10px] bg-[#FF6F00] hover:bg-[#FF6F00]/90 text-white w-full sm:w-fit py-3 sm:py-2 px-4 font-semibold cursor-pointer flex items-center justify-center gap-2"
            >
              Manage Modules <Plus size={18} />
            </Button>
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
