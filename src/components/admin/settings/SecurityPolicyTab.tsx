'use client';

import { getCheckoutPolicy, updateCheckoutPolicy } from '@/app/actions/hotel';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

const MIN_IDLE_MINUTES = 3;
const MAX_IDLE_MINUTES = 30;

export default function SecurityPolicyTab() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [idleLogoutMinutes, setIdleLogoutMinutes] = useState(3);
    const [initialIdleLogoutMinutes, setInitialIdleLogoutMinutes] = useState(3);

    const validationError = useMemo(() => {
        if (
            !Number.isInteger(idleLogoutMinutes) ||
            idleLogoutMinutes < MIN_IDLE_MINUTES ||
            idleLogoutMinutes > MAX_IDLE_MINUTES
        ) {
            return `Must be an integer between ${MIN_IDLE_MINUTES} and ${MAX_IDLE_MINUTES} minutes`;
        }
        return '';
    }, [idleLogoutMinutes]);

    const isDirty = idleLogoutMinutes !== initialIdleLogoutMinutes;
    const canSave = !validationError && isDirty && !saving;

    const loadPolicy = async () => {
        setLoading(true);
        const res = await getCheckoutPolicy();
        if ('data' in res && res.data) {
            const next = Number(res.data.idleLogoutMinutes || 3);
            setIdleLogoutMinutes(next);
            setInitialIdleLogoutMinutes(next);
        } else {
            toast.custom(() => (
                <Toast
                    title="Error"
                    description="Failed to load security policy"
                    type="error"
                />
            ));
        }
        setLoading(false);
    };

    useEffect(() => {
        loadPolicy();
    }, []);

    const handleSave = async () => {
        if (!canSave) return;
        setSaving(true);
        const res = await updateCheckoutPolicy({ idleLogoutMinutes });
        if ('data' in res && res.data) {
            setInitialIdleLogoutMinutes(idleLogoutMinutes);
            toast.custom(() => (
                <Toast
                    title="Success"
                    description="Security policy updated"
                    type="success"
                />
            ));
        } else {
            toast.custom(() => (
                <Toast
                    title="Error"
                    description="Unable to save security policy"
                    type="error"
                />
            ));
        }
        setSaving(false);
    };

    if (loading) {
        return (
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
            </div>
        );
    }

    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Auto Logout Policy</CardTitle>
                    <CardDescription>
                        Automatically log users out after inactivity to protect
                        guest and financial data.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-2">
                        <Label>Auto Logout After (minutes)</Label>
                        <Input
                            type="number"
                            min={MIN_IDLE_MINUTES}
                            max={MAX_IDLE_MINUTES}
                            step={1}
                            value={idleLogoutMinutes}
                            onChange={(e) =>
                                setIdleLogoutMinutes(Number(e.target.value || 0))
                            }
                            className="w-[220px]"
                        />
                        <p className="text-sm text-muted-foreground">
                            Allowed range: {MIN_IDLE_MINUTES} to{' '}
                            {MAX_IDLE_MINUTES} minutes.
                        </p>
                        {validationError && (
                            <p className="text-sm text-destructive">
                                {validationError}
                            </p>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between gap-2">
                    <div className="text-sm text-muted-foreground">
                        {isDirty ? 'You have unsaved changes.' : 'All changes saved.'}
                    </div>
                    <Button
                        className="bg-orion-blue"
                        onClick={handleSave}
                        disabled={!canSave}
                    >
                        {saving ? 'Saving…' : 'Save changes'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
