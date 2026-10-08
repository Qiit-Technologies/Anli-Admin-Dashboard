export interface ProductionBatchIngredient {
    itemId: number;
    itemName?: string;
    quantity: number;
    unit?: string;
    unitCost?: number;
    lineCost?: number;
}

export interface ProductionBatch {
    id: number;
    batchNumber?: string;
    productionDate?: string;
    recipeId: number;
    recipeName?: string;
    outputItemId?: number;
    outputItemName?: string;
    outputQuantity: number;
    outputUnit?: string;
    totalCost?: number;
    costPerUnit?: number;
    producedBy?: string;
    notes?: string;
    ingredients?: ProductionBatchIngredient[];
    createdAt?: string;
}

export function batchTotalCost(batch: ProductionBatch): number {
    if (typeof batch.totalCost === 'number') return batch.totalCost;
    return (batch.ingredients ?? []).reduce(
        (sum, ing) =>
            sum + (ing.lineCost ?? (ing.quantity || 0) * (ing.unitCost || 0)),
        0,
    );
}

export function batchCostPerUnit(batch: ProductionBatch): number {
    if (typeof batch.costPerUnit === 'number') return batch.costPerUnit;
    const qty = batch.outputQuantity || 1;
    return batchTotalCost(batch) / qty;
}
