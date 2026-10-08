'use client';

import BrandButton from '@/components/common/Button';
import { AmountInput, InputField, SelectField } from '@/components/common/Form';
import ImageUploadField from '@/components/common/ImageUploadField';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

const CATEGORY_OPTIONS = [
    { value: 'audio', label: 'Audio' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'visuals', label: 'Visuals' },
    { value: 'light', label: 'Light' },
    { value: 'other', label: 'Other' },
];

const CONDITION_OPTIONS = [
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'poor', label: 'Poor' },
    { value: 'bad', label: 'Bad' },
];

export interface AmenitySpecRow {
    id: string;
    label: string;
    value: string;
}

export interface CreateAmenityFormValues {
    name: string;
    totalQuantity: string;
    dailyRate: string;
    category: string;
    condition: string;
    description: string;
    subtitle: string;
    environment: string;
    specRows: AmenitySpecRow[];
    images: string[];
}

export const defaultCreateAmenityFormValues = (): CreateAmenityFormValues => ({
    name: '',
    totalQuantity: '1',
    dailyRate: '',
    category: '',
    condition: '',
    description: '',
    subtitle: '',
    environment: '',
    specRows: [
        { id: '1', label: 'Power Output', value: '' },
        { id: '2', label: 'Speaker Type', value: '' },
        { id: '3', label: 'Subwoofer', value: '' },
        { id: '4', label: 'Microphone', value: '' },
    ],
    images: [],
});

interface CreateAmenityFormProps {
    initialValues?: Partial<CreateAmenityFormValues>;
    mode?: 'create' | 'edit';
    onSubmit?: (values: CreateAmenityFormValues) => void;
    submitting?: boolean;
}

export default function CreateAmenityForm({
    initialValues,
    mode = 'create',
    onSubmit,
    submitting,
}: CreateAmenityFormProps) {
    const [values, setValues] = useState<CreateAmenityFormValues>(() => ({
        ...defaultCreateAmenityFormValues(),
        ...initialValues,
    }));

    useEffect(() => {
        if (initialValues) {
            setValues((prev) => ({ ...prev, ...initialValues }));
        }
    }, [initialValues]);

    const setField = <K extends keyof CreateAmenityFormValues>(
        field: K,
        value: CreateAmenityFormValues[K],
    ) => {
        setValues((prev) => ({ ...prev, [field]: value }));
    };

    const addSpecRow = () => {
        setValues((prev) => ({
            ...prev,
            specRows: [
                ...prev.specRows,
                { id: String(Date.now()), label: 'Other', value: '' },
            ],
        }));
    };

    const updateSpecRow = (id: string, value: string) => {
        setValues((prev) => ({
            ...prev,
            specRows: prev.specRows.map((r) =>
                r.id === id ? { ...r, value } : r,
            ),
        }));
    };

    return (
        <form
            className="space-y-8"
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit?.(values);
            }}
        >
            <div className="rounded-xl border border-gray-200 bg-white p-6 lg:p-8">
                <h2 className="text-lg font-semibold text-gray-900">
                    Basic Information
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Provide basic information about this amenity
                </p>

                <div className="mt-6">
                    <p className="text-sm font-medium text-gray-900">
                        Upload image{' '}
                        <span className="font-normal text-muted-foreground">
                            (Add up to 6 images)
                        </span>
                    </p>
                    <ImageUploadField
                        className="mt-3"
                        images={values.images}
                        onChange={(images) => setField('images', images)}
                        maxImages={6}
                        disabled={submitting}
                    />
                </div>

                <div className="mt-8 border-t border-gray-100 pt-8">
                    <h3 className="text-sm font-semibold text-gray-900">
                        Amenity Information
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Please provide the basic information for this amenity
                    </p>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        <InputField
                            id="amenityName"
                            name="amenityName"
                            label="Amenity Name"
                            placeholder="Enter Amenity name"
                            value={values.name}
                            onChange={(e) => setField('name', e.target.value)}
                            required
                        />
                        <InputField
                            id="totalQuantity"
                            name="totalQuantity"
                            label="Total quantity"
                            placeholder="Enter total quantity"
                            type="number"
                            value={values.totalQuantity}
                            onChange={(e) =>
                                setField('totalQuantity', e.target.value)
                            }
                            required
                        />
                        <AmountInput
                            id="dailyRate"
                            name="dailyRate"
                            label="Daily rate"
                            placeholder="0.00"
                            value={values.dailyRate}
                            onChange={(v) => setField('dailyRate', v)}
                            inputClassName="bg-gray-100 border-gray-100"
                            required
                        />
                        <SelectField
                            id="category"
                            name="category"
                            label="Category"
                            placeholder="Select category"
                            value={values.category}
                            onValueChange={(v) => setField('category', v)}
                            options={CATEGORY_OPTIONS}
                        />
                        <SelectField
                            id="condition"
                            name="condition"
                            label="Amenity Condition"
                            placeholder="Select Condition"
                            value={values.condition}
                            onValueChange={(v) => setField('condition', v)}
                            options={CONDITION_OPTIONS}
                        />
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 lg:p-8">
                <h2 className="text-lg font-semibold text-gray-900">
                    Specification Information
                </h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    {values.specRows.map((row) => (
                        <InputField
                            key={row.id}
                            id={`spec-${row.id}`}
                            name={`spec-${row.id}`}
                            label={row.label}
                            placeholder={`Enter ${row.label}`}
                            value={row.value}
                            onChange={(e) =>
                                updateSpecRow(row.id, e.target.value)
                            }
                        />
                    ))}
                </div>
                <button
                    type="button"
                    onClick={addSpecRow}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-orion-blue hover:underline"
                >
                    <Plus className="h-4 w-4" />
                    Add more
                </button>
            </div>

            <div>
                <h2 className="text-lg font-semibold text-gray-900">
                    Amenity Description{' '}
                    <span className="font-normal text-muted-foreground">
                        (optional)
                    </span>
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Add a short description or note about the amenity
                </p>
                <Textarea
                    className="mt-4 min-h-[120px] resize-none border-gray-200"
                    placeholder="eg Premium professional sound system for large events"
                    value={values.description}
                    onChange={(e) => setField('description', e.target.value)}
                />
            </div>

            <BrandButton type="submit" disabled={submitting}>
                {submitting
                    ? mode === 'edit'
                        ? 'Saving…'
                        : 'Creating…'
                    : mode === 'edit'
                      ? 'Save Changes'
                      : 'Create Amenity'}
            </BrandButton>
        </form>
    );
}
