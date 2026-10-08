/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { getMenus, getMenusByDineArea } from '@/app/actions/menu';
import {
    getMenuCategories,
    // getMenuCategoriesByDine,
    getOneMenuCategories,
} from '@/app/actions/menu-category';
import { getMenuItems } from '@/app/actions/menu-item';
import { createOrder } from '@/app/actions/order';
import { getWorkPeriods, startWorkPeriod } from '@/app/actions/work-period';
import WorkPeriodForcedStartModal from './WorkPeriod/WorkPeriodForcedStartModal';
import { getCustomCharges } from '@/app/actions/hotel';
import { getDineInAreas } from '@/app/actions/back-of-house';
import { ItemsTable } from '@/components/common/ItemsTable';
import { PageHeader } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import useHotel from '@/hooks/useHotel';
import useOrderStore, { Table } from '@/store/useOrder';
import { ArrowLeft, LoaderCircle, Send, ShoppingCart } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import useSWR, { mutate } from 'swr';
import { CustomSheet } from '../common/CustomSheet';
import SearchInput from '../common/SearchInput';
import { ItemOrderColumns } from '../common/table/column/ItemOrder';
import Toast from '../toast';
import { Badge } from '../ui/badge';
import { ItemCategory } from './data/types/types';
import { MenuItemGrid } from './MenuItemCard';
import MiniCategoryList from './MiniCategoryList';
import ModifierSelectionDialog from './ModifierSelectionDialog';
import OrderSkeleton from './OrderSkeleton';
import { ScrollableTabs } from './ScrollTab';
import NoCharge, { type DraftComplimentaryPayload } from './tables/NoCharge';
import RoomComp from './tables/RoomComp';
import {
    DraftOrderChargeWaiver,
    type DraftWaiverPayload,
} from './tables/OrderChargeWaiver';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { usePermissions } from '@/hooks/auth/usePermission';
import OrderDiscountBadge from './complimentary/OrderDiscountBadge';
import OrderDiscount, {
    type DraftOrderDiscountPayload,
} from './tables/OrderDiscount';
import { formatOrderMoney } from './utils/complimentary';
import VoidOrder from './tables/VoidOrder';
import { getFilteredItems } from './utils';

const createLineKey = () =>
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

interface MenuItem {
    id: number;
    name: string;
    description: string;
    price: number;
    basePrice: number;
    quantity: number;
    category: ItemCategory;
    subCategory: string;
    imageUrl?: string;
    modifierGroups?: Array<{
        id: number;
        name: string;
        description?: string;
        isRequired: boolean;
        allowMultiple: boolean;
        minSelections: number;
        maxSelections: number;
        displayOrder: number;
        options?: Array<{
            id: number;
            name: string;
            description?: string;
            price: number;
            isAvailable: boolean;
            displayOrder: number;
        }>;
    }>;
}

const FoodMenuComponent = ({
    onOrderComplete,
    goBack,
}: {
    onOrderComplete?: () => void;
    goBack: () => void;
}) => {
    const {
        order,
        addItem: addOrderItem,
        increaseItemQuantity,
        decreaseItemQuantity,
        updateTotalAmount,
        clearOrder,
    } = useOrderStore();
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
    const [subCategories, setSubCategories] = useState<any[]>([]);
    const [isLoadingSave, setIsLoadingSave] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [includeTip, setIncludeTip] = useState(false);
    const [isLoadingSubcategories, setIsLoadingSubcategories] = useState(false);
    const [modifierDialogOpen, setModifierDialogOpen] = useState(false);
    const [selectedItemForModifiers, setSelectedItemForModifiers] =
        useState<MenuItem | null>(null);
    const [selectedMenuId, setSelectedMenuId] = useState<number | 'all' | null>(
        null,
    );
    const [showForcedStartModal, setShowForcedStartModal] = useState(false);
    const [isWorkPeriodStarted, setIsWorkPeriodStarted] = useState(false);
    const [isStartingPeriod, setIsStartingPeriod] = useState(false);
    const [pendingComplimentary, setPendingComplimentary] =
        useState<DraftComplimentaryPayload | null>(null);
    const [roomCompEnabled, setRoomCompEnabled] = useState(false);
    const [pendingWaiver, setPendingWaiver] =
        useState<DraftWaiverPayload | null>(null);
    const [pendingDiscount, setPendingDiscount] =
        useState<DraftOrderDiscountPayload | null>(null);
    const { hasPermission } = usePermissions();
    const canDiscountOrders = hasPermission(
        PERMISSIONS.APPLY_DISCOUNT_TO_ORDERS,
    );

    // Extract dineArea ID - handle both string and number cases
    const dineAreaIdRaw = (order?.table as Table)?.dineArea;
    let dineAreaId = '';
    if (dineAreaIdRaw) {
        if (
            typeof dineAreaIdRaw === 'string' ||
            typeof dineAreaIdRaw === 'number'
        ) {
            dineAreaId = String(dineAreaIdRaw);
        } else if (
            typeof dineAreaIdRaw === 'object' &&
            dineAreaIdRaw !== null &&
            'id' in dineAreaIdRaw
        ) {
            dineAreaId = String((dineAreaIdRaw as { id: number | string }).id);
        }
    } else if (order?.dineInArea) {
        dineAreaId = String(order.dineInArea.id);
    }

    // Use dine-specific categories if a dineAreaId is present
    const shouldUseDineCategories = Boolean(dineAreaId) && dineAreaId !== '';

    // Fetch menus by dine area, then extract categories (only for DINE_IN orders)
    const { data: menusByDine } = useSWR(
        shouldUseDineCategories && dineAreaId
            ? ['/dine/menus', dineAreaId]
            : null,
        () => getMenusByDineArea(dineAreaId),
    );

    // Fetch all menus for non-DINE_IN orders (FAST_FOOD, TAKE_AWAY, DELIVERY, ROOM)
    const { data: allMenus } = useSWR(
        !shouldUseDineCategories ? '/all-menus' : null,
        () => getMenus(),
    );

    // Fetch all categories (for TAKE_AWAY, DELIVERY, ROOM orders, or fallback)
    const { data: menuCategories } = useSWR(
        !shouldUseDineCategories ? '/menu/category' : null,
        () => getMenuCategories(),
    );

    const { data: workPeriodsResponse } = useSWR(
        '/restaurants/work-period',
        getWorkPeriods,
    );

    const { data: dineInAreasResponse } = useSWR(
        '/restaurants/dine-in-areas',
        getDineInAreas,
    );

    const activeWorkPeriods = useMemo(
        () => (workPeriodsResponse?.data || []).filter((p: any) => p.isActive),
        [workPeriodsResponse],
    );

    const computedAreaName = useMemo(() => {
        if (order.orderType === 'FAST_FOOD') return 'Fast Food';
        const areaIdNum = Number(dineAreaId);

        // 1. Try to find the name in dine-in areas list (this works even if work period hasn't started)
        const dineArea = (dineInAreasResponse?.data || []).find(
            (a: any) => a.id === areaIdNum,
        );
        if (dineArea?.name) {
            return `${dineArea.name} Dine area`;
        }

        // 2. Fallback to active work periods
        const period = activeWorkPeriods.find(
            (p: any) =>
                p.areaType === 'DINE_AREA' && p.dineInArea?.id === areaIdNum,
        );
        if (period?.dineInArea?.name) {
            return `${period.dineInArea.name} Dine area`;
        }

        // 3. Fallback to raw value if it's already a string name
        if (dineAreaId && isNaN(areaIdNum)) {
            return `${dineAreaId} Dine area`;
        }

        return 'Dine Area';
    }, [order.orderType, dineAreaId, activeWorkPeriods, dineInAreasResponse]);

    // Get available menus (from dine area or all menus)
    const availableMenus = useMemo(() => {
        if (shouldUseDineCategories && menusByDine?.data) {
            return menusByDine.data;
        }
        if (!shouldUseDineCategories && allMenus?.data) {
            return allMenus.data;
        }
        return [];
    }, [shouldUseDineCategories, menusByDine, allMenus]);

    // Set default selected menu when menus are loaded
    useEffect(() => {
        if (availableMenus.length > 0 && selectedMenuId === null) {
            // If only one menu, select it; if multiple, show "All Menus" option
            if (availableMenus.length === 1) {
                setSelectedMenuId(availableMenus[0].id);
            } else {
                setSelectedMenuId('all');
            }
        } else if (availableMenus.length === 0 && selectedMenuId !== null) {
            // If no menus available, reset to null to use fallback items
            setSelectedMenuId(null);
        }
    }, [availableMenus, selectedMenuId]);

    // Extract categories from menus based on selected menu
    const menuCategoriesData = useMemo(() => {
        // If we have menus from dine area, try to extract categories from them
        if (
            shouldUseDineCategories &&
            menusByDine?.data &&
            menusByDine.data.length > 0
        ) {
            // Filter by selected menu if a specific menu is selected
            // If selectedMenuId is null or 'all', show all menus
            let menusToUse = menusByDine.data;
            if (selectedMenuId !== null && selectedMenuId !== 'all') {
                menusToUse = menusByDine.data.filter(
                    (menu: any) => menu.id === selectedMenuId,
                );
            }
            // Flatten categories from selected menu(s)
            const allCategories = menusToUse.flatMap(
                (menu: any) => menu.categories || [],
            );
            // If we got categories, return them
            if (allCategories.length > 0) {
                return { data: allCategories };
            }
        }
        // For non-DINE_IN orders, try to extract categories from all menus
        if (
            !shouldUseDineCategories &&
            allMenus?.data &&
            allMenus.data.length > 0
        ) {
            let menusToUse = allMenus.data;
            if (selectedMenuId !== null && selectedMenuId !== 'all') {
                menusToUse = allMenus.data.filter(
                    (menu: any) => menu.id === selectedMenuId,
                );
            }
            // Extract categories from selected menu(s)
            const allCategories = menusToUse.flatMap(
                (menu: any) => menu.categories || [],
            );
            if (allCategories.length > 0) {
                return { data: allCategories };
            }
        }
        // Fallback to regular menu categories (for when no menus, menus have no categories, or categories are still loading)
        return menuCategories;
    }, [
        shouldUseDineCategories,
        menusByDine,
        allMenus,
        menuCategories,
        selectedMenuId,
    ]);

    // Fetch all items (for TAKE_AWAY, DELIVERY, ROOM orders, or fallback when no items in menus)
    const { data: items } = useSWR(
        !shouldUseDineCategories ? '/menu/item' : null,
        getMenuItems,
    );
    // Extract items from menu structure when using dine area menus (with correct per-menu prices)
    const itemsFromMenus = useMemo(() => {
        if (!shouldUseDineCategories || !menusByDine?.data) {
            return null;
        }

        // Filter by selected menu if a specific menu is selected
        // If selectedMenuId is null or 'all', show all menus
        let menusToUse = menusByDine.data;
        if (selectedMenuId !== null && selectedMenuId !== 'all') {
            menusToUse = menusByDine.data.filter(
                (menu: any) => menu.id === selectedMenuId,
            );
        }

        // Flatten all items from all categories in selected menu(s)
        const allItems: any[] = [];
        menusToUse.forEach((menu: any) => {
            if (menu.categories) {
                menu.categories.forEach((category: any) => {
                    // Items directly in category
                    if (category.items && Array.isArray(category.items)) {
                        allItems.push(...category.items);
                    }
                    // Items in subcategories
                    if (category.subCategories) {
                        category.subCategories.forEach((subCat: any) => {
                            if (subCat.items && Array.isArray(subCat.items)) {
                                allItems.push(...subCat.items);
                            }
                        });
                    }
                });
            }
        });

        return allItems.length > 0 ? { data: allItems } : null;
    }, [shouldUseDineCategories, menusByDine, selectedMenuId]);

    // Extract items from all menus for non-DINE_IN orders
    const itemsFromAllMenus = useMemo(() => {
        if (shouldUseDineCategories || !allMenus?.data) {
            return null;
        }

        // Filter by selected menu if a specific menu is selected
        // If selectedMenuId is null or 'all', show all menus
        let menusToUse = allMenus.data;
        if (selectedMenuId !== null && selectedMenuId !== 'all') {
            menusToUse = allMenus.data.filter(
                (menu: any) => menu.id === selectedMenuId,
            );
        }

        // Flatten all items from all categories in selected menu(s)
        const allItems: any[] = [];
        menusToUse.forEach((menu: any) => {
            if (menu.categories) {
                menu.categories.forEach((category: any) => {
                    // Items directly in category
                    if (category.items && Array.isArray(category.items)) {
                        allItems.push(...category.items);
                    }
                    // Items in subcategories
                    if (category.subCategories) {
                        category.subCategories.forEach((subCat: any) => {
                            if (subCat.items && Array.isArray(subCat.items)) {
                                allItems.push(...subCat.items);
                            }
                        });
                    }
                });
            }
        });

        return allItems.length > 0 ? { data: allItems } : null;
    }, [shouldUseDineCategories, allMenus, selectedMenuId]);

    // Use items from menus if available, otherwise use fetched items
    // When no menus are attached, backend returns categories with all items, so itemsFromMenus should have items
    const allMenuItems = useMemo(() => {
        // If we have items from menus with actual data, use them
        if (itemsFromMenus?.data && itemsFromMenus.data.length > 0) {
            return itemsFromMenus;
        }
        if (itemsFromAllMenus?.data && itemsFromAllMenus.data.length > 0) {
            return itemsFromAllMenus;
        }
        // Fallback to regular items fetch (for when no menus or menus have no items)
        return items;
    }, [itemsFromMenus, itemsFromAllMenus, items]);

    const [filteredItem, setFilteredItem] = useState<any>(null);

    const categoryOptions = useMemo(() => {
        if (Array.isArray(menuCategoriesData?.data)) {
            return menuCategoriesData.data.map((category: any) => ({
                value: category.id,
                label: category.name,
            }));
        }
        return [];
    }, [menuCategoriesData?.data]);

    const subCategoryOptions = useMemo(
        () =>
            subCategories.map((category: any) => ({
                value: category.id,
                label: category.name,
            })) || [],
        [subCategories],
    );

    const subtotal = useMemo(
        () =>
            order.items.reduce((acc, item) => {
                return acc + (item.price ?? 0) * item.quantity;
            }, 0),
        [order.items],
    );
    const { organization } = useHotel();

    const restaurantVatInclusive =
        organization?.restaurantVatInclusive ?? false;
    const restaurantServiceChargeInclusive =
        organization?.restaurantServiceChargeInclusive ?? false;
    const restaurantTipInclusive =
        organization?.restaurantTipInclusive ?? false;
    const restaurantCustomChargesInclusive =
        organization?.restaurantCustomChargesInclusive ?? false;

    const vatRate = useMemo(
        () =>
            Number(
                organization?.restaurantVatRate ?? organization?.vatRate ?? 0,
            ),
        [organization?.restaurantVatRate, organization?.vatRate],
    );

    const serviceChargeRate = useMemo(
        () =>
            Number(
                organization?.restaurantServiceChargeRate ??
                    organization?.serviceChargeRate ??
                    0,
            ),
        [
            organization?.restaurantServiceChargeRate,
            organization?.serviceChargeRate,
        ],
    );

    const tipRate = useMemo(
        () =>
            Number(
                organization?.restaurantTipRate ?? organization?.tipRate ?? 0,
            ),
        [organization?.restaurantTipRate, organization?.tipRate],
    );

    const vatAmount = useMemo(
        () =>
            restaurantVatInclusive
                ? Number((subtotal - subtotal / (1 + vatRate / 100)).toFixed(2))
                : (subtotal * vatRate) / 100,
        [subtotal, vatRate, restaurantVatInclusive],
    );

    const serviceChargeAmount = useMemo(
        () =>
            restaurantServiceChargeInclusive
                ? Number(
                      (
                          subtotal -
                          subtotal / (1 + serviceChargeRate / 100)
                      ).toFixed(2),
                  )
                : (subtotal * serviceChargeRate) / 100,
        [subtotal, serviceChargeRate, restaurantServiceChargeInclusive],
    );

    const tipAmount = useMemo(
        () =>
            includeTip
                ? restaurantTipInclusive
                    ? Number(
                          (subtotal - subtotal / (1 + tipRate / 100)).toFixed(
                              2,
                          ),
                      )
                    : (subtotal * tipRate) / 100
                : 0,
        [subtotal, tipRate, includeTip, restaurantTipInclusive],
    );

    // Fetch custom charges
    const { data: customChargesData } = useSWR(
        'custom-charges-foodmenu',
        async () => {
            const result = await getCustomCharges();
            if ('error' in result) {
                console.error('Error fetching custom charges:', result.error);
                return [];
            }
            return (result.data || []).filter(
                (charge: any) => charge.isActive === true,
            );
        },
    );

    // Calculate custom charges
    const customChargesAmount = useMemo(() => {
        if (!customChargesData || customChargesData.length === 0) return 0;
        return customChargesData.reduce((sum: number, charge: any) => {
            const rate = Math.min(Math.max(Number(charge.rate ?? 0), 0), 100);
            return sum + (subtotal * rate) / 100;
        }, 0);
    }, [customChargesData, subtotal]);

    const grossOrderTotal = useMemo(
        () =>
            subtotal +
            (restaurantVatInclusive ? 0 : pendingWaiver?.vat ? 0 : vatAmount) +
            (restaurantServiceChargeInclusive
                ? 0
                : pendingWaiver?.serviceCharge
                  ? 0
                  : serviceChargeAmount) +
            (restaurantTipInclusive ? 0 : pendingWaiver?.tip ? 0 : tipAmount) +
            (restaurantCustomChargesInclusive
                ? 0
                : pendingWaiver?.customCharges
                  ? 0
                  : customChargesAmount),
        [
            subtotal,
            vatAmount,
            serviceChargeAmount,
            tipAmount,
            customChargesAmount,
            pendingWaiver,
            restaurantVatInclusive,
            restaurantServiceChargeInclusive,
            restaurantTipInclusive,
            restaurantCustomChargesInclusive,
        ],
    );

    const draftDiscountAmount = useMemo(() => {
        if (!pendingDiscount) return 0;
        if (pendingDiscount.discountType === 'PERCENTAGE') {
            const pct = Math.min(
                Math.max(pendingDiscount.discountValue, 0),
                100,
            );
            return (grossOrderTotal * pct) / 100;
        }
        return Math.min(pendingDiscount.discountValue, grossOrderTotal);
    }, [pendingDiscount, grossOrderTotal]);

    const totalWithVat = Math.max(0, grossOrderTotal - draftDiscountAmount);

    const isRestaurantOrder = useMemo(() => {
        return (
            order.orderType === 'DINE_IN' ||
            order.orderType === 'TAKE_AWAY' ||
            order.orderType === 'DELIVERY'
        );
    }, [order.orderType]);

    const foodMenuBreakdownRows = useMemo(() => {
        const rows: Array<{ label: string; value: number }> = [
            { label: 'Subtotal', value: subtotal },
        ];

        if (!restaurantVatInclusive && vatRate > 0) {
            rows.push({
                label: pendingWaiver?.vat
                    ? `VAT (${vatRate.toFixed(2)}%) (Waived)`
                    : `VAT (${vatRate.toFixed(2)}%)`,
                value: pendingWaiver?.vat ? 0 : vatAmount,
            });
        }

        if (!restaurantServiceChargeInclusive && serviceChargeRate > 0) {
            rows.push({
                label: pendingWaiver?.serviceCharge
                    ? `Service Charge (${serviceChargeRate.toFixed(2)}%) (Waived)`
                    : `Service Charge (${serviceChargeRate.toFixed(2)}%)`,
                value: pendingWaiver?.serviceCharge ? 0 : serviceChargeAmount,
            });
        }

        if (
            isRestaurantOrder &&
            !restaurantTipInclusive &&
            tipRate > 0 &&
            includeTip
        ) {
            rows.push({
                label: pendingWaiver?.tip
                    ? `Tip (${tipRate.toFixed(2)}%) (Waived)`
                    : `Tip (${tipRate.toFixed(2)}%)`,
                value: pendingWaiver?.tip ? 0 : tipAmount,
            });
        }

        if (
            !restaurantCustomChargesInclusive &&
            customChargesData &&
            customChargesData.length > 0
        ) {
            (customChargesData as any[]).forEach((charge: any) => {
                const rate = Math.min(
                    Math.max(Number(charge.rate ?? 0), 0),
                    100,
                );
                const amount = (subtotal * rate) / 100;
                if (amount > 0) {
                    rows.push({
                        label: pendingWaiver?.customCharges
                            ? `${charge.name} (${rate.toFixed(2)}%) (Waived)`
                            : `${charge.name} (${rate.toFixed(2)}%)`,
                        value: pendingWaiver?.customCharges ? 0 : amount,
                    });
                }
            });
        }

        return rows;
    }, [
        subtotal,
        vatRate,
        vatAmount,
        serviceChargeRate,
        serviceChargeAmount,
        isRestaurantOrder,
        tipRate,
        tipAmount,
        includeTip,
        customChargesData,
        pendingWaiver,
        restaurantVatInclusive,
        restaurantServiceChargeInclusive,
        restaurantTipInclusive,
        restaurantCustomChargesInclusive,
    ]);

    const cartBreakdownRows = useMemo(() => {
        if (!pendingDiscount || draftDiscountAmount <= 0) {
            return foodMenuBreakdownRows;
        }
        const label =
            pendingDiscount.discountType === 'PERCENTAGE'
                ? `Discount (${pendingDiscount.discountValue}% off the bill)`
                : 'Discount (off the bill)';
        return [
            ...foodMenuBreakdownRows,
            { label, value: -draftDiscountAmount },
        ];
    }, [foodMenuBreakdownRows, pendingDiscount, draftDiscountAmount]);

    const discountBill = useMemo(
        () => ({
            lines: foodMenuBreakdownRows,
            total: grossOrderTotal,
        }),
        [foodMenuBreakdownRows, grossOrderTotal],
    );

    const draftDiscountNotice = pendingDiscount ? (
        <div className="bg-[#E8F3FF] border border-orion-blue/30 rounded-lg p-3 mb-3 text-xs text-orion-blue flex justify-between items-center gap-3">
            <div className="min-w-0">
                <OrderDiscountBadge
                    order={{ ...pendingDiscount, isDiscounted: true }}
                />
                <p className="text-[11px] text-orion-blue mt-1">
                    {formatOrderMoney(draftDiscountAmount)} off the full bill
                    when you save
                    {pendingDiscount.discountReason
                        ? ` · ${pendingDiscount.discountReason}`
                        : ''}
                </p>
            </div>
            <button
                type="button"
                onClick={() => setPendingDiscount(null)}
                className="shrink-0 text-xs text-orion-blue underline font-medium"
            >
                Remove
            </button>
        </div>
    ) : null;

    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);
    }, []);

    const filteredItems = useMemo(() => {
        if (searchQuery.trim()) {
            return filteredItem || [];
        }

        return getFilteredItems(
            allMenuItems?.data,
            selectedCategory ?? '',
            selectedSubCategory ?? '',
        );
    }, [
        allMenuItems?.data,
        selectedCategory,
        selectedSubCategory,
        searchQuery,
        filteredItem,
    ]);

    useEffect(() => {
        if (!allMenuItems?.data) {
            setFilteredItem(null);
            return;
        }

        if (!searchQuery.trim()) {
            setFilteredItem(allMenuItems.data);
            return;
        }

        const filtered = allMenuItems.data.filter(
            (item: any) =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase()),
        );

        setFilteredItem(filtered);
    }, [allMenuItems?.data, searchQuery]);

    useEffect(() => {
        const fetchCategory = async () => {
            if (!selectedCategory) return;

            setIsLoadingSubcategories(true);
            try {
                const response = await getOneMenuCategories(selectedCategory);
                setSubCategories(response?.data?.subCategories || []);

                if (response?.data?.subCategories?.length > 0) {
                    setSelectedSubCategory(response.data.subCategories[0].id);
                } else {
                    setSelectedSubCategory('');
                }
            } catch (error: any) {
                console.error('Failed to fetch menu category:', error);
            } finally {
                setIsLoadingSubcategories(false);
            }
        };

        if (selectedCategory) {
            fetchCategory();
        }
    }, [selectedCategory]);

    useEffect(() => {
        updateTotalAmount({
            subtotal,
            vatAmount,
            serviceChargeAmount,
            tipAmount,
            total: totalWithVat,
            vatRate,
            serviceChargeRate,
            tipRate,
        });
    }, [
        subtotal,
        vatAmount,
        serviceChargeAmount,
        tipAmount,
        totalWithVat,
        vatRate,
        serviceChargeRate,
        tipRate,
        updateTotalAmount,
    ]);

    useEffect(() => {
        if (menuCategoriesData?.data && categoryOptions.length > 0) {
            setSelectedCategory(categoryOptions[0].value ?? '');
        }
    }, [categoryOptions, menuCategoriesData?.data]);

    const handleSubCategoryChange = useCallback((subCategory: string) => {
        setSelectedSubCategory(subCategory);
    }, []);

    const addItem = useCallback(
        (item: MenuItem) => {
            const menuItem = order.items.find((i) => i.id === item.id);
            if (menuItem) {
                increaseItemQuantity(item.id);
            } else {
                // Check if item has modifiers
                if (
                    item.modifierGroups &&
                    item.modifierGroups.length > 0 &&
                    item.modifierGroups.some(
                        (g) => g.options && g.options.length > 0,
                    )
                ) {
                    // Show modifier selection dialog
                    setSelectedItemForModifiers(item);
                    setModifierDialogOpen(true);
                } else {
                    // No modifiers, add directly
                    addOrderItem({
                        id: item.id,
                        lineKey: createLineKey(),
                        name: item.name,
                        price: item.price,
                        quantity: 1,
                    });
                }
            }
        },
        [order.items, addOrderItem],
    );

    const handleModifierConfirm = useCallback(
        (
            selectedModifiers: Array<{
                modifierGroupId: number;
                modifierOptionId: number;
            }>,
            totalPrice: number,
        ) => {
            if (selectedItemForModifiers) {
                addOrderItem({
                    id: selectedItemForModifiers.id,
                    lineKey: createLineKey(),
                    name: selectedItemForModifiers.name,
                    price: totalPrice,
                    quantity: 1,
                    selectedModifiers,
                });
                setSelectedItemForModifiers(null);
            }
        },
        [selectedItemForModifiers, addOrderItem],
    );

    const increaseQuantity = useCallback(
        (id: number) => {
            increaseItemQuantity(id);
        },
        [increaseItemQuantity],
    );

    const decreaseQuantity = useCallback(
        (id: number) => {
            decreaseItemQuantity(id);
        },
        [decreaseItemQuantity],
    );

    const handleQuantityChange = useCallback(
        (id: number, increase: boolean) =>
            increase ? increaseQuantity(id) : decreaseQuantity(id),
        [increaseQuantity, decreaseQuantity],
    );

    const handleSaveOrder = useCallback(
        async (isRetry: boolean = false) => {
            if (isLoadingSave) return;

            // Check for work period if it's FAST_FOOD, DINE_IN, or if any order type has an area selected
            if (
                !isRetry &&
                (order.orderType === 'FAST_FOOD' ||
                    order.orderType === 'DINE_IN' ||
                    Boolean(dineAreaId))
            ) {
                const isFastFood = order.orderType === 'FAST_FOOD';
                const areaId = isFastFood ? null : Number(dineAreaId);

                const hasActivePeriod = activeWorkPeriods.some((p: any) => {
                    if (isFastFood) return p.areaType === 'FAST_FOOD';
                    // For other types, only check if they match the selected dine area
                    return (
                        p.areaType === 'DINE_AREA' &&
                        p.dineInArea?.id === areaId
                    );
                });

                if (!hasActivePeriod && !isWorkPeriodStarted) {
                    setShowForcedStartModal(true);
                    return;
                }
            }

            if (!order.totalAmount) {
                toast.custom(() => (
                    <Toast
                        title="Error"
                        description={`Please add items to the order`}
                        type="error"
                    />
                ));
                return;
            }

            if (pendingComplimentary) {
                const cartLineKeys = new Set(
                    order.items
                        .map((item) => item.lineKey)
                        .filter((key): key is string => Boolean(key)),
                );
                const hasInvalidSelection = pendingComplimentary.lineKeys.some(
                    (lineKey) => !cartLineKeys.has(lineKey),
                );
                const missingLineKeys = order.items.some(
                    (item) => !item.lineKey,
                );

                if (missingLineKeys || hasInvalidSelection) {
                    toast.custom(() => (
                        <Toast
                            title="Error"
                            description="No charge selection is out of date. Configure it again before saving."
                            type="error"
                        />
                    ));
                    setPendingComplimentary(null);
                    return;
                }
            }

            const mappedOrder = {
                guestName: order.guestName,
                guestEmail: order.guestEmail,
                guestPhoneNumber: order.phoneNumber,
                waiterId: order.waiter?.id,
                orderType: order.orderType,
                tableId: order.table?.id,
                roomId: order.room?.id,
                dineInAreaId: dineAreaId ? Number(dineAreaId) : null,
                paymentStatus: 'PENDING',
                paymentMethod: order.paymentMethod,
                receivingAccount: order.recievingAccount,
                remark: order.orderType === 'DELIVERY' ? order.remark : null,
                scheduledFor:
                    order.orderType === 'DELIVERY' ? order.timeExpected : null,
                address: order.address,
                items: order.items.map((item) => ({
                    menuItemId: item.id,
                    ...(item.lineKey ? { lineKey: item.lineKey } : {}),
                    quantity: item.quantity,
                    price: item.price,
                    notes: item.notes,
                    selectedModifiers: item.selectedModifiers,
                })),
                totalPrice: totalWithVat,
                subtotal: subtotal,
                vatAmount: vatAmount,
                vatRateSnapshot: vatRate,
                serviceChargeAmount: serviceChargeAmount,
                serviceChargeRateSnapshot: serviceChargeRate,
                tipAmount: includeTip ? tipAmount : 0,
                tipRateSnapshot: includeTip ? tipRate : 0,
                ...(order.orderType === 'ROOM'
                    ? { roomComp: roomCompEnabled }
                    : pendingComplimentary
                      ? {
                            complimentary: {
                                ...pendingComplimentary,
                                pin: pendingComplimentary.pin || undefined,
                            },
                        }
                      : {}),
                ...(pendingWaiver
                    ? {
                          waiver: pendingWaiver,
                      }
                    : {}),
                ...(canDiscountOrders && pendingDiscount
                    ? {
                          discount: pendingDiscount,
                      }
                    : {}),
            };

            setIsLoadingSave(true);
            try {
                const response = await createOrder(mappedOrder);
                if (response.data) {
                    // Force immediate refetch of all relevant order lists
                    mutate('/orders/query/all', undefined, {
                        revalidate: true,
                    });
                    mutate('/orders/query/running', undefined, {
                        revalidate: true,
                    });
                    mutate('/orders/query/ready', undefined, {
                        revalidate: true,
                    });
                    mutate('/orders/query/settled', undefined, {
                        revalidate: true,
                    });

                    // Handle specifically the per-type list keys used in service pages
                    mutate('/orders/order-type?=FAST_FOOD', undefined, {
                        revalidate: true,
                    });
                    mutate('/orders/order-type?=ROOM', undefined, {
                        revalidate: true,
                    });
                    mutate('/orders/order-type?=TAKE_AWAY', undefined, {
                        revalidate: true,
                    });
                    mutate('/orders/order-type?=DELIVERY', undefined, {
                        revalidate: true,
                    });

                    toast.custom(() => (
                        <Toast
                            title="Success!"
                            description={
                                order.orderType === 'ROOM' && roomCompEnabled
                                    ? 'Order posted to the room as complimentary.'
                                    : pendingComplimentary
                                      ? 'Order saved with complimentary applied.'
                                      : 'Order saved successfully!'
                            }
                            type="success"
                        />
                    ));
                    setPendingComplimentary(null);
                    setRoomCompEnabled(false);
                    setPendingWaiver(null);
                    clearOrder();
                    onOrderComplete?.();
                } else {
                    toast.custom(() => (
                        <Toast
                            title="Error"
                            description={`Failed to save order. Please try again.`}
                            type="error"
                        />
                    ));
                }
            } catch (error: any) {
                console.error('Error:', error);
                toast.custom(() => (
                    <Toast
                        title="Error"
                        description={`Failed to save order. Please try again.`}
                        type="error"
                    />
                ));
            } finally {
                setIsLoadingSave(false);
            }
        },
        [
            order,
            onOrderComplete,
            isLoadingSave,
            pendingComplimentary,
            pendingDiscount,
            canDiscountOrders,
            roomCompEnabled,
        ],
    );

    const isReady =
        categoryOptions.length > 0 && allMenuItems?.data?.length > 0;

    const loader = useMemo(() => <OrderSkeleton />, []);

    const MiniCategoryListMemo = useMemo(
        () => (
            <MiniCategoryList
                miniCategories={subCategoryOptions ?? []}
                selectedSubCategory={selectedSubCategory}
                onSelect={handleSubCategoryChange}
            />
        ),
        [subCategoryOptions, selectedSubCategory, handleSubCategoryChange],
    );
    const draftNoChargeOrder = useMemo(
        () => ({
            orderType: order.orderType,
            items: order.items.map((item) => ({
                lineKey: item.lineKey,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
            })),
        }),
        [order.orderType, order.items],
    );

    const OrderActionButtons = useMemo(
        () =>
            order.items.length > 0 ? (
                <div className="absolute bg-white bottom-0 inset-x-0 flex">
                    <div className="flex w-full border-t p-3 px-4">
                        <div className="ml-auto flex gap-2">
                            <DraftOrderChargeWaiver
                                vatAmount={vatAmount}
                                serviceChargeAmount={serviceChargeAmount}
                                tipAmount={tipAmount}
                                customChargesAmount={customChargesAmount}
                                pendingWaiver={pendingWaiver}
                                onApply={setPendingWaiver}
                                onClear={() => setPendingWaiver(null)}
                            />
                            {order.orderType === 'ROOM' ? (
                                <RoomComp
                                    checked={roomCompEnabled}
                                    onCheckedChange={setRoomCompEnabled}
                                />
                            ) : (
                                <NoCharge
                                    mode="draft"
                                    order={draftNoChargeOrder}
                                    draftComplimentary={pendingComplimentary}
                                    onDraftApply={setPendingComplimentary}
                                    onDraftClear={() =>
                                        setPendingComplimentary(null)
                                    }
                                />
                            )}
                            <OrderDiscount
                                order={order}
                                mode="draft"
                                bill={discountBill}
                                draftDiscount={pendingDiscount}
                                onDraftApply={setPendingDiscount}
                                onDraftClear={() => setPendingDiscount(null)}
                            />
                            <Button
                                size="sm"
                                variant={'outline'}
                                onClick={() => handleSaveOrder()}
                                disabled={isLoadingSave}
                                className="border-hexbrand text-hexbrand"
                            >
                                {isLoadingSave ? (
                                    <LoaderCircle className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                                {isLoadingSave ? 'Saving...' : 'Save'}
                            </Button>
                        </div>

                        {/* <PaymentActionCell
                            order={order}
                            mode="create"
                            resetParentStep={onOrderComplete}
                            trigger={
                                <Button
                                    size={'sm'}
                                    className="w-fill px-4 text-white bg-orion-blue hover:bg-orion-blue/80"
                                >
                                    Make Payment
                                </Button>
                            }
                        /> */}
                    </div>
                </div>
            ) : null,
        [
            handleSaveOrder,
            order.items.length,
            order.orderType,
            isLoadingSave,
            draftNoChargeOrder,
            pendingComplimentary,
            roomCompEnabled,
            pendingWaiver,
            pendingDiscount,
            discountBill,
            order,
            onOrderComplete,
            vatAmount,
            serviceChargeAmount,
            tipAmount,
            customChargesAmount,
        ],
    );

    return (
        <PageWrapper className="gap-2 pt-4">
            {showForcedStartModal && (
                <WorkPeriodForcedStartModal
                    isOpen={showForcedStartModal}
                    onClose={() => setShowForcedStartModal(false)}
                    areaName={computedAreaName}
                    isLoading={isStartingPeriod}
                    isStarted={isWorkPeriodStarted}
                    onStart={async () => {
                        setIsStartingPeriod(true);
                        try {
                            const isFastFood = order.orderType === 'FAST_FOOD';
                            const areaId = isFastFood
                                ? undefined
                                : Number(dineAreaId);
                            const areaType = isFastFood
                                ? 'FAST_FOOD'
                                : 'DINE_AREA';

                            const result = await startWorkPeriod(
                                new Date().toISOString(),
                                areaType,
                                areaId,
                            );

                            if (result.error) {
                                toast.custom(() => (
                                    <Toast
                                        title="Error"
                                        description={result.error}
                                        type="error"
                                    />
                                ));
                            } else {
                                setIsWorkPeriodStarted(true);
                                await mutate('/restaurants/work-period');
                            }
                        } finally {
                            setIsStartingPeriod(false);
                        }
                    }}
                    onFinalSave={() => {
                        setShowForcedStartModal(false);
                        handleSaveOrder(true);
                    }}
                />
            )}
            <PageHeader>
                <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={goBack}
                            variant={'ghost'}
                            size={'icon'}
                        >
                            <ArrowLeft />
                        </Button>
                        <h1 className="font-medium text-xl">Food Menu</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-[250px]">
                            <SearchInput
                                className="bg-white h-9"
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder="Search menu..."
                            />
                        </div>
                        <CustomSheet
                            title="View Cart"
                            subTitle={
                                order.waiter?.fullName
                                    ? `Waiter: ${order.waiter.fullName}`
                                    : undefined
                            }
                            trigger={
                                <Button
                                    size={'icon'}
                                    className="ml-4 hover:bg-white relative hover:rexr-black xl:hidden bg-white rounded-full shadow-none border text-gray-400"
                                >
                                    <ShoppingCart size={18} />
                                    {order.items.length > 0 && (
                                        <Badge className="absolute rounded-full w-6 h-6 flex items-center justify-center -top-3 -right-2 bg-hexbrand">
                                            {order.items.length}
                                        </Badge>
                                    )}
                                </Button>
                            }
                        >
                            {pendingWaiver &&
                                (pendingWaiver.vat ||
                                    pendingWaiver.serviceCharge ||
                                    pendingWaiver.tip ||
                                    pendingWaiver.customCharges) && (
                                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3 text-xs text-orange-900 flex justify-between items-center">
                                        <div>
                                            <span className="font-semibold text-orange-800">
                                                Draft Charge Waiver Active
                                            </span>
                                            <p className="text-[11px] text-orange-700 mt-0.5">
                                                {[
                                                    pendingWaiver.vat && 'VAT',
                                                    pendingWaiver.serviceCharge &&
                                                        'Service Charge',
                                                    pendingWaiver.tip && 'Tip',
                                                    pendingWaiver.customCharges &&
                                                        'Custom Charges',
                                                ]
                                                    .filter(Boolean)
                                                    .join(', ')}{' '}
                                                waived
                                                {pendingWaiver.waiverReason
                                                    ? ` • Reason: ${pendingWaiver.waiverReason}`
                                                    : ''}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() =>
                                                setPendingWaiver(null)
                                            }
                                            className="text-xs text-orange-700 underline font-medium hover:text-orange-900"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                )}
                            {draftDiscountNotice}
                            <ItemsTable
                                title="Items Ordered:"
                                columns={ItemOrderColumns}
                                items={order.items}
                                totalValue={totalWithVat}
                                showTotal
                                currencyPrefix="₦"
                                breakdownRows={cartBreakdownRows}
                                emptyMessage="Once you select any food it will show here"
                            />
                            <div className="mt-4 flex flex-col gap-2">
                                {order.items.length > 0 && (
                                    <>
                                        <DraftOrderChargeWaiver
                                            vatAmount={vatAmount}
                                            serviceChargeAmount={
                                                serviceChargeAmount
                                            }
                                            tipAmount={tipAmount}
                                            customChargesAmount={
                                                customChargesAmount
                                            }
                                            pendingWaiver={pendingWaiver}
                                            onApply={setPendingWaiver}
                                            onClear={() =>
                                                setPendingWaiver(null)
                                            }
                                        />
                                        {order.orderType === 'ROOM' ? (
                                            <RoomComp
                                                checked={roomCompEnabled}
                                                onCheckedChange={
                                                    setRoomCompEnabled
                                                }
                                            />
                                        ) : (
                                            <NoCharge
                                                mode="draft"
                                                order={draftNoChargeOrder}
                                                draftComplimentary={
                                                    pendingComplimentary
                                                }
                                                onDraftApply={
                                                    setPendingComplimentary
                                                }
                                                onDraftClear={() =>
                                                    setPendingComplimentary(
                                                        null,
                                                    )
                                                }
                                            />
                                        )}
                                        <OrderDiscount
                                            order={order}
                                            mode="draft"
                                            bill={discountBill}
                                            draftDiscount={pendingDiscount}
                                            onDraftApply={setPendingDiscount}
                                            onDraftClear={() =>
                                                setPendingDiscount(null)
                                            }
                                        />
                                        <VoidOrder
                                            order={order}
                                            onSuccess={onOrderComplete}
                                        />
                                        <Button
                                            size="sm"
                                            variant={'outline'}
                                            onClick={() => handleSaveOrder()}
                                            disabled={isLoadingSave}
                                            className="border-hexbrand text-hexbrand w-full"
                                        >
                                            {isLoadingSave ? (
                                                <LoaderCircle className="w-4 h-4 animate-spin mr-2" />
                                            ) : (
                                                <Send className="w-4 h-4 mr-2" />
                                            )}
                                            {isLoadingSave
                                                ? 'Saving...'
                                                : 'Save'}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </CustomSheet>
                    </div>
                </div>
            </PageHeader>
            <div className="space-y-2">
                {/* Menu Switcher - Show when multiple menus are available */}
                {availableMenus.length > 1 && (
                    <div className="pb-3 border-b">
                        <div className="flex items-center gap-2 flex-wrap">
                            <button
                                onClick={() => {
                                    setSelectedMenuId('all');
                                    setSelectedCategory('');
                                    setSelectedSubCategory('');
                                }}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                                    selectedMenuId === 'all'
                                        ? 'bg-hexbrand text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                All Menus
                            </button>
                            {availableMenus.map((menu: any) => (
                                <button
                                    key={menu.id}
                                    onClick={() => {
                                        setSelectedMenuId(menu.id);
                                        setSelectedCategory('');
                                        setSelectedSubCategory('');
                                    }}
                                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                                        selectedMenuId === menu.id
                                            ? 'bg-hexbrand text-white shadow-md'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {menu.name || `Menu ${menu.id}`}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                {searchQuery.trim() && (
                    <div className="py-2 mt-2 text-sm text-gray-600">
                        {Array.isArray(filteredItems) &&
                            (filteredItems.length > 0
                                ? `Found ${filteredItems.length} item${filteredItems.length === 1 ? '' : 's'} matching "${searchQuery}"`
                                : `No items found matching "${searchQuery}"`)}
                    </div>
                )}
            </div>
            <div className="mb-20">
                {!isReady && loader}
                {isReady && (
                    <Tabs
                        defaultValue={categoryOptions[0].value ?? ''}
                        value={selectedCategory}
                        onValueChange={setSelectedCategory}
                        className="w-full h-full md:h-[550px] 2xl:h-[1000px]"
                    >
                        <ScrollableTabs categoryOptions={categoryOptions} />
                        <TabsContent
                            className="h-full relative w-full rounded-lg shadow-none border bg-white mt-1"
                            value={selectedCategory}
                        >
                            <div className="h-full w-full flex gap-4 p-4">
                                <div
                                    className="flex flex-col gap-3 w-full
                             md:w-[650px] 2xl:w-[1240px]"
                                >
                                    {selectedCategory && (
                                        <>
                                            <div>
                                                {isLoadingSubcategories ? (
                                                    <div className="h-8 w-full animate-pulse bg-gray-200 rounded" />
                                                ) : (
                                                    MiniCategoryListMemo
                                                )}
                                            </div>
                                            {selectedSubCategory !== '' && (
                                                <hr className="my-2" />
                                            )}
                                        </>
                                    )}
                                    <ScrollArea className="h-[calc(100vh-200px)] mb-10">
                                        <MenuItemGrid
                                            items={
                                                Array.isArray(filteredItems)
                                                    ? filteredItems
                                                    : (filteredItems as any)
                                                          ?.data || []
                                            }
                                            addItem={addItem}
                                            handleQuantityChange={
                                                handleQuantityChange
                                            }
                                            order={order}
                                        />
                                    </ScrollArea>
                                </div>
                                <div className="flex-col gap-2 flex-1 hidden xl:flex">
                                    {isRestaurantOrder && tipRate > 0 && (
                                        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg mb-2">
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-gray-700">
                                                    Include Tip
                                                </label>
                                                <p className="text-xs text-gray-500">
                                                    Add {tipRate.toFixed(2)}%
                                                    tip to the order
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setIncludeTip(!includeTip)
                                                }
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orion-blue focus:ring-offset-2 ${
                                                    includeTip
                                                        ? 'bg-orion-blue'
                                                        : 'bg-gray-200'
                                                }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                        includeTip
                                                            ? 'translate-x-6'
                                                            : 'translate-x-1'
                                                    }`}
                                                />
                                            </button>
                                        </div>
                                    )}
                                    {pendingWaiver &&
                                        (pendingWaiver.vat ||
                                            pendingWaiver.serviceCharge ||
                                            pendingWaiver.tip ||
                                            pendingWaiver.customCharges) && (
                                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3 text-xs text-orange-900 flex justify-between items-center">
                                                <div>
                                                    <span className="font-semibold text-orange-800">
                                                        Draft Charge Waiver
                                                        Active
                                                    </span>
                                                    <p className="text-[11px] text-orange-700 mt-0.5">
                                                        {[
                                                            pendingWaiver.vat &&
                                                                'VAT',
                                                            pendingWaiver.serviceCharge &&
                                                                'Service Charge',
                                                            pendingWaiver.tip &&
                                                                'Tip',
                                                            pendingWaiver.customCharges &&
                                                                'Custom Charges',
                                                        ]
                                                            .filter(Boolean)
                                                            .join(', ')}{' '}
                                                        waived
                                                        {pendingWaiver.waiverReason
                                                            ? ` • Reason: ${pendingWaiver.waiverReason}`
                                                            : ''}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() =>
                                                        setPendingWaiver(null)
                                                    }
                                                    className="text-xs text-orange-700 underline font-medium hover:text-orange-900"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        )}
                                    {draftDiscountNotice}
                                    <ItemsTable
                                        title="Items Ordered:"
                                        columns={ItemOrderColumns}
                                        items={order.items}
                                        totalValue={totalWithVat}
                                        showTotal
                                        currencyPrefix="₦"
                                        breakdownRows={cartBreakdownRows}
                                        emptyMessage="Once you select any food it will show here"
                                    />
                                </div>
                                {OrderActionButtons}
                            </div>
                        </TabsContent>
                    </Tabs>
                )}
            </div>

            {selectedItemForModifiers && (
                <ModifierSelectionDialog
                    open={modifierDialogOpen}
                    onOpenChange={setModifierDialogOpen}
                    modifierGroups={
                        selectedItemForModifiers.modifierGroups || []
                    }
                    itemName={selectedItemForModifiers.name}
                    basePrice={selectedItemForModifiers.price}
                    onConfirm={handleModifierConfirm}
                />
            )}
        </PageWrapper>
    );
};

export default FoodMenuComponent;
