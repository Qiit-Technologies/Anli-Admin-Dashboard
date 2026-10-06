'use client';

import {
    getMe,
    updateProfile,
    uploadProfilePicture,
} from '@/app/actions/users';
import {
    fetchHotelById,
    updateHotelVatRate,
    updateHotelServiceChargeRate,
    updateHotelTipRate,
    updateRequisitionApprovalSetting,
    getCustomCharges,
    createCustomCharge,
    updateCustomCharge,
    deleteCustomCharge,
    updateHotel,
    uploadGalleryImage,
} from '@/app/actions/hotel';
import { StaffMemberColumns } from '@/components/admin/Table/column/StaffColumn';
import BrandButton from '@/components/common/Button';
import { InputField } from '@/components/common/Form';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import CustomTable from '@/components/common/table/CustomTable';
import { PrinterSelector } from '@/components/PrinterSelect';
import Toast from '@/components/toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CheckoutPolicyTab from '@/components/admin/settings/CheckoutPolicyTab';
import SecurityPolicyTab from '@/components/admin/settings/SecurityPolicyTab';
import ReservationConfirmationTab from '@/components/admin/settings/ReservationConfirmationTab';
import RestaurantDetailsTab from '@/components/admin/settings/RestaurantDetailsTab';
import NightAuditSettingsTab from '@/components/admin/settings/NightAuditSettingsTab';
import useStaff from '@/hooks/useStaff';
import { Mail, User, } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { FaEye, FaEyeSlash, FaLock } from 'react-icons/fa';
import { LuImageUp } from 'react-icons/lu';
import { useUser } from '@/context/useUser';
import { useUserProfile } from '@/hooks/useUser';
import ComplimentaryPinSettings from '@/components/back-of-house/ComplimentaryPinSettings';

const SettingsPage = () => {
    useUserProfile();
    const { user } = useUser();
    const userRole = user?.roles?.name?.toLowerCase();
    const isAdminOrManager = userRole === 'administrator' || userRole === 'manager';

    // Gallery settings
    const [galleryImages, setGalleryImages] = useState<string[]>([]);
    const [uploadingGallery, setUploadingGallery] = useState(false);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [currentPin, setCurrentPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [passwordVisibility, setPasswordVisibility] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [pinVisibility, setPinVisibility] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [, setError] = useState<string | null>(null);
    const [, setIsLoading] = useState(false);

    // Requisition settings
    const [enableRequisitionApproval, setEnableRequisitionApproval] =
        useState(false);
    const [loadingRequisitionSetting, setLoadingRequisitionSetting] =
        useState(false);
    const [vatRate, setVatRate] = useState('0');
    const [serviceChargeRate, setServiceChargeRate] = useState('0');
    const [tipRate, setTipRate] = useState('0');
    const [savingFinancialSettings, setSavingFinancialSettings] =
        useState(false);

    // Front Office specific rates
    const [frontOfficeVatRate, setFrontOfficeVatRate] = useState('0');
    const [frontOfficeServiceChargeRate, setFrontOfficeServiceChargeRate] =
        useState('0');
    const [frontOfficeTipRate, setFrontOfficeTipRate] = useState('0');
    const [frontOfficeVatInclusive, setFrontOfficeVatInclusive] =
        useState(false);
    const [frontOfficeServiceChargeInclusive, setFrontOfficeServiceChargeInclusive] =
        useState(false);
    const [frontOfficeTipInclusive, setFrontOfficeTipInclusive] =
        useState(false);
    const [frontOfficeCustomChargesInclusive, setFrontOfficeCustomChargesInclusive] =
        useState(false);

    // Restaurant specific rates
    const [restaurantVatRate, setRestaurantVatRate] = useState('0');
    const [restaurantServiceChargeRate, setRestaurantServiceChargeRate] =
        useState('0');
    const [restaurantTipRate, setRestaurantTipRate] = useState('0');
    const [restaurantVatInclusive, setRestaurantVatInclusive] =
        useState(false);
    const [restaurantServiceChargeInclusive, setRestaurantServiceChargeInclusive] =
        useState(false);
    const [restaurantTipInclusive, setRestaurantTipInclusive] =
        useState(false);
    const [restaurantCustomChargesInclusive, setRestaurantCustomChargesInclusive] =
        useState(false);

    // Custom Charges
    const [customCharges, setCustomCharges] = useState<any[]>([]);
    const [loadingCustomCharges, setLoadingCustomCharges] = useState(false);
    const [editingCharge, setEditingCharge] = useState<number | null>(null);
    const [newChargeName, setNewChargeName] = useState('');
    const [newChargeRate, setNewChargeRate] = useState('');
    const [savingCharge, setSavingCharge] = useState(false);

    const handlePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
        setPasswordVisibility((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    const handlePinVisibility = (field: 'current' | 'new' | 'confirm') => {
        setPinVisibility((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    const handleRequisitionApprovalToggle = async () => {
        setLoadingRequisitionSetting(true);
        try {
            const response = await updateRequisitionApprovalSetting(
                !enableRequisitionApproval,
            );
            if (
                response.message ===
                'Requisition approval setting updated successfully!'
            ) {
                setEnableRequisitionApproval(!enableRequisitionApproval);
                setLoadingRequisitionSetting(false);
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={response.message}
                        type="success"
                    />
                ));
            } else {
                setLoadingRequisitionSetting(false);
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={
                            response.message ||
                            'Error updating requisition approval setting'
                        }
                        type="error"
                    />
                ));
            }
        } catch (error: any) {
            console.error(
                'Error updating requisition approval setting:',
                error,
            );
            setLoadingRequisitionSetting(false);
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="Error updating requisition approval setting"
                    type="error"
                />
            ));
        }
    };

    const handleSaveFinancialSettings = async () => {
        setSavingFinancialSettings(true);
        try {
            const numericVat = Math.min(
                Math.max(parseFloat(vatRate) || 0, 0),
                100,
            );
            const numericFrontOfficeVat = Math.min(
                Math.max(parseFloat(frontOfficeVatRate) || 0, 0),
                100,
            );
            const numericRestaurantVat = Math.min(
                Math.max(parseFloat(restaurantVatRate) || 0, 0),
                100,
            );

            const numericServiceCharge = Math.min(
                Math.max(parseFloat(serviceChargeRate) || 0, 0),
                100,
            );
            const numericFrontOfficeServiceCharge = Math.min(
                Math.max(parseFloat(frontOfficeServiceChargeRate) || 0, 0),
                100,
            );
            const numericRestaurantServiceCharge = Math.min(
                Math.max(parseFloat(restaurantServiceChargeRate) || 0, 0),
                100,
            );

            const numericTip = Math.min(
                Math.max(parseFloat(tipRate) || 0, 0),
                100,
            );
            const numericFrontOfficeTip = Math.min(
                Math.max(parseFloat(frontOfficeTipRate) || 0, 0),
                100,
            );
            const numericRestaurantTip = Math.min(
                Math.max(parseFloat(restaurantTipRate) || 0, 0),
                100,
            );

            await Promise.all([
                updateHotelVatRate({
                    vatRate: numericVat,
                    frontOfficeVatRate: numericFrontOfficeVat,
                    restaurantVatRate: numericRestaurantVat,
                    restaurantVatInclusive,
                    frontOfficeVatInclusive,
                    restaurantCustomChargesInclusive,
                    frontOfficeCustomChargesInclusive,
                }),
                updateHotelServiceChargeRate({
                    serviceChargeRate: numericServiceCharge,
                    frontOfficeServiceChargeRate:
                        numericFrontOfficeServiceCharge,
                    restaurantServiceChargeRate: numericRestaurantServiceCharge,
                    restaurantServiceChargeInclusive,
                    frontOfficeServiceChargeInclusive,
                }),
                updateHotelTipRate({
                    tipRate: numericTip,
                    frontOfficeTipRate: numericFrontOfficeTip,
                    restaurantTipRate: numericRestaurantTip,
                    restaurantTipInclusive,
                    frontOfficeTipInclusive,
                }),
            ]);

            toast.custom(() => (
                <Toast
                    title="Success!"
                    description="Tax settings updated successfully"
                    type="success"
                />
            ));
        } catch (error: any) {
            console.error('Error updating tax settings:', error);
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="Unable to update tax settings right now."
                    type="error"
                />
            ));
        } finally {
            setSavingFinancialSettings(false);
        }
    };

    const handleCreateCustomCharge = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!newChargeName.trim() || !newChargeRate.trim()) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="Please provide both name and rate"
                    type="error"
                />
            ));
            return;
        }

        setSavingCharge(true);
        const numericRate = Math.min(
            Math.max(parseFloat(newChargeRate) || 0, 0),
            100,
        );
        try {
            const response = await createCustomCharge({
                name: newChargeName.trim(),
                rate: numericRate,
            });
            if ('error' in response && response.error) {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={
                            response.error ||
                            'Unable to create custom charge right now.'
                        }
                        type="error"
                    />
                ));
            } else {
                setNewChargeName('');
                setNewChargeRate('');
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description="Custom charge created successfully"
                        type="success"
                    />
                ));
                // Refresh custom charges list
                const refreshResponse = await getCustomCharges();
                if ('data' in refreshResponse) {
                    setCustomCharges(refreshResponse.data || []);
                }
            }
        } catch (error: any) {
            console.error('Error creating custom charge:', error);
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="Unable to create custom charge right now."
                    type="error"
                />
            ));
        } finally {
            setSavingCharge(false);
        }
    };

    const handleUpdateCustomCharge = async (
        id: number,
        name: string,
        rate: number,
        isActive: boolean,
    ) => {
        setSavingCharge(true);
        try {
            const response = await updateCustomCharge(id, {
                name,
                rate,
                isActive,
            });
            if ('error' in response && response.error) {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={
                            response.error ||
                            'Unable to update custom charge right now.'
                        }
                        type="error"
                    />
                ));
            } else {
                setEditingCharge(null);
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description="Custom charge updated successfully"
                        type="success"
                    />
                ));
                // Refresh custom charges list
                const refreshResponse = await getCustomCharges();
                if ('data' in refreshResponse) {
                    setCustomCharges(refreshResponse.data || []);
                }
            }
        } catch (error: any) {
            console.error('Error updating custom charge:', error);
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="Unable to update custom charge right now."
                    type="error"
                />
            ));
        } finally {
            setSavingCharge(false);
        }
    };

    const handleDeleteCustomCharge = async (id: number) => {
        if (!confirm('Are you sure you want to delete this custom charge?')) {
            return;
        }

        setSavingCharge(true);
        try {
            const response = await deleteCustomCharge(id);
            if ('error' in response && response.error) {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={
                            response.error ||
                            'Unable to delete custom charge right now.'
                        }
                        type="error"
                    />
                ));
            } else {
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description="Custom charge deleted successfully"
                        type="success"
                    />
                ));
                // Refresh custom charges list
                const refreshResponse = await getCustomCharges();
                if ('data' in refreshResponse) {
                    setCustomCharges(refreshResponse.data || []);
                }
            }
        } catch (error: any) {
            console.error('Error deleting custom charge:', error);
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="Unable to delete custom charge right now."
                    type="error"
                />
            ));
        } finally {
            setSavingCharge(false);
        }
    };

    // staffs
    const [refreshTable, setRefreshTable] = useState(1);
    const { staff: staffMembers } = useStaff(refreshTable);
    useEffect(() => {
        async function fetchProfileData() {
            try {
                const result = await getMe();
                if ('error' in result) {
                    console.error('Error fetching user details:', result.error);
                } else if ('data' in result && result.data) {
                    console.log(result.data);
                    setName(result.data.fullName);
                    setEmail(result.data.email);
                    setProfilePicture(result.data.profileImage);
                    // Set requisition approval setting from hotel data
                    if (
                        result.data.hotel?.enableRequisitionApproval !==
                        undefined
                    ) {
                        setEnableRequisitionApproval(
                            result.data.hotel.enableRequisitionApproval,
                        );
                    }
                }
            } catch (error: any) {
                console.error('Error fetching profile data:', error);
            }
        }
        async function fetchHotelVatSetting() {
            try {
                const response = await fetchHotelById();
                if (response?.data?.vatRate !== undefined) {
                    setVatRate(Number(response.data.vatRate ?? 0).toString());
                }
                if (response?.data?.serviceChargeRate !== undefined) {
                    setServiceChargeRate(
                        Number(response.data.serviceChargeRate ?? 0).toString(),
                    );
                }
                if (response?.data?.tipRate !== undefined) {
                    setTipRate(Number(response.data.tipRate ?? 0).toString());
                }

                // Front Office rates
                if (response?.data?.frontOfficeVatRate !== undefined) {
                    setFrontOfficeVatRate(
                        Number(
                            response.data.frontOfficeVatRate ??
                            response.data.vatRate ??
                            0,
                        ).toString(),
                    );
                }
                if (
                    response?.data?.frontOfficeServiceChargeRate !== undefined
                ) {
                    setFrontOfficeServiceChargeRate(
                        Number(
                            response.data.frontOfficeServiceChargeRate ??
                            response.data.serviceChargeRate ??
                            0,
                        ).toString(),
                    );
                }
                if (response?.data?.frontOfficeTipRate !== undefined) {
                    setFrontOfficeTipRate(
                        Number(
                            response.data.frontOfficeTipRate ??
                            response.data.tipRate ??
                            0,
                        ).toString(),
                    );
                }

                // Restaurant rates
                if (response?.data?.restaurantVatRate !== undefined) {
                    setRestaurantVatRate(
                        Number(
                            response.data.restaurantVatRate ??
                            response.data.vatRate ??
                            0,
                        ).toString(),
                    );
                }
                if (response?.data?.restaurantServiceChargeRate !== undefined) {
                    setRestaurantServiceChargeRate(
                        Number(
                            response.data.restaurantServiceChargeRate ??
                            response.data.serviceChargeRate ??
                            0,
                        ).toString(),
                    );
                }
                if (response?.data?.restaurantTipRate !== undefined) {
                    setRestaurantTipRate(
                        Number(
                            response.data.restaurantTipRate ??
                            response.data.tipRate ??
                            0,
                        ).toString(),
                    );
                }
                if (response?.data?.images !== undefined) {
                    setGalleryImages(response.data.images ?? []);
                }
                if (response?.data?.restaurantVatInclusive !== undefined) {
                    setRestaurantVatInclusive(
                        Boolean(response.data.restaurantVatInclusive),
                    );
                }
                if (response?.data?.frontOfficeVatInclusive !== undefined) {
                    setFrontOfficeVatInclusive(
                        Boolean(response.data.frontOfficeVatInclusive),
                    );
                }
                if (response?.data?.restaurantServiceChargeInclusive !== undefined) {
                    setRestaurantServiceChargeInclusive(
                        Boolean(response.data.restaurantServiceChargeInclusive),
                    );
                }
                if (response?.data?.frontOfficeServiceChargeInclusive !== undefined) {
                    setFrontOfficeServiceChargeInclusive(
                        Boolean(response.data.frontOfficeServiceChargeInclusive),
                    );
                }
                if (response?.data?.restaurantTipInclusive !== undefined) {
                    setRestaurantTipInclusive(
                        Boolean(response.data.restaurantTipInclusive),
                    );
                }
                if (response?.data?.frontOfficeTipInclusive !== undefined) {
                    setFrontOfficeTipInclusive(
                        Boolean(response.data.frontOfficeTipInclusive),
                    );
                }
                if (response?.data?.restaurantCustomChargesInclusive !== undefined) {
                    setRestaurantCustomChargesInclusive(
                        Boolean(response.data.restaurantCustomChargesInclusive),
                    );
                }
                if (response?.data?.frontOfficeCustomChargesInclusive !== undefined) {
                    setFrontOfficeCustomChargesInclusive(
                        Boolean(response.data.frontOfficeCustomChargesInclusive),
                    );
                }
            } catch (error: any) {
                console.error('Error fetching hotel settings:', error);
            }
        }
        async function fetchCustomCharges() {
            setLoadingCustomCharges(true);
            try {
                const response = await getCustomCharges();
                if ('error' in response) {
                    console.error(
                        'Error fetching custom charges:',
                        response.error,
                    );
                } else {
                    setCustomCharges(response.data || []);
                }
            } catch (error: any) {
                console.error('Error fetching custom charges:', error);
            } finally {
                setLoadingCustomCharges(false);
            }
        }
        fetchProfileData();
        fetchHotelVatSetting();
        fetchCustomCharges();
    }, []);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await uploadProfilePicture(formData);
                if (response && response.status) {
                    setProfilePicture(URL.createObjectURL(file));
                    toast.custom(() => (
                        <Toast
                            title="Success!"
                            description="Profile picture updated successfully"
                            type="success"
                        />
                    ));
                } else {
                    toast.custom(() => (
                        <Toast
                            title="Error!"
                            description="Failed to upload profile picture"
                            type="error"
                        />
                    ));
                }
            } catch (err) {
                console.error('Error uploading profile picture:', err);
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description="An unexpected error occurred"
                        type="error"
                    />
                ));
            }
        }
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="New password and confirm password does not match"
                    type="error"
                />
            ));
            return;
        }

        if (newPin && newPin !== confirmPin) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="New PIN and confirm PIN do not match"
                    type="error"
                />
            ));
            return;
        }

        if (newPin && newPin.length !== 4) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="PIN must be exactly 4 digits"
                    type="error"
                />
            ));
            return;
        }

        const formData = new FormData();
        formData.append('email', email);
        formData.append('name', name);
        if (currentPassword)
            formData.append('currentPassword', currentPassword);
        if (newPassword) formData.append('newPassword', newPassword);

        // For PIN update, if currentPin is provided and is 4 digits, send as currentPin
        // Otherwise, if it's longer, send as currentPassword (for PIN update verification)
        if (currentPin) {
            if (currentPin.length === 4 && /^\d{4}$/.test(currentPin)) {
                formData.append('currentPin', currentPin);
            } else {
                // If it's not 4 digits, it's likely a password, send as currentPassword
                formData.append('currentPassword', currentPin);
            }
        }
        if (newPin) formData.append('newPin', newPin);

        try {
            const response = await updateProfile(formData);
            if (response) {
                if (response.message === 'Profile updated successfully') {
                    toast.custom(() => (
                        <Toast
                            title="Success!"
                            description={response.message}
                            type="success"
                        />
                    ));
                    setIsEditing(false);
                } else {
                    toast.custom(() => (
                        <Toast
                            title="Error!"
                            description={response.message ?? "Error"}
                            type="error"
                        />
                    ));
                }
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setIsLoading(false);
        }
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');
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
        const hotelId = localStorage.getItem('hotelId');
        if (!hotelId) return;

        const updatedImages = galleryImages.filter((_, idx) => idx !== indexToRemove);
        try {
            const response = await updateHotel(Number(hotelId), { images: updatedImages });
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

    return (
        <PageWrapper>
            <PageHeader>
                <PageHeadertitle title="Settings" />
            </PageHeader>
            <div className="flex w-full h-full items-center justify-center">
                <div className="w-full bg-white rounded-lg overflow-hidden">
                    <div className="pb-6 pt-6 px-6">
                        <div className="flex items-center space-x-4">
                            <div
                                className="relative w-20 h-20 rounded-full overflow-hidden cursor-pointer"
                                onClick={handleImageClick}
                            >
                                <img
                                    src={
                                        profilePicture ||
                                        'https://res.cloudinary.com/dhkwjizxu/image/upload/v1736109984/assets/fwaq9bud8tyqsps9hwjy.png'
                                    }
                                    alt={name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="opacity-0 hover:opacity-100 transition-opacity ease-in-out absolute flex flex-col items-center justify-center top-0 left-0 w-full h-full bg-black/65">
                                    <LuImageUp className="w-1/2 h-1/2 text-gray-400" />
                                    <span className="text-gray-400 text-xs">
                                        Upload
                                    </span>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">{name}</h1>
                                <p className="text-gray-500 text-sm">{email}</p>
                            </div>
                        </div>
                    </div>

                    <Tabs defaultValue="profile" className="px-8">
                        <div className="w-full overflow-x-auto pb-2">
                            <TabsList className="inline-flex h-auto w-max min-w-full flex-nowrap gap-1">
                                <TabsTrigger
                                    className="whitespace-nowrap"
                                    value="profile"
                                >
                                    Profile
                                </TabsTrigger>
                                <TabsTrigger
                                    className="whitespace-nowrap"
                                    value="misc"
                                >
                                    Miscellaneous
                                </TabsTrigger>
                                <TabsTrigger
                                    className="whitespace-nowrap"
                                    value="vat-settings"
                                >
                                    Tax & VAT
                                </TabsTrigger>
                                <TabsTrigger
                                    className="whitespace-nowrap"
                                    value="requisition-settings"
                                >
                                    Requisition Settings
                                </TabsTrigger>
                                <TabsTrigger
                                    className="whitespace-nowrap"
                                    value="staff-passwords"
                                >
                                    Staff Passwords
                                </TabsTrigger>
                                <TabsTrigger
                                    className="whitespace-nowrap"
                                    value="checkout-policy"
                                >
                                    Overstay Policy
                                </TabsTrigger>
                                <TabsTrigger
                                    className="whitespace-nowrap"
                                    value="security-policy"
                                >
                                    Security Policy
                                </TabsTrigger>
                                <TabsTrigger
                                    className="whitespace-nowrap"
                                    value="reservation-confirmation"
                                >
                                    Reservation Confirmation
                                </TabsTrigger>
                                <TabsTrigger
                                    className="whitespace-nowrap"
                                    value="night-audit"
                                >
                                    Night Audit
                                </TabsTrigger>
                                {isAdminOrManager && (
                                    <TabsTrigger
                                        className="whitespace-nowrap"
                                        value="gallery"
                                    >
                                        Restaurant Details
                                    </TabsTrigger>
                                )}
                            </TabsList>
                        </div>

                        <TabsContent value="profile" className="py-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <h2 className="text-lg font-semibold">
                                        Personal Information
                                    </h2>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <InputField
                                            icon={User}
                                            iconPosition="left"
                                            id="name"
                                            name="name"
                                            label="Full Name"
                                            type="text"
                                            value={name}
                                            onChange={(e) =>
                                                setName(e.target.value)
                                            }
                                            readOnly={!isEditing}
                                            className="pl-8 block  h-10"
                                        />

                                        <InputField
                                            icon={Mail}
                                            iconPosition="left"
                                            id="email"
                                            name="email"
                                            label="Email"
                                            type="email"
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                            readOnly={!isEditing}
                                            className="pl-8 block  h-10"
                                        />
                                    </div>
                                </div>

                                <hr className="border-t border-gray-200" />

                                <div className="space-y-4">
                                    <h2 className="text-lg font-semibold">
                                        Change Password & PIN
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Password Section */}
                                        <div className="space-y-3 border-r border-gray-200 pr-6">
                                            <h3 className="text-base font-semibold">
                                                Password
                                            </h3>

                                            <div className="space-y-3">
                                                {[
                                                    'Current Password',
                                                    'New Password',
                                                    'Confirm New Password',
                                                ].map((label, index) => {
                                                    const field = label
                                                        .toLowerCase()
                                                        .replace(/\s/g, '') as
                                                        | 'current'
                                                        | 'new'
                                                        | 'confirm';
                                                    return (
                                                        <div
                                                            key={label}
                                                            className="space-y-1"
                                                        >
                                                            <label
                                                                htmlFor={field}
                                                                className="text-sm font-medium text-gray-700"
                                                            >
                                                                {label}{' '}
                                                                <span className="text-red-500">
                                                                    *
                                                                </span>
                                                            </label>
                                                            <div className="relative">
                                                                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                                                                <input
                                                                    id={field}
                                                                    type={
                                                                        passwordVisibility[
                                                                            field
                                                                        ]
                                                                            ? 'text'
                                                                            : 'password'
                                                                    }
                                                                    value={
                                                                        [
                                                                            currentPassword,
                                                                            newPassword,
                                                                            confirmPassword,
                                                                        ][index]
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) => {
                                                                        [
                                                                            setCurrentPassword,
                                                                            setNewPassword,
                                                                            setConfirmPassword,
                                                                        ][
                                                                            index
                                                                        ](
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        );
                                                                    }}
                                                                    disabled={
                                                                        !isEditing
                                                                    }
                                                                    className="pl-8 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 h-10 text-sm"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handlePasswordVisibility(
                                                                            field,
                                                                        )
                                                                    }
                                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                                                >
                                                                    {passwordVisibility[
                                                                        field
                                                                    ] ? (
                                                                        <FaEyeSlash className="text-sm" />
                                                                    ) : (
                                                                        <FaEye className="text-sm" />
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* PIN Section */}
                                        <div className="space-y-3 pl-6">
                                            <h3 className="text-base font-semibold">
                                                PIN
                                            </h3>
                                            <div className="space-y-3">
                                                {[
                                                    'Current PIN or Password',
                                                    'New PIN',
                                                    'Confirm New PIN',
                                                ].map((label, index) => {
                                                    const field = label
                                                        .toLowerCase()
                                                        .replace(/\s/g, '')
                                                        .replace(
                                                            'orpassword',
                                                            '',
                                                        ) as
                                                        | 'current'
                                                        | 'new'
                                                        | 'confirm';
                                                    return (
                                                        <div
                                                            key={label}
                                                            className="space-y-1"
                                                        >
                                                            <label
                                                                htmlFor={`pin-${field}`}
                                                                className="text-sm font-medium text-gray-700"
                                                            >
                                                                {label}
                                                            </label>
                                                            <div className="relative">
                                                                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                                                                <input
                                                                    id={`pin-${field}`}
                                                                    type={
                                                                        field ===
                                                                            'current'
                                                                            ? 'text'
                                                                            : pinVisibility[
                                                                                field
                                                                            ]
                                                                                ? 'text'
                                                                                : 'password'
                                                                    }
                                                                    autoComplete={
                                                                        field ===
                                                                            'current'
                                                                            ? 'off'
                                                                            : 'off'
                                                                    }
                                                                    maxLength={
                                                                        field ===
                                                                            'current'
                                                                            ? undefined
                                                                            : 4
                                                                    }
                                                                    value={
                                                                        [
                                                                            currentPin,
                                                                            newPin,
                                                                            confirmPin,
                                                                        ][index]
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) => {
                                                                        // Allow both text and numbers for current PIN (can be PIN or password)
                                                                        // Only allow numbers for new PIN and confirm PIN
                                                                        const value =
                                                                            field ===
                                                                                'current'
                                                                                ? e
                                                                                    .target
                                                                                    .value
                                                                                : e.target.value.replace(
                                                                                    /\D/g,
                                                                                    '',
                                                                                );
                                                                        [
                                                                            setCurrentPin,
                                                                            setNewPin,
                                                                            setConfirmPin,
                                                                        ][
                                                                            index
                                                                        ](
                                                                            value,
                                                                        );
                                                                    }}
                                                                    inputMode={
                                                                        field ===
                                                                            'current'
                                                                            ? pinVisibility[
                                                                                field
                                                                            ]
                                                                                ? 'text'
                                                                                : undefined
                                                                            : 'numeric'
                                                                    }
                                                                    pattern={
                                                                        field ===
                                                                            'current'
                                                                            ? undefined
                                                                            : '[0-9]*'
                                                                    }
                                                                    disabled={
                                                                        !isEditing
                                                                    }
                                                                    placeholder={
                                                                        field ===
                                                                            'current'
                                                                            ? 'Enter current PIN or password'
                                                                            : 'Enter 4-digit PIN'
                                                                    }
                                                                    className="pl-8 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 h-10 text-sm"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handlePinVisibility(
                                                                            field,
                                                                        )
                                                                    }
                                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                                                >
                                                                    {pinVisibility[
                                                                        field
                                                                    ] ? (
                                                                        <FaEyeSlash className="text-sm" />
                                                                    ) : (
                                                                        <FaEye className="text-sm" />
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(!isEditing)}
                                        className={`px-4 py-2 text-sm ${isEditing
                                            ? 'bg-gray-400'
                                            : 'bg-orion-blue hover:bg-blue-700'
                                            } text-white rounded-md focus:outline-none`}
                                    >
                                        {isEditing ? 'Cancel' : 'Edit'}
                                    </button>
                                    {isEditing && (
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-orange-500 text-white text-sm rounded-md hover:bg-orange-600 focus:outline-none"
                                        >
                                            Save Changes
                                        </button>
                                    )}
                                </div>
                                <ComplimentaryPinSettings />
                            </form>
                        </TabsContent>

                        <TabsContent value="misc" className="py-6">
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold">
                                    Account Settings
                                </h2>
                                <div className="space-y-4">
                                    <PrinterSelector />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="vat-settings" className="py-6">
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Tax & Charges Configuration
                                    </h2>
                                    <p className="text-sm text-gray-500 max-w-2xl">
                                        Manage tax and service charge rates
                                        independently for different hotel
                                        departments. Modules will prioritize
                                        their specific rates.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Front Office Section */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 border-b border-blue-100 pb-2">
                                            <div className="p-1.5 bg-blue-50 rounded-md">
                                                <User className="text-blue-600 w-3 h-3" />
                                            </div>
                                            <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider">
                                                Front Office (Rooms)
                                            </h3>
                                        </div>
                                        <div className="bg-blue-50/20 p-6 rounded-xl border border-blue-100 space-y-5">
                                            <InputField
                                                id="frontOfficeVatRate"
                                                name="frontOfficeVatRate"
                                                label="Rooms VAT (%)"
                                                type="number"
                                                value={frontOfficeVatRate}
                                                onChange={(e) =>
                                                    setFrontOfficeVatRate(
                                                        e.target.value,
                                                    )
                                                }
                                                className="h-10 bg-white"
                                            />
                                            <InputField
                                                id="frontOfficeServiceChargeRate"
                                                name="frontOfficeServiceChargeRate"
                                                label="Rooms Service Charge (%)"
                                                type="number"
                                                value={
                                                    frontOfficeServiceChargeRate
                                                }
                                                onChange={(e) =>
                                                    setFrontOfficeServiceChargeRate(
                                                        e.target.value,
                                                    )
                                                }
                                                className="h-10 bg-white"
                                            />
                                            <InputField
                                                id="frontOfficeTipRate"
                                                name="frontOfficeTipRate"
                                                label="Rooms Tip (%)"
                                                type="number"
                                                value={frontOfficeTipRate}
                                                onChange={(e) =>
                                                    setFrontOfficeTipRate(
                                                        e.target.value,
                                                    )
                                                 }
                                                 className="h-10 bg-white"
                                             />
                                             <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">
                                                    Rooms VAT Inclusive
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setFrontOfficeVatInclusive(
                                                            !frontOfficeVatInclusive,
                                                        )
                                                    }
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orion-blue focus:ring-offset-2 ${frontOfficeVatInclusive
                                                        ? 'bg-orion-blue'
                                                        : 'bg-gray-200'
                                                        }`}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${frontOfficeVatInclusive
                                                            ? 'translate-x-6'
                                                            : 'translate-x-1'
                                                            }`}
                                                    />
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">
                                                    Rooms Service Charge Inclusive
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setFrontOfficeServiceChargeInclusive(
                                                            !frontOfficeServiceChargeInclusive,
                                                        )
                                                    }
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orion-blue focus:ring-offset-2 ${frontOfficeServiceChargeInclusive
                                                        ? 'bg-orion-blue'
                                                        : 'bg-gray-200'
                                                        }`}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${frontOfficeServiceChargeInclusive
                                                            ? 'translate-x-6'
                                                            : 'translate-x-1'
                                                            }`}
                                                    />
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">
                                                    Rooms Tip Inclusive
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setFrontOfficeTipInclusive(
                                                            !frontOfficeTipInclusive,
                                                        )
                                                    }
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orion-blue focus:ring-offset-2 ${frontOfficeTipInclusive
                                                        ? 'bg-orion-blue'
                                                        : 'bg-gray-200'
                                                        }`}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${frontOfficeTipInclusive
                                                            ? 'translate-x-6'
                                                            : 'translate-x-1'
                                                            }`}
                                                    />
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">
                                                    Rooms Custom Charges Inclusive
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setFrontOfficeCustomChargesInclusive(
                                                            !frontOfficeCustomChargesInclusive,
                                                        )
                                                    }
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orion-blue focus:ring-offset-2 ${frontOfficeCustomChargesInclusive
                                                        ? 'bg-orion-blue'
                                                        : 'bg-gray-200'
                                                        }`}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${frontOfficeCustomChargesInclusive
                                                            ? 'translate-x-6'
                                                            : 'translate-x-1'
                                                            }`}
                                                    />
                                                </button>
                                            </div>
                                         </div>
                                     </div>

                                     {/* Restaurant Section */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 border-b border-orange-100 pb-2">
                                            <div className="p-1.5 bg-orange-50 rounded-md">
                                                <LuImageUp className="text-orange-600 w-3 h-3" />
                                            </div>
                                            <h3 className="text-sm font-bold text-orange-800 uppercase tracking-wider">
                                                Restaurant (POS)
                                            </h3>
                                        </div>
                                        <div className="bg-orange-50/20 p-6 rounded-xl border border-orange-100 space-y-5">
                                            <InputField
                                                id="restaurantVatRate"
                                                name="restaurantVatRate"
                                                label="POS VAT (%)"
                                                type="number"
                                                value={restaurantVatRate}
                                                onChange={(e) =>
                                                    setRestaurantVatRate(
                                                        e.target.value,
                                                    )
                                                }
                                                className="h-10 bg-white"
                                            />
                                            <InputField
                                                id="restaurantServiceChargeRate"
                                                name="restaurantServiceChargeRate"
                                                label="POS Service Charge (%)"
                                                type="number"
                                                value={
                                                    restaurantServiceChargeRate
                                                }
                                                onChange={(e) =>
                                                    setRestaurantServiceChargeRate(
                                                        e.target.value,
                                                    )
                                                }
                                                className="h-10 bg-white"
                                            />
                                            <InputField
                                                id="restaurantTipRate"
                                                name="restaurantTipRate"
                                                label="POS Tip (%)"
                                                type="number"
                                                value={restaurantTipRate}
                                                onChange={(e) =>
                                                    setRestaurantTipRate(
                                                        e.target.value,
                                                    )
                                                 }
                                                 className="h-10 bg-white"
                                             />
                                             <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">
                                                    POS VAT Inclusive
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setRestaurantVatInclusive(
                                                            !restaurantVatInclusive,
                                                        )
                                                    }
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orion-blue focus:ring-offset-2 ${restaurantVatInclusive
                                                        ? 'bg-orion-blue'
                                                        : 'bg-gray-200'
                                                        }`}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${restaurantVatInclusive
                                                            ? 'translate-x-6'
                                                            : 'translate-x-1'
                                                            }`}
                                                    />
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">
                                                    POS Service Charge Inclusive
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setRestaurantServiceChargeInclusive(
                                                            !restaurantServiceChargeInclusive,
                                                        )
                                                    }
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orion-blue focus:ring-offset-2 ${restaurantServiceChargeInclusive
                                                        ? 'bg-orion-blue'
                                                        : 'bg-gray-200'
                                                        }`}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${restaurantServiceChargeInclusive
                                                            ? 'translate-x-6'
                                                            : 'translate-x-1'
                                                            }`}
                                                    />
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">
                                                    POS Tip Inclusive
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setRestaurantTipInclusive(
                                                            !restaurantTipInclusive,
                                                        )
                                                    }
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orion-blue focus:ring-offset-2 ${restaurantTipInclusive
                                                        ? 'bg-orion-blue'
                                                        : 'bg-gray-200'
                                                        }`}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${restaurantTipInclusive
                                                            ? 'translate-x-6'
                                                            : 'translate-x-1'
                                                            }`}
                                                    />
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">
                                                    POS Custom Charges Inclusive
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setRestaurantCustomChargesInclusive(
                                                            !restaurantCustomChargesInclusive,
                                                        )
                                                    }
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orion-blue focus:ring-offset-2 ${restaurantCustomChargesInclusive
                                                        ? 'bg-orion-blue'
                                                        : 'bg-gray-200'
                                                        }`}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${restaurantCustomChargesInclusive
                                                            ? 'translate-x-6'
                                                            : 'translate-x-1'
                                                            }`}
                                                    />
                                                </button>
                                            </div>
                                         </div>
                                     </div>
                                 </div>

                                <div className="flex pt-4 border-t border-gray-100">
                                    <button
                                        onClick={handleSaveFinancialSettings}
                                        disabled={savingFinancialSettings}
                                        className={`px-8 py-3 rounded-xl text-white text-sm font-bold transition-all shadow-md ${savingFinancialSettings ? 'bg-gray-400' : 'bg-orion-blue hover:bg-blue-700 active:scale-95'}`}
                                    >
                                        {savingFinancialSettings
                                            ? 'Saving Settings...'
                                            : 'Save Tax Settings'}
                                    </button>
                                </div>

                                <div className="pt-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="text-md font-semibold">
                                                Custom Charges
                                            </h3>
                                            <p className="text-xs text-gray-500">
                                                Additional percentage-based
                                                charges applied to reservations.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Create New Custom Charge Form */}
                                    <form
                                        onSubmit={handleCreateCustomCharge}
                                        className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg"
                                    >
                                        <InputField
                                            id="newChargeName"
                                            name="newChargeName"
                                            label="Charge Name"
                                            type="text"
                                            value={newChargeName}
                                            onChange={(e) =>
                                                setNewChargeName(e.target.value)
                                            }
                                            readOnly={savingCharge}
                                            className="h-10"
                                            placeholder="e.g., City Tax"
                                        />
                                        <InputField
                                            id="newChargeRate"
                                            name="newChargeRate"
                                            label="Rate (%)"
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            value={newChargeRate}
                                            onChange={(e) =>
                                                setNewChargeRate(e.target.value)
                                            }
                                            readOnly={savingCharge}
                                            className="h-10"
                                            placeholder="0.00"
                                        />
                                        <div className="flex items-end">
                                            <button
                                                type="submit"
                                                disabled={savingCharge}
                                                className={`px-4 py-2 rounded-md text-white w-full h-10 ${savingCharge ? 'bg-gray-400' : 'bg-orion-blue hover:bg-orion-blue/80'}`}
                                            >
                                                {savingCharge
                                                    ? 'Adding...'
                                                    : 'Add Charge'}
                                            </button>
                                        </div>
                                    </form>

                                    {/* Custom Charges List */}
                                    {loadingCustomCharges ? (
                                        <div className="text-center py-4 text-gray-500">
                                            Loading custom charges...
                                        </div>
                                    ) : customCharges.length === 0 ? (
                                        <div className="text-center py-4 text-gray-500">
                                            No custom charges configured. Add
                                            one above to get started.
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {customCharges.map((charge) => (
                                                <div
                                                    key={charge.id}
                                                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                                                >
                                                    {editingCharge ===
                                                        charge.id ? (
                                                        <div className="flex items-center gap-4 flex-1">
                                                            <InputField
                                                                id={`charge-name-${charge.id}`}
                                                                name={`charge-name-${charge.id}`}
                                                                label=""
                                                                type="text"
                                                                value={
                                                                    charge.name
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    setCustomCharges(
                                                                        (
                                                                            prev,
                                                                        ) =>
                                                                            prev.map(
                                                                                (
                                                                                    c,
                                                                                ) =>
                                                                                    c.id ===
                                                                                        charge.id
                                                                                        ? {
                                                                                            ...c,
                                                                                            name: e
                                                                                                .target
                                                                                                .value,
                                                                                        }
                                                                                        : c,
                                                                            ),
                                                                    );
                                                                }}
                                                                className="h-10 flex-1"
                                                            />
                                                            <InputField
                                                                id={`charge-rate-${charge.id}`}
                                                                name={`charge-rate-${charge.id}`}
                                                                label=""
                                                                type="number"
                                                                min="0"
                                                                max="100"
                                                                step="0.01"
                                                                value={
                                                                    charge.rate
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    setCustomCharges(
                                                                        (
                                                                            prev,
                                                                        ) =>
                                                                            prev.map(
                                                                                (
                                                                                    c,
                                                                                ) =>
                                                                                    c.id ===
                                                                                        charge.id
                                                                                        ? {
                                                                                            ...c,
                                                                                            rate:
                                                                                                parseFloat(
                                                                                                    e
                                                                                                        .target
                                                                                                        .value,
                                                                                                ) ||
                                                                                                0,
                                                                                        }
                                                                                        : c,
                                                                            ),
                                                                    );
                                                                }}
                                                                className="h-10 w-24"
                                                            />
                                                            <label className="flex items-center gap-2">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={
                                                                        charge.isActive
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) => {
                                                                        setCustomCharges(
                                                                            (
                                                                                prev,
                                                                            ) =>
                                                                                prev.map(
                                                                                    (
                                                                                        c,
                                                                                    ) =>
                                                                                        c.id ===
                                                                                            charge.id
                                                                                            ? {
                                                                                                ...c,
                                                                                                isActive:
                                                                                                    e
                                                                                                        .target
                                                                                                        .checked,
                                                                                            }
                                                                                            : c,
                                                                                ),
                                                                        );
                                                                    }}
                                                                    className="rounded"
                                                                />
                                                                <span className="text-sm text-gray-600">
                                                                    Active
                                                                </span>
                                                            </label>
                                                            <button
                                                                onClick={() =>
                                                                    handleUpdateCustomCharge(
                                                                        charge.id,
                                                                        charge.name,
                                                                        charge.rate,
                                                                        charge.isActive,
                                                                    )
                                                                }
                                                                disabled={
                                                                    savingCharge
                                                                }
                                                                className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:bg-gray-400"
                                                            >
                                                                Save
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setEditingCharge(
                                                                        null,
                                                                    );
                                                                    // Reset to original values
                                                                    const refreshResponse =
                                                                        getCustomCharges();
                                                                    refreshResponse.then(
                                                                        (
                                                                            res,
                                                                        ) => {
                                                                            if (
                                                                                'data' in
                                                                                res
                                                                            ) {
                                                                                setCustomCharges(
                                                                                    res.data ||
                                                                                    [],
                                                                                );
                                                                            }
                                                                        },
                                                                    );
                                                                }}
                                                                className="px-3 py-1 bg-gray-400 text-white rounded text-sm hover:bg-gray-500"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="flex items-center gap-4 flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium">
                                                                        {
                                                                            charge.name
                                                                        }
                                                                    </span>
                                                                    <span className="text-sm text-gray-500">
                                                                        {
                                                                            charge.rate
                                                                        }
                                                                        %
                                                                    </span>
                                                                    {!charge.isActive && (
                                                                        <span className="text-sm text-orange-500">
                                                                            (Inactive)
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() =>
                                                                        setEditingCharge(
                                                                            charge.id,
                                                                        )
                                                                    }
                                                                    className="px-3 py-1 bg-orion-blue text-white rounded text-sm hover:bg-orion-blue/80"
                                                                >
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        handleDeleteCustomCharge(
                                                                            charge.id,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        savingCharge
                                                                    }
                                                                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 disabled:bg-gray-400"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent
                            value="requisition-settings"
                            className="py-6"
                        >
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold">
                                    Requisition Settings
                                </h2>
                                <div className="space-y-4">
                                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <h3 className="text-md font-medium text-gray-900">
                                                    Requisition Approval
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    When enabled, inventory
                                                    requisition requests will
                                                    require management approval
                                                    before being processed. When
                                                    disabled, requests will be
                                                    automatically approved and
                                                    go directly to stock.
                                                </p>
                                            </div>
                                            <div className="flex items-center">
                                                <button
                                                    type="button"
                                                    onClick={
                                                        handleRequisitionApprovalToggle
                                                    }
                                                    disabled={
                                                        loadingRequisitionSetting
                                                    }
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orion-blue focus:ring-offset-2 ${enableRequisitionApproval
                                                        ? 'bg-orion-blue'
                                                        : 'bg-gray-200'
                                                        } ${loadingRequisitionSetting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enableRequisitionApproval
                                                            ? 'translate-x-6'
                                                            : 'translate-x-1'
                                                            }`}
                                                    />
                                                </button>
                                            </div>
                                        </div>
                                        {loadingRequisitionSetting && (
                                            <div className="mt-2 text-sm text-gray-500">
                                                Updating setting...
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="staff-passwords" className="py-6">
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold">
                                    Staff Password Management
                                </h2>
                                <CustomTable
                                    data={staffMembers}
                                    columns={StaffMemberColumns}
                                    extend={
                                        <BrandButton
                                            onClick={() => setRefreshTable(1)}
                                        >
                                            Reresh
                                        </BrandButton>
                                    }
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="checkout-policy" className="py-6">
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold">
                                    Checkout & Overstay Policy
                                </h2>
                                <CheckoutPolicyTab />
                            </div>
                        </TabsContent>

                        <TabsContent value="security-policy" className="py-6">
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold">
                                    Security Policy
                                </h2>
                                <SecurityPolicyTab />
                            </div>
                        </TabsContent>

                        <TabsContent
                            value="reservation-confirmation"
                            className="py-6"
                        >
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold">
                                    Reservation Confirmation
                                </h2>
                                <ReservationConfirmationTab />
                            </div>
                        </TabsContent>

                        {isAdminOrManager && (
                            <TabsContent
                                value="night-audit"
                                className="py-6"
                            >
                                <div className="space-y-6">
                                    <h2 className="text-lg font-semibold">
                                        Night Audit Email
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        Configure when the nightly audit
                                        report is sent and which staff
                                        receive it.
                                    </p>
                                    <NightAuditSettingsTab />
                                </div>
                            </TabsContent>
                        )}

                        {isAdminOrManager && (
                            <TabsContent value="gallery" className="py-6">
                                <RestaurantDetailsTab />
                            </TabsContent>
                        )}
                    </Tabs>
                </div>
            </div>
        </PageWrapper>
    );
};

export default SettingsPage;
