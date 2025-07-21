"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import getModulesList from "../actions/modules";
import getPermissionsList, {
  createPermission,
  updatePermission,
  deletePermission,
  type CreatePermissionDto,
} from "../actions/permissions";
import { Permission } from "../actions/types";
import SearchWithIcon from "@/components/common/searchWithIcon";
import { useDebounce } from "@/hooks/useDebounce";
import { Pagination } from "@/components/common/pagination";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  Tbody,
  Thead,
  Th,
  Td,
  Tr,
} from "@/components/common/customTable";

type Module = {
  id: number;
  name: string;
  description?: string;
};

const AddPermissionDialog = ({
  onAddPermission,
}: {
  onAddPermission: (permission: Omit<Permission, "id">) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [moduleId, setModuleId] = useState<number | undefined>(undefined);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchModules = async () => {
      setLoading(true);
      try {
        const response = await getModulesList();
        if (response) {
          setModules(response);
        }
      } catch (error) {
        console.error("Failed to fetch modules:", error);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchModules();
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddPermission({ name, description, moduleId });
    setName("");
    setDescription("");
    setModuleId(undefined);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="text-base font-medium text-white rounded-md bg-[#F47411] hover:bg-[#F47411]/90">
          Add Permission
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Permission</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <FormLabel htmlFor="name">Name</FormLabel>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="description">Description</label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="module">Module (Optional)</label>
            <select
              id="module"
              value={moduleId || ""}
              onChange={(e) =>
                setModuleId(e.target.value ? Number(e.target.value) : undefined)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F47411] focus:border-[#F47411]"
              disabled={loading}
            >
              <option value="">Select a module</option>
              {modules.map((module) => (
                <option key={module.id} value={module.id}>
                  {module.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end">
            <Button
              className="text-base font-medium text-white rounded-md bg-[#F47411] hover:bg-[#F47411]/90"
              type="submit"
            >
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const EditPermissionDialog = ({
  permission,
  modules,
  onSave,
  onOpenChange,
  open,
}: {
  permission: Permission;
  modules: Module[];
  onSave: (permission: Permission) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) => {
  const [formData, setFormData] = useState<Omit<Permission, "id">>({
    name: permission.name,
    description: permission.description,
    moduleId: permission.module?.id,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...permission,
      ...formData,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Permission</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <FormLabel htmlFor="name">Name</FormLabel>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="description">Description</label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="module">Module (Optional)</label>
            <select
              id="module"
              value={formData.moduleId || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  moduleId: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#F47411] focus:border-[#F47411]"
            >
              <option value="">Select a module</option>
              {modules.map((module) => (
                <option key={module.id} value={module.id}>
                  {module.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end">
            <Button
              className="text-base font-medium text-white rounded-md bg-[#F47411] hover:bg-[#F47411]/90"
              type="submit"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default function PermissionPage() {
  const router = useRouter();
  const [permissions, setPermissions] = useState<{ permissions: Permission[] }>(
    { permissions: [] }
  );
  const [modules, setModules] = useState<Module[]>([]);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query);
  const [page, setPage] = useState(1);
  const limit = 10;

  // Simulate search and pagination client-side
  const filteredPermissions = permissions.permissions.filter((p) =>
    p.name.toLowerCase().includes(debouncedQuery.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filteredPermissions.length / limit));
  const paginatedPermissions = filteredPermissions.slice(
    (page - 1) * limit,
    page * limit
  );

  useEffect(() => {
    setPage(1); // Reset to first page on new search
  }, [debouncedQuery]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [permissionsResponse, modulesResponse] = await Promise.all([
          getPermissionsList(),
          getModulesList(),
        ]);
        setPermissions(permissionsResponse);
        setModules(modulesResponse);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddPermission = async (permission: CreatePermissionDto) => {
    try {
      const response = await createPermission(permission);
      if (response.data) {
        setPermissions({
          permissions: [...permissions.permissions, response.data],
        });
      }
    } catch (error) {
      console.error("Failed to add permission:", error);
    }
  };

  const handleDeletePermission = async (id: string) => {
    try {
      await deletePermission(id);
      setPermissions({
        permissions: permissions.permissions.filter((p) => p.id !== id),
      });
    } catch (error) {
      console.error("Failed to delete permission:", error);
    }
  };

  const handleEditClick = (permission: Permission) => {
    setEditingPermission(permission);
  };

  const handleSavePermission = async (updatedPermission: Permission) => {
    try {
      const response = await updatePermission(updatedPermission.id, {
        name: updatedPermission.name,
        description: updatedPermission.description,
        moduleId: updatedPermission.moduleId,
      });
      if (response.data) {
        setPermissions({
          permissions: permissions.permissions.map((p) =>
            p.id === updatedPermission.id ? response.data : p
          ),
        });
      }
      setEditingPermission(null);
    } catch (error) {
      console.error("Failed to update permission:", error);
    }
  };

  const getModuleName = (permission: Permission) => {
    if (!permission.module?.id) return "-";
    const foundModule = modules.find((m) => m.id === permission?.module?.id);
    return foundModule ? foundModule.name : "-";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/business-list")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft size={20} />
            Back to Business List
          </Button>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>
        {/* Logo */}
        <div className="text-center mb-8">
          <Image
            src="/logo.svg"
            alt="Anli logo"
            width={120}
            height={70}
            className="mx-auto"
          />
        </div>
        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="flex flex-col px-6 py-4 sm:flex-row justify-between items-start sm:items-center gap-3 border-b">
            <h2 className="text-lg font-normal text-[#101828]">
              System Permissions
            </h2>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <SearchWithIcon
                className="w-[478px]"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <AddPermissionDialog onAddPermission={handleAddPermission} />
            </div>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="p-5">
                <Spinner>Loading permissions...</Spinner>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <Thead>
                    <Tr>
                      <Th withIcon>Name</Th>
                      <Th withIcon>Description</Th>
                      <Th withIcon>Module</Th>
                      <Th>Action</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {paginatedPermissions.map((permission) => (
                      <Tr key={permission.id}>
                        <Td>{permission.name}</Td>
                        <Td>{permission.description}</Td>
                        <Td>{getModuleName(permission)}</Td>
                        <Td className="text-blue-600 hover:underline cursor-pointer py-4 px-4">
                          <span
                            className="mr-4 cursor-pointer text-blue-600 hover:underline"
                            onClick={() => handleEditClick(permission)}
                          >
                            Edit
                          </span>
                          <span
                            className="cursor-pointer text-red-600 hover:underline"
                            onClick={() =>
                              handleDeletePermission(permission.id)
                            }
                          >
                            Delete
                          </span>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
                <Pagination
                  totalPages={totalPages}
                  page={page}
                  onPageChange={setPage}
                />
              </div>
            )}
          </div>
        </div>
        {editingPermission && (
          <EditPermissionDialog
            permission={editingPermission}
            modules={modules}
            onSave={handleSavePermission}
            onOpenChange={(open) => !open && setEditingPermission(null)}
            open={!!editingPermission}
          />
        )}
      </div>
    </div>
  );
}
