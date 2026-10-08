'use client';

import { getAllMenuItemMappings, syncMenuMappings } from '@/app/actions/sales-unit-mapping';
import {
    HeaderActions,
    PageHeader,
    PageHeadertitle,
} from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { NotificationsPopover } from '@/components/house-keeping/common/Notification';
import SearchInput from '@/components/house-keeping/common/SearchInput';
import {
    salesUnitMappingColumns,
    salesUnitMappingFilters,
    SalesUnitMappingProps,
} from '@/components/stock/tables/columns/ssales-unit-mapping';
import StockItemTable from '@/components/stock/tables/StockItemTable';
import { Button } from '@/components/ui/button';
import Toast from '@/components/toast';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import useSWR, { mutate } from 'swr';
import { RefreshCw } from 'lucide-react';

const SalesUnitMapping = () => {
    const { data: mappingsResponse } = useSWR(
        '/items/menu-item-mappings',
        getAllMenuItemMappings,
    );
    const [syncing, setSyncing] = useState(false);

    const handleSync = async () => {
        setSyncing(true);
        try {
            const result = await syncMenuMappings();
            if ('error' in result && result.error) {
                toast.custom(() => (
                    <Toast
                        title="Sync not completed"
                        description={result.error as string}
                        type="error"
                    />
                ));
                return;
            }
            await mutate('/items/menu-item-mappings');
            toast.custom(() => (
                <Toast
                    title="Menu synced"
                    description={
                        (result as { message?: string }).message ||
                        'Mappings were auto-populated from the POS menu. Auto rows are flagged and can still be edited manually.'
                    }
                    type="success"
                />
            ));
        } catch (err) {
            toast.custom(() => (
                <Toast
                    title="Sync failed"
                    description={
                        err instanceof Error ? err.message : 'Please try again.'
                    }
                    type="error"
                />
            ));
        } finally {
            setSyncing(false);
        }
    };

    // Group mappings by menuItemId to show all inventory items in one row
    const groupedMappings = useMemo(() => {
        const rawMappings =
            (mappingsResponse?.data as SalesUnitMappingProps[]) ?? [];

        // Group by menuItemId
        const grouped = rawMappings.reduce(
            (acc, mapping) => {
                const menuItemId = mapping.menuItem?.id;
                if (!menuItemId) return acc;

                if (!acc[menuItemId]) {
                    // First mapping for this menu item - use as base
                    acc[menuItemId] = {
                        ...mapping,
                        inventoryItems: [mapping.inventoryItem],
                        quantities: [mapping.quantityPerSale],
                        baseUnits: [
                            mapping.inventoryItem?.baseUnit ||
                                mapping.inventoryItem?.unitOfMeasurement ||
                                'unit',
                        ],
                        costPrices: [mapping.inventoryItem?.costPrice || 0],
                    };
                } else {
                    // Additional inventory items for same menu item
                    acc[menuItemId].inventoryItems.push(mapping.inventoryItem);
                    acc[menuItemId].quantities.push(mapping.quantityPerSale);
                    acc[menuItemId].baseUnits.push(
                        mapping.inventoryItem?.baseUnit ||
                            mapping.inventoryItem?.unitOfMeasurement ||
                            'unit',
                    );
                    acc[menuItemId].costPrices.push(
                        mapping.inventoryItem?.costPrice || 0,
                    );
                }

                return acc;
            },
            {} as Record<
                number,
                SalesUnitMappingProps & {
                    inventoryItems: Array<{
                        id: number;
                        name: string;
                        baseUnit?: string;
                        costPrice?: number;
                        quantity?: number;
                        stockDate?: string;
                        expiryDate?: string;
                    }>;
                    quantities: number[];
                    baseUnits: string[];
                    costPrices: number[];
                }
            >,
        );

        return Object.values(grouped);
    }, [mappingsResponse]);

    const mappings: SalesUnitMappingProps[] = groupedMappings;

    return (
        <div className="flex flex-col h-full overflow-auto bg-gray-50/50">
            <PageHeader>
                <PageHeadertitle
                    title="Sales Unit Mapping"
                    subtitle="View all menu item to inventory item mappings"
                />
                <HeaderActions />
            </PageHeader>
            <PageWrapper>
                <div className="flex w-full gap-3">
                    <Button
                        variant={'outline'}
                        className="border-orion-blue text-orion-blue"
                        onClick={handleSync}
                        disabled={syncing}
                    >
                        <RefreshCw
                            className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`}
                        />
                        {syncing ? 'Syncing…' : 'Sync from POS Menu'}
                    </Button>
                    <Link href={'/stock/sales-unit-mapping/create'}>
                        <Button
                            variant={'outline'}
                            className="border-orion-blue text-orion-blue"
                        >
                            Add new mapping
                        </Button>
                    </Link>
                </div>
                <div>
                    <StockItemTable
                        data={mappings}
                        columns={salesUnitMappingColumns}
                        filters={salesUnitMappingFilters}
                        hasStickyAction
                        title="Sales Unit Mappings"
                    />
                </div>
            </PageWrapper>
        </div>
    );
};

export default SalesUnitMapping;

/**
 Functional Requirements Document (FRD)
Module: Sales Unit Mapping
System: Restaurant & Bar Inventory Management System
Purpose:
The Sales Unit Mapping module defines the relationship between items as they are purchased in inventory units and sold in sales units. It ensures accurate real-time stock depletion, cost calculation, and profit tracking by mapping conversion factors between these two units.
1. Functional Overview
The Sales Unit Mapping page bridges the gap between the Inventory Module and the Sales Module.
 It allows the stock manager to:
Define how many sales units exist in one inventory unit (e.g., 1 bottle = 12.5 shots).


Automatically calculate cost per sales unit and expected profit.


Enable real-time inventory depletion when items are sold through the POS.


Provide transparency for each item’s inventory cost, selling price, conversion rate, and profitability.


This ensures that the cost of goods sold (COGS), inventory value, and profit margin are accurately reported.
2. Functional Requirements
Feature
Description
Add/Edit Item Mapping
Users can create or edit mappings between inventory units and sales units.
Auto Calculation
The system auto-calculates cost per sales unit, expected sales value, and projected profit based on formulas.
Real-Time Depletion
When a sales unit is sold (via POS), inventory decreases automatically by the equivalent quantity based on the conversion factor.
Profit Projection
Displays total expected sales revenue and projected profit for all available stock.
Expiry Tracking
Tracks expiry dates for perishable items.
Validation
Prevents saving if mandatory fields (Item Name, Conversion Factor, Cost per Unit) are empty.
Integration
Linked directly with the Inventory, Sales Log, and Reports modules for live updates.


3. Data Flow Summary
User Actions → System Processes → Outputs
User enters item details and units (Inventory & Sales Units).


System auto-calculates:


Cost per Sales Unit


Expected Sales Value


Projected Profit


When a sale occurs (POS):


System deducts from inventory in proportion to the sales unit sold.


Updates Inventory Value and Quantity in Stock in real time.


Reports generated:


Total profit projections per item


Variance between expected and actual sales


Expiry and reorder notifications


4. Table: Sales Unit Mapping Fields (Vertical Layout)
Field
Example / Description
Item No
001
Item Name
Tequila
Category
Drinks
Sub Category
Alcohol
Inventory Unit of Measure (use the Base)
Bottle (750ml)
Sales Unit of Measure
Shot (60ml)
Conversion Factor
12.5 Shots (i.e., 1 Bottle = 12.5 Shots)
Cost Per Inventory Unit
₦12,000
Cost Per Sales Unit
₦960 (₦12,000 ÷ 12.5)
Selling Price Per Sales Unit
₦1,440 (₦18,000 ÷ 12.5)
Expected Sales Value
₦360,000 (₦1,440 × (12.5 × 20))
Projected Profit
₦120,000 (₦1,440 × (12.5 × 20) – ₦12,000 × 20)
Stock Date
10/10/2025 (Last restock date of the item)
Expiry Date
12/12/2025


5. Calculation Logic
Formula
Description
Cost Per Sales Unit = Cost Per Inventory Unit ÷ Conversion Factor
Converts inventory unit cost into sales unit cost.
Expected Sales Value = Selling Price Per Sales Unit × Conversion Factor × Quantity in Stock
Calculates total expected revenue.
Projected Profit = Expected Sales Value – (Cost Per Inventory Unit × Quantity in Stock)
Determines profit margin for available stock.
Inventory Value = Cost Per Inventory Unit × Quantity in Stock
Total value of stock on hand.


6. User Experience (UX) Notes
Add Mapping Button: Opens a clean form to input item details and unit relationships.


Auto-Fill: If the item already exists in Inventory, relevant data (Item Name, Category, Cost per Unit) auto-loads.


Color Indicators:


Red: Expired


Orange: Close to expiry (1–3 days)


Yellow: Low stock


Editable Fields: Only non-system-calculated fields can be edited.


Real-Time Link: When an item sells through the POS, quantity automatically updates in stock and recalculates inventory value.


Search & Filter: By Item Name, Category, or Expiry Date.


7. Integration Points
Module
Purpose of Integration
Inventory
Fetch item name, category, cost, and stock levels.
Sales Log
Receive quantity sold and trigger automatic depletion.
Reports
Generate variance, profit, and stock movement reports.
Purchase Log
Update restock quantity and recalculate total sales value.


8. Expected Outputs
Real-time cost and profit insights per sales unit.


Transparent visibility of inventory movement and value.


Consistent stock reconciliation between warehouse, bar, and sales floor.


Automatic profit projections and variance rep

This are the form Fields.
Field Name
Input Type / UX Behavior
Description
Menu Item
🔍 Searchable dropdown (loads all menu items dynamically from the Menu table)
Select the menu item you want to map. Auto-loads name and category.
Inventory Item(s)
Multi-select search with quantity fields
Select one or multiple inventory items (Bread, Egg, Tomato, etc.). Each selected item reveals a “Qty per Sale” and “Base UoM” input.
Inventory UoM (Base)
Auto-filled
Comes from the inventory item definition (e.g. Bottle, Kg, Piece).
Sales UoM
Dropdown / text
Defines how it’s sold (e.g. Shot, Plate, Cup).
Conversion Factor
Numeric field
For measurable conversions (e.g. 1 Bottle = 12.5 Shots).
Qty Used per Sale
Numeric field
For recipes (e.g. 2 eggs, 50g rice, 0.02L oil).
Cost per Inventory Unit (₦)
Auto-filled
Pulled from Inventory database.
Cost per Sales Unit (₦)
Auto-calculated
Formula: Cost per Inventory ÷ Conversion Factor (or sum of ingredient costs).
Selling Price (₦)
Auto-filled from Menu table
The POS selling price.
Expected Profit (₦)
Auto-calculated
Selling Price - Total Ingredient Cost.
Linked Department
Dropdown
Select Bar / Kitchen / Restaurant.
Auto Deduction Rule
Toggle
ON = auto-deduct from inventory on sale.
Last Restock / Expiry
Auto from Inventory
Tracks validity and expiry.
Save / Update
Button
Saves mapping or updates recipe quantities.



This is the Logic, reference for myself, will use it to explain the Logic to Dev
Field Name
Input Type / UX Behavior
Data Source / Autofill Logic
Who Fills It?
Remarks / Example
Menu Item
🔍 Searchable dropdown (dynamic)
Pulls from Menu Table (menu_item_id, menu_name, category, selling_price)
User selects
On selection, it auto-fills the Category and Selling Price below.
Category
Auto-filled text
Comes from the selected Menu Item
System auto-fills
e.g. Drinks, Main Dish, Breakfast, etc.
Selling Price (₦)
Auto-filled numeric
From Menu Table
System auto-fills
From menu selling price (₦2,500 for Tequila Tot, ₦4,500 for Bread/Egg/Sausage, etc.)
Inventory Item(s)
Multi-select dropdown with inline quantity fields
From Inventory Table (inventory_item_id, item_name, unit_of_measure, cost_per_unit)
User selects one or more items
You can select multiple (e.g. Egg, Bread, Sausage, Oil).
Inventory UoM (Base)
Auto-filled
Pulled from the Inventory Item(s) selected
System auto-fills
e.g. Bottle, Crate, Kg, Liter, Piece, etc.
Qty Used per Sale
Numeric input
Manual entry per selected Inventory Item
User fills manually
Defines consumption per sale: e.g. 0.08 Bottle, 2 pcs, 0.02L.
Sales UoM
Dropdown / text
User defines manually
User fills manually
How the item is sold to the customer: Plate, Shot, Cup, etc.
Conversion Factor
Numeric input (optional)
For measurable items only
User fills manually
e.g. 1 Bottle = 12.5 Shots → Conversion Factor = 12.5.
Cost per Inventory Unit (₦)
Auto-filled
Pulled from Inventory Table
System auto-fills
Example: ₦12,000 for Tequila Bottle, ₦3,200 for Egg Crate.
Cost per Sales Unit (₦)
Auto-calculated
Formula: Inventory Cost ÷ Conversion Factor (for measurable) OR Sum(Qty × Unit Cost) (for recipes)
System auto-calculates
Example: Tequila = ₦12,000 ÷ 12.5 = ₦960 per shot.
Expected Profit (₦)
Auto-calculated
Formula: Selling Price - Cost per Sales Unit
System auto-calculates
Tequila Shot ₦2,500 - ₦960 = ₦1,540 profit.
Linked Department
Dropdown
Bar / Kitchen / Restaurant / Others
User selects
Tells where the item will be deducted from inventory.
Auto Deduction Rule
Toggle (Yes/No)
Manual
User toggles
ON = automatically deduct when sold at POS.
Last Restock / Expiry
Auto-filled
Pulled from Inventory Table
System auto-fills
For perishable tracking.
Save / Update
Button
Triggers save/update API
User clicks
Saves mapping for that Menu Item.



How Table Looks like after creation
Item No
Menu Item
Inventory Items & Qty Used per Sale
Inventory UoM (Base)
Sales UoM
Conversion Factor
Cost per Inventory (₦)
Cost per Sales Unit (₦)
Selling Price (₦)
Expected Profit (₦)
Linked Dept
Auto Deduct
Notes
1
Tequila Tot
Tequila – 1/12.5 bottle
Bottle (750ml)
Shot (60ml)
12.5
12,000
960
2,500
1,540
Bar
✅
Deduct 0.08 bottle per sale
2
Bread/Egg/Sausage
Bread – 2 slices, Egg – 2 pcs, Sausage – 1, Oil – 0.02L
Slice / Pc / Litre
Plate
Recipe-based
Bread: ₦100, Egg: ₦200, Sausage: ₦400, Oil: ₦100
800
4,500
3,700
Kitchen
✅
Used for breakfast
3
Coffee
Coffee Powder – 15g, Milk – 100ml, Sugar – 10g
Gram / ml
Cup
Recipe-based
₦60
₦60
1,500
1,440
Kitchen
✅
Deducts from pantry
4
Hot Chocolate
Cocoa Powder – 20g, Milk – 150ml, Sugar – 10g
Gram / ml
Cup
Recipe-based
₦80
₦80
1,500
1,420
Kitchen
✅
Morning beverage
5
Tea
Tea Bag – 1, Milk – 100ml, Sugar – 10g
Piece / ml
Cup
Recipe-based
₦50
₦50
1,500
1,450
Kitchen
✅
Basic tea combo
6
Rice Plate (Jollof)
Rice – 200g, Oil – 0.05L, Tomato – 50g, Spice – 10g
g / L
Plate
Recipe-based
₦350
₦350
3,000
2,650
Kitchen
✅
Jollof plate
7
Toothpaste
Toothpaste – 1 Tube
Tube
Tube
1
2,000
2,000
2,000
0
House Utilities
❌
Not for resale
8
Beer (Heineken)
Beer – 1 Bottle
Bottle (600ml)
Bottle
1
1,000
1,000
2,000
1,000
Bar
✅
Simple direct sale
9
Fried Egg Only
Egg – 2 pcs, Oil – 0.01L, Onion – 10g
Pc / L / g
Plate
Recipe-based
₦180
₦180
2,000
1,820
Kitchen
✅
Deduct 2 eggs per plate
10
Juice (Fresh Orange)
Orange – 5 pcs, Sugar – 20g, Water – 100ml
Pc / g / ml
Glass
Recipe-based
₦250
₦250
2,000
1,750
Kitchen
✅
Freshly squeezed juice



 */
