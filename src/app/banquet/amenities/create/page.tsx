'use client';

import {
    BanquetInventoryItem,
    createBanquetInventoryItem,
    getBanquetInventoryItem,
    updateBanquetInventoryItem,
} from '@/app/actions/banquet-inventory';
import CreateAmenityForm, {
    CreateAmenityFormValues,
    defaultCreateAmenityFormValues,
} from '@/components/banquest/amenities/CreateAmenityForm';
import { formValuesToInventoryPayload } from '@/components/banquest/amenities/utils/form-to-inventory-payload';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';

function inventoryToFormValues(
    item: BanquetInventoryItem | undefined,
): CreateAmenityFormValues | undefined {
    if (!item) return undefined;

    const name = item.type.includes(' — ')
        ? item.type.split(' — ').slice(1).join(' — ')
        : item.type;

    const specRows =
        item.specifications && item.specifications.length > 0
            ? item.specifications.map((s, i) => ({
                  id: String(i + 1),
                  label: s.label,
                  value: s.value,
              }))
            : defaultCreateAmenityFormValues().specRows;

    return {
        name,
        totalQuantity: String(item.quantity),
        dailyRate: String(item.unitCost),
        category: item.category || '',
        condition: item.condition || '',
        description: item.description ?? '',
        subtitle: item.subtitle ?? '',
        environment: item.environment ?? '',
        specRows,
        images: item.images?.length ? item.images : [],
    };
}

export default function CreateAmenityPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = Number(searchParams.get('edit'));
    const isEdit = Number.isFinite(editId);

    const { data: editResponse, isLoading: loadingEdit } = useSWR(
        isEdit ? `/banquet/inventory/${editId}/edit` : null,
        () => getBanquetInventoryItem(editId),
    );

    const initialValues = useMemo(() => {
        if (!editResponse?.data || 'error' in editResponse) return undefined;
        return inventoryToFormValues(editResponse.data);
    }, [editResponse]);

    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (values: CreateAmenityFormValues) => {
        if (!values.name.trim()) {
            toast.custom(() => (
                <Toast
                    title="Missing name"
                    description="Enter an amenity name before saving."
                    type="error"
                />
            ));
            return;
        }

        setSubmitting(true);
        const payload = formValuesToInventoryPayload(values);

        const result = isEdit
            ? await updateBanquetInventoryItem(editId, payload)
            : await createBanquetInventoryItem(payload);

        setSubmitting(false);

        if (result.error) {
            toast.custom(() => (
                <Toast title="Error" description={result.error} type="error" />
            ));
            return;
        }

        toast.custom(() => (
            <Toast
                title="Success"
                description={
                    isEdit
                        ? 'Amenity updated successfully'
                        : 'Amenity created successfully'
                }
                type="success"
            />
        ));
        router.push(
            isEdit
                ? `/banquet/amenities/${editId}`
                : '/banquet/amenities',
        );
    };

    const stillLoading = isEdit && loadingEdit && !initialValues;

    return (
        <PageWrapper className="lg:px-0 gap-0 bg-gray-50/50">
            <PageHeader>
                <div className="flex w-full flex-col gap-3 px-4 lg:px-8">
                    <Button
                        variant="ghost"
                        className="w-fit text-orion-blue hover:text-orion-blue"
                        asChild
                    >
                        <Link
                            href={
                                isEdit
                                    ? `/banquet/amenities/${editId}`
                                    : '/banquet/amenities'
                            }
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Link>
                    </Button>
                    <PageHeadertitle
                        title={
                            isEdit ? 'Edit Amenities' : 'Create New Amenities'
                        }
                        subtitle="Follow the steps below to add or update an amenity."
                    />
                </div>
            </PageHeader>

            <div className="px-4 pb-12 lg:px-8 mt-8">
                {stillLoading ? (
                    <div className="flex justify-center py-16">
                        <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <CreateAmenityForm
                        key={isEdit ? `edit-${editId}` : 'create'}
                        mode={isEdit ? 'edit' : 'create'}
                        initialValues={initialValues}
                        onSubmit={handleSubmit}
                        submitting={submitting}
                    />
                )}
            </div>
        </PageWrapper>
    );
}
