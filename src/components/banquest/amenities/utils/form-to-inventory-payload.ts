import {
    CreateBanquetInventoryInput,
} from '@/app/actions/banquet-inventory';
import { CreateAmenityFormValues } from '../CreateAmenityForm';

function parseNum(value: string, fallback = 0): number {
    const n = Number(String(value).replace(/,/g, ''));
    return Number.isFinite(n) ? n : fallback;
}

export function formValuesToInventoryPayload(
    values: CreateAmenityFormValues,
): CreateBanquetInventoryInput {
    const specifications = values.specRows
        .filter((r) => r.value.trim())
        .map((r) => ({ label: r.label, value: r.value.trim() }));

    return {
        type: values.name.trim(),
        quantity: Math.max(1, parseNum(values.totalQuantity, 1)),
        unitCost: parseNum(values.dailyRate),
        description: values.description.trim() || undefined,
        subtitle: values.subtitle.trim() || values.name.trim().toLowerCase(),
        category: values.category || 'other',
        condition: values.condition || 'good',
        environment: values.environment.trim() || undefined,
        images: values.images.length ? values.images : undefined,
        specifications: specifications.length ? specifications : undefined,
    };
}
