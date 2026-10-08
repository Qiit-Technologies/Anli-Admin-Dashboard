'use client';

import {
    PageHeader,
    PageHeadertitle,
    HeaderActions,
} from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, CircleCheck, CircleAlert } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createProductionBatch, getRecipe, getRecipes } from '@/app/actions/stock';
import { useItemsContext } from '@/context/ItemsContext';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import Toast from '@/components/toast';
import useSWR from 'swr';
import { Suspense } from 'react';

function CreateProductionForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preselectedRecipe = searchParams.get('recipe') || '';

    const { itemsList } = useItemsContext();
    const [recipeId, setRecipeId] = useState(preselectedRecipe);
    const [outputQuantity, setOutputQuantity] = useState('');
    const [notes, setNotes] = useState('');
    const [confirming, setConfirming] = useState(false);

    const { data: recipesResponse } = useSWR('/items/recipes', getRecipes);
    const recipes: any[] = useMemo(() => {
        const raw = recipesResponse?.data;
        if (Array.isArray(raw)) return raw;
        if (raw && Array.isArray(raw.items)) return raw.items;
        return [];
    }, [recipesResponse]);

    // Load the selected recipe in full (with ingredient lines)
    const { data: recipeResponse } = useSWR(
        recipeId ? `/items/recipes/${recipeId}` : null,
        () => getRecipe(recipeId),
    );
    const recipe = recipeResponse?.data ?? null;

    const stockByItemId = useMemo(() => {
        const map = new Map<string, number>();
        for (const it of itemsList ?? []) {
            map.set(String(it.value ?? it.id), Number(it.quantity) || 0);
        }
        return map;
    }, [itemsList]);

    const scale = useMemo(() => {
        const outQty = Number(outputQuantity) || 0;
        const recipeOut = Number(recipe?.outputQuantity) || 0;
        if (!recipe || outQty <= 0 || recipeOut <= 0) return 0;
        return outQty / recipeOut;
    }, [outputQuantity, recipe]);

    const requirementLines = useMemo(() => {
        if (!recipe || scale <= 0) return [];
        return (recipe.ingredients ?? []).map((ing: any, i: number) => {
            const required = (Number(ing.quantity) || 0) * scale;
            const onHand = stockByItemId.get(String(ing.itemId)) ?? 0;
            const unitCost = Number(ing.unitCost) || 0;
            return {
                key: ing.id ?? i,
                itemId: ing.itemId,
                itemName: ing.itemName || `#${ing.itemId}`,
                required,
                unit: ing.unit || '',
                onHand,
                sufficient: onHand >= required,
                lineCost: required * unitCost,
            };
        });
    }, [recipe, scale, stockByItemId]);

    const totalCost = requirementLines.reduce(
        (s: number, l: { lineCost: number }) => s + l.lineCost,
        0,
    );
    const outQty = Number(outputQuantity) || 0;
    const costPerUnit = outQty > 0 ? totalCost / outQty : 0;
    const allSufficient =
        requirementLines.length > 0 &&
        requirementLines.every((l: { sufficient: boolean }) => l.sufficient);

    const valid = recipeId && outQty > 0 && recipe && !recipeResponse?.error;

    const handleConfirm = async () => {
        if (!valid || confirming) return;
        if (!allSufficient) {
            toast.custom(() => (
                <Toast
                    title="Insufficient stock"
                    description="Some ingredients are short on stock. Adjust the output quantity or restock first."
                    type="error"
                />
            ));
            return;
        }
        setConfirming(true);
        try {
            const result = await createProductionBatch({
                recipeId: Number(recipeId),
                outputQuantity: outQty,
                productionDate: format(new Date(), 'yyyy-MM-dd'),
                notes: notes.trim() || undefined,
            });
            if (result.error) {
                toast.custom(() => (
                    <Toast title="Error" description={result.error} type="error" />
                ));
            } else {
                toast.custom(() => (
                    <Toast
                        title="Success"
                        description="Production batch posted successfully."
                        type="success"
                    />
                ));
                router.push('/stock/production');
            }
        } catch (e: any) {
            toast.custom(() => (
                <Toast
                    title="Error"
                    description={e?.message || 'Failed to post production.'}
                    type="error"
                />
            ));
        } finally {
            setConfirming(false);
        }
    };

    return (
        <PageWrapper>
            <PageHeader>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/stock/production">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <PageHeadertitle
                        title="New Production Batch"
                        subtitle="Consume ingredients, create prepared items"
                    />
                </div>
                <HeaderActions>
                    <Button
                        onClick={handleConfirm}
                        disabled={!valid || confirming || !allSufficient}
                    >
                        {confirming ? 'Posting…' : 'Confirm Production'}
                    </Button>
                </HeaderActions>
            </PageHeader>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="p-6 lg:col-span-2">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <Label>Recipe *</Label>
                            <Select value={recipeId} onValueChange={setRecipeId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a recipe" />
                                </SelectTrigger>
                                <SelectContent>
                                    {recipes.map((r: any) => (
                                        <SelectItem key={r.id} value={String(r.id)}>
                                            {r.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {recipesResponse?.error && (
                                <p className="mt-1 text-xs text-amber-700">
                                    Recipes could not be loaded ({recipesResponse.error}).
                                </p>
                            )}
                        </div>
                        <div>
                            <Label>Output quantity *</Label>
                            <Input
                                type="number"
                                min="0"
                                step="any"
                                value={outputQuantity}
                                onChange={(e) => setOutputQuantity(e.target.value)}
                                placeholder={
                                    recipe?.outputUnit
                                        ? `e.g. 20 (${recipe.outputUnit})`
                                        : 'e.g. 20'
                                }
                            />
                        </div>
                        <div>
                            <Label>Recipe batch size</Label>
                            <div className="flex h-10 items-center text-sm text-muted-foreground">
                                {recipe
                                    ? `${recipe.outputQuantity}${
                                          recipe.outputUnit ? ` ${recipe.outputUnit}` : ''
                                      } per batch`
                                    : '—'}
                            </div>
                        </div>
                        <div className="sm:col-span-2">
                            <Label>Notes</Label>
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Batch notes…"
                                rows={3}
                            />
                        </div>
                    </div>

                    {recipe && scale > 0 && (
                        <div className="mt-6">
                            <h3 className="mb-3 font-semibold">
                                Required ingredients{' '}
                                <span className="text-sm font-normal text-muted-foreground">
                                    (×{scale.toFixed(2)} batch{scale === 1 ? '' : 'es'})
                                </span>
                            </h3>
                            <div className="space-y-2">
                                {requirementLines.map(
                                    (line: {
                                        key: string | number;
                                        itemName: string;
                                        required: number;
                                        unit: string;
                                        onHand: number;
                                        sufficient: boolean;
                                        lineCost: number;
                                    }) => (
                                    <div
                                        key={line.key}
                                        className="flex items-center justify-between gap-3 rounded-md border p-3"
                                    >
                                        <div className="flex items-center gap-2">
                                            {line.sufficient ? (
                                                <CircleCheck className="h-5 w-5 shrink-0 text-emerald-600" />
                                            ) : (
                                                <CircleAlert className="h-5 w-5 shrink-0 text-rose-600" />
                                            )}
                                            <div>
                                                <div className="font-medium">{line.itemName}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    Need {line.required.toFixed(2)}
                                                    {line.unit ? ` ${line.unit}` : ''} · on hand{' '}
                                                    {line.onHand.toFixed(2)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right text-sm">
                                            <div className="font-medium">
                                                {formatCurrency(line.lineCost)}
                                            </div>
                                            {!line.sufficient && (
                                                <div className="text-xs text-rose-600">
                                                    Short by{' '}
                                                    {(line.required - line.onHand).toFixed(2)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>

                <Card className="h-fit p-6">
                    <h3 className="mb-3 font-semibold">Batch summary</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Output</span>
                            <span className="font-medium">
                                {outQty || '—'}
                                {recipe?.outputUnit ? ` ${recipe.outputUnit}` : ''}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Ingredient cost</span>
                            <span className="font-semibold">{formatCurrency(totalCost)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                            <span className="text-muted-foreground">Cost per unit</span>
                            <span className="font-semibold">{formatCurrency(costPerUnit)}</span>
                        </div>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                        Confirming consumes the ingredients from stock and adds the prepared
                        output at total ingredient cost ÷ output quantity.
                    </p>
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
                    Loading production form…
                </div>
            }
        >
            <CreateProductionForm />
        </Suspense>
    );
}
