'use client';

import {
    getAdrRevenueSettings,
    patchAdrRevenueSettings,
} from '@/app/actions/hotel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser } from '@/context/useUser';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

export default function AdrRevenueSettingsTab() {
    const { user } = useUser();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [target, setTarget] = useState('');
    const [minFactor, setMinFactor] = useState('');
    const [maxMove, setMaxMove] = useState('');

    const canEdit = useMemo(() => {
        const role = user?.roles?.name?.toLowerCase() ?? '';
        return ['manager', 'administrator', 'general manager'].includes(role);
    }, [user?.roles?.name]);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getAdrRevenueSettings();
            if ('error' in res) {
                toast.error(res.error);
                return;
            }
            const d = res.data;
            setTarget(d.adrTargetAdr != null ? String(d.adrTargetAdr) : '');
            setMinFactor(
                d.adrMinRateFactor != null ? String(d.adrMinRateFactor) : '',
            );
            setMaxMove(
                d.adrMaxDiscountPercentFrontDesk != null
                    ? String(d.adrMaxDiscountPercentFrontDesk)
                    : '',
            );
        } catch {
            toast.error('Failed to load ADR settings.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const handleSave = async () => {
        if (!canEdit) return;
        setSaving(true);
        try {
            const payload: {
                adrTargetAdr: number | null;
                adrMinRateFactor: number | null;
                adrMaxDiscountPercentFrontDesk: number | null;
            } = {
                adrTargetAdr:
                    target.trim() === ''
                        ? null
                        : Math.max(0, Number(target) || 0),
                adrMinRateFactor:
                    minFactor.trim() === ''
                        ? null
                        : Math.min(1, Math.max(0.5, Number(minFactor) || 0.9)),
                adrMaxDiscountPercentFrontDesk:
                    maxMove.trim() === ''
                        ? null
                        : Math.min(
                              100,
                              Math.max(0, Math.floor(Number(maxMove) || 0)),
                          ),
            };
            const res = await patchAdrRevenueSettings(payload);
            if ('error' in res) {
                toast.error(res.error);
                return;
            }
            toast.success('ADR settings saved');
            await load();
        } catch {
            toast.error('Save failed.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="py-8 text-sm text-gray-500">Loading settings…</div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto w-full flex flex-col gap-4 py-4 px-2">
            <p className="text-sm text-gray-600">
                These values drive the <strong>suggested minimum rate</strong>{' '}
                (ADR × min factor), <strong>target banding</strong> on
                single-day context, and extra wording on the what-if tool when
                ADR moves too far. Leave a field blank and save to clear it
                (server defaults apply).
            </p>
            <div className="flex flex-col gap-2">
                <Label htmlFor="adr-set-target">Target ADR (optional)</Label>
                <Input
                    id="adr-set-target"
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="e.g. 200"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    disabled={!canEdit}
                    className="bg-white"
                />
            </div>
            <div className="flex flex-col gap-2">
                <Label htmlFor="adr-set-minf">
                    Min-rate factor (optional, 0.5–1)
                </Label>
                <Input
                    id="adr-set-minf"
                    type="number"
                    min={0.5}
                    max={1}
                    step="0.01"
                    placeholder="Default 0.9 if empty"
                    value={minFactor}
                    onChange={(e) => setMinFactor(e.target.value)}
                    disabled={!canEdit}
                    className="bg-white"
                />
            </div>
            <div className="flex flex-col gap-2">
                <Label htmlFor="adr-set-maxmove">
                    Max ADR drop hint % for desk (optional, 0–100)
                </Label>
                <Input
                    id="adr-set-maxmove"
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    placeholder="e.g. 10 means warn past ~10% ADR drop"
                    value={maxMove}
                    onChange={(e) => setMaxMove(e.target.value)}
                    disabled={!canEdit}
                    className="bg-white"
                />
            </div>
            {canEdit ? (
                <Button
                    type="button"
                    onClick={() => void handleSave()}
                    disabled={saving}
                    className="bg-blue hover:bg-blue/90 text-white w-fit mx-auto sm:mx-0"
                >
                    {saving ? 'Saving…' : 'Save'}
                </Button>
            ) : (
                <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                    Only managers and administrators can change these values.
                </p>
            )}
        </div>
    );
}
