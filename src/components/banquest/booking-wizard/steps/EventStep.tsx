'use client';

import { InputField, SelectField } from '@/components/common/Form';
import { Textarea } from '@/components/ui/textarea';
import { useCallback, useEffect, useMemo, useState } from 'react';
import CategoryChips from '../CategoryChips';
import {
    DEFAULT_EVENT_TYPES,
    EVENT_CATEGORIES,
    EVENT_TYPE_OTHER_VALUE,
} from '../constants';
import {
    loadCustomEventTypes,
    saveCustomEventType,
} from '../custom-event-types';
import SectionHeader from '../SectionHeader';
import { BanquetWizardState } from '../types';

interface EventStepProps {
    state: BanquetWizardState;
    onChange: <K extends keyof BanquetWizardState>(
        field: K,
        value: BanquetWizardState[K],
    ) => void;
}

const DEFAULT_EVENT_TYPE_VALUES = new Set(
    DEFAULT_EVENT_TYPES.map((type) => type.value),
);

function mergeCustomEventTypes(
    stored: string[],
    currentType?: string,
): string[] {
    if (
        !currentType ||
        DEFAULT_EVENT_TYPE_VALUES.has(currentType) ||
        currentType === EVENT_TYPE_OTHER_VALUE
    ) {
        return stored;
    }

    if (
        stored.some(
            (eventType) =>
                eventType.toLowerCase() === currentType.toLowerCase(),
        )
    ) {
        return stored;
    }

    return [...stored, currentType];
}

export default function EventStep({
    state,
    onChange,
}: Readonly<EventStepProps>) {
    const [customEventTypes, setCustomEventTypes] = useState<string[]>([]);

    useEffect(() => {
        const stored = loadCustomEventTypes();
        setCustomEventTypes(mergeCustomEventTypes(stored, state.eventType));
    }, [state.eventType]);

    const eventTypeOptions = useMemo(() => {
        const customOptions = customEventTypes.map((name) => ({
            value: name,
            label: name,
        }));

        return [
            ...DEFAULT_EVENT_TYPES,
            ...customOptions,
            { value: EVENT_TYPE_OTHER_VALUE, label: 'Other' },
        ];
    }, [customEventTypes]);

    const handleOtherEventTypeCommit = useCallback(() => {
        const name = state.eventTypeOther.trim();
        if (!name) return;

        const updated = saveCustomEventType(name);
        setCustomEventTypes(updated);
        onChange('eventType', name);
        onChange('eventTypeOther', '');
    }, [onChange, state.eventTypeOther]);

    const showOtherEventTypeInput =
        state.eventType === EVENT_TYPE_OTHER_VALUE;

    return (
        <div className="flex flex-col gap-8">
            <section>
                <div className="grid gap-4 md:grid-cols-3">
                    <InputField
                        id="eventName"
                        name="eventName"
                        label="Enter Event"
                        value={state.eventName}
                        onChange={(e) => onChange('eventName', e.target.value)}
                        required
                        className="bg-transparent min-h-[59px] rounded-8px shadow-none border border-[#D5D4D4] focus:ring-0 focus:border-none"
                    />
                    <div className="flex flex-col gap-2">
                        <SelectField
                            id="eventType"
                            name="eventType"
                            label="Event type"
                            value={state.eventType}
                            onValueChange={(v) => onChange('eventType', v)}
                            options={eventTypeOptions}
                            required
                            className="bg-transparent min-h-[59px] rounded-8px shadow-none border border-[#D5D4D4] focus:ring-0 focus:border-none"
                        />
                        {showOtherEventTypeInput ? (
                            <input
                                type="text"
                                placeholder="Enter event type"
                                value={state.eventTypeOther}
                                onChange={(e) =>
                                    onChange('eventTypeOther', e.target.value)
                                }
                                onBlur={handleOtherEventTypeCommit}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleOtherEventTypeCommit();
                                    }
                                }}
                                className="h-9 rounded-md border border-[#D5D4D4] px-3 text-sm"
                            />
                        ) : null}
                    </div>
                    <InputField
                        id="eventVenue"
                        name="eventVenue"
                        label="Venue"
                        value={state.eventVenue}
                        onChange={(e) => onChange('eventVenue', e.target.value)}
                        required
                        className="bg-transparent min-h-[59px] rounded-8px shadow-none border border-[#D5D4D4] focus:ring-0 focus:border-none"
                    />
                    <InputField
                        id="eventDate"
                        name="eventDate"
                        label="Event date"
                        type="date"
                        value={state.eventDate}
                        onChange={(e) => onChange('eventDate', e.target.value)}
                        required
                        className="bg-transparent min-h-[59px] rounded-8px shadow-none border border-[#D5D4D4] focus:ring-0 focus:border-none"
                    />
                    <InputField
                        id="eventTime"
                        name="eventTime"
                        label="Event time"
                        type="time"
                        value={state.eventTime}
                        onChange={(e) => onChange('eventTime', e.target.value)}
                        required
                        className="bg-transparent min-h-[59px] rounded-8px shadow-none border border-[#D5D4D4] focus:ring-0 focus:border-none"
                    />
                    <InputField
                        id="eventEndTime"
                        name="eventEndTime"
                        label="Event end time"
                        type="time"
                        value={state.eventEndTime}
                        onChange={(e) =>
                            onChange('eventEndTime', e.target.value)
                        }
                        className="bg-transparent min-h-[59px] rounded-8px shadow-none border border-[#D5D4D4] focus:ring-0 focus:border-none"
                    />
                    <InputField
                        id="estimatedGuestCount"
                        name="estimatedGuestCount"
                        label="Estimated guest count"
                        type="number"
                        min="0"
                        value={state.estimatedGuestCount}
                        onChange={(e) =>
                            onChange('estimatedGuestCount', e.target.value)
                        }
                        className="bg-transparent min-h-[59px] rounded-8px shadow-none border border-[#D5D4D4] focus:ring-0 focus:border-none"
                    />
                    <InputField
                        id="setupTime"
                        name="setupTime"
                        label="Setup time"
                        type="time"
                        value={state.setupTime}
                        onChange={(e) => onChange('setupTime', e.target.value)}
                        className="bg-transparent min-h-[59px] rounded-8px shadow-none border border-[#D5D4D4] focus:ring-0 focus:border-none"
                    />
                    <InputField
                        id="teardownTime"
                        name="teardownTime"
                        label="Teardown time"
                        type="time"
                        value={state.teardownTime}
                        onChange={(e) =>
                            onChange('teardownTime', e.target.value)
                        }
                        className="bg-transparent min-h-[59px] rounded-8px shadow-none border border-[#D5D4D4] focus:ring-0 focus:border-none"
                    />
                </div>
            </section>
            <section>
                <SectionHeader
                    title="Event Category (optional)"
                    subtitle="Select a predefined category or choose other to add your own."
                />
                <div className="mt-4" />
                <CategoryChips
                    options={EVENT_CATEGORIES}
                    value={state.eventCategory}
                    onChange={(v) => onChange('eventCategory', v)}
                    otherValue={state.eventCategoryOther}
                    onOtherChange={(v) => onChange('eventCategoryOther', v)}
                />
            </section>
            <section>
                <SectionHeader
                    title="Event Description (optional)"
                    subtitle="Add notes about the event setup or requirements"
                />
                <div className="mt-4" />
                <Textarea
                    id="eventDescription"
                    rows={4}
                    placeholder="Add notes about the event setup or requirements"
                    value={state.eventDescription}
                    onChange={(e) =>
                        onChange('eventDescription', e.target.value)
                    }
                />
            </section>
        </div>
    );
}
