'use client';

import MenuItemsTable from '../../shared/MenuItemsTable';
import { MenuPackageWizardState } from '../types';

interface StepProps {
    state: MenuPackageWizardState;
    onChange: <K extends keyof MenuPackageWizardState>(
        field: K,
        value: MenuPackageWizardState[K],
    ) => void;
}

export default function SelectMenuItemsStep({ state, onChange }: StepProps) {
    const toggle = (id: number, selected: boolean) => {
        const next = selected
            ? [...state.selectedMenuItemIds, id]
            : state.selectedMenuItemIds.filter((x) => x !== id);
        onChange('selectedMenuItemIds', next);
    };

    return (
        <MenuItemsTable
            mode="select"
            selectedIds={state.selectedMenuItemIds}
            onToggleItem={toggle}
        />
    );
}
