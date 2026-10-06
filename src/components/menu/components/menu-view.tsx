'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Search, LayoutGrid, SlidersHorizontal, X, Check } from 'lucide-react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MenuItemCard } from '@/components/menu/components/menu-item-card';
import { useAppContext } from '@/context/menu-context';
import {
    useMenuGroups,
    useMenuCategories,
    useMenuItems,
} from '@/components/menu/hooks/useMenuData';

interface MenuViewProps {
    menuType: 'food' | 'drinks';
}

const foodFilterTags = [
    { id: 'popular', label: 'Popular', abbr: 'P' },
    { id: 'new', label: 'New', abbr: 'N' },
    { id: 'vegetarian', label: 'Vegetarian', abbr: 'V' },
    { id: 'vegan', label: 'Vegan', abbr: 'VG' },
    { id: 'spicy', label: 'Spicy', abbr: 'S' },
];

const drinksFilterTags = [
    { id: 'popular', label: 'Popular', abbr: 'P' },
    { id: 'new', label: 'New', abbr: 'N' },
    { id: 'alcoholic', label: 'Alcoholic', abbr: 'A' },
    { id: 'non-alcoholic', label: 'Non-Alcoholic', abbr: 'NA' },
    { id: 'hot', label: 'Hot', abbr: 'H' },
    { id: 'cold', label: 'Cold', abbr: 'C' },
];

export function MenuView({ menuType }: MenuViewProps) {
    const { settings } = useAppContext();
    const restaurantId = settings.restaurantId;

    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [groupBy, setGroupBy] = useState<'category' | 'subcategory'>(
        'category',
    );
    const [search, setSearch] = useState('');
    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    const [filterOpen, setFilterOpen] = useState(false);
    const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const categoryScrollRef = useRef<HTMLDivElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    const { groups, isLoading: groupsLoading } = useMenuGroups(
        restaurantId,
        menuType,
    );
    const hasGroups = groups.length > 0;

    const [activeGroupId, setActiveGroupId] = useState<string>('');

    useEffect(() => {
        if (groups.length > 0 && !activeGroupId) {
            setActiveGroupId(groups[0].id);
        }
    }, [groups, activeGroupId]);

    const activeGroup = hasGroups ? activeGroupId || groups[0]?.id : undefined;

    const { categories: fetchedMenuCategories, isLoading: catsLoading } =
        useMenuCategories(restaurantId, menuType, activeGroup);

    const { items: allItems, isLoading: itemsLoading } = useMenuItems(
        restaurantId,
        menuType,
        activeGroup,
    );

    const menuCategories = useMemo(
        () =>
            fetchedMenuCategories.map((category) => ({
                ...category,
                image:
                    allItems.find((item) => item.categoryId === category.id)
                        ?.image ||
                    category.image ||
                    'https://placehold.co/600x400?text=No+Image',
            })),
        [fetchedMenuCategories, allItems],
    );

    const isLoading = groupsLoading || catsLoading || itemsLoading;

    const [activeCategory, setActiveCategory] = useState<string>('');

    const menuSubCategories = useMemo(() => {
        return menuCategories
            .flatMap((category) => category.subCategories ?? [])
            .filter((subCategory) =>
                allItems.some((item) => item.subCategoryId === subCategory.id),
            );
    }, [allItems, menuCategories]);

    const activeList =
        groupBy === 'category' ? menuCategories : menuSubCategories;

    const availableTags = useMemo(() => {
        const tagSet = new Set<string>();
        allItems.forEach((item) => {
            item.tags?.forEach((tag: string) => tagSet.add(tag));
        });
        return Array.from(tagSet).sort();
    }, [allItems]);

    const filterTags = useMemo(() => {
        if (availableTags.length > 0) {
            return availableTags.map((tag) => ({
                id: tag,
                label: tag.charAt(0).toUpperCase() + tag.slice(1),
                abbr: tag.charAt(0).toUpperCase(),
            }));
        }
        return menuType === 'food' ? foodFilterTags : drinksFilterTags;
    }, [availableTags, menuType]);

    useEffect(() => {
        if (activeList.length > 0) {
            setActiveCategory(activeList[0].id);
        }
    }, [activeGroup, groupBy, activeList.length]);

    const filteredItems = useMemo(() => {
        return allItems.filter((item) => {
            if (search) {
                const q = search.toLowerCase();
                if (
                    !item.name.toLowerCase().includes(q) &&
                    !item.description.toLowerCase().includes(q)
                )
                    return false;
            }
            if (activeFilters.length > 0) {
                const hasFilter = activeFilters.some((f) =>
                    item.tags.includes(f),
                );
                if (!hasFilter) return false;
            }
            return true;
        });
    }, [allItems, search, activeFilters]);

    const groupedItems = useMemo(() => {
        const result: Record<string, typeof filteredItems> = {};
        if (groupBy === 'category') {
            for (const cat of menuCategories) {
                const catItems = filteredItems.filter(
                    (i) => (i.categoryId ?? (i as any).category) === cat.id,
                );
                if (catItems.length > 0) {
                    result[cat.id] = catItems;
                }
            }
        } else {
            for (const sub of menuSubCategories) {
                const subItems = filteredItems.filter(
                    (i) => i.subCategoryId === sub.id,
                );
                if (subItems.length > 0) {
                    result[sub.id] = subItems;
                }
            }
        }
        return result;
    }, [filteredItems, menuCategories, menuSubCategories, groupBy]);

    useEffect(() => {
        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        setActiveCategory(entry.target.id);
                    }
                }
            },
            { rootMargin: '-200px 0px -60% 0px', threshold: 0 },
        );

        for (const catId of Object.keys(sectionRefs.current)) {
            const el = sectionRefs.current[catId];
            if (el) observerRef.current.observe(el);
        }

        return () => observerRef.current?.disconnect();
    }, [groupedItems]);

    const scrollToCategory = useCallback((catId: string) => {
        setActiveCategory(catId);
        const el = sectionRefs.current[catId];
        const scrollContainer = el?.closest('main');
        if (el && scrollContainer) {
            const offset = 200;
            const containerTop = scrollContainer.getBoundingClientRect().top;
            const elementTop = el.getBoundingClientRect().top;
            const scrollTop =
                scrollContainer.scrollTop +
                (elementTop - containerTop) -
                offset;
            scrollContainer.scrollTo({ top: scrollTop, behavior: 'smooth' });
        }
    }, []);

    const toggleFilter = useCallback((filterId: string) => {
        setActiveFilters((prev) =>
            prev.includes(filterId)
                ? prev.filter((f) => f !== filterId)
                : [...prev, filterId],
        );
    }, []);

    const handleGroupChange = useCallback((groupId: string) => {
        setActiveGroupId(groupId);
        setActiveCategory('');
        setSearch('');
        setActiveFilters([]);
    }, []);

    return (
        <div className="flex flex-col">
            <div
                className="sticky top-0 z-40 border-b"
                style={{
                    borderColor: 'var(--menu-border)',
                    backgroundColor: 'var(--menu-background)',
                }}
            >
                {hasGroups && (
                    <div className="flex gap-2 px-4 pt-3 pb-2">
                        {groups.map((group) => {
                            const isActive = activeGroupId === group.id;
                            return (
                                <button
                                    key={group.id}
                                    onClick={() => handleGroupChange(group.id)}
                                    className="rounded-lg px-5 py-1.5 text-sm font-semibold transition-all duration-200 capitalize"
                                    style={{
                                        backgroundColor: isActive
                                            ? 'var(--menu-brand)'
                                            : 'var(--menu-secondary)',
                                        color: isActive
                                            ? 'var(--menu-primary-foreground)'
                                            : 'var(--menu-muted-foreground)',
                                    }}
                                >
                                    {group.label}
                                </button>
                            );
                        })}
                    </div>
                )}
                <div className="flex items-center gap-2 px-4 py-2">
                    <button
                        onClick={() =>
                            setView(view === 'grid' ? 'list' : 'grid')
                        }
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-secondary"
                    >
                        <LayoutGrid className="h-5 w-5 text-foreground" />
                    </button>

                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search Item By Name, Price Or Description."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-9 border-0 bg-transparent pl-9 text-sm placeholder:text-muted-foreground focus-visible:ring-0"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2"
                            >
                                <X className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>
                        )}
                    </div>

                    <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                        <SheetTrigger asChild>
                            <button className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-secondary">
                                <SlidersHorizontal className="h-5 w-5 text-foreground" />
                                {activeFilters.length > 0 && (
                                    <span
                                        className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
                                        style={{
                                            backgroundColor:
                                                'var(--menu-brand)',
                                        }}
                                    >
                                        {activeFilters.length}
                                    </span>
                                )}
                            </button>
                        </SheetTrigger>
                        <SheetContent
                            side="right"
                            className="w-80 border p-0"
                            style={{
                                backgroundColor: 'var(--menu-background)',
                                borderColor: 'var(--menu-border)',
                            }}
                            showCloseButton={false}
                        >
                            <div className="flex items-center justify-between border-b border-border px-5 py-4">
                                <h3 className="text-lg font-bold text-foreground">
                                    Filters
                                </h3>
                                {activeFilters.length > 0 && (
                                    <button
                                        onClick={() => setActiveFilters([])}
                                        className="text-sm font-medium transition-colors"
                                        style={{ color: 'var(--menu-brand)' }}
                                    >
                                        Clear all
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-col pb-20">
                                {filterTags.map((tag) => {
                                    const isActive = activeFilters.includes(
                                        tag.id,
                                    );
                                    return (
                                        <button
                                            key={tag.id}
                                            onClick={() => toggleFilter(tag.id)}
                                            className="flex items-center gap-4 border-b border-border px-5 py-4 text-left transition-colors hover:bg-secondary/50"
                                        >
                                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border text-xs font-bold text-foreground">
                                                {tag.abbr}
                                            </span>
                                            <span className="flex-1 text-sm font-medium text-foreground">
                                                {tag.label}
                                            </span>
                                            <div
                                                className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                                                    isActive
                                                        ? 'border-transparent'
                                                        : 'border-border'
                                                }`}
                                                style={
                                                    isActive
                                                        ? {
                                                              backgroundColor:
                                                                  'var(--menu-brand)',
                                                          }
                                                        : undefined
                                                }
                                            >
                                                {isActive && (
                                                    <Check className="h-3.5 w-3.5 text-white" />
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 border-t border-border bg-background p-4">
                                <button
                                    onClick={() => setFilterOpen(false)}
                                    className="w-full rounded-lg py-3 text-sm font-semibold transition-colors"
                                    style={
                                        activeFilters.length > 0
                                            ? {
                                                  backgroundColor:
                                                      'var(--menu-brand)',
                                                  color: 'white',
                                              }
                                            : {
                                                  backgroundColor:
                                                      'var(--menu-secondary)',
                                                  color: 'var(--menu-muted-foreground)',
                                              }
                                    }
                                >
                                    Apply filters
                                </button>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                {menuSubCategories.length > 0 && (
                    <div
                        className="flex items-center justify-between px-4 pb-2 pt-1 border-b"
                        style={{ borderColor: 'var(--menu-border)' }}
                    >
                        <div
                            className="flex bg-secondary rounded-lg p-1 w-full sm:w-auto"
                            style={{ backgroundColor: 'var(--menu-secondary)' }}
                        >
                            <button
                                onClick={() => setGroupBy('category')}
                                className={`flex-1 sm:flex-none rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                                    groupBy === 'category' ? 'shadow-sm' : ''
                                }`}
                                style={
                                    groupBy === 'category'
                                        ? {
                                              backgroundColor:
                                                  'var(--menu-background)',
                                              color: 'var(--menu-foreground)',
                                          }
                                        : {
                                              color: 'var(--menu-muted-foreground)',
                                          }
                                }
                            >
                                Categories
                            </button>
                            <button
                                onClick={() => setGroupBy('subcategory')}
                                className={`flex-1 sm:flex-none rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                                    groupBy === 'subcategory' ? 'shadow-sm' : ''
                                }`}
                                style={
                                    groupBy === 'subcategory'
                                        ? {
                                              backgroundColor:
                                                  'var(--menu-background)',
                                              color: 'var(--menu-foreground)',
                                          }
                                        : {
                                              color: 'var(--menu-muted-foreground)',
                                          }
                                }
                            >
                                Sub-categories
                            </button>
                        </div>
                    </div>
                )}

                <div
                    ref={categoryScrollRef}
                    className="hide-scrollbar flex gap-3 overflow-x-auto px-4 pb-3 pt-3"
                >
                    {activeList.map((cat) => {
                        const isActive = activeCategory === cat.id;
                        const hasItems = groupedItems[cat.id];
                        return (
                            <button
                                key={cat.id}
                                onClick={() => scrollToCategory(cat.id)}
                                className={`relative flex shrink-0 flex-col items-center gap-1.5 transition-opacity ${
                                    !hasItems ? 'opacity-40' : ''
                                }`}
                            >
                                <div
                                    className="relative h-16 w-16 overflow-hidden rounded-xl border-2 transition-colors"
                                    style={{
                                        borderColor: isActive
                                            ? 'var(--menu-brand)'
                                            : 'transparent',
                                    }}
                                >
                                    <Image
                                        src={
                                            cat.image ||
                                            'https://placehold.co/600x400?text=No+Image'
                                        }
                                        alt={cat.name}
                                        fill
                                        className="object-cover"
                                        sizes="64px"
                                    />
                                </div>
                                <span
                                    className="text-[10px] font-semibold uppercase leading-tight max-w-16 text-center"
                                    style={{
                                        color: isActive
                                            ? 'var(--menu-brand)'
                                            : 'var(--menu-muted-foreground)',
                                    }}
                                >
                                    {cat.name}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="px-4 py-4">
                {isLoading ? (
                    <div className="flex flex-col gap-8">
                        {[1, 2].map((s) => (
                            <div key={s}>
                                <div
                                    className="mb-4 h-7 w-40 animate-pulse rounded-lg"
                                    style={{
                                        backgroundColor:
                                            'var(--menu-secondary)',
                                    }}
                                />
                                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div
                                            key={i}
                                            className="animate-pulse rounded-2xl"
                                            style={{
                                                backgroundColor:
                                                    'var(--menu-secondary)',
                                            }}
                                        >
                                            <div className="aspect-square w-full rounded-t-2xl" />
                                            <div className="space-y-2 p-3">
                                                <div
                                                    className="h-3 w-3/4 rounded"
                                                    style={{
                                                        backgroundColor:
                                                            'var(--menu-border)',
                                                    }}
                                                />
                                                <div
                                                    className="h-3 w-1/2 rounded"
                                                    style={{
                                                        backgroundColor:
                                                            'var(--menu-border)',
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : Object.keys(groupedItems).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <p className="text-lg font-medium text-muted-foreground">
                            No items found
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Try adjusting your search or filters
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-8">
                        {activeList.map((cat) => {
                            const items = groupedItems[cat.id];
                            if (!items) return null;
                            return (
                                <div
                                    key={cat.id}
                                    id={cat.id}
                                    ref={(el) => {
                                        sectionRefs.current[cat.id] = el;
                                    }}
                                >
                                    <h2 className="mb-4 text-2xl font-bold uppercase text-foreground">
                                        {cat.name}
                                    </h2>
                                    <AnimatePresence mode="popLayout">
                                        <div
                                            className={
                                                view === 'grid'
                                                    ? 'grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4'
                                                    : 'flex flex-col gap-3'
                                            }
                                        >
                                            {items.map((item) => (
                                                <MenuItemCard
                                                    key={item.id}
                                                    item={item}
                                                    view={view}
                                                />
                                            ))}
                                        </div>
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
