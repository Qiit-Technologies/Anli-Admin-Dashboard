"use client";

import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { ArrowLeft, Eye } from "lucide-react";
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

const emptyForm: RestaurantForm = {
  name: "",
  address: "",
  coverImage: "",
  tags: "",
  displayHours: "",
  rating: 4.0,
  ratingCount: 0,
  isBookable: false,
  isActive: true,
  file: null,
  headline: "",
  description: "",
  amenities: [],
  website: "",
  contactEmail: "",
  contactPhone: "",
  twitterUrl: "",
  linkedinUrl: "",
  instagramUrl: "",
  facebookUrl: "",
  city: "",
  neighborhood: "",
  weekdayHours: "",
  weekendHours: "",
  closeTime: "",
  priceLevel: "$$$",
  averageCostForTwo: undefined,
  promoTitle: "",
  promoDescription: "",
  whyDinersLoveUs: [],
  serviceTypes: [],
  dietaryPreferences: [],
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
    formData.rating !== null &&
    (Number.isNaN(Number(formData.rating)) ||
      Number(formData.rating) < 0 ||
      Number(formData.rating) > 5)
  ) {
    errors.rating = "Rating must be between 0 and 5";
  }

  if (
    formData.ratingCount !== undefined &&
    formData.ratingCount !== null &&
    (Number.isNaN(Number(formData.ratingCount)) ||
      Number(formData.ratingCount) < 0)
  ) {
    errors.ratingCount = "Rating count cannot be negative";
  }

  return errors;
};

const ImagePreview = ({
  src,
  alt,
  onClear,
}: {
  src: string;
  alt?: string;
  onClear?: () => void;
}) => {
  const [error, setError] = useState(false);

  if (error || !src) return null;

  return (
    <div className="relative w-full h-40 rounded-lg overflow-hidden border bg-gray-50">
      <Image
        src={src}
        alt={alt || "Preview"}
        fill
        className="object-cover"
        onError={() => setError(true)}
      />
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
};

/** Shared form fields used by both Add and Edit dialogs */
const RestaurantFormFields = ({
  formData,
  setFormData,
  errors,
  setErrors,
  previewUrl,
  currentCoverImage,
  fileInputRef,
  onFileChange,
  onClearPreview,
  isEdit,
}: {
  formData: RestaurantForm;
  setFormData: (d: RestaurantForm) => void;
  errors: RestaurantFormErrors;
  setErrors: (fn: (prev: RestaurantFormErrors) => RestaurantFormErrors) => void;
  previewUrl: string | null;
  currentCoverImage?: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearPreview: () => void;
  isEdit?: boolean;
}) => {
  const f = formData;
  const set = (patch: Partial<RestaurantForm>) =>
    setFormData({ ...f, ...patch });

  const getInputValue = (val?: string[] | string | null): string => {
    if (val === undefined || val === null) return "";
    if (typeof val === "string") return val;
    if (Array.isArray(val)) return val.join(", ");
    return "";
  };

  const currentImageSrc =
    previewUrl || (isEdit ? currentCoverImage || null : null);

  return (
    <div className="space-y-5">
      {/* ── Basic Info ─────────────────────────────────────────── */}
      <div className="pb-1 border-b border-gray-100">
        <p className="text-xs font-bold uppercase tracking-widest text-[#F47411]">
          Basic Info
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-2">
          <FormLabel htmlFor="name">
            Name <span className="text-red-500">*</span>
          </FormLabel>
          <Input
            id="name"
            value={f.name || ""}
            onChange={(e) => {
              set({ name: e.target.value });
              setErrors((p) => ({ ...p, name: undefined }));
            }}
            required
            aria-invalid={Boolean(errors.name)}
            className={errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}
          />
          {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <FormLabel htmlFor="address">Address</FormLabel>
          <Input
            id="address"
            value={f.address || ""}
            onChange={(e) => set({ address: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <FormLabel htmlFor="coverImage">Cover Image</FormLabel>
          <Input
            ref={fileInputRef}
            id="coverImage"
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
            onChange={onFileChange}
          />
          {currentImageSrc && (
            <div className="mt-2">
              <ImagePreview src={currentImageSrc} onClear={onClearPreview} />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-2">
          <FormLabel htmlFor="tags">Tags (comma-separated)</FormLabel>
          <Input
            id="tags"
            value={f.tags || ""}
            onChange={(e) => set({ tags: e.target.value })}
            placeholder="Nigerian, Fine Dining, Outdoor"
          />
        </div>

        <div className="space-y-2">
          <FormLabel htmlFor="displayHours">Display Hours</FormLabel>
          <Input
            id="displayHours"
            value={f.displayHours || ""}
            onChange={(e) => set({ displayHours: e.target.value })}
            placeholder="Mon–Sun: 10 AM – 11 PM"
          />
        </div>

        <div className="space-y-2">
          <FormLabel htmlFor="rating">Rating (0–5)</FormLabel>
          <Input
            id="rating"
            type="number"
            step="0.1"
            min={0}
            max={5}
            value={f.rating ?? 0}
            onChange={(e) => {
              set({ rating: Number(e.target.value) });
              setErrors((p) => ({ ...p, rating: undefined }));
            }}
            aria-invalid={Boolean(errors.rating)}
          />
          {errors.rating && (
            <p className="text-xs text-red-600">{errors.rating}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
        <div className="space-y-2">
          <FormLabel htmlFor="ratingCount">Rating Count</FormLabel>
          <Input
            id="ratingCount"
            type="number"
            min={0}
            value={f.ratingCount ?? 0}
            onChange={(e) => {
              set({ ratingCount: Number(e.target.value) });
              setErrors((p) => ({ ...p, ratingCount: undefined }));
            }}
            aria-invalid={Boolean(errors.ratingCount)}
          />
          {errors.ratingCount && (
            <p className="text-xs text-red-600">{errors.ratingCount}</p>
          )}
        </div>

        <div className="flex items-center gap-2 pt-5">
          <input
            type="checkbox"
            id="isBookable"
            checked={Boolean(f.isBookable)}
            onChange={(e) => set({ isBookable: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-[#F47411] focus:ring-[#F47411]"
          />
          <FormLabel htmlFor="isBookable" className="cursor-pointer">
            Bookable
          </FormLabel>
        </div>

        <div className="flex items-center gap-2 pt-5">
          <input
            type="checkbox"
            id="isActive"
            checked={Boolean(f.isActive)}
            onChange={(e) => set({ isActive: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-[#F47411] focus:ring-[#F47411]"
          />
          <FormLabel htmlFor="isActive" className="cursor-pointer">
            Active
          </FormLabel>
        </div>
      </div>

      {/* ── Branding & Story ──────────────────────────────────── */}
      <div className="pt-2 pb-1 border-b border-gray-100">
        <p className="text-xs font-bold uppercase tracking-widest text-[#F47411]">
          Branding & Story
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-2 sm:col-span-1">
          <FormLabel htmlFor="headline">Main Headline / Tagline</FormLabel>
          <Input
            id="headline"
            value={f.headline || ""}
            onChange={(e) => set({ headline: e.target.value })}
            placeholder="Serving The Best Flavours In Lagos, Nigeria."
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <FormLabel htmlFor="amenities">
            Amenities / Feature Badges (comma-separated)
          </FormLabel>
          <Input
            id="amenities"
            value={getInputValue(f.amenities)}
            onChange={(e) => set({ amenities: e.target.value })}
            placeholder="Date Night, Outdoor Seating, Romantic Ambience"
          />
        </div>
      </div>

      <div className="space-y-2">
        <FormLabel htmlFor="description">About / Description</FormLabel>
        <textarea
          id="description"
          rows={3}
          value={f.description || ""}
          onChange={(e) => set({ description: e.target.value })}
          placeholder="Home of bold flavors, crafted cocktails..."
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>

      {/* ── Contact & Web ─────────────────────────────────────── */}
      <div className="pt-2 pb-1 border-b border-gray-100">
        <p className="text-xs font-bold uppercase tracking-widest text-[#F47411]">
          Contact & Web
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-2">
          <FormLabel htmlFor="contactPhone">Phone</FormLabel>
          <Input
            id="contactPhone"
            value={f.contactPhone || ""}
            onChange={(e) => set({ contactPhone: e.target.value })}
            placeholder="+234 800 000 0000"
          />
        </div>
        <div className="space-y-2">
          <FormLabel htmlFor="contactEmail">Email</FormLabel>
          <Input
            id="contactEmail"
            type="email"
            value={f.contactEmail || ""}
            onChange={(e) => set({ contactEmail: e.target.value })}
            placeholder="hello@restaurant.com"
          />
        </div>
        <div className="space-y-2">
          <FormLabel htmlFor="website">Website</FormLabel>
          <Input
            id="website"
            value={f.website || ""}
            onChange={(e) => set({ website: e.target.value })}
            placeholder="www.restaurant.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-2">
          <FormLabel htmlFor="twitterUrl">Twitter URL</FormLabel>
          <Input
            id="twitterUrl"
            value={f.twitterUrl || ""}
            onChange={(e) => set({ twitterUrl: e.target.value })}
            placeholder="https://twitter.com/..."
          />
        </div>
        <div className="space-y-2">
          <FormLabel htmlFor="instagramUrl">Instagram URL</FormLabel>
          <Input
            id="instagramUrl"
            value={f.instagramUrl || ""}
            onChange={(e) => set({ instagramUrl: e.target.value })}
            placeholder="https://instagram.com/..."
          />
        </div>
        <div className="space-y-2">
          <FormLabel htmlFor="facebookUrl">Facebook URL</FormLabel>
          <Input
            id="facebookUrl"
            value={f.facebookUrl || ""}
            onChange={(e) => set({ facebookUrl: e.target.value })}
            placeholder="https://facebook.com/..."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-2">
          <FormLabel htmlFor="linkedinUrl">LinkedIn URL</FormLabel>
          <Input
            id="linkedinUrl"
            value={f.linkedinUrl || ""}
            onChange={(e) => set({ linkedinUrl: e.target.value })}
            placeholder="https://linkedin.com/..."
          />
        </div>
      </div>

      {/* ── Location & Hours ──────────────────────────────────── */}
      <div className="pt-2 pb-1 border-b border-gray-100">
        <p className="text-xs font-bold uppercase tracking-widest text-[#F47411]">
          Location & Hours
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-2">
          <FormLabel htmlFor="city">City / Region</FormLabel>
          <Input
            id="city"
            value={f.city || ""}
            onChange={(e) => set({ city: e.target.value })}
            placeholder="Lagos"
          />
        </div>
        <div className="space-y-2">
          <FormLabel htmlFor="neighborhood">Neighborhood</FormLabel>
          <Input
            id="neighborhood"
            value={f.neighborhood || ""}
            onChange={(e) => set({ neighborhood: e.target.value })}
            placeholder="Lekki Phase 1"
          />
        </div>
        <div className="space-y-2">
          <FormLabel htmlFor="closeTime">Closing Badge Text</FormLabel>
          <Input
            id="closeTime"
            value={f.closeTime || ""}
            onChange={(e) => set({ closeTime: e.target.value })}
            placeholder="Close 11:30 PM"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-2">
          <FormLabel htmlFor="weekdayHours">Weekday Hours</FormLabel>
          <Input
            id="weekdayHours"
            value={f.weekdayHours || ""}
            onChange={(e) => set({ weekdayHours: e.target.value })}
            placeholder="Mon–Fri: 10 AM – 11 PM"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <FormLabel htmlFor="weekendHours">Weekend Hours</FormLabel>
          <Input
            id="weekendHours"
            value={f.weekendHours || ""}
            onChange={(e) => set({ weekendHours: e.target.value })}
            placeholder="Sat–Sun: 8 AM – 12 AM"
          />
        </div>
      </div>

      {/* ── Pricing & Promo ───────────────────────────────────── */}
      <div className="pt-2 pb-1 border-b border-gray-100">
        <p className="text-xs font-bold uppercase tracking-widest text-[#F47411]">
          Pricing & Promo
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-2">
          <FormLabel htmlFor="priceLevel">Price Tier</FormLabel>
          <select
            id="priceLevel"
            value={f.priceLevel || "$$$"}
            onChange={(e) => set({ priceLevel: e.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="$">$ – Budget Friendly</option>
            <option value="$$">$$ – Moderate</option>
            <option value="$$$">$$$ – Fine Dining</option>
            <option value="$$$$">$$$$ – Ultra Luxury</option>
          </select>
        </div>
        <div className="space-y-2">
          <FormLabel htmlFor="averageCostForTwo">Avg Cost for 2 (₦)</FormLabel>
          <Input
            id="averageCostForTwo"
            type="number"
            min={0}
            value={f.averageCostForTwo ?? ""}
            onChange={(e) =>
              set({
                averageCostForTwo: e.target.value
                  ? Number(e.target.value)
                  : undefined,
              })
            }
            placeholder="50000"
          />
        </div>
        <div className="space-y-2">
          <FormLabel htmlFor="promoTitle">Promo Card Title</FormLabel>
          <Input
            id="promoTitle"
            value={f.promoTitle || ""}
            onChange={(e) => set({ promoTitle: e.target.value })}
            placeholder="Discover more. Dine Better."
          />
        </div>
      </div>

      <div className="space-y-2">
        <FormLabel htmlFor="promoDescription">Promo Card Body</FormLabel>
        <Input
          id="promoDescription"
          value={f.promoDescription || ""}
          onChange={(e) => set({ promoDescription: e.target.value })}
          placeholder="Find more restaurants for every occasion."
        />
      </div>

      {/* ── Dining Details ────────────────────────────────────── */}
      <div className="pt-2 pb-1 border-b border-gray-100">
        <p className="text-xs font-bold uppercase tracking-widest text-[#F47411]">
          Dining Details
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-2">
          <FormLabel htmlFor="whyDinersLoveUs">
            Why Diners Love Us (comma-separated)
          </FormLabel>
          <Input
            id="whyDinersLoveUs"
            value={getInputValue(f.whyDinersLoveUs)}
            onChange={(e) => set({ whyDinersLoveUs: e.target.value })}
            placeholder="Amazing cocktails, Live music"
          />
        </div>
        <div className="space-y-2">
          <FormLabel htmlFor="serviceTypes">
            Service Types (comma-separated)
          </FormLabel>
          <Input
            id="serviceTypes"
            value={getInputValue(f.serviceTypes)}
            onChange={(e) => set({ serviceTypes: e.target.value })}
            placeholder="Dine-in, Takeout, Delivery"
          />
        </div>
        <div className="space-y-2">
          <FormLabel htmlFor="dietaryPreferences">
            Dietary Options (comma-separated)
          </FormLabel>
          <Input
            id="dietaryPreferences"
            value={getInputValue(f.dietaryPreferences)}
            onChange={(e) => set({ dietaryPreferences: e.target.value })}
            placeholder="Vegan, Halal, Gluten-Free"
          />
        </div>
      </div>
    </div>
  );
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, file });
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const clearPreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFormData({ ...formData, file: null });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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
      clearPreview();
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
      <DialogContent className="!max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Restaurant</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pb-2">
          <RestaurantFormFields
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
            previewUrl={previewUrl}
            fileInputRef={fileInputRef}
            onFileChange={handleFileChange}
            onClearPreview={clearPreview}
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
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

const ViewRestaurantDialog = ({
  restaurant,
  open,
  onOpenChange,
}: {
  restaurant: RestaurantCatalogItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  if (!restaurant) return null;

  const field = (label: string, value?: string | number | null) => (
    <div>
      <span className="text-gray-500 text-xs">{label}</span>
      <p className="font-medium text-sm">{value ?? "—"}</p>
    </div>
  );

  const formatVal = (val?: string[] | string | null): string | null => {
    if (!val) return null;
    if (Array.isArray(val)) return val.join(", ");
    return val;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{restaurant.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          {restaurant.coverImage && (
            <div className="relative w-full h-56 sm:h-72 rounded-lg overflow-hidden border bg-gray-50">
              <Image
                src={restaurant.coverImage}
                alt={restaurant.name}
                fill
                className="object-cover"
              />
            </div>
          )}

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#F47411] border-b border-gray-100 pb-1 mb-3">
              Basic Info
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              {field("Address", restaurant.address)}
              {field(
                "Rating",
                `${restaurant.rating ?? 0} (${restaurant.ratingCount ?? 0} reviews)`,
              )}
              {field("Tags", restaurant.tags)}
              {field("Display Hours", restaurant.displayHours)}
              <div>
                <span className="text-gray-500 text-xs">Status</span>
                <p>
                  <StatusBadge
                    status={restaurant.isActive ? "Active" : "Inactive"}
                    statusColorMap={{ Active: "green", Inactive: "gray" }}
                  />
                </p>
              </div>
              {field("Bookable", restaurant.isBookable ? "Yes" : "No")}
            </div>
          </div>

          {(restaurant.headline || restaurant.description || restaurant.amenities) && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#F47411] border-b border-gray-100 pb-1 mb-3">
                Branding & Story
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                {field("Headline", restaurant.headline)}
                {restaurant.description && (
                  <div className="sm:col-span-2">
                    <span className="text-gray-500 text-xs">Description</span>
                    <p className="font-medium text-sm">{restaurant.description}</p>
                  </div>
                )}
                {field("Amenities", formatVal(restaurant.amenities))}
              </div>
            </div>
          )}

          {(restaurant.contactPhone || restaurant.contactEmail || restaurant.website) && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#F47411] border-b border-gray-100 pb-1 mb-3">
                Contact & Web
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                {field("Phone", restaurant.contactPhone)}
                {field("Email", restaurant.contactEmail)}
                {field("Website", restaurant.website)}
                {field("Twitter", restaurant.twitterUrl)}
                {field("Instagram", restaurant.instagramUrl)}
                {field("Facebook", restaurant.facebookUrl)}
              </div>
            </div>
          )}

          {(restaurant.city || restaurant.weekdayHours) && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#F47411] border-b border-gray-100 pb-1 mb-3">
                Location & Hours
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                {field("City", restaurant.city)}
                {field("Neighborhood", restaurant.neighborhood)}
                {field("Close Time", restaurant.closeTime)}
                {field("Weekday Hours", restaurant.weekdayHours)}
                {field("Weekend Hours", restaurant.weekendHours)}
              </div>
            </div>
          )}

          {(restaurant.priceLevel || restaurant.promoTitle) && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#F47411] border-b border-gray-100 pb-1 mb-3">
                Pricing & Promo
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                {field("Price Tier", restaurant.priceLevel)}
                {field(
                  "Avg Cost for 2",
                  restaurant.averageCostForTwo
                    ? `₦${Number(restaurant.averageCostForTwo).toLocaleString()}`
                    : null,
                )}
                {field("Promo Title", restaurant.promoTitle)}
                {field("Promo Body", restaurant.promoDescription)}
              </div>
            </div>
          )}

          {(restaurant.whyDinersLoveUs ||
            restaurant.serviceTypes ||
            restaurant.dietaryPreferences) && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#F47411] border-b border-gray-100 pb-1 mb-3">
                  Dining Details
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  {field("Why Diners Love Us", formatVal(restaurant.whyDinersLoveUs))}
                  {field("Service Types", formatVal(restaurant.serviceTypes))}
                  {field("Dietary Options", formatVal(restaurant.dietaryPreferences))}
                </div>
              </div>
            )}
        </div>
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData(restaurant);
    setErrors({});
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [restaurant, open]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, file });
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const clearPreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFormData({ ...formData, file: null });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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
      <DialogContent className="!max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Restaurant</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pb-2">
          <RestaurantFormFields
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
            previewUrl={previewUrl}
            currentCoverImage={restaurant.coverImage}
            fileInputRef={fileInputRef}
            onFileChange={handleFileChange}
            onClearPreview={clearPreview}
            isEdit
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
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
  const [saving, setSaving] = useState(false);
  const [editingRestaurant, setEditingRestaurant] =
    useState<RestaurantCatalogItem | null>(null);
  const [viewingRestaurant, setViewingRestaurant] =
    useState<RestaurantCatalogItem | null>(null);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query);
  const [page, setPage] = useState(1);
  const limit = 10;

  const {
    data: fetchedRestaurants,
    isLoading: loading,
    mutate,
  } = useSWR<RestaurantCatalogItem[] | undefined>(
    "/super-admin/hotels/scraped-restaurants",
    getScrapedRestaurants,
  );

  const restaurants = fetchedRestaurants || [];

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
        await updateScrapedRestaurant(
          editingRestaurant.id,
          formData,
        );
        toast.success("Restaurant updated successfully");
      } else {
        await createScrapedRestaurant(formData);
        toast.success("Restaurant created successfully");
      }
      await mutate();
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
      toast.success("Restaurant deleted successfully");
      await mutate();
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

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Restaurant Catalog
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Manage scraped restaurants available to customers
              </p>
            </div>
            <AddRestaurantDialog onAddRestaurant={handleCreateOrUpdate} />
          </div>

          <div className="mb-4">
            <SearchWithIcon
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, address or tags…"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Spinner size="lg" />
            </div>
          ) : (
            <>
              <Table>
                <Thead>
                  <Tr>
                    <Th>Restaurant</Th>
                    <Th>Address</Th>
                    <Th>Rating</Th>
                    <Th>Price</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {paginatedRestaurants.length === 0 ? (
                    <Tr>
                      <Td colSpan={6} className="text-center py-10 text-gray-400">
                        No restaurants found
                      </Td>
                    </Tr>
                  ) : (
                    paginatedRestaurants.map((restaurant) => (
                      <Tr key={restaurant.id}>
                        <Td>
                          <div className="flex items-center gap-3">
                            {restaurant.coverImage && (
                              <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                                <Image
                                  src={restaurant.coverImage}
                                  alt={restaurant.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-sm">
                                {restaurant.name}
                              </p>
                              {restaurant.tags && (
                                <p className="text-xs text-gray-400">
                                  {restaurant.tags}
                                </p>
                              )}
                            </div>
                          </div>
                        </Td>
                        <Td className="text-sm text-gray-600 max-w-[180px] truncate">
                          {restaurant.address || "—"}
                        </Td>
                        <Td className="text-sm">
                          {restaurant.rating ?? 0}{" "}
                          <span className="text-gray-400 text-xs">
                            ({restaurant.ratingCount ?? 0})
                          </span>
                        </Td>
                        <Td className="text-sm font-medium">
                          {restaurant.priceLevel || "—"}
                        </Td>
                        <Td>
                          <StatusBadge
                            status={restaurant.isActive ? "Active" : "Inactive"}
                            statusColorMap={{
                              Active: "green",
                              Inactive: "gray",
                            }}
                          />
                        </Td>
                        <Td>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setViewingRestaurant(restaurant)}
                              className="p-1.5 rounded hover:bg-gray-100 text-gray-500"
                              title="View"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingRestaurant(restaurant)}
                              className="p-1.5 rounded hover:bg-orange-50 text-[#F47411]"
                              title="Edit"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(restaurant.id)}
                              className="p-1.5 rounded hover:bg-red-50 text-red-500"
                              title="Delete"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                <path d="M10 11v6" />
                                <path d="M14 11v6" />
                                <path d="M9 6V4h6v2" />
                              </svg>
                            </button>
                          </div>
                        </Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>

              {totalPages > 1 && (
                <div className="mt-4">
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* View Dialog */}
      <ViewRestaurantDialog
        restaurant={viewingRestaurant}
        open={Boolean(viewingRestaurant)}
        onOpenChange={(open) => !open && setViewingRestaurant(null)}
      />

      {/* Edit Dialog */}
      {editingRestaurant && (
        <EditRestaurantDialog
          restaurant={editingRestaurant}
          onSave={handleCreateOrUpdate}
          open={Boolean(editingRestaurant)}
          onOpenChange={(open) => !open && setEditingRestaurant(null)}
          saving={saving}
        />
      )}
    </div>
  );
}
