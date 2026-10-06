import {
    getMenuCategories,
    getOneMenuCategories,
} from '@/app/actions/menu-category';
import { InputField, SelectField } from '@/components/common/Form';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';

interface ItemFormData {
    id: number;
    category: string;
    subCategory: string;
    name: string;
    description: string;
    price: string;
    categoryId: number;
    subCategoryId: number;
    imageUrl?: string;
}

interface MutateItemFormProps {
    initialData?: ItemFormData;
    onSubmit: (data: ItemFormData) => void;
    mode?: 'add' | 'edit';
    categoryId?: number;
    subCategoryId?: number;
    isloading?: boolean;
}

const MutateItemForm: React.FC<MutateItemFormProps> = ({
    initialData = {
        id: 1,
        category: '',
        subCategory: '',
        name: '',
        description: '',
        price: '',
        categoryId: 0,
        subCategoryId: 0,
        imageUrl: '',
    },
    isloading,
    onSubmit,
    mode = 'add',
    subCategoryId,
    categoryId,
}) => {
    const initialCatId = categoryId ?? initialData?.categoryId;
    const [subCategories, setSubCategories] = React.useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = React.useState(
        initialCatId ? String(initialCatId) : '',
    );
    const { data: menuCategories } = useSWR(
        '/menu/category',
        getMenuCategories,
    );

    const [formData, setFormData] = React.useState<ItemFormData>({
        ...initialData,
        categoryId:
            mode === 'edit'
                ? categoryId || initialData.categoryId
                : initialData.categoryId,
        subCategoryId:
            mode === 'edit'
                ? subCategoryId || initialData.subCategoryId
                : initialData.subCategoryId,
    });
    const [isUploadingImage, setIsUploadingImage] = React.useState(false);
    const [imageFile, setImageFile] = React.useState<File | null>(null);

    const handleImagePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
        const items = e.clipboardData?.items;
        if (!items?.length) return;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.kind !== 'file' || !item.type.startsWith('image/')) {
                continue;
            }
            const file = item.getAsFile();
            if (file) {
                e.preventDefault();
                e.stopPropagation();
                setImageFile(file);
                return;
            }
        }
    };

    useEffect(() => {
        if (mode !== 'edit' || !initialData) {
            return;
        }

        const resolvedCategoryId = categoryId ?? initialData.categoryId ?? 0;
        const resolvedSubCategoryId =
            subCategoryId ?? initialData.subCategoryId ?? 0;

        setFormData({
            ...initialData,
            imageUrl: initialData.imageUrl,
            categoryId: resolvedCategoryId,
            subCategoryId: resolvedSubCategoryId,
        });
        setSelectedCategory(
            resolvedCategoryId ? String(resolvedCategoryId) : '',
        );
    }, [mode, initialData?.id, categoryId, subCategoryId]);

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const response = await getOneMenuCategories(selectedCategory);
                setSubCategories(response?.data?.subCategories);
            } catch (error: any) {
                console.error('Failed to fetch menu category:', error);
            }
        };

        if (selectedCategory) {
            fetchCategory();
        }
    }, [selectedCategory]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let imageUrl = initialData?.imageUrl || '';

        if (imageFile) {
            setIsUploadingImage(true);
            const imageFormData = new FormData();
            imageFormData.append('file', imageFile);
            imageFormData.append('upload_preset', 'anli_default');

            try {
                const uploadResponse = await fetch(
                    'https://api.cloudinary.com/v1_1/dhkwjizxu/image/upload',
                    {
                        method: 'POST',
                        body: imageFormData,
                    },
                );
                if (!uploadResponse.ok) throw new Error('Upload failed');

                const imageData = await uploadResponse.json();
                imageUrl = imageData.secure_url;

                if (!imageUrl) throw new Error('No image URL returned');

                setIsUploadingImage(false);
            } catch (error: any) {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description="Image upload failed"
                        type="error"
                    />
                ));
                setIsUploadingImage(false);
                return;
            }
        }

        onSubmit({
            name: formData.name,
            description: formData.description,
            categoryId: formData.categoryId,
            subCategoryId: formData.subCategoryId,
            imageUrl: imageUrl,
            price: formData.price,
            id: formData.id,
            category: formData.category,
            subCategory: formData.subCategory,
        });
    };

    return (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
                <SelectField
                    id="category"
                    name="category"
                    label="Category"
                    placeholder="Select Item Category"
                    options={
                        menuCategories?.data?.map((item: any) => {
                            return {
                                value: String(item.id),
                                label: item.name,
                            };
                        }) ?? []
                    }
                    onValueChange={(value) => {
                        const selectedOption = menuCategories?.data?.find(
                            (item: any) => String(item.id) === String(value),
                        );

                        setFormData((prev) => ({
                            ...prev,
                            categoryId: Number(value),
                            category: selectedOption?.name ?? '',
                            subCategoryId: 0,
                            subCategory: '',
                        }));
                        setSelectedCategory(value);
                    }}
                    value={String(formData.categoryId || '')}
                    // disabled={mode === 'edit'}
                />
                <SelectField
                    id="subCategory"
                    name="subCategory"
                    label="Sub Category"
                    placeholder="Select Mini Category"
                    options={[
                        ...(subCategories?.map((item: any) => ({
                            value: String(item.id),
                            label: item.name,
                        })) ?? []),
                        ...(mode === 'edit' &&
                        (subCategoryId === null || subCategoryId === undefined)
                            ? [
                                  {
                                      value: '0',
                                      label: 'No sub category',
                                  },
                              ]
                            : []),
                    ]}
                    onValueChange={(value) => {
                        const selectedOption =
                            value === '0'
                                ? null
                                : subCategories?.find(
                                      (item: any) =>
                                          String(item.id) === String(value),
                                  );

                        setFormData((prev) => ({
                            ...prev,
                            subCategoryId: value === '0' ? 0 : Number(value),
                            subCategory: selectedOption?.name ?? '',
                        }));
                    }}
                    value={String(
                        formData.subCategoryId === null ||
                            formData.subCategoryId === undefined
                            ? '0'
                            : formData.subCategoryId,
                    )}
                    // disabled={mode === 'edit'}
                />
            </div>
            <div>
                <InputField
                    id="item"
                    name="item"
                    label="Item Name"
                    type="text"
                    placeholder="Enter Item Name"
                    value={formData.name}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            name: e.target.value,
                        })
                    }
                />
            </div>
            <div>
                <InputField
                    id="description"
                    name="description"
                    label="Description"
                    type="text"
                    placeholder="Enter Description"
                    value={formData.description}
                    onChange={(e) =>
                        setFormData({
                            ...formData,
                            description: e.target.value,
                        })
                    }
                />
            </div>
            <div>
                <InputField
                    id="price"
                    name="price"
                    label="Price"
                    type="text"
                    placeholder="Enter Price"
                    value={
                        formData.price
                            ? `₦${Number(formData.price).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`
                            : ''
                    }
                    onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setFormData({
                            ...formData,
                            price: value,
                        });
                    }}
                />
            </div>
            <div>
                <label className="block mb-2 font-medium sr-only">
                    Upload Image
                </label>
                <div
                    className="border-2 border-dashed border-orion-blue rounded-lg p-4 text-center hover:bg-blue-50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-orion-blue/30"
                    onPaste={handleImagePaste}
                    tabIndex={0}
                >
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="image-upload"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                setImageFile(file);
                            }
                        }}
                    />
                    <label
                        htmlFor="image-upload"
                        className="cursor-pointer flex flex-col items-center justify-center"
                    >
                        {!imageFile ? (
                            <>
                                {mode === 'edit' && formData.imageUrl ? (
                                    <div className="relative w-full">
                                        <img
                                            src={formData.imageUrl}
                                            alt="Current image"
                                            className="mt-2 max-h-32 object-contain mx-auto"
                                        />
                                        <div className="mt-2 text-sm text-gray-600">
                                            Click to change image
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-10 w-10 text-orion-blue mb-2"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                            />
                                        </svg>
                                        <span className="text-sm text-gray-600">
                                            Click to upload an image
                                        </span>
                                        <span className="text-xs text-gray-500 mt-1">
                                            PNG, JPG, GIF up to 10MB. You can
                                            also paste copied image (Ctrl+V).
                                        </span>
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="relative w-full">
                                <img
                                    src={URL.createObjectURL(imageFile)}
                                    alt="Preview"
                                    className="mt-2 max-h-32 object-contain mx-auto"
                                />
                                <button
                                    type="button"
                                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 transform translate-x-1/2 -translate-y-1/2"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setImageFile(null);
                                    }}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </label>
                </div>
            </div>
            <Button
                disabled={
                    isloading ||
                    isUploadingImage ||
                    !formData.name ||
                    // !formData.description ||
                    !formData.price ||
                    !formData.categoryId
                }
                className="h-12 bg-orion-blue disabled:opacity-15 text-white w-full"
                type="submit"
            >
                {isUploadingImage || isloading ? (
                    <Loader2 className="animate-spin mr-2" />
                ) : (
                    <>{mode === 'add' ? 'Add Item' : 'Update Item'}</>
                )}
            </Button>
        </form>
    );
};

export default MutateItemForm;
