'use client';

import {
    ADDITIONAL_ITEMS,
    EVENT_SUITABLE_OPTIONS,
    SERVICE_STYLE_OPTIONS,
    SPECIAL_ADD_ONS,
} from './constants';
import { MenuPackageWizardState } from './types';
import {
    AddOnCheckboxList,
    SelectionCard,
    SelectionCardGroup,
} from '../shared/selection-cards';

interface MenuPackageSidebarProps {
    state: MenuPackageWizardState;
    onChange: <K extends keyof MenuPackageWizardState>(
        field: K,
        value: MenuPackageWizardState[K],
    ) => void;
    showAdditionalItems?: boolean;
}

export default function MenuPackageSidebar({
    state,
    onChange,
    showAdditionalItems = false,
}: MenuPackageSidebarProps) {
    const toggleAddOn = (id: string) => {
        const next = state.specialAddOns.includes(id)
            ? state.specialAddOns.filter((x) => x !== id)
            : [...state.specialAddOns, id];
        onChange('specialAddOns', next);
    };

    return (
        <aside className="flex flex-col gap-4">
            <SelectionCardGroup
                title="Event Suitable"
                hint="Select the type of event this package is suitable for"
            >
                {EVENT_SUITABLE_OPTIONS.map((option) => (
                    <SelectionCard
                        key={option}
                        label={option}
                        selected={state.eventSuitable === option}
                        onSelect={() => onChange('eventSuitable', option)}
                        variant="solid"
                    />
                ))}
            </SelectionCardGroup>

            <SelectionCardGroup
                title="Special Add on"
                hint="Select add-ons available with this package"
            >
                <AddOnCheckboxList
                    items={SPECIAL_ADD_ONS}
                    selected={state.specialAddOns}
                    onToggle={toggleAddOn}
                />
            </SelectionCardGroup>

            <SelectionCardGroup
                title="Service Style"
                hint="Select how this package is served"
            >
                {SERVICE_STYLE_OPTIONS.map((option) => (
                    <SelectionCard
                        key={option}
                        label={option}
                        selected={state.serviceStyle === option}
                        onSelect={() => onChange('serviceStyle', option)}
                    />
                ))}
            </SelectionCardGroup>

            {showAdditionalItems ? (
                <SelectionCardGroup
                    title="Additional Items"
                    hint="Add commonly used items quickly"
                >
                    {ADDITIONAL_ITEMS.map((option) => (
                        <SelectionCard
                            key={option}
                            label={option}
                            selected={state.additionalItem === option}
                            onSelect={() => onChange('additionalItem', option)}
                            variant="solid"
                        />
                    ))}
                </SelectionCardGroup>
            ) : null}
        </aside>
    );
}
