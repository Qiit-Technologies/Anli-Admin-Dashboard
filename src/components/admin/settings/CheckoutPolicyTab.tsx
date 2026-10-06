/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Toast from '@/components/toast';
import { getCheckoutPolicy, updateCheckoutPolicy } from '@/app/actions/hotel';
import toast from 'react-hot-toast';

type FeeType = 'FIXED' | 'PERCENTAGE';

type PolicyForm = {
    defaultCheckoutTime: string;
    overstayThresholdMinutes: number;
    overstayEnabled: boolean;
    overstayFeeType: FeeType;
    overstayFeeAmount: number;
    requireUnpaidOrdersSettledOnShiftEnd: boolean;
};

export default function CheckoutPolicySettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<PolicyForm>({
        defaultCheckoutTime: '12:00',
        overstayThresholdMinutes: 0,
        overstayEnabled: false,
        overstayFeeType: 'FIXED',
        overstayFeeAmount: 0,
        requireUnpaidOrdersSettledOnShiftEnd: false,
    });
    const [initialForm, setInitialForm] = useState<PolicyForm>(form);

    const errors = useMemo(() => {
        const e: Partial<Record<keyof PolicyForm, string>> = {};
        if (!form.defaultCheckoutTime) e.defaultCheckoutTime = 'Required';

        if (
            form.overstayThresholdMinutes < 0 ||
            !Number.isFinite(form.overstayThresholdMinutes)
        ) {
            e.overstayThresholdMinutes = 'Must be a non-negative number';
        }

        if (form.overstayEnabled) {
            if (form.overstayFeeType === 'FIXED') {
                if (
                    form.overstayFeeAmount < 0 ||
                    !Number.isFinite(form.overstayFeeAmount)
                ) {
                    e.overstayFeeAmount = 'Must be a non-negative number';
                }
            } else if (
                !Number.isFinite(form.overstayFeeAmount) ||
                form.overstayFeeAmount < 0 ||
                form.overstayFeeAmount > 100
            ) {
                e.overstayFeeAmount = 'Percentage must be between 0 and 100';
            }
        }

        return e;
    }, [form]);

    const isDirty = useMemo(
        () => JSON.stringify(form) !== JSON.stringify(initialForm),
        [form, initialForm],
    );

    const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

    const loadPolicy = async () => {
        setLoading(true);
        const res = await getCheckoutPolicy();
        if ((res as any).data) {
            const data = (res as any).data;
            const next: PolicyForm = {
                defaultCheckoutTime: data.defaultCheckoutTime || '12:00',
                overstayThresholdMinutes: Number(
                    data.overstayThresholdMinutes || 0,
                ),
                overstayEnabled: Boolean(data.overstayEnabled || false),
                overstayFeeType: (data.overstayFeeType as FeeType) || 'FIXED',
                overstayFeeAmount: Number(data.overstayFeeAmount || 0),
                requireUnpaidOrdersSettledOnShiftEnd: Boolean(
                    data.requireUnpaidOrdersSettledOnShiftEnd,
                ),
            };
            setForm(next);
            setInitialForm(next);
        } else if ((res as any).error) {
            toast.custom(() => (
                <Toast title="Error" description={''} type="error" />
            ));
        }
        setLoading(false);
    };

    useEffect(() => {
        loadPolicy();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSave = async () => {
        if (!isValid || !isDirty) return;
        setSaving(true);
        const res = await updateCheckoutPolicy(form);
        if ((res as any).data) {
            setInitialForm(form);
            toast.custom(() => (
                <Toast
                    title="Success"
                    description={'Checkout policy updated'}
                    type="success"
                />
            ));
        } else {
            toast.custom(() => (
                <Toast
                    title="Error"
                    description={'An Error Occurred'}
                    type="error"
                />
            ));
        }
        setSaving(false);
    };

    return (
        <div className="p-4">
            {/* // <PageWrapper> */}
            {loading ? (
                <div className="grid gap-6 max-w-3xl">
                    <Card>
                        <CardHeader>
                            <div className="h-5 w-40 bg-muted animate-pulse rounded" />
                            <div className="h-4 w-64 bg-muted animate-pulse rounded mt-2" />
                        </CardHeader>
                        <CardContent>
                            <div className="h-9 w-52 bg-muted animate-pulse rounded" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <div className="h-5 w-48 bg-muted animate-pulse rounded" />
                            <div className="h-4 w-72 bg-muted animate-pulse rounded mt-2" />
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="h-9 bg-muted animate-pulse rounded" />
                                <div className="h-9 bg-muted animate-pulse rounded" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Checkout Window</CardTitle>
                            <CardDescription>
                                Guests should check out by the default time
                                below unless extended.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-2">
                                <Label>Default Checkout Time</Label>
                                <Input
                                    type="time"
                                    value={form.defaultCheckoutTime}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            defaultCheckoutTime: e.target.value,
                                        })
                                    }
                                />
                                {errors.defaultCheckoutTime && (
                                    <p className="text-sm text-destructive">
                                        {errors.defaultCheckoutTime}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Overstay Rules</CardTitle>
                            <CardDescription>
                                Configure when an overstay applies and whether
                                it is enforced.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label>Enable Overstay</Label>
                                    <Select
                                        value={
                                            form.overstayEnabled
                                                ? 'true'
                                                : 'false'
                                        }
                                        onValueChange={(v) =>
                                            setForm({
                                                ...form,
                                                overstayEnabled: v === 'true',
                                            })
                                        }
                                    >
                                        <SelectTrigger className="w-[220px]">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="true">
                                                Enabled
                                            </SelectItem>
                                            <SelectItem value="false">
                                                Disabled
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {!form.overstayEnabled && (
                                        <p className="text-sm text-muted-foreground">
                                            Overstay fees will not be applied
                                            when disabled.
                                        </p>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label>Overstay Threshold (minutes)</Label>
                                    <Input
                                        type="text"
                                        min={0}
                                        step={1}
                                        value={form.overstayThresholdMinutes}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                overstayThresholdMinutes:
                                                    Number(e.target.value || 0),
                                            })
                                        }
                                        disabled={!form.overstayEnabled}
                                    />
                                    {errors.overstayThresholdMinutes && (
                                        <p className="text-sm text-destructive">
                                            {errors.overstayThresholdMinutes}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Work Period Settlement Rule</CardTitle>
                            <CardDescription>
                                Decide whether open unpaid orders must be
                                resolved before ending a work period.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-2">
                                <Label>
                                    Require unpaid orders to be settled before
                                    shift end
                                </Label>
                                <Select
                                    value={
                                        form.requireUnpaidOrdersSettledOnShiftEnd
                                            ? 'true'
                                            : 'false'
                                    }
                                    onValueChange={(v) =>
                                        setForm({
                                            ...form,
                                            requireUnpaidOrdersSettledOnShiftEnd:
                                                v === 'true',
                                        })
                                    }
                                >
                                    <SelectTrigger className="w-[320px]">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="true">
                                            Enabled (block end period when
                                            unpaid orders remain)
                                        </SelectItem>
                                        <SelectItem value="false">
                                            Disabled (keep current behavior)
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Overstay Fees</CardTitle>
                            <CardDescription>
                                Choose a fixed amount or a percentage of the
                                base rate.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label>Overstay Fee Type</Label>
                                    <Select
                                        value={form.overstayFeeType}
                                        onValueChange={(v) =>
                                            setForm({
                                                ...form,
                                                overstayFeeType: v as FeeType,
                                            })
                                        }
                                        disabled={!form.overstayEnabled}
                                    >
                                        <SelectTrigger className="w-[220px]">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="FIXED">
                                                Fixed
                                            </SelectItem>
                                            <SelectItem value="PERCENTAGE">
                                                Percentage
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <Label>
                                        {form.overstayFeeType === 'PERCENTAGE'
                                            ? 'Overstay Fee (%)'
                                            : 'Overstay Fee Amount'}
                                    </Label>
                                    <Input
                                        type="text"
                                        min={0}
                                        step={
                                            form.overstayFeeType ===
                                            'PERCENTAGE'
                                                ? 0.01
                                                : 1
                                        }
                                        value={form.overstayFeeAmount}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                overstayFeeAmount: Number(
                                                    e.target.value || 0,
                                                ),
                                            })
                                        }
                                        disabled={!form.overstayEnabled}
                                    />
                                    {errors.overstayFeeAmount && (
                                        <p className="text-sm text-destructive">
                                            {errors.overstayFeeAmount}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                        <Separator />
                        <CardFooter className="flex mt-4 items-center justify-between gap-2">
                            <div className="text-sm text-muted-foreground">
                                {isDirty
                                    ? 'You have unsaved changes.'
                                    : 'All changes saved.'}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    className="bg-orion-blue"
                                    onClick={handleSave}
                                    disabled={!isDirty || !isValid || saving}
                                >
                                    {saving ? 'Saving…' : 'Save changes'}
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </div>
        // </PageWrapper>
    );
}
