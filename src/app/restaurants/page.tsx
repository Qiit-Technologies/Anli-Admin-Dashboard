"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import SearchWithIcon from "@/components/common/searchWithIcon";
import { Pagination } from "@/components/common/pagination";
import {
  Table,
  Tbody,
  Thead,
  Th,
  Td,
  Tr,
  StatusBadge,
} from "@/components/common/customTable";
import { useDebounce } from "@/hooks/useDebounce";
import {
  createScrapedRestaurant,
  deleteScrapedRestaurant,
  getScrapedRestaurants,
  RestaurantCatalogItem,
  updateScrapedRestaurant,
} from "@/app/actions/restaurants";

const emptyForm = {
  name: "",
  address: "",
  coverImage: "",
  tags: "",
  displayHours: "",
  rating: 4.0,
  ratingCount: 0,
  isBookable: false,
  isActive: true,
  file: null as File | null,
};

type RestaurantForm = Partial<RestaurantCatalogItem> & {
  file?: File | null;
};

type RestaurantFormErrors = Partial<{
  name: string;
  rating: string;
  ratingCount: string;
}>;

const validateRestaurantForm = (
  formData: RestaurantForm,
): RestaurantFormErrors => {
  const errors: RestaurantFormErrors = {};

  if (!formData.name?.trim()) {
    errors.name = "Restaurant name is required";
  }

  if (
    formData.rating !== undefined &&
    (Number.isNaN(Number(formData.rating)) ||
      Number(formData.rating) < 0 ||
      Number(formData.rating) > 5)
  ) {
    errors.rating = "Rating must be between 0 and 5";
  }

  if (
    formData.ratingCount !== undefined &&
    (Number.isNaN(Number(formData.ratingCount)) ||
      Number(formData.ratingCount) < 0)
  ) {
    errors.ratingCount = "Rating count cannot be negative";
  }

  return errors;
};

const AddRestaurantDialog = ({
  onAddRestaurant,
}: {
  onAddRestaurant: (restaurant: RestaurantForm) => Promise<void>;
}) => {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<RestaurantForm>(emptyForm);
  const [errors, setErrors] = useState<RestaurantFormErrors>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateRestaurantForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast.error(Object.values(validationErrors)[0]);
      return;
    }

    setSaving(true);
    try {
      await onAddRestaurant(formData);
      setFormData(emptyForm);
      setErrors({});
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="text-base font-medium text-white rounded-md bg-[#F47411] hover:bg-[#F47411]/90">
          Add Restaurant
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Add Restaurant</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <FormLabel htmlFor="name">Name</FormLabel>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                setErrors((current) => ({ ...current, name: undefined }));
              }}
              required
              aria-invalid={Boolean(errors.name)}
              className={
                errors.name ? "border-red-500 focus-visible:ring-red-500" : ""
              }
            />
            {errors.name && (
              <p className="text-xs text-red-600">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <FormLabel htmlFor="address">Address</FormLabel>
            <Input
              id="address"
              value={formData.address || ""}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <FormLabel htmlFor="coverImage">Cover Image</FormLabel>
            <Input
              id="coverImage"
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/gif"
              onChange={(e) =>
                setFormData({ ...formData, file: e.target.files?.[0] || null })
              }
            />
          </div>

          <div className="space-y-2">
            <FormLabel htmlFor="tags">Tags</FormLabel>
            <Input
              id="tags"
              value={formData.tags || ""}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <FormLabel htmlFor="displayHours">Display Hours</FormLabel>
            <Input
              id="displayHours"
              value={formData.displayHours || ""}
              onChange={(e) =>
                setFormData({ ...formData, displayHours: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <FormLabel htmlFor="rating">Rating</FormLabel>
              <Input
                id="rating"
                type="number"
                step="0.1"
                min={0}
                max={5}
                value={formData.rating ?? 0}
                onChange={(e) => {
                  setFormData({ ...formData, rating: Number(e.target.value) });
                  setErrors((current) => ({ ...current, rating: undefined }));
                }}
                aria-invalid={Boolean(errors.rating)}
              />
              {errors.rating && (
                <p className="text-xs text-red-600">{errors.rating}</p>
              )}
            </div>

            <div className="space-y-2">
              <FormLabel htmlFor="ratingCount">Rating Count</FormLabel>
              <Input
                id="ratingCount"
                type="number"
                min={0}
                value={formData.ratingCount ?? 0}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    ratingCount: Number(e.target.value),
                  });
                  setErrors((current) => ({
                    ...current,
                    ratingCount: undefined,
                  }));
                }}
                aria-invalid={Boolean(errors.ratingCount)}
              />
              {errors.ratingCount && (
                <p className="text-xs text-red-600">{errors.ratingCount}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(formData.isBookable)}
                onChange={(e) =>
                  setFormData({ ...formData, isBookable: e.target.checked })
                }
              />
              Bookable
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(formData.isActive)}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
              />
              Active
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#F47411] text-white hover:bg-[#F47411]/90"
              disabled={saving}
            >
              {saving ? <Spinner size="sm" /> : "Create Restaurant"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const EditRestaurantDialog = ({
  restaurant,
  onSave,
  onOpenChange,
  open,
  saving,
}: {
  restaurant: RestaurantCatalogItem;
  onSave: (restaurant: RestaurantForm) => Promise<void>;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  saving: boolean;
}) => {
  const [formData, setFormData] = useState<RestaurantForm>(restaurant);
  const [errors, setErrors] = useState<RestaurantFormErrors>({});

  useEffect(() => {
    setFormData(restaurant);
    setErrors({});
  }, [restaurant, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateRestaurantForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast.error(Object.values(validationErrors)[0]);
      return;
    }

    await onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Restaurant</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <FormLabel htmlFor="name">Name</FormLabel>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                setErrors((current) => ({ ...current, name: undefined }));
              }}
              required
              aria-invalid={Boolean(errors.name)}
              className={
                errors.name ? "border-red-500 focus-visible:ring-red-500" : ""
              }
            />
            {errors.name && (
              <p className="text-xs text-red-600">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <FormLabel htmlFor="address">Address</FormLabel>
            <Input
              id="address"
              value={formData.address || ""}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <FormLabel htmlFor="coverImage">Cover Image</FormLabel>
            <Input
              id="coverImage"
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/gif"
              onChange={(e) =>
                setFormData({ ...formData, file: e.target.files?.[0] || null })
              }
            />
          </div>

          <div className="space-y-2">
            <FormLabel htmlFor="tags">Tags</FormLabel>
            <Input
              id="tags"
              value={formData.tags || ""}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <FormLabel htmlFor="displayHours">Display Hours</FormLabel>
            <Input
              id="displayHours"
              value={formData.displayHours || ""}
              onChange={(e) =>
                setFormData({ ...formData, displayHours: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <FormLabel htmlFor="rating">Rating</FormLabel>
              <Input
                id="rating"
                type="number"
                step="0.1"
                min={0}
                max={5}
                value={formData.rating ?? 0}
                onChange={(e) => {
                  setFormData({ ...formData, rating: Number(e.target.value) });
                  setErrors((current) => ({ ...current, rating: undefined }));
                }}
                aria-invalid={Boolean(errors.rating)}
              />
              {errors.rating && (
                <p className="text-xs text-red-600">{errors.rating}</p>
              )}
            </div>

            <div className="space-y-2">
              <FormLabel htmlFor="ratingCount">Rating Count</FormLabel>
              <Input
                id="ratingCount"
                type="number"
                min={0}
                value={formData.ratingCount ?? 0}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    ratingCount: Number(e.target.value),
                  });
                  setErrors((current) => ({
                    ...current,
                    ratingCount: undefined,
                  }));
                }}
                aria-invalid={Boolean(errors.ratingCount)}
              />
              {errors.ratingCount && (
                <p className="text-xs text-red-600">{errors.ratingCount}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(formData.isBookable)}
                onChange={(e) =>
                  setFormData({ ...formData, isBookable: e.target.checked })
                }
              />
              Bookable
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(formData.isActive)}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
              />
              Active
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#F47411] text-white hover:bg-[#F47411]/90"
              disabled={saving}
            >
              {saving ? <Spinner size="sm" /> : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default function RestaurantsPage() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<RestaurantCatalogItem[]>([]);
  console.log("Restaurants: ", restaurants);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingRestaurant, setEditingRestaurant] =
    useState<RestaurantCatalogItem | null>(null);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query);
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const data = await getScrapedRestaurants();
        setRestaurants(data);
      } catch (error: any) {
        toast.error(error?.message || "Failed to load restaurants");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery]);

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const searchValue = debouncedQuery.toLowerCase();
    return [restaurant?.name, restaurant?.address, restaurant?.tags]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(searchValue));
  });

  const totalPages = Math.max(1, Math.ceil(filteredRestaurants.length / limit));
  const paginatedRestaurants = filteredRestaurants.slice(
    (page - 1) * limit,
    page * limit,
  );

  const handleCreateOrUpdate = async (formData: RestaurantForm) => {
    if (!formData.name?.trim()) {
      toast.error("Restaurant name is required");
      return;
    }

    setSaving(true);

    try {
      if (editingRestaurant?.id) {
        const updated = await updateScrapedRestaurant(
          editingRestaurant.id,
          formData,
        );
        //@ts-expect-error typescript doesnt recognize the type
        setRestaurants((prev) =>
          prev.map((item) =>
            item.id === editingRestaurant.id ? updated : item,
          ),
        );
        toast.success("Restaurant updated successfully");
      } else {
        const created = await createScrapedRestaurant(formData);
        //@ts-expect-error typescript doesnt recognize the type
        setRestaurants((prev) => [created, ...prev]);
        toast.success("Restaurant created successfully");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to save restaurant");
    } finally {
      setSaving(false);
      setEditingRestaurant(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this scraped restaurant?")) return;

    try {
      await deleteScrapedRestaurant(id);
      setRestaurants((prev) =>
        prev.filter((restaurant) => restaurant.id !== id),
      );
      toast.success("Restaurant deleted successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete restaurant");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/business-list")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm sm:text-base"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Back to Business List</span>
            <span className="sm:hidden">Back</span>
          </Button>
          <div className="hidden sm:block w-24" />
        </div>

        <div className="text-center mb-8">
          <Image
            src="/logo.svg"
            alt="Anli logo"
            width={120}
            height={70}
            className="mx-auto"
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="flex flex-col px-4 sm:px-6 py-4 sm:flex-row justify-between items-start sm:items-center gap-3 border-b">
            <h2 className="text-base sm:text-lg font-normal text-[#101828]">
              Scraped Restaurant Catalog
            </h2>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <SearchWithIcon
                className="w-full sm:w-[300px] md:w-[478px]"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <AddRestaurantDialog onAddRestaurant={handleCreateOrUpdate} />
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="p-5">
                <Spinner size="lg" />
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="min-w-full inline-block align-middle">
                  <Table>
                    <Thead>
                      <Tr>
                        <Th withIcon>Name</Th>
                        <Th withIcon>Address</Th>
                        <Th withIcon>Rating</Th>
                        <Th withIcon>Status</Th>
                        <Th>Action</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {paginatedRestaurants.map((restaurant) => (
                        <Tr key={restaurant.id}>
                          <Td className="min-w-[150px] font-medium">
                            {restaurant.name}
                          </Td>
                          <Td className="min-w-[220px] text-gray-600">
                            {restaurant.address || "—"}
                          </Td>
                          <Td className="min-w-[120px] text-gray-600">
                            {restaurant.rating ?? 0} (
                            {restaurant.ratingCount ?? 0})
                          </Td>
                          <Td className="min-w-[110px]">
                            <StatusBadge
                              status={
                                restaurant.isActive ? "Active" : "Inactive"
                              }
                              statusColorMap={{
                                Active: "green",
                                Inactive: "gray",
                              }}
                            />
                          </Td>
                          <Td className="text-blue-600 hover:underline cursor-pointer py-4 px-4 min-w-[120px]">
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                              <span
                                className="cursor-pointer text-blue-600 hover:underline text-sm"
                                onClick={() => setEditingRestaurant(restaurant)}
                              >
                                Edit
                              </span>
                              <span
                                className="cursor-pointer text-red-600 hover:underline text-sm"
                                onClick={() => handleDelete(restaurant.id)}
                              >
                                Delete
                              </span>
                            </div>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </div>
                <div className="mt-4">
                  <Pagination
                    totalPages={totalPages}
                    page={page}
                    onPageChange={setPage}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {editingRestaurant && (
          <EditRestaurantDialog
            restaurant={editingRestaurant}
            open={!!editingRestaurant}
            onOpenChange={(open) => {
              if (!open) setEditingRestaurant(null);
            }}
            onSave={handleCreateOrUpdate}
            saving={saving}
          />
        )}
      </div>
    </div>
  );
}
