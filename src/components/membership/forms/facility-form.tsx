'use client';

import BrandButton from '@/components/common/Button';
import { InputField, SelectField } from '@/components/common/Form';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import useImageUpload from '@/hooks/useImageUpload';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';

interface Facility {
    id?: string;
    name: string;
    image?: string;
    category: string;
    description?: string;
    isBookable: boolean;
    status: 'active' | 'suspended';
    fee?: number;
}

interface FacilityFormProps {
    facility?: Facility;
    mode: 'add' | 'edit';
    onSubmit: (facilityData: Omit<Facility, 'id'>) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

const categoryOptions = [
    { value: 'fitness', label: 'Fitness' },
    { value: 'recreation', label: 'Recreation' },
    { value: 'wellness', label: 'Wellness' },
    { value: 'sports', label: 'Sports' },
    { value: 'dining', label: 'Dining' },
    { value: 'business', label: 'Business' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'other', label: 'Other' },
];

export default function FacilityForm({
    facility,
    mode,
    onSubmit,
    onCancel,
    isLoading = false,
}: FacilityFormProps) {
    const [formData, setFormData] = useState<Omit<Facility, 'id'>>({
        name: facility?.name || '',
        image: facility?.image || '',
        category: facility?.category || '',
        description: facility?.description || '',
        isBookable: facility?.isBookable || false,
        status: facility?.status || 'active',
        fee: facility?.fee || 0,
    });

    const [imagePreview, setImagePreview] = useState<string | null>(
        facility?.image || null,
    );
    const [, setImageFile] = useState<File | null>(null);
    const { uploadImage, isLoading: isUploading } = useImageUpload();

    const handleInputChange = (
        field: keyof Omit<Facility, 'id'>,
        value: any,
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleImageUpload = async (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 1024 * 1024) {
                alert('File size must be less than 1MB');
                return;
            }

            setImageFile(file);

            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                setImagePreview(result);
            };
            reader.readAsDataURL(file);

            const uploadedUrl = await uploadImage(file);
            if (uploadedUrl) {
                handleInputChange('image', uploadedUrl);
            }
        }
    };

    const removeImage = () => {
        setImagePreview(null);
        setImageFile(null);
        handleInputChange('image', '');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    const isFormLoading = isLoading || isUploading;

    return (
        <form onSubmit={handleSubmit} className="flex flex-col">
            <Separator />
            <div className="flex items-center w-full">
                <div
                    className="flex flex-col
                 gap-4 items-center justify-center h-full w-full max-w-[300px]"
                >
                    <div className="flex flex-col items-center">
                        <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center mb-4 overflow-hidden relative">
                            {imagePreview ? (
                                <div className="relative w-full h-full">
                                    <Image
                                        src={imagePreview}
                                        alt="Facility preview"
                                        fill
                                        className="object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        disabled={isUploading}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 disabled:opacity-50"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ) : (
                                <Upload className="w-8 h-8 text-gray-400" />
                            )}
                            {isUploading && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                </div>
                            )}
                        </div>
                        <div className="text-center">
                            <p className="font-medium text-gray-900 mb-1">
                                Upload Image
                            </p>
                            <p className="text-sm text-gray-500 mb-3">
                                Max File size: 1MB
                            </p>
                            <label className="cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={isUploading}
                                    className="hidden"
                                />
                                <span className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
                                    {isUploading ? 'Uploading...' : 'Add Image'}
                                </span>
                            </label>
                        </div>
                    </div>
                </div>
                <Separator orientation="vertical" className="mx-4" />
                <div className="space-y-4 flex-1 p-4">
                    <InputField
                        id="serviceName"
                        name="serviceName"
                        label="Service Name"
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                            handleInputChange('name', e.target.value)
                        }
                        placeholder="Gym Facility"
                        required
                        readOnly={isFormLoading}
                    />

                    <SelectField
                        id="serviceCategory"
                        name="serviceCategory"
                        label="Service Category"
                        value={formData.category}
                        onValueChange={(value) =>
                            handleInputChange('category', value)
                        }
                        options={categoryOptions}
                        placeholder="Select category"
                        required
                        disabled={isFormLoading}
                    />

                    <div className="space-y-2">
                        <Label
                            htmlFor="description"
                            className="text-sm font-medium text-gray-700"
                        >
                            Description
                        </Label>
                        <Textarea
                            id="description"
                            placeholder="Enter service details"
                            value={formData.description}
                            onChange={(e) =>
                                handleInputChange('description', e.target.value)
                            }
                            disabled={isFormLoading}
                            className="min-h-[80px] bg-gray-100 border-gray-100 focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    <InputField
                        id="serviceFee"
                        name="serviceFee"
                        label="Extra Fee (₦)"
                        type="number"
                        value={formData.fee?.toString() || ''}
                        onChange={(e) =>
                            handleInputChange(
                                'fee',
                                parseFloat(e.target.value) || 0,
                            )
                        }
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        readOnly={isFormLoading}
                    />

                    <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-700">
                            Service Status
                        </label>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    value="active"
                                    id="active"
                                    name="status"
                                    checked={formData.status === 'active'}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'status',
                                            e.target.value,
                                        )
                                    }
                                    disabled={isFormLoading}
                                    className="w-4 h-4 text-hexbrand focus:ring-hexbrand"
                                />
                                <label
                                    htmlFor="active"
                                    className="text-sm my-0 text-gray-700 cursor-pointer"
                                >
                                    Active
                                </label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    value="suspended"
                                    id="suspended"
                                    name="status"
                                    checked={formData.status === 'suspended'}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'status',
                                            e.target.value,
                                        )
                                    }
                                    disabled={isFormLoading}
                                    className="w-4 h-4 text-hexbrand focus:ring-hexbrand focus:bg-hexbrand"
                                />
                                <label
                                    htmlFor="suspended"
                                    className="text-sm my-0 text-gray-700 cursor-pointer"
                                >
                                    Suspend
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center mt-3 justify-start gap-2">
                        <Label
                            htmlFor="bookable"
                            className="text-sm font-medium my-0 text-gray-700"
                        >
                            Bookable
                        </Label>
                        <Switch
                            id="bookable"
                            checked={formData.isBookable}
                            onCheckedChange={(checked) =>
                                handleInputChange('isBookable', checked)
                            }
                            className="shadow-none data-[state=unchecked]:bg-[#F4F4F4] data-[state=unchecked]:border-[#D9D9D9] data-[state=checked]:bg-hexbrand data-[state=checked]:border-hexbrand"
                            disabled={isFormLoading}
                        />
                    </div>
                </div>
            </div>
            <div className="flex space-x-4 border-t pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isFormLoading}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                    Cancel Service
                </button>
                <BrandButton
                    type="submit"
                    disabled={
                        isFormLoading || !formData.name || !formData.category
                    }
                    className="flex-1"
                >
                    {isFormLoading
                        ? isUploading
                            ? 'Uploading Image...'
                            : 'Saving...'
                        : mode === 'add'
                          ? 'Save Service'
                          : 'Update Service'}
                </BrandButton>
            </div>
        </form>
    );
}
