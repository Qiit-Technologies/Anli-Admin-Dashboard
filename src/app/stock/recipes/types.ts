export interface RecipeIngredient {
    id?: number;
    itemId: number;
    itemName?: string;
    quantity: number;
    unit?: string;
    unitCost?: number;
    lineCost?: number;
}

export interface Recipe {
    id: number;
    name: string;
    description?: string;
    outputItemId: number;
    outputItemName?: string;
    outputQuantity: number;
    outputUnit?: string;
    instructions?: string;
    isActive: boolean;
    totalCost?: number;
    costPerUnit?: number;
    ingredientCount?: number;
    ingredients?: RecipeIngredient[];
    createdAt?: string;
    updatedAt?: string;
}

export function recipeTotalCost(recipe: Recipe): number {
    if (typeof recipe.totalCost === 'number') return recipe.totalCost;
    return (recipe.ingredients ?? []).reduce(
        (sum, ing) => sum + (ing.lineCost ?? (ing.quantity || 0) * (ing.unitCost || 0)),
        0,
    );
}

export function recipeCostPerUnit(recipe: Recipe): number {
    if (typeof recipe.costPerUnit === 'number') return recipe.costPerUnit;
    const qty = recipe.outputQuantity || 1;
    return recipeTotalCost(recipe) / qty;
}
