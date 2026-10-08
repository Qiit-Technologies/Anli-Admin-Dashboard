'use client';

import {
    PageHeader,
    PageHeadertitle,
    HeaderActions,
} from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { getRecipe } from '@/app/actions/stock';
import { formatCurrency } from '@/lib/utils';
import { Recipe, recipeTotalCost, recipeCostPerUnit } from '../types';
import { Suspense } from 'react';

function RecipeDetail() {
    const params = useParams();
    const id = params?.id as string;
    const { data: recipeResponse, isLoading } = useSWR(
        id ? `/items/recipes/${id}` : null,
        () => getRecipe(id),
    );

    const recipe: Recipe | null = recipeResponse?.data ?? null;

    if (isLoading) {
        return (
            <PageWrapper>
                <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                    Loading recipe…
                </div>
            </PageWrapper>
        );
    }

    if (recipeResponse?.error || !recipe) {
        return (
            <PageWrapper>
                <PageHeader>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/stock/recipes">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <PageHeadertitle title="Recipe not found" />
                    </div>
                </PageHeader>
                <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    {recipeResponse?.error ||
                        'This recipe could not be loaded. It may not exist yet on the server.'}
                </div>
            </PageWrapper>
        );
    }

    const totalCost = recipeTotalCost(recipe);
    const costPerUnit = recipeCostPerUnit(recipe);

    return (
        <PageWrapper>
            <PageHeader>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/stock/recipes">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <PageHeadertitle
                        title={recipe.name}
                        subtitle={recipe.description || 'Recipe detail'}
                    />
                </div>
                <HeaderActions>
                    <Badge
                        variant="outline"
                        className={
                            recipe.isActive
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-muted text-muted-foreground'
                        }
                    >
                        {recipe.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button asChild>
                        <Link href={`/stock/production/create?recipe=${recipe.id}`}>
                            Produce batch
                        </Link>
                    </Button>
                </HeaderActions>
            </PageHeader>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="p-6 lg:col-span-2">
                    <h3 className="mb-4 font-semibold">Ingredients</h3>
                    {(recipe.ingredients ?? []).length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No ingredient lines on this recipe.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-muted-foreground">
                                        <th className="py-2 pr-4 font-medium">Item</th>
                                        <th className="py-2 pr-4 font-medium">Quantity</th>
                                        <th className="py-2 pr-4 font-medium">Unit cost</th>
                                        <th className="py-2 text-right font-medium">Line cost</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(recipe.ingredients ?? []).map((ing, i) => {
                                        const lineCost =
                                            ing.lineCost ??
                                            (ing.quantity || 0) * (ing.unitCost || 0);
                                        return (
                                            <tr key={ing.id ?? i} className="border-b last:border-0">
                                                <td className="py-2 pr-4 font-medium">
                                                    {ing.itemName || `#${ing.itemId}`}
                                                </td>
                                                <td className="py-2 pr-4">
                                                    {ing.quantity}
                                                    {ing.unit ? ` ${ing.unit}` : ''}
                                                </td>
                                                <td className="py-2 pr-4">
                                                    {formatCurrency(ing.unitCost || 0)}
                                                </td>
                                                <td className="py-2 text-right font-medium">
                                                    {formatCurrency(lineCost)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan={3} className="py-3 font-semibold">
                                            Total ingredient cost
                                        </td>
                                        <td className="py-3 text-right font-semibold">
                                            {formatCurrency(totalCost)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}

                    {recipe.instructions && (
                        <div className="mt-6">
                            <h3 className="mb-2 font-semibold">Instructions</h3>
                            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                                {recipe.instructions}
                            </p>
                        </div>
                    )}
                </Card>

                <Card className="h-fit p-6">
                    <h3 className="mb-3 font-semibold">Output</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Produces</span>
                            <span className="font-medium">
                                {recipe.outputItemName || `#${recipe.outputItemId}`}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Quantity</span>
                            <span>
                                {recipe.outputQuantity}
                                {recipe.outputUnit ? ` ${recipe.outputUnit}` : ''}
                            </span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                            <span className="text-muted-foreground">Total cost</span>
                            <span className="font-semibold">{formatCurrency(totalCost)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Cost per unit</span>
                            <span className="font-semibold">{formatCurrency(costPerUnit)}</span>
                        </div>
                    </div>
                </Card>
            </div>
        </PageWrapper>
    );
}

export default function Page() {
    return (
        <Suspense
            fallback={
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    Loading recipe…
                </div>
            }
        >
            <RecipeDetail />
        </Suspense>
    );
}
