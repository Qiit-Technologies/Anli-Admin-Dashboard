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
import { useState } from "react";
import Sidebar from "../components/layout/sidebar";

type Permission = {
  id: string;
  name: string;
  description: string;
};

const mockPermissions: Permission[] = [
  { id: "1", name: "read", description: "Read access" },
  { id: "2", name: "write", description: "Write access" },
  { id: "3", name: "admin", description: "Administrator access" },
];

const PermissionTable = ({
  permissions,
  onDelete,
  onEditClick,
}: {
  permissions: Permission[];
  onDelete: (id: string) => void;
  onEditClick: (permission: Permission) => void;
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
        {permissions.map((permission) => (
          <TableRow key={permission.id}>
            <TableCell className="font-medium">{permission.name}</TableCell>
            <TableCell>{permission.description}</TableCell>
            <TableCell className="text-right">
              <Button
                variant="outline"
                size="sm"
                className="mr-2"
                onClick={() => onEditClick(permission)}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                className="text-red-500"
                size="sm"
                onClick={() => onDelete(permission.id)}
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

const AddPermissionDialog = ({
  onAddPermission,
}: {
  onAddPermission: (permission: Omit<Permission, "id">) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddPermission({ name, description });
    setName("");
    setDescription("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="text-base font-medium text-white rounded-md bg-app-primary hover:bg-app-primary">
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
          <div className="flex justify-end">
            <Button
              className="text-base font-medium text-white rounded-md bg-app-primary hover:bg-app-primary"
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
  onSave,
  onOpenChange,
  open,
}: {
  permission: Permission;
  onSave: (permission: Permission) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) => {
  const [formData, setFormData] = useState<Omit<Permission, "id">>({
    name: permission.name,
    description: permission.description,
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
          <div className="flex justify-end">
            <Button
              className="text-base font-medium text-white rounded-md bg-app-primary hover:bg-app-primary"
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>(mockPermissions);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(
    null
  );

  const handleAddPermission = (permission: Omit<Permission, "id">) => {
    const newPermission: Permission = {
      ...permission,
      id: Date.now().toString(),
    };
    setPermissions([...permissions, newPermission]);
  };

  const handleDeletePermission = (id: string) => {
    setPermissions(permissions.filter((p) => p.id !== id));
  };

  const handleEditClick = (permission: Permission) => {
    setEditingPermission(permission);
  };

  const handleSavePermission = (updatedPermission: Permission) => {
    setPermissions(
      permissions.map((p) =>
        p.id === updatedPermission.id ? updatedPermission : p
      )
    );
    setEditingPermission(null);
  };

  return (
    <div className="flex flex-col min-h-screen sm:flex-row">
      <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />
      <div className="flex flex-col flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Permissions</h1>
          <AddPermissionDialog onAddPermission={handleAddPermission} />
        </div>
        <div className="rounded-md border">
          <PermissionTable
            permissions={permissions}
            onDelete={handleDeletePermission}
            onEditClick={handleEditClick}
          />
        </div>

        {editingPermission && (
          <EditPermissionDialog
            permission={editingPermission}
            onSave={handleSavePermission}
            onOpenChange={(open) => !open && setEditingPermission(null)}
            open={!!editingPermission}
          />
        )}
      </div>
    </div>
  );
}
