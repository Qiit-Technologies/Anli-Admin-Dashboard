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
import { ArrowLeft, Layers } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import getModulesList, {
  createModule,
  updateModule,
  deleteModule,
  type Module,
} from "../actions/modules";
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

const AddModuleDialog = ({
  onAddModule,
}: {
  onAddModule: (module: { name: string; description?: string }) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log("Submitting module data:", { name, description });
      await createModule({ name, description });
      onAddModule({ name, description });
      setName("");
      setDescription("");
      setOpen(false);
    } catch (error) {
      console.error("Failed to create module:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="text-base font-medium text-white rounded-md bg-[#F47411] hover:bg-[#F47411]/90">
          Add Module
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Module</DialogTitle>
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
            <label htmlFor="description">Description (Optional)</label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <Button
              className="text-base font-medium text-white rounded-md bg-[#F47411] hover:bg-[#F47411]/90"
              type="submit"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const EditModuleDialog = ({
  module,
  onSave,
  onOpenChange,
  open,
}: {
  module: Module;
  onSave: (module: Module) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) => {
  const [formData, setFormData] = useState<{
    name: string;
    description?: string;
  }>({
    name: module.name,
    description: module.description,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateModule(module.id, formData);
      onSave({
        ...module,
        ...formData,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update module:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Module</DialogTitle>
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
            <label htmlFor="description">Description (Optional)</label>
            <Input
              id="description"
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>
          <div className="flex justify-end">
            <Button
              className="text-base font-medium text-white rounded-md bg-[#F47411] hover:bg-[#F47411]/90"
              type="submit"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default function ModulePage() {
  const router = useRouter();
  const [modules, setModules] = useState<Module[]>([]);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query);
  const [page, setPage] = useState(1);
  const limit = 10;

  // Simulate search and pagination client-side
  const filteredModules = modules.filter((m) =>
    m.name.toLowerCase().includes(debouncedQuery.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filteredModules.length / limit));
  const paginatedModules = filteredModules.slice(
    (page - 1) * limit,
    page * limit
  );

  useEffect(() => {
    setPage(1); // Reset to first page on new search
  }, [debouncedQuery]);

  useEffect(() => {
    const fetchModules = async () => {
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
    fetchModules();
  }, []);
  console.log(modules);
  const handleAddModule = async (moduleData: {
    name: string;
    description?: string;
  }) => {
    try {
      let response;
      try {
        response = await createModule(moduleData);
      } catch (error) {
        console.error("Failed to create module:", error);
        throw error;
      }
      if (response && response.data) {
        setModules([...modules, response.data]);
      }
    } catch (error) {
      console.error("Failed to add module:", error);
    }
  };

  const handleDeleteModule = async (id: number) => {
    try {
      await deleteModule(id);
      setModules(modules.filter((m) => m.id !== id));
    } catch (error) {
      console.error("Failed to delete module:", error);
    }
  };

  const handleEditClick = (module: Module) => {
    setEditingModule(module);
  };

  const handleSaveModule = (updatedModule: Module) => {
    setModules(
      modules.map((m) => (m.id === updatedModule.id ? updatedModule : m))
    );
    setEditingModule(null);
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
          <div className="flex items-center gap-3">
            <Layers size={24} className="text-[#F47411]" />
            <h1 className="text-2xl font-bold text-gray-900">Modules</h1>
          </div>
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
              System Modules
            </h2>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <SearchWithIcon
                className="w-[478px]"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <AddModuleDialog onAddModule={handleAddModule} />
            </div>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="p-5">
                <Spinner size="lg" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <Thead>
                    <Tr>
                      <Th withIcon>Name</Th>
                      <Th withIcon>Description</Th>
                      <Th>Action</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {paginatedModules.map((module) => (
                      <Tr key={module.id}>
                        <Td>{module.name}</Td>
                        <Td>{module.description || "-"}</Td>
                        <Td className="text-blue-600 hover:underline cursor-pointer py-4 px-4">
                          <span
                            className="mr-4 cursor-pointer text-blue-600 hover:underline"
                            onClick={() => handleEditClick(module)}
                          >
                            Edit
                          </span>
                          <span
                            className="cursor-pointer text-red-600 hover:underline"
                            onClick={() => handleDeleteModule(module.id)}
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
        {editingModule && (
          <EditModuleDialog
            module={editingModule}
            onSave={handleSaveModule}
            onOpenChange={(open) => !open && setEditingModule(null)}
            open={!!editingModule}
          />
        )}
      </div>
    </div>
  );
}
