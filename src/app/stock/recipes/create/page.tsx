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
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createRecipe } from '@/app/actions/stock';
import { useItemsContext } from '@/context/ItemsContext';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import Toast from '@/components/toast';
import { Suspense } from 'react';

interface IngredientRow {
    key: string;
    itemId: string;
    quantity: string;
    unit: string;
}

let rowCounter = 0;
const nextKey = () => `row-${Date.now()}-${rowCounter++}`;

function itemCostPerUnit(item: any): number {
    return (
        Number(item?.costPrice) ||
        Number(item?.costPriceOuter) ||
        Number(item?.price) ||
        0
    );
}

function CreateRecipeForm() {
    const router = useRouter();
    const { itemsList, isLoading: itemsLoading } = useItemsContext();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [outputItemId, setOutputItemId] = useState('');
    const [outputQuantity, setOutputQuantity] = useState('1');
    const [outputUnit, setOutputUnit] = useState('');
    const [instructions, setInstructions] = useState('');
    const [rows, setRows] = useState<IngredientRow[]>([
        { key: nextKey(), itemId: '', quantity: '', unit: '' },
    ]);
    const [saving, setSaving] = useState(false);

    const itemById = useMemo(() => {
        const map = new Map<string, any>();
        for (const it of itemsList ?? []) map.set(String(it.value ?? it.id), it);
        return map;
    }, [itemsList]);

    const rowsWithCost = useMemo(
        () =>
            rows.map((row) => {
                const item = itemById.get(row.itemId);
                const qty = Number(row.quantity) || 0;
                const unitCost = item ? itemCostPerUnit(item) : 0;
                return { ...row, item, qty, unitCost, lineCost: qty * unitCost };
            }),
        [rows, itemById],
    );

    const totalCost = rowsWithCost.reduce((s, r) => s + r.lineCost, 0);
    const outQty = Number(outputQuantity) || 0;
    const costPerUnit = outQty > 0 ? totalCost / outQty : 0;

    const updateRow = (key: string, field: keyof IngredientRow, value: string) => {
        setRows((prev) =>
            prev.map((r) => {
                if (r.key !== key) return r;
                const next = { ...r, [field]: value };
                if (field === 'itemId' && value) {
                    const item = itemById.get(value);
                    if (item && !next.unit) {
                        next.unit =
                            item.baseUnit || item.unitOfMeasurement || '';
                    }
                }
                return next;
            }),
        );
    };

    const addRow = () =>
        setRows((prev) => [
            ...prev,
            { key: nextKey(), itemId: '', quantity: '', unit: '' },
        ]);

    const removeRow = (key: string) =>
        setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.key !== key) : prev));

    const valid = useMemo(() => {
        if (!name.trim() || !outputItemId || outQty <= 0) return false;
        const filled = rowsWithCost.filter((r) => r.itemId && r.qty > 0);
        return filled.length > 0;
    }, [name, outputItemId, outQty, rowsWithCost]);

    const handleSave = async () => {
        if (!valid || saving) return;
        setSaving(true);
        try {
            const result = await createRecipe({
                name: name.trim(),
                description: description.trim() || undefined,
                outputItemId: Number(outputItemId),
                outputQuantity: outQty,
                outputUnit: outputUnit.trim() || undefined,
                instructions: instructions.trim() || undefined,
                isActive: true,
                ingredients: rowsWithCost
                    .filter((r) => r.itemId && r.qty > 0)
                    .map((r) => ({
                        itemId: Number(r.itemId),
                        quantity: r.qty,
                        unit: r.unit.trim() || undefined,
                    })),
            });
            if (result.error) {
                toast.custom(() => (
                    <Toast title="Error" description={result.error} type="error" />
                ));
            } else {
                toast.custom(() => (
                    <Toast
                        title="Success"
                        description="Recipe created successfully."
                        type="success"
                    />
                ));
                router.push('/stock/recipes');
            }
        } catch (e: any) {
            toast.custom(() => (
                <Toast
                    title="Error"
                    description={e?.message || 'Failed to create recipe.'}
                    type="error"
                />
            ));
        } finally {
            setSaving(false);
        }
    };

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
                        title="New Recipe"
                        subtitle="Define ingredients, quantities and costing"
                    />
                </div>
                <HeaderActions>
                    <Button onClick={handleSave} disabled={!valid || saving}>
                        {saving ? 'Saving…' : 'Save Recipe'}
                    </Button>
                </HeaderActions>
            </PageHeader>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="p-6 lg:col-span-2">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <Label>Recipe name *</Label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Party Jollof Rice"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <Label>Description</Label>
                            <Input
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Short description"
                            />
                        </div>
                        <div>
                            <Label>Output item *</Label>
                            <Select value={outputItemId} onValueChange={setOutputItemId}>
                                <SelectTrigger>
                                    <SelectValue
                                        placeholder={
                                            itemsLoading ? 'Loading items…' : 'Select item'
                                        }
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {(itemsList ?? []).map((it) => (
                                        <SelectItem
                                            key={it.id}
                                            value={String(it.value ?? it.id)}
                                        >
                                            {it.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label>Output qty *</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="any"
                                    value={outputQuantity}
                                    onChange={(e) => setOutputQuantity(e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>Unit</Label>
                                <Input
                                    value={outputUnit}
                                    onChange={(e) => setOutputUnit(e.target.value)}
                                    placeholder="e.g. plates"
                                />
                            </div>
                        </div>
                        <div className="sm:col-span-2">
                            <Label>Instructions</Label>
                            <Textarea
                                value={instructions}
                                onChange={(e) => setInstructions(e.target.value)}
                                placeholder="Preparation steps…"
                                rows={4}
                            />
                        </div>
                    </div>
                </Card>

                <Card className="h-fit p-6">
                    <h3 className="mb-3 font-semibold">Costing</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Total ingredient cost</span>
                            <span className="font-semibold">{formatCurrency(totalCost)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Output quantity</span>
                            <span>
                                {outQty || '—'}
                                {outputUnit ? ` ${outputUnit}` : ''}
                            </span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                            <span className="text-muted-foreground">Cost per unit</span>
                            <span className="font-semibold">{formatCurrency(costPerUnit)}</span>
                        </div>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                        Costs are computed from each ingredient&apos;s current cost price.
                    </p>
                </Card>
            </div>

            <Card className="mt-6 p-6">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-semibold">Ingredients</h3>
                    <Button variant="outline" size="sm" onClick={addRow}>
                        <Plus className="mr-2 h-4 w-4" /> Add ingredient
                    </Button>
                </div>
                <div className="space-y-3">
                    {rowsWithCost.map((row) => (
                        <div
                            key={row.key}
                            className="grid grid-cols-12 items-end gap-3 rounded-md border p-3"
                        >
                            <div className="col-span-12 sm:col-span-5">
                                <Label>Item *</Label>
                                <Select
                                    value={row.itemId}
                                    onValueChange={(v) => updateRow(row.key, 'itemId', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select item" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(itemsList ?? []).map((it) => (
                                            <SelectItem
                                                key={it.id}
                                                value={String(it.value ?? it.id)}
                                            >
                                                {it.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="col-span-4 sm:col-span-2">
                                <Label>Qty *</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="any"
                                    value={row.quantity}
                                    onChange={(e) =>
                                        updateRow(row.key, 'quantity', e.target.value)
                                    }
                                />
                            </div>
                            <div className="col-span-4 sm:col-span-2">
                                <Label>Unit</Label>
                                <Input
                                    value={row.unit}
                                    onChange={(e) => updateRow(row.key, 'unit', e.target.value)}
                                    placeholder={row.item?.baseUnit || 'unit'}
                                />
                            </div>
                            <div className="col-span-3 sm:col-span-2">
                                <Label>Line cost</Label>
                                <div className="flex h-10 items-center text-sm font-medium">
                                    {formatCurrency(row.lineCost)}
                                </div>
                            </div>
                            <div className="col-span-1 flex justify-end">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeRow(row.key)}
                                    disabled={rows.length <= 1}
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </PageWrapper>
    );
}

export default function Page() {
    return (
        <Suspense
            fallback={
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    Loading recipe builder…
                </div>
            }
        >
            <CreateRecipeForm />
        </Suspense>
    );
}
