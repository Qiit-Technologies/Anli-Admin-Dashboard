'use client';

import {
    PageHeader,
    PageHeadertitle,
    HeaderActions,
} from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import CustomTable from '@/components/common/table/CustomTable';
import { recipeColumns } from './columns';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import useSWR from 'swr';
import { getRecipes } from '@/app/actions/stock';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { useMemo, useState } from 'react';
import { Recipe } from './types';
import { Suspense } from 'react';

function RecipesListPage() {
    const [query, setQuery] = useState('');
    const { data: recipesResponse, isLoading } = useSWR('/items/recipes', getRecipes);

    const allData: Recipe[] = useMemo(() => {
        const raw = recipesResponse?.data;
        if (Array.isArray(raw)) return raw;
        if (raw && Array.isArray(raw.items)) return raw.items;
        return [];
    }, [recipesResponse]);

    const data = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return allData;
        return allData.filter((r) =>
            [r.name, r.description, r.outputItemName]
                .filter(Boolean)
                .join(' ')
                .toLowerCase()
                .includes(q),
        );
    }, [allData, query]);

    return (
        <PageWrapper>
            <PageHeader>
                <PageHeadertitle
                    title="Recipes"
                    subtitle="Ingredient lists and costings for kitchen production"
                />
                <HeaderActions>
                    <Button asChild>
                        <Link href="/stock/recipes/create">
                            <Plus className="mr-2 h-4 w-4" />
                            New Recipe
                        </Link>
                    </Button>
                </HeaderActions>
            </PageHeader>

            <div className="mb-4 flex items-center gap-2">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search recipes…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            {recipesResponse?.error && (
                <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                    Could not load recipes from the server ({recipesResponse.error}).
                    The list will populate once the backend ships{' '}
                    <span className="font-mono">/items/recipes</span>.
                </div>
            )}

            <CustomTable
                data={data}
                columns={recipeColumns}
                isPaginated={true}
                hasHeader={false}
                title="Recipes"
            />
            {data.length === 0 && !isLoading && (
                <p className="mt-4 text-center text-sm text-muted-foreground">
                    No recipes yet. Create your first recipe to start costing production.
                </p>
            )}
        </PageWrapper>
    );
}

export default function Page() {
    return (
        <Suspense
            fallback={
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    Loading recipes…
                </div>
            }
        >
            <RecipesListPage />
        </Suspense>
    );
}
