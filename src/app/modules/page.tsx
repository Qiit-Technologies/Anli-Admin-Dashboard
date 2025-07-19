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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

const ModuleTable = ({
  modules,
  onDelete,
  onEditClick,
}: {
  modules: Module[];
  onDelete: (id: number) => void;
  onEditClick: (module: Module) => void;
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {modules.map((module) => (
          <TableRow key={module.id}>
            <TableCell className="font-medium">{module.name}</TableCell>
            <TableCell>{module.description || "-"}</TableCell>
            <TableCell className="text-right">
              <Button
                variant="outline"
                size="sm"
                className="mr-2"
                onClick={() => onEditClick(module)}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                className="text-red-500"
                size="sm"
                onClick={() => onDelete(module.id)}
              >
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

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

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await getModulesList();
        console.log(response);
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
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/business-list")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft size={20} />
              Back to Business List
            </Button>
          </div>
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
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  System Modules
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Manage modules across all businesses
                </p>
              </div>
              <AddModuleDialog onAddModule={handleAddModule} />
            </div>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#F47411]"></div>
                <p className="mt-2 text-gray-500">Loading modules...</p>
              </div>
            ) : (
              <ModuleTable
                modules={modules}
                onDelete={handleDeleteModule}
                onEditClick={handleEditClick}
              />
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
