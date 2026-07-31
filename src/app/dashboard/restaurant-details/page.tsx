"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import {
    Utensils,
    Globe,
    Mail,
    Phone,
    Clock,
    MapPin,
    Share2,
    DollarSign,
    Star,
    Plus,
    Trash2,
    Loader2,
    Save,
    Sparkles,
    Image as ImageIcon,
    Heart,
} from "lucide-react";
import {
    FaTwitter,
    FaLinkedin,
    FaInstagram,
    FaFacebook,
} from "react-icons/fa";

import Header from "../components/layout/header";
import Sidebar from "../components/layout/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { useBusiness } from "@/context/businessContext";
import {
    getBusinessDetails,
    updateBusiness,
    uploadBusinessGalleryImage,
} from "@/app/actions/business";
import { BusinessDTO } from "@/types/business";

export interface HotelRestaurantDetails {
    rating?: number | null;
    ratingCount?: number | null;
    headline?: string | null;
    description?: string | null;
    amenities?: string[] | string | null;
    website?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    weekdayHours?: string | null;
    weekendHours?: string | null;
    closeTime?: string | null;
    city?: string | null;
    neighborhood?: string | null;
    priceLevel?: string | null;
    averageCostForTwo?: number | null;
    twitterUrl?: string | null;
    linkedinUrl?: string | null;
    instagramUrl?: string | null;
    facebookUrl?: string | null;
    promoTitle?: string | null;
    promoDescription?: string | null;
    whyDinersLoveUs?: string[] | string | Record<string, string> | null;
    serviceTypes?: string[] | string | null;
    dietaryPreferences?: string[] | string | null;
    images?: string[] | null;
}

type HotelWithRestaurantDetails = BusinessDTO & HotelRestaurantDetails;

/** Normalise a value that could be string | string[] | object into a plain comma-separated string */
function toInputString(val: unknown): string {
    if (!val) return "";
    if (typeof val === "string") return val;
    if (Array.isArray(val)) return val.join(", ");
    if (typeof val === "object") {
        return Object.values(val as Record<string, string>).join(", ");
    }
    return "";
}

const splitCsv = (val: string) =>
    val.split(",").map((s) => s.trim()).filter(Boolean);

interface RestaurantDetails {
    id: number | null;
    headline: string;
    description: string;
    amenities: string;
    website: string;
    contactEmail: string;
    contactPhone: string;
    weekdayHours: string;
    weekendHours: string;
    closeTime: string;
    city: string;
    neighborhood: string;
    priceLevel: string;
    averageCostForTwo: string;
    rating: string;
    ratingCount: string;
    twitterUrl: string;
    linkedinUrl: string;
    instagramUrl: string;
    facebookUrl: string;
    promoTitle: string;
    promoDescription: string;
    whyDinersLoveUs: string;
    serviceTypes: string;
    dietaryPreferences: string;
    galleryImages: string[];
}

export default function RestaurantDetailsPage() {
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);
    const { business, loading, setBusiness } = useBusiness();

    const [details, setDetails] = useState<RestaurantDetails>({
        id: null,
        headline: "",
        description: "",
        amenities: "",
        website: "",
        contactEmail: "",
        contactPhone: "",
        weekdayHours: "",
        weekendHours: "",
        closeTime: "",
        city: "",
        neighborhood: "",
        priceLevel: "$$$",
        averageCostForTwo: "",
        rating: "",
        ratingCount: "",
        twitterUrl: "",
        linkedinUrl: "",
        instagramUrl: "",
        facebookUrl: "",
        promoTitle: "",
        promoDescription: "",
        whyDinersLoveUs: "",
        serviceTypes: "",
        dietaryPreferences: "",
        galleryImages: [],
    });

    const [saving, setSaving] = useState(false);
    const [uploadingGallery, setUploadingGallery] = useState(false);

    useEffect(() => {
        if (!loading && (!business || Object.keys(business).length < 1)) {
            router.replace("/business-list");
        }
    }, [business, loading, router]);

    useEffect(() => {
        const loadDetails = async () => {
            if (!business?.id) return;
            try {
                const response = await getBusinessDetails(
                    business.id.toString(),
                );
                const hotel = response?.data
                    ?.hotel as HotelWithRestaurantDetails | undefined;
                if (!hotel) return;

                setDetails({
                    id: hotel.id,
                    headline:
                        hotel.headline ||
                        "Serving The Best Flavours In Abeokuta & Ibadan, Nigeria.",
                    description:
                        hotel.description ||
                        "Home of bold flavors, crafted cocktails, and effortless vibes. Reserve your table now and taste why South Kitchen is where Abeokuta comes alive. Open everyday through from 7 AM – 1 AM",
                    amenities: Array.isArray(hotel.amenities)
                        ? hotel.amenities.join(", ")
                        : hotel.amenities ||
                        "Perfect for date Night, Outdoor/ Indoor Seating, Romantic Ambience",
                    website: hotel.website || "www.southkitchen.com",
                    contactEmail: hotel.contactEmail || "ujua1@gmail.com",
                    contactPhone: hotel.contactPhone || "+234 6098 890 768",
                    weekdayHours:
                        hotel.weekdayHours ||
                        "Monday – Friday : 10 : 00 AM – 11 : 00 PM",
                    weekendHours:
                        hotel.weekendHours ||
                        "Saturday – Sunday: 08 : 00 AM – 12 : 00 PM",
                    closeTime: hotel.closeTime || "Close 11:30 PM",
                    city: hotel.city || "Lagos",
                    neighborhood: hotel.neighborhood || "Lekki Phase 1",
                    priceLevel: hotel.priceLevel || "$$$",
                    averageCostForTwo: hotel.averageCostForTwo
                        ? String(hotel.averageCostForTwo)
                        : "",
                    rating: hotel.rating != null ? String(hotel.rating) : "",
                    ratingCount: hotel.ratingCount != null ? String(hotel.ratingCount) : "",
                    twitterUrl: hotel.twitterUrl || "https://twitter.com",
                    linkedinUrl: hotel.linkedinUrl || "https://linkedin.com",
                    instagramUrl: hotel.instagramUrl || "https://instagram.com",
                    facebookUrl: hotel.facebookUrl || "https://facebook.com",
                    promoTitle:
                        hotel.promoTitle || "Discover more .\nDine Better.",
                    promoDescription:
                        hotel.promoDescription ||
                        "Find out more beautiful restaurants in Lagos for different occasions.",
                    whyDinersLoveUs: toInputString(hotel.whyDinersLoveUs),
                    serviceTypes: toInputString(hotel.serviceTypes),
                    dietaryPreferences: toInputString(hotel.dietaryPreferences),
                    galleryImages: hotel.images || [],
                });
            } catch (error) {
                console.error("Error loading restaurant details:", error);
                toast.error("Failed to load restaurant details");
            }
        };

        loadDetails();
    }, [business?.id]);

    if (loading || !business) return null;

    const handleSaveDetails = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!details.id) {
            toast.error("Business ID not found");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                headline: details.headline,
                description: details.description,
                amenities: splitCsv(details.amenities),
                website: details.website,
                contactEmail: details.contactEmail,
                contactPhone: details.contactPhone,
                weekdayHours: details.weekdayHours,
                weekendHours: details.weekendHours,
                closeTime: details.closeTime,
                city: details.city,
                neighborhood: details.neighborhood,
                priceLevel: details.priceLevel,
                averageCostForTwo: parseFloat(details.averageCostForTwo) || 0,
                rating: parseFloat(details.rating) || 0,
                ratingCount: parseInt(details.ratingCount, 10) || 0,
                twitterUrl: details.twitterUrl,
                linkedinUrl: details.linkedinUrl,
                instagramUrl: details.instagramUrl,
                facebookUrl: details.facebookUrl,
                promoTitle: details.promoTitle,
                promoDescription: details.promoDescription,
                whyDinersLoveUs: splitCsv(details.whyDinersLoveUs),
                serviceTypes: splitCsv(details.serviceTypes),
                dietaryPreferences: splitCsv(details.dietaryPreferences),
            };

            await updateBusiness(details.id.toString(), payload);
            toast.success("Restaurant details updated successfully");
        } catch (error: any) {
            console.error("Error saving restaurant details:", error);
            toast.error(
                error?.message || "Unable to update restaurant details right now.",
            );
        } finally {
            setSaving(false);
        }
    };

    const handleUploadGalleryImages = async (files: File[]) => {
        if (!details.id) return;
        setUploadingGallery(true);
        try {
            let lastImages = details.galleryImages;
            for (const file of files) {
                const formData = new FormData();
                formData.append("file", file);
                const res = await uploadBusinessGalleryImage(
                    details.id.toString(),
                    formData,
                );
                if (res?.images) {
                    lastImages = res.images;
                    setDetails((prev) => ({
                        ...prev,
                        galleryImages: lastImages,
                    }));
                } else {
                    toast.error(`Failed to upload ${file.name}`);
                }
            }
            if (lastImages.length > details.galleryImages.length) {
                toast.success("Images uploaded to gallery successfully");
                if (business) {
                    setBusiness({ ...business, images: lastImages });
                }
            }
        } catch (error) {
            console.error("Error uploading gallery images:", error);
            toast.error("An unexpected error occurred");
        } finally {
            setUploadingGallery(false);
        }
    };

    const handleRemoveGalleryImage = async (indexToRemove: number) => {
        if (!details.id) return;

        const updatedImages = details.galleryImages.filter(
            (_, idx) => idx !== indexToRemove,
        );
        try {
            await updateBusiness(details.id.toString(), {
                images: updatedImages,
            });
            setDetails((prev) => ({
                ...prev,
                galleryImages: updatedImages,
            }));
            if (business) {
                setBusiness({ ...business, images: updatedImages });
            }
            toast.success("Image removed from gallery successfully");
        } catch (error: any) {
            console.error("Error removing gallery image:", error);
            toast.error(
                error?.message || "Failed to remove image from gallery",
            );
        }
    };

    const updateField = (field: keyof RestaurantDetails, value: any) =>
        setDetails((prev) => ({ ...prev, [field]: value }));

    const inputCls =
        "w-full h-11 px-4 text-sm rounded-xl border border-gray-200 focus:border-[#F47411] focus:ring-2 focus:ring-[#F47411]/10 outline-none transition-all";
    const labelCls =
        "block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5";

    return (
        <div className="h-screen w-screen flex flex-col sm:flex-row overflow-hidden">
            <Sidebar isOpen={menuOpen} setIsOpen={setMenuOpen} />
            <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                <Header
                    isOpen={menuOpen}
                    setIsOpen={setMenuOpen}
                    title="Restaurant Details"
                />
                <main className="px-3 sm:px-4 md:px-6 lg:px-10 py-4 sm:py-6 md:py-10 bg-gray-50 overflow-y-auto overflow-x-hidden flex-1 min-h-0">
                    <form onSubmit={handleSaveDetails} className="space-y-8">
                        {/* Header Banner */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-[#FFF0E5] to-[#FFE8DC] p-6 rounded-2xl border border-[#F47411]/20">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Utensils className="w-5 h-5 text-[#F47411]" />
                                    Restaurant Details &amp; Profile
                                </h2>
                                <p className="text-sm text-gray-600 mt-1 max-w-2xl">
                                    Update all customer-facing details,
                                    descriptions, operating hours, social links,
                                    and hero slider images shown on the public
                                    restaurant pages.
                                </p>
                            </div>

                        </div>

                        {/* 1. Branding & Story */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
                            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                                <Sparkles className="w-4 h-4 text-[#F47411]" />
                                <h3 className="text-base font-bold text-gray-900">
                                    Story &amp; Branding Highlights
                                </h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className={labelCls}>
                                        Main Headline / Tagline
                                    </label>
                                    <input
                                        type="text"
                                        value={details.headline}
                                        onChange={(e) =>
                                            updateField(
                                                "headline",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="e.g. Serving The Best Flavours In Abeokuta & Ibadan, Nigeria."
                                        className={inputCls}
                                    />
                                </div>

                                <div>
                                    <label className={labelCls}>
                                        About / Description Paragraph
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={details.description}
                                        onChange={(e) =>
                                            updateField(
                                                "description",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Home of bold flavors, crafted cocktails..."
                                        className="w-full p-4 text-sm rounded-xl border border-gray-200 focus:border-[#F47411] focus:ring-2 focus:ring-[#F47411]/10 outline-none leading-relaxed"
                                    />
                                </div>

                                <div>
                                    <label className={labelCls}>
                                        Amenities / Feature Badges (Comma-separated)
                                    </label>
                                    <input
                                        type="text"
                                        value={details.amenities}
                                        onChange={(e) =>
                                            updateField(
                                                "amenities",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Perfect for date Night, Outdoor/ Indoor Seating, Romantic Ambience"
                                        className={inputCls}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. Contact & Web */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
                            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                                <Globe className="w-4 h-4 text-blue-500" />
                                <h3 className="text-base font-bold text-gray-900">
                                    Contact Info &amp; Official Web Links
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className={labelCls} htmlFor="contactPhone">
                                        <Phone className="w-3.5 h-3.5 text-gray-400 inline mr-1.5" />
                                        Contact Phone
                                    </label>
                                    <input
                                        id="contactPhone"
                                        type="text"
                                        value={details.contactPhone}
                                        onChange={(e) =>
                                            updateField(
                                                "contactPhone",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="+234 6098 890 768"
                                        className={inputCls}
                                    />
                                </div>

                                <div>
                                    <label className={labelCls} htmlFor="contactEmail">
                                        <Mail className="w-3.5 h-3.5 text-gray-400 inline mr-1.5" />
                                        Contact Email
                                    </label>
                                    <input
                                        id="contactEmail"
                                        type="email"
                                        value={details.contactEmail}
                                        onChange={(e) =>
                                            updateField(
                                                "contactEmail",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="ujua1@gmail.com"
                                        className={inputCls}
                                    />
                                </div>

                                <div>
                                    <label className={labelCls} htmlFor="website">
                                        <Globe className="w-3.5 h-3.5 text-gray-400 inline mr-1.5" />
                                        Official Website
                                    </label>
                                    <input
                                        id="website"
                                        type="text"
                                        value={details.website}
                                        onChange={(e) =>
                                            updateField("website", e.target.value)
                                        }
                                        placeholder="www.southkitchen.com"
                                        className={inputCls}
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <label className={labelCls} htmlFor="social-media">
                                    <Share2 className="w-3.5 h-3.5 text-gray-400 inline mr-1.5" />
                                    Social Media Channels
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="relative">
                                        <FaTwitter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                                        <input
                                            type="text"
                                            value={details.twitterUrl}
                                            onChange={(e) =>
                                                updateField(
                                                    "twitterUrl",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Twitter URL"
                                            className="w-full h-10 pl-9 pr-3 text-xs rounded-xl border border-gray-200 focus:border-[#F47411] outline-none"
                                        />
                                    </div>

                                    <div className="relative">
                                        <FaLinkedin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                                        <input
                                            type="text"
                                            value={details.linkedinUrl}
                                            onChange={(e) =>
                                                updateField(
                                                    "linkedinUrl",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="LinkedIn URL"
                                            className="w-full h-10 pl-9 pr-3 text-xs rounded-xl border border-gray-200 focus:border-[#F47411] outline-none"
                                        />
                                    </div>

                                    <div className="relative">
                                        <FaInstagram className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                                        <input
                                            type="text"
                                            value={details.instagramUrl}
                                            onChange={(e) =>
                                                updateField(
                                                    "instagramUrl",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Instagram URL"
                                            className="w-full h-10 pl-9 pr-3 text-xs rounded-xl border border-gray-200 focus:border-[#F47411] outline-none"
                                        />
                                    </div>

                                    <div className="relative">
                                        <FaFacebook className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                                        <input
                                            type="text"
                                            value={details.facebookUrl}
                                            onChange={(e) =>
                                                updateField(
                                                    "facebookUrl",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Facebook URL"
                                            className="w-full h-10 pl-9 pr-3 text-xs rounded-xl border border-gray-200 focus:border-[#F47411] outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Location & Operating Hours */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
                            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                                <Clock className="w-4 h-4 text-emerald-500" />
                                <h3 className="text-base font-bold text-gray-900">
                                    Location &amp; Operating Schedule
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className={labelCls} htmlFor="city">
                                        <MapPin className="w-3.5 h-3.5 text-gray-400 inline mr-1.5" />
                                        City / Region
                                    </label>
                                    <input
                                        id="city"
                                        type="text"
                                        value={details.city}
                                        onChange={(e) =>
                                            updateField("city", e.target.value)
                                        }
                                        placeholder="Lagos"
                                        className={inputCls}
                                    />
                                </div>

                                <div>
                                    <label className={labelCls} htmlFor="neighborhood">
                                        <MapPin className="w-3.5 h-3.5 text-gray-400 inline mr-1.5" />
                                        Neighborhood
                                    </label>
                                    <input
                                        id="neighborhood"
                                        type="text"
                                        value={details.neighborhood}
                                        onChange={(e) =>
                                            updateField(
                                                "neighborhood",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Lekki Phase 1"
                                        className={inputCls}
                                    />
                                </div>

                                <div>
                                    <label className={labelCls} htmlFor="closeTime">
                                        Hero Closing Badge
                                    </label>
                                    <input
                                        id="closeTime"
                                        type="text"
                                        value={details.closeTime}
                                        onChange={(e) =>
                                            updateField(
                                                "closeTime",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Close 11:30 PM"
                                        className={inputCls}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                <div>
                                    <label className={labelCls}>
                                        Weekday Hours
                                    </label>
                                    <input
                                        type="text"
                                        value={details.weekdayHours}
                                        onChange={(e) =>
                                            updateField(
                                                "weekdayHours",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Monday – Friday : 10 : 00 AM – 11 : 00 PM"
                                        className={inputCls}
                                    />
                                </div>

                                <div>
                                    <label className={labelCls}>
                                        Weekend Hours
                                    </label>
                                    <input
                                        type="text"
                                        value={details.weekendHours}
                                        onChange={(e) =>
                                            updateField(
                                                "weekendHours",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Saturday – Sunday: 08 : 00 AM – 12 : 00 PM"
                                        className={inputCls}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 4. Pricing & Promo */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
                            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                                <DollarSign className="w-4 h-4 text-purple-500" />
                                <h3 className="text-base font-bold text-gray-900">
                                    Pricing &amp; Promo Card Settings
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls} htmlFor="priceLevel">
                                        Price Tier ($ - $$$$)
                                    </label>
                                    <select
                                        id="priceLevel"
                                        value={details.priceLevel}
                                        onChange={(e) =>
                                            updateField(
                                                "priceLevel",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full h-11 px-4 text-sm rounded-xl border border-gray-200 focus:border-[#F47411] outline-none bg-white"
                                    >
                                        <option value="$">
                                            $ (Budget Friendly)
                                        </option>
                                        <option value="$$">$$ (Moderate)</option>
                                        <option value="$$$">
                                            $$$ (Fine Dining)
                                        </option>
                                        <option value="$$$$">
                                            $$$$ (Ultra Luxury)
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className={labelCls} htmlFor="averageCostForTwo">
                                        Average Cost for 2 Diners (₦)
                                    </label>
                                    <input
                                        id="averageCostForTwo"
                                        type="number"
                                        value={details.averageCostForTwo}
                                        onChange={(e) =>
                                            updateField(
                                                "averageCostForTwo",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="50000"
                                        className={inputCls}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                                <div>
                                    <label className={labelCls} htmlFor="rating">
                                        <Star className="w-3.5 h-3.5 text-gray-400 inline mr-1.5" />
                                        Rating (0–5)
                                    </label>
                                    <input
                                        id="rating"
                                        type="number"
                                        step="0.1"
                                        min={0}
                                        max={5}
                                        value={details.rating}
                                        onChange={(e) =>
                                            updateField("rating", e.target.value)
                                        }
                                        placeholder="4.5"
                                        className={inputCls}
                                    />
                                </div>

                                <div>
                                    <label className={labelCls} htmlFor="ratingCount">
                                        <Star className="w-3.5 h-3.5 text-gray-400 inline mr-1.5" />
                                        Rating Count
                                    </label>
                                    <input
                                        id="ratingCount"
                                        type="number"
                                        min={0}
                                        value={details.ratingCount}
                                        onChange={(e) =>
                                            updateField(
                                                "ratingCount",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="0"
                                        className={inputCls}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                <div>
                                    <label className={labelCls}>
                                        Promo Card Title
                                    </label>
                                    <input
                                        type="text"
                                        value={details.promoTitle}
                                        onChange={(e) =>
                                            updateField(
                                                "promoTitle",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Discover more. Dine Better."
                                        className={inputCls}
                                    />
                                </div>

                                <div>
                                    <label className={labelCls}>
                                        Promo Card Body Text
                                    </label>
                                    <input
                                        type="text"
                                        value={details.promoDescription}
                                        onChange={(e) =>
                                            updateField(
                                                "promoDescription",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Find out more beautiful restaurants in Lagos for different occasions."
                                        className={inputCls}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 5. Dining Details */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
                            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                                <Heart className="w-4 h-4 text-rose-500" />
                                <h3 className="text-base font-bold text-gray-900">
                                    Dining Details
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className={labelCls}>
                                        Why Diners Love Us (Comma-separated)
                                    </label>
                                    <input
                                        type="text"
                                        value={details.whyDinersLoveUs}
                                        onChange={(e) =>
                                            updateField(
                                                "whyDinersLoveUs",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Amazing cocktails, Live music, Great ambience"
                                        className={inputCls}
                                    />
                                </div>

                                <div>
                                    <label className={labelCls}>
                                        Service Types (Comma-separated)
                                    </label>
                                    <input
                                        type="text"
                                        value={details.serviceTypes}
                                        onChange={(e) =>
                                            updateField(
                                                "serviceTypes",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Dine-in, Takeout, Delivery"
                                        className={inputCls}
                                    />
                                </div>

                                <div>
                                    <label className={labelCls}>
                                        Dietary Options (Comma-separated)
                                    </label>
                                    <input
                                        type="text"
                                        value={details.dietaryPreferences}
                                        onChange={(e) =>
                                            updateField(
                                                "dietaryPreferences",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Vegan, Halal, Gluten-Free"
                                        className={inputCls}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 6. Hero Gallery Images */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
                            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                                <ImageIcon className="w-4 h-4 text-indigo-500" />
                                <div>
                                    <h3 className="text-base font-bold text-gray-900">
                                        Restaurant Hero Gallery Images
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Upload multiple photos to feature in the
                                        auto-sliding image carousel on the
                                        restaurant detail hero section.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                {details.galleryImages.map((imageUrl, index) => (
                                    <div
                                        key={index}
                                        className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 shadow-sm hover:shadow-md transition-all duration-300"
                                    >
                                        <Image
                                            src={imageUrl}
                                            alt={`Gallery Photo ${index + 1}`}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleRemoveGalleryImage(index)
                                                }
                                                className="p-2.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all shadow-lg flex items-center justify-center"
                                                title="Remove Image"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-md text-white text-[10px] font-medium uppercase">
                                            Photo {index + 1}
                                        </div>
                                    </div>
                                ))}

                                <label className="flex flex-col items-center justify-center aspect-[4/3] rounded-2xl border-2 border-dashed border-gray-200 hover:border-[#F47411] hover:bg-[#F47411]/5 cursor-pointer transition-all duration-300 text-gray-400 hover:text-[#F47411] group">
                                    {uploadingGallery ? (
                                        <div className="flex flex-col items-center space-y-2">
                                            <Spinner size="sm" className="text-[#F47411]" />
                                            <span className="text-xs font-semibold text-[#F47411]">
                                                Uploading...
                                            </span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="p-2.5 bg-gray-50 rounded-full group-hover:bg-[#F47411]/10 group-hover:scale-110 transition-all duration-300 mb-1.5">
                                                <Plus className="h-5 w-5 text-gray-500 group-hover:text-[#F47411]" />
                                            </div>
                                            <span className="text-xs font-bold text-gray-700">
                                                Add Photo
                                            </span>
                                            <span className="text-[10px] text-gray-400 mt-0.5">
                                                JPEG/PNG up to 5MB
                                            </span>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        disabled={uploadingGallery}
                                        onChange={async (e) => {
                                            if (
                                                e.target.files &&
                                                e.target.files.length > 0
                                            ) {
                                                await handleUploadGalleryImages(
                                                    Array.from(e.target.files),
                                                );
                                            }
                                            e.target.value = "";
                                        }}
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Bottom Save Action Bar */}
                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-8 py-3.5 bg-[#F47411] hover:bg-[#F47411]/90 disabled:bg-gray-400 text-white font-bold text-sm rounded-xl transition-all shadow-lg flex items-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Saving Changes...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        <span>Save Restaurant Details</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </main>
            </div>
        </div>
    );
}
