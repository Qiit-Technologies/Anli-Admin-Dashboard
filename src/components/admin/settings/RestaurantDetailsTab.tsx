'use client';

import React, { useState, useEffect } from 'react';
import { fetchHotelById, updateHotel, uploadGalleryImage } from '@/app/actions/hotel';

import Toast from '@/components/toast';
import toast from 'react-hot-toast';
import {
    Utensils,
    Globe,
    Mail,
    Phone,
    Clock,
    MapPin,
    Share2,
    DollarSign,
    Tag,
    Plus,
    Trash2,
    Loader2,
    Save,
    Sparkles,
    Image as ImageIcon,
    Heart,
} from 'lucide-react';
import {
    FaTwitter,
    FaLinkedin,
    FaInstagram,
    FaFacebook,
    FaTiktok,
    FaSnapchat,
    FaYoutube,
} from 'react-icons/fa';

/** Normalise a value that could be string | string[] | object into a plain comma-separated string */
function toInputString(val: unknown): string {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (Array.isArray(val)) return val.join(', ');
    // jsonb object (whyDinersLoveUs legacy shape) – extract values
    if (typeof val === 'object') {
        return Object.values(val as Record<string, string>).join(', ');
    }
    return '';
}

export default function RestaurantDetailsTab() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hotelId, setHotelId] = useState<number | null>(null);

    // Form fields state
    const [headline, setHeadline] = useState('');
    const [description, setDescription] = useState('');
    const [amenities, setAmenities] = useState('');
    const [website, setWebsite] = useState('');
    const [tags, setTags] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [weekdayHours, setWeekdayHours] = useState('');
    const [weekendHours, setWeekendHours] = useState('');
    const [closeTime, setCloseTime] = useState('');
    const [city, setCity] = useState('');
    const [neighborhood, setNeighborhood] = useState('');
    const [priceLevel, setPriceLevel] = useState('$$$');
    const [averageCostForTwo, setAverageCostForTwo] = useState('50000');
    const [twitterUrl, setTwitterUrl] = useState('');
    const [linkedinUrl, setLinkedinUrl] = useState('');
    const [instagramUrl, setInstagramUrl] = useState('');
    const [facebookUrl, setFacebookUrl] = useState('');
    const [tiktokUrl, setTiktokUrl] = useState('');
    const [snapchatUrl, setSnapchatUrl] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [promoTitle, setPromoTitle] = useState('');
    const [promoDescription, setPromoDescription] = useState('');

    // Dining Details – stored as plain strings; split to arrays on save
    const [whyDinersLoveUs, setWhyDinersLoveUs] = useState('');
    const [serviceTypes, setServiceTypes] = useState('');
    const [dietaryPreferences, setDietaryPreferences] = useState('');

    // Gallery state
    const [galleryImages, setGalleryImages] = useState<string[]>([]);
    const [uploadingGallery, setUploadingGallery] = useState(false);

    useEffect(() => {
        const loadHotelDetails = async () => {
            setLoading(true);
            try {
                const response = await fetchHotelById();
                if (response?.data) {
                    const data = response.data;
                    setHotelId(data.id);
                    setHeadline(data.headline || 'Serving The Best Flavours In Abeokuta & Ibadan, Nigeria.');
                    setDescription(data.description || 'Home of bold flavors, crafted cocktails, and effortless vibes. Reserve your table now and taste why South Kitchen is where Abeokuta comes alive. Open everyday through from 7 AM – 1 AM');
                    setAmenities(
                        Array.isArray(data.amenities)
                            ? data.amenities.join(', ')
                            : data.amenities || 'Perfect for date Night, Outdoor/ Indoor Seating, Romantic Ambience'
                    );
                    setWebsite(data.website || 'www.southkitchen.com');
                    setTags(data.tags || '');
                    setContactEmail(data.contactEmail || 'ujua1@gmail.com');
                    setContactPhone(data.contactPhone || '+234 6098 890 768');
                    setWeekdayHours(data.weekdayHours || 'Monday – Friday : 10 : 00 AM – 11 : 00 PM');
                    setWeekendHours(data.weekendHours || 'Saturday – Sunday: 08 : 00 AM – 12 : 00 PM');
                    setCloseTime(data.closeTime || 'Close 11:30 PM');
                    setCity(data.city || 'Lagos');
                    setNeighborhood(data.neighborhood || 'Lekki Phase 1');
                    setPriceLevel(data.priceLevel || '$$$');
                    setAverageCostForTwo(data.averageCostForTwo ? String(data.averageCostForTwo) : '50000');
                    setTwitterUrl(data.twitterUrl || 'https://twitter.com');
                    setLinkedinUrl(data.linkedinUrl || 'https://linkedin.com');
                    setInstagramUrl(data.instagramUrl || 'https://instagram.com');
                    setFacebookUrl(data.facebookUrl || 'https://facebook.com');
                    setTiktokUrl(data.tiktokUrl || '');
                    setSnapchatUrl(data.snapchatUrl || '');
                    setYoutubeUrl(data.youtubeUrl || '');
                    setPromoTitle(data.promoTitle || 'Discover more .\nDine Better.');
                    setPromoDescription(data.promoDescription || 'Find out more beautiful restaurants in Lagos for different occasions.');
                    setGalleryImages(data.images || []);

                    // Dining details – normalise from any shape the server returns
                    setWhyDinersLoveUs(toInputString(data.whyDinersLoveUs));
                    setServiceTypes(toInputString(data.serviceTypes));
                    setDietaryPreferences(toInputString(data.dietaryPreferences));
                }
            } catch (error) {
                console.error('Error loading restaurant details:', error);
                toast.custom(() => (
                    <Toast title="Error!" description="Failed to load restaurant details" type="error" />
                ));
            } finally {
                setLoading(false);
            }
        };

        loadHotelDetails();
    }, []);

    const handleSaveDetails = async (e: React.FormEvent) => {
        e.preventDefault();
        const storedHotelId = hotelId || Number(localStorage.getItem('hotelId'));
        if (!storedHotelId) {
            toast.custom(() => (
                <Toast title="Error!" description="Hotel ID not found" type="error" />
            ));
            return;
        }

        setSaving(true);
        try {
            const splitCsv = (val: string) =>
                val.split(',').map((s) => s.trim()).filter(Boolean);

            const payload = {
                headline,
                description,
                amenities: splitCsv(amenities),
                website,
                tags,
                contactEmail,
                contactPhone,
                weekdayHours,
                weekendHours,
                closeTime,
                city,
                neighborhood,
                priceLevel,
                averageCostForTwo: parseFloat(averageCostForTwo) || 50000,
                twitterUrl,
                linkedinUrl,
                instagramUrl,
                facebookUrl,
                tiktokUrl,
                snapchatUrl,
                youtubeUrl,
                promoTitle,
                promoDescription,
                whyDinersLoveUs: splitCsv(whyDinersLoveUs),
                serviceTypes: splitCsv(serviceTypes),
                dietaryPreferences: splitCsv(dietaryPreferences),
            };

            const response = await updateHotel(storedHotelId, payload);
            if (response.error) {
                toast.custom(() => (
                    <Toast title="Error!" description={response.error} type="error" />
                ));
            } else {
                toast.custom(() => (
                    <Toast title="Success!" description="Restaurant details updated successfully" type="success" />
                ));
            }
        } catch (error) {
            console.error('Error saving restaurant details:', error);
            toast.custom(() => (
                <Toast title="Error!" description="An unexpected error occurred" type="error" />
            ));
        } finally {
            setSaving(false);
        }
    };

    const handleUploadGalleryImages = async (files: File[]) => {
        setUploadingGallery(true);
        try {
            let lastImages = galleryImages;
            for (const file of files) {
                const response = await uploadGalleryImage(file);
                if (response.error) {
                    toast.custom(() => (
                        <Toast title="Error!" description={`Failed to upload ${file.name}: ${response.error}`} type="error" />
                    ));
                } else if (response.data) {
                    lastImages = response.data.images ?? [];
                    setGalleryImages(lastImages);
                }
            }
            toast.custom(() => (
                <Toast title="Success!" description="Images uploaded to gallery successfully" type="success" />
            ));
        } catch (error) {
            console.error('Error uploading gallery images:', error);
            toast.custom(() => (
                <Toast title="Error!" description="An unexpected error occurred" type="error" />
            ));
        } finally {
            setUploadingGallery(false);
        }
    };

    const handleRemoveGalleryImage = async (indexToRemove: number) => {
        const storedHotelId = hotelId || Number(localStorage.getItem('hotelId'));
        if (!storedHotelId) return;

        const updatedImages = galleryImages.filter((_, idx) => idx !== indexToRemove);
        try {
            const response = await updateHotel(storedHotelId, { images: updatedImages });
            if (response.error) {
                toast.custom(() => (
                    <Toast title="Error!" description={response.error} type="error" />
                ));
            } else {
                setGalleryImages(updatedImages);
                toast.custom(() => (
                    <Toast title="Success!" description="Image removed from gallery successfully" type="success" />
                ));
            }
        } catch (error) {
            console.error('Error removing gallery image:', error);
            toast.custom(() => (
                <Toast title="Error!" description="An unexpected error occurred" type="error" />
            ));
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
        );
    }

    return (
        <form onSubmit={handleSaveDetails} className="space-y-8 py-6">
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-2xl border border-orange-100/80">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Utensils className="w-5 h-5 text-orange-500" />
                        Restaurant Details &amp; Profile
                    </h2>
                    <p className="text-sm text-gray-600 mt-1 max-w-2xl">
                        Update all customer-facing details, descriptions, operating hours, social links, and hero slider images shown on the public restaurant pages.
                    </p>
                </div>
                <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white text-sm font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2 flex-shrink-0"
                >
                    {saving ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Saving...</span>
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            <span>Save All Details</span>
                        </>
                    )}
                </button>
            </div>

            {/* 1. Branding & Story Content */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                    <Sparkles className="w-4 h-4 text-orange-500" />
                    <h3 className="text-base font-bold text-gray-900">
                        Story &amp; Branding Highlights
                    </h3>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                            Main Headline / Tagline
                        </label>
                        <input
                            type="text"
                            value={headline}
                            onChange={(e) => setHeadline(e.target.value)}
                            placeholder="e.g. Serving The Best Flavours In Abeokuta & Ibadan, Nigeria."
                            className="w-full h-11 px-4 text-sm rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                            About / Description Paragraph
                        </label>
                        <textarea
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Home of bold flavors, crafted cocktails, and effortless vibes..."
                            className="w-full p-4 text-sm rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all outline-none leading-relaxed"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                            Amenities / Feature Badges (Comma-separated)
                        </label>
                        <input
                            type="text"
                            value={amenities}
                            onChange={(e) => setAmenities(e.target.value)}
                            placeholder="Perfect for date Night, Outdoor/ Indoor Seating, Romantic Ambience"
                            className="w-full h-11 px-4 text-sm rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* 2. Contact & Web Information */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                    <Globe className="w-4 h-4 text-blue-500" />
                    <h3 className="text-base font-bold text-gray-900">
                        Contact Info &amp; Official Web Links
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-gray-400" /> Contact Phone
                        </label>
                        <input
                            type="text"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            placeholder="+234 6098 890 768"
                            className="w-full h-11 px-4 text-sm rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-gray-400" /> Contact Email
                        </label>
                        <input
                            type="email"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            placeholder="ujua1@gmail.com"
                            className="w-full h-11 px-4 text-sm rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-gray-400" /> Official Website
                        </label>
                        <input
                            type="text"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            placeholder="www.southkitchen.com"
                            className="w-full h-11 px-4 text-sm rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5 text-gray-400" /> Tags (comma-separated)
                        </label>
                        <input
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="Nigerian, Fine Dining, Outdoor"
                            className="w-full h-11 px-4 text-sm rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all outline-none"
                        />
                    </div>
                </div>

                {/* Social Media Row */}
                <div className="pt-2">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <Share2 className="w-3.5 h-3.5 text-gray-400" /> Social Media Channels
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <FaTwitter className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                            <input
                                type="text"
                                value={twitterUrl}
                                onChange={(e) => setTwitterUrl(e.target.value)}
                                placeholder="Twitter URL"
                                className="w-full h-10 pl-9 pr-3 text-xs rounded-xl border border-gray-200 focus:border-orange-500 outline-none"
                            />
                        </div>

                        <div className="relative">
                            <FaLinkedin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                            <input
                                type="text"
                                value={linkedinUrl}
                                onChange={(e) => setLinkedinUrl(e.target.value)}
                                placeholder="LinkedIn URL"
                                className="w-full h-10 pl-9 pr-3 text-xs rounded-xl border border-gray-200 focus:border-orange-500 outline-none"
                            />
                        </div>

                        <div className="relative">
                            <FaInstagram className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                            <input
                                type="text"
                                value={instagramUrl}
                                onChange={(e) => setInstagramUrl(e.target.value)}
                                placeholder="Instagram URL"
                                className="w-full h-10 pl-9 pr-3 text-xs rounded-xl border border-gray-200 focus:border-orange-500 outline-none"
                            />
                        </div>

                        <div className="relative">
                            <FaFacebook className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                            <input
                                type="text"
                                value={facebookUrl}
                                onChange={(e) => setFacebookUrl(e.target.value)}
                                placeholder="Facebook URL"
                                className="w-full h-10 pl-9 pr-3 text-xs rounded-xl border border-gray-200 focus:border-orange-500 outline-none"
                            />
                        </div>

                        <div className="relative">
                            <FaTiktok className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                            <input
                                type="text"
                                value={tiktokUrl}
                                onChange={(e) => setTiktokUrl(e.target.value)}
                                placeholder="TikTok URL"
                                className="w-full h-10 pl-9 pr-3 text-xs rounded-xl border border-gray-200 focus:border-orange-500 outline-none"
                            />
                        </div>

                        <div className="relative">
                            <FaSnapchat className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                            <input
                                type="text"
                                value={snapchatUrl}
                                onChange={(e) => setSnapchatUrl(e.target.value)}
                                placeholder="Snapchat URL"
                                className="w-full h-10 pl-9 pr-3 text-xs rounded-xl border border-gray-200 focus:border-orange-500 outline-none"
                            />
                        </div>

                        <div className="relative">
                            <FaYoutube className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                            <input
                                type="text"
                                value={youtubeUrl}
                                onChange={(e) => setYoutubeUrl(e.target.value)}
                                placeholder="YouTube URL"
                                className="w-full h-10 pl-9 pr-3 text-xs rounded-xl border border-gray-200 focus:border-orange-500 outline-none"
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
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" /> City / Region
                        </label>
                        <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Lagos"
                            className="w-full h-11 px-4 text-sm rounded-xl border border-gray-200 focus:border-orange-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" /> Neighborhood
                        </label>
                        <input
                            type="text"
                            value={neighborhood}
                            onChange={(e) => setNeighborhood(e.target.value)}
                            placeholder="Lekki Phase 1"
                            className="w-full h-11 px-4 text-sm rounded-xl border border-gray-200 focus:border-orange-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                            Hero Closing Badge
                        </label>
                        <input
                            type="text"
                            value={closeTime}
                            onChange={(e) => setCloseTime(e.target.value)}
                            placeholder="Close 11:30 PM"
                            className="w-full h-11 px-4 text-sm rounded-xl border border-gray-200 focus:border-orange-500 outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                            Weekday Hours
                        </label>
                        <input
                            type="text"
                            value={weekdayHours}
                            onChange={(e) => setWeekdayHours(e.target.value)}
                            placeholder="Monday – Friday : 10 : 00 AM – 11 : 00 PM"
                            className="w-full h-11 px-4 text-sm rounded-xl border border-gray-200 focus:border-orange-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                            Weekend Hours
                        </label>
                        <input
                            type="text"
                            value={weekendHours}
                            onChange={(e) => setWeekendHours(e.target.value)}
                            placeholder="Saturday – Sunday: 08 : 00 AM – 12 : 00 PM"
                            className="w-full h-11 px-4 text-sm rounded-xl border border-gray-200 focus:border-orange-500 outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* 4. Pricing & Promo Section */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                    <DollarSign className="w-4 h-4 text-purple-500" />
                    <h3 className="text-base font-bold text-gray-900">
                        Pricing &amp; Promo Card Settings
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                            Price Tier ($ - $$$$)
                        </label>
                        <select
                            value={priceLevel}
                            onChange={(e) => setPriceLevel(e.target.value)}
                            className="w-full h-11 px-4 text-sm rounded-xl border border-gray-200 focus:border-orange-500 outline-none bg-white"
                        >
                            <option value="$">$ (Budget Friendly)</option>
                            <option value="$$">$$ (Moderate)</option>
                            <option value="$$$">$$$ (Fine Dining)</option>
                            <option value="$$$$">$$$$ (Ultra Luxury)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                            Average Cost for 2 Diners (₦)
                        </label>
                        <input
                            type="number"
                            value={averageCostForTwo}
                            onChange={(e) => setAverageCostForTwo(e.target.value)}
                            placeholder="50000"
                            className="w-full h-11 px-4 text-sm rounded-xl border border-gray-200 focus:border-orange-500 outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                            Promo Card Title
                        </label>
                        <input
                            type="text"
                            value={promoTitle}
                            onChange={(e) => setPromoTitle(e.target.value)}
                            placeholder="Discover more .\nDine Better."
                            className="w-full h-11 px-4 text-sm rounded-xl border border-gray-200 focus:border-orange-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                            Promo Card Body Text
                        </label>
                        <input
                            type="text"
                            value={promoDescription}
                            onChange={(e) => setPromoDescription(e.target.value)}
                            placeholder="Find out more beautiful restaurants in Lagos for different occasions."
                            className="w-full h-11 px-4 text-sm rounded-xl border border-gray-200 focus:border-orange-500 outline-none"
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
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                            Why Diners Love Us (Comma-separated)
                        </label>
                        <input
                            type="text"
                            value={whyDinersLoveUs}
                            onChange={(e) => setWhyDinersLoveUs(e.target.value)}
                            placeholder="Amazing cocktails, Live music, Great ambience"
                            className="w-full h-11 px-4 text-sm rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                            Service Types (Comma-separated)
                        </label>
                        <input
                            type="text"
                            value={serviceTypes}
                            onChange={(e) => setServiceTypes(e.target.value)}
                            placeholder="Dine-in, Takeout, Delivery"
                            className="w-full h-11 px-4 text-sm rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                            Dietary Options (Comma-separated)
                        </label>
                        <input
                            type="text"
                            value={dietaryPreferences}
                            onChange={(e) => setDietaryPreferences(e.target.value)}
                            placeholder="Vegan, Halal, Gluten-Free"
                            className="w-full h-11 px-4 text-sm rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all outline-none"
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
                            Upload multiple photos to feature in the auto-sliding image carousel on the restaurant detail hero section.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {galleryImages.map((imageUrl, index) => (
                        <div
                            key={index}
                            className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 shadow-sm hover:shadow-md transition-all duration-300"
                        >
                            <img
                                src={imageUrl}
                                alt={`Gallery Photo ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <button
                                    type="button"
                                    onClick={() => handleRemoveGalleryImage(index)}
                                    className="p-2.5 bg-red-500 hover:bg-red-600 active:scale-95 text-white rounded-full transition-all shadow-lg flex items-center justify-center"
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

                    <label className="flex flex-col items-center justify-center aspect-[4/3] rounded-2xl border-2 border-dashed border-gray-200 hover:border-orange-500 hover:bg-orange-50/10 cursor-pointer transition-all duration-300 text-gray-400 hover:text-orange-600 group">
                        {uploadingGallery ? (
                            <div className="flex flex-col items-center space-y-2">
                                <Loader2 className="h-7 w-7 text-orange-500 animate-spin" />
                                <span className="text-xs font-semibold text-orange-500">Uploading...</span>
                            </div>
                        ) : (
                            <>
                                <div className="p-2.5 bg-gray-50 rounded-full group-hover:bg-orange-50 group-hover:scale-110 transition-all duration-300 mb-1.5">
                                    <Plus className="h-5 w-5 text-gray-500 group-hover:text-orange-500" />
                                </div>
                                <span className="text-xs font-bold text-gray-700">Add Photo</span>
                                <span className="text-[10px] text-gray-400 mt-0.5">JPEG/PNG up to 5MB</span>
                            </>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            disabled={uploadingGallery}
                            onChange={async (e) => {
                                if (e.target.files && e.target.files.length > 0) {
                                    await handleUploadGalleryImages(Array.from(e.target.files));
                                }
                                e.target.value = '';
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
                    className="px-8 py-3.5 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold text-sm rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-2"
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
    );
}
