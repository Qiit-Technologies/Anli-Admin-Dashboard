'use client';

import { getStaff } from '@/app/actions/staff';
import {
    getNightAuditEmailSettings,
    type NightAuditDefaultStaff,
    type NightAuditEmailSettings,
    updateNightAuditEmailSettings,
} from '@/app/actions/night-audit-settings';
import BrandButton from '@/components/common/Button';
import Toast from '@/components/toast';
import { Badge } from '@/components/ui/badge';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
    Clock,
    FileText,
    Info,
    Mail,
    Package,
    Plus,
    Save,
    Search,
    Trash2,
    Users,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

type StaffMember = {
    id: number;
    fullName: string;
    email: string | null;
    role: string | null;
    isActive?: boolean;
};

type StaffPickerProps = {
    selectedIds: number[];
    staff: StaffMember[];
    loading: boolean;
    onAdd: (id: number) => void;
    onRemove: (id: number) => void;
};

function StaffPicker({
    selectedIds,
    staff,
    loading,
    onAdd,
    onRemove,
}: StaffPickerProps) {
    const [query, setQuery] = useState('');

    const selectedMembers = useMemo(
        () =>
            selectedIds
                .map((id) => staff.find((s) => s.id === id))
                .filter((s): s is StaffMember => Boolean(s)),
        [selectedIds, staff],
    );

    const available = useMemo(() => {
        const q = query.trim().toLowerCase();
        return staff
            .filter((s) => !selectedIds.includes(s.id))
            .filter((s) => {
                if (!q) return true;
                return (
                    s.fullName.toLowerCase().includes(q) ||
                    (s.email?.toLowerCase().includes(q) ?? false) ||
                    (s.role?.toLowerCase().includes(q) ?? false)
                );
            })
            .slice(0, 50);
    }, [staff, selectedIds, query]);

    return (
        <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
                <div>
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">
                        Available staff
                    </Label>
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by name, email or role..."
                            className="pl-9"
                        />
                    </div>
                    <div className="mt-2 max-h-56 overflow-auto rounded-md border bg-white">
                        {loading ? (
                            <div className="p-3 space-y-2">
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                            </div>
                        ) : available.length === 0 ? (
                            <p className="p-3 text-xs text-muted-foreground italic">
                                {staff.length === 0
                                    ? 'No active staff found.'
                                    : 'No matching staff.'}
                            </p>
                        ) : (
                            <ul className="divide-y text-xs">
                                {available.map((s) => (
                                    <li
                                        key={s.id}
                                        className="flex items-center justify-between gap-2 px-3 py-2 hover:bg-muted/50"
                                    >
                                        <div className="min-w-0">
                                            <p className="font-medium truncate">
                                                {s.fullName}
                                            </p>
                                            <p className="text-muted-foreground truncate">
                                                {s.email || 'No email'}
                                                {s.role ? ` · ${s.role}` : ''}
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() => onAdd(s.id)}
                                            className="h-7 text-xs px-2"
                                        >
                                            <Plus className="w-3 h-3 mr-1" />
                                            Add
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <div>
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground mb-2 block">
                        Selected ({selectedMembers.length})
                    </Label>
                    <div className="min-h-[100px] max-h-56 overflow-auto rounded-md border bg-muted/30 p-2">
                        {selectedMembers.length === 0 ? (
                            <p className="p-3 text-xs text-muted-foreground italic">
                                No custom recipients selected. Falls back to default roles.
                            </p>
                        ) : (
                            <ul className="flex flex-col gap-1.5">
                                {selectedMembers.map((s) => (
                                    <li
                                        key={s.id}
                                        className="flex items-center justify-between gap-2 rounded-md bg-white px-2.5 py-1.5 border text-xs"
                                    >
                                        <div className="min-w-0">
                                            <p className="font-medium truncate">
                                                {s.fullName}
                                            </p>
                                            <p className="text-muted-foreground truncate">
                                                {s.email || 'No email'}
                                                {s.role ? ` · ${s.role}` : ''}
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => onRemove(s.id)}
                                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function NightAuditSettingsTab() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [staffLoading, setStaffLoading] = useState(false);

    // Night Audit
    const [naEnabled, setNaEnabled] = useState(true);
    const [naTime, setNaTime] = useState('06:00');
    const [naSelectedIds, setNaSelectedIds] = useState<number[]>([]);
    const [naUseCustom, setNaUseCustom] = useState(false);

    // Control Sheet
    const [csEnabled, setCsEnabled] = useState(true);
    const [csTime, setCsTime] = useState('06:00');
    const [csSelectedIds, setCsSelectedIds] = useState<number[]>([]);
    const [csUseCustom, setCsUseCustom] = useState(false);

    // Stock Movement
    const [smEnabled, setSmEnabled] = useState(true);
    const [smTime, setSmTime] = useState('06:00');
    const [smSelectedIds, setSmSelectedIds] = useState<number[]>([]);
    const [smUseCustom, setSmUseCustom] = useState(false);

    // Initial snapshot for dirty state
    const [initialState, setInitialState] = useState<NightAuditEmailSettings | null>(null);
    const [naDefaultStaff, setNaDefaultStaff] = useState<NightAuditDefaultStaff[]>([]);
    const [csDefaultStaff, setCsDefaultStaff] = useState<NightAuditDefaultStaff[]>([]);
    const [smDefaultStaff, setSmDefaultStaff] = useState<NightAuditDefaultStaff[]>([]);

    const fetchAllStaff = async () => {
        setStaffLoading(true);
        try {
            const all: StaffMember[] = [];
            let page = 1;
            let totalPages = 1;
            do {
                const res = await getStaff(page, 200);
                const items = Array.isArray(res?.data) ? res.data : [];
                items.forEach((s: any) => {
                    if (!s?.id || s.deletedAt) return;
                    all.push({
                        id: s.id,
                        fullName: s.fullName || s.username || `Staff #${s.id}`,
                        email: s.email || null,
                        role: s.roles?.name || null,
                        isActive: s.isActive ?? true,
                    });
                });
                const metaTotal = (res?.meta as any)?.totalPages;
                totalPages = typeof metaTotal === 'number' ? metaTotal : 1;
                page += 1;
            } while (page <= totalPages && totalPages > 1);

            setStaff(all);
        } catch (err) {
            console.error('Failed to load staff list', err);
        } finally {
            setStaffLoading(false);
        }
    };

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            await fetchAllStaff();

            const res = await getNightAuditEmailSettings();
            if (res.data) {
                const d = res.data;
                setInitialState(d);
                setNaDefaultStaff(d.defaultRoleBasedStaff ?? []);
                setCsDefaultStaff(d.defaultControlSheetStaff ?? d.defaultRoleBasedStaff ?? []);
                setSmDefaultStaff(d.defaultStockMovementStaff ?? d.defaultRoleBasedStaff ?? []);

                // NA
                setNaEnabled(d.nightAuditEmailEnabled ?? true);
                setNaTime(d.nightAuditEmailTime || '06:00');
                const naIds = d.nightAuditEmailStaffIds ?? [];
                setNaSelectedIds(naIds);
                setNaUseCustom(naIds.length > 0);

                // CS
                setCsEnabled(d.controlSheetEmailEnabled ?? true);
                setCsTime(d.controlSheetEmailTime || '06:00');
                const csIds = d.controlSheetEmailStaffIds ?? [];
                setCsSelectedIds(csIds);
                setCsUseCustom(csIds.length > 0);

                // SM
                setSmEnabled(d.stockMovementEmailEnabled ?? true);
                setSmTime(d.stockMovementEmailTime || '06:00');
                const smIds = d.stockMovementEmailStaffIds ?? [];
                setSmSelectedIds(smIds);
                setSmUseCustom(smIds.length > 0);
            } else if (res.error) {
                toast.custom(() => (
                    <Toast
                        title="Error"
                        description={res.error || 'Failed to load automated report email settings'}
                        type="error"
                    />
                ));
            }
            setLoading(false);
        };
        load();
    }, []);

    const isDirty = useMemo(() => {
        if (!initialState) return false;
        const initNaIds = initialState.nightAuditEmailStaffIds ?? [];
        const initCsIds = initialState.controlSheetEmailStaffIds ?? [];
        const initSmIds = initialState.stockMovementEmailStaffIds ?? [];

        return (
            naEnabled !== initialState.nightAuditEmailEnabled ||
            naTime !== initialState.nightAuditEmailTime ||
            (naUseCustom ? naSelectedIds.join(',') : '') !== initNaIds.join(',') ||
            csEnabled !== initialState.controlSheetEmailEnabled ||
            csTime !== initialState.controlSheetEmailTime ||
            (csUseCustom ? csSelectedIds.join(',') : '') !== initCsIds.join(',') ||
            smEnabled !== initialState.stockMovementEmailEnabled ||
            smTime !== initialState.stockMovementEmailTime ||
            (smUseCustom ? smSelectedIds.join(',') : '') !== initSmIds.join(',')
        );
    }, [
        initialState,
        naEnabled,
        naTime,
        naUseCustom,
        naSelectedIds,
        csEnabled,
        csTime,
        csUseCustom,
        csSelectedIds,
        smEnabled,
        smTime,
        smUseCustom,
        smSelectedIds,
    ]);

    const timeErrors = useMemo(() => {
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        return {
            na: !timeRegex.test(naTime) ? 'Time must be in HH:mm 24-hour format.' : '',
            cs: !timeRegex.test(csTime) ? 'Time must be in HH:mm 24-hour format.' : '',
            sm: !timeRegex.test(smTime) ? 'Time must be in HH:mm 24-hour format.' : '',
        };
    }, [naTime, csTime, smTime]);

    const hasErrors = Boolean(timeErrors.na || timeErrors.cs || timeErrors.sm);
    const canSave = !loading && !saving && isDirty && !hasErrors;

    const handleReset = () => {
        if (!initialState) return;
        setNaEnabled(initialState.nightAuditEmailEnabled ?? true);
        setNaTime(initialState.nightAuditEmailTime || '06:00');
        const naIds = initialState.nightAuditEmailStaffIds ?? [];
        setNaSelectedIds(naIds);
        setNaUseCustom(naIds.length > 0);

        setCsEnabled(initialState.controlSheetEmailEnabled ?? true);
        setCsTime(initialState.controlSheetEmailTime || '06:00');
        const csIds = initialState.controlSheetEmailStaffIds ?? [];
        setCsSelectedIds(csIds);
        setCsUseCustom(csIds.length > 0);

        setSmEnabled(initialState.stockMovementEmailEnabled ?? true);
        setSmTime(initialState.stockMovementEmailTime || '06:00');
        const smIds = initialState.stockMovementEmailStaffIds ?? [];
        setSmSelectedIds(smIds);
        setSmUseCustom(smIds.length > 0);
    };

    const handleSave = async () => {
        if (!canSave) return;
        setSaving(true);

        const payload = {
            nightAuditEmailEnabled: naEnabled,
            nightAuditEmailTime: naTime,
            nightAuditEmailStaffIds: naUseCustom ? naSelectedIds : null,

            controlSheetEmailEnabled: csEnabled,
            controlSheetEmailTime: csTime,
            controlSheetEmailStaffIds: csUseCustom ? csSelectedIds : null,

            stockMovementEmailEnabled: smEnabled,
            stockMovementEmailTime: smTime,
            stockMovementEmailStaffIds: smUseCustom ? smSelectedIds : null,
        };

        const res = await updateNightAuditEmailSettings(payload);
        if (res.data) {
            const d = res.data;
            setInitialState(d);
            setNaDefaultStaff(d.defaultRoleBasedStaff ?? naDefaultStaff);
            setCsDefaultStaff(d.defaultControlSheetStaff ?? d.defaultRoleBasedStaff ?? csDefaultStaff);
            setSmDefaultStaff(d.defaultStockMovementStaff ?? d.defaultRoleBasedStaff ?? smDefaultStaff);

            setNaEnabled(d.nightAuditEmailEnabled);
            setNaTime(d.nightAuditEmailTime || '06:00');
            const naIds = d.nightAuditEmailStaffIds ?? [];
            setNaSelectedIds(naIds);
            setNaUseCustom(naIds.length > 0);

            setCsEnabled(d.controlSheetEmailEnabled);
            setCsTime(d.controlSheetEmailTime || '06:00');
            const csIds = d.controlSheetEmailStaffIds ?? [];
            setCsSelectedIds(csIds);
            setCsUseCustom(csIds.length > 0);

            setSmEnabled(d.stockMovementEmailEnabled);
            setSmTime(d.stockMovementEmailTime || '06:00');
            const smIds = d.stockMovementEmailStaffIds ?? [];
            setSmSelectedIds(smIds);
            setSmUseCustom(smIds.length > 0);

            toast.custom(() => (
                <Toast
                    title="Success"
                    description="Automated report email settings saved successfully."
                    type="success"
                />
            ));
        } else {
            toast.custom(() => (
                <Toast
                    title="Error"
                    description={res.error || 'Unable to save automated report email settings.'}
                    type="error"
                />
            ));
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="grid gap-6 max-w-4xl">
                <Card>
                    <CardHeader>
                        <div className="h-5 w-56 bg-muted animate-pulse rounded" />
                        <div className="h-4 w-72 bg-muted animate-pulse rounded mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="grid gap-6 max-w-4xl pb-10">
            {/* Section 1: Night Audit Email */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Mail className="w-5 h-5 text-primary" /> Night Audit Email
                    </CardTitle>
                    <CardDescription>
                        Configure scheduled delivery time and recipients for the daily Night Audit summary.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                            <Label htmlFor="na-enabled" className="text-sm font-medium">
                                Send daily night audit email
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Automatically emails night audit figures each morning.
                            </p>
                        </div>
                        <Switch
                            id="na-enabled"
                            checked={naEnabled}
                            onCheckedChange={setNaEnabled}
                            disabled={saving}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="na-time" className="flex items-center gap-2 text-xs font-semibold">
                            <Clock className="w-4 h-4" /> Send time (Africa/Lagos)
                        </Label>
                        <Input
                            id="na-time"
                            type="time"
                            value={naTime}
                            onChange={(e) => setNaTime(e.target.value)}
                            disabled
                            className="w-[180px]"
                        />
                        {timeErrors.na && (
                            <p className="text-xs text-destructive">{timeErrors.na}</p>
                        )}
                    </div>

                    <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <div>
                                <Label htmlFor="na-custom" className="text-sm font-medium">
                                    Custom recipient list
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Override default role-based distribution.
                                </p>
                            </div>
                            <Switch
                                id="na-custom"
                                checked={naUseCustom}
                                onCheckedChange={(checked) => {
                                    setNaUseCustom(checked);
                                    if (!checked) setNaSelectedIds([]);
                                }}
                                disabled={saving || !naEnabled}
                            />
                        </div>

                        {naUseCustom ? (
                            <StaffPicker
                                selectedIds={naSelectedIds}
                                staff={staff}
                                loading={staffLoading}
                                onAdd={(id) => setNaSelectedIds((prev) => prev.includes(id) ? prev : [...prev, id])}
                                onRemove={(id) => setNaSelectedIds((prev) => prev.filter((i) => i !== id))}
                            />
                        ) : (
                            <div className="rounded-lg border bg-muted/40 p-3">
                                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-semibold">
                                    Default role recipients ({naDefaultStaff.length})
                                </p>
                                <ul className="flex flex-wrap gap-1.5">
                                    {naDefaultStaff.map((s) => (
                                        <li key={s.id}>
                                            <Badge variant="secondary" className="text-xs">
                                                {s.fullName} {s.role ? `· ${s.role}` : ''}
                                            </Badge>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Section 2: Control Sheet Email */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <FileText className="w-5 h-5 text-indigo-600" /> Control Sheet Email
                    </CardTitle>
                    <CardDescription>
                        Configure scheduled delivery time and recipients for the daily F&amp;B Control Sheet report.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                            <Label htmlFor="cs-enabled" className="text-sm font-medium">
                                Send daily control sheet email
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Automatically emails outlet control sheet breakdown each morning.
                            </p>
                        </div>
                        <Switch
                            id="cs-enabled"
                            checked={csEnabled}
                            onCheckedChange={setCsEnabled}
                            disabled={saving}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="cs-time" className="flex items-center gap-2 text-xs font-semibold">
                            <Clock className="w-4 h-4" /> Send time (Africa/Lagos)
                        </Label>
                        <Input
                            id="cs-time"
                            type="time"
                            value={csTime}
                            onChange={(e) => setCsTime(e.target.value)}
                            disabled
                            className="w-[180px]"
                        />
                        {timeErrors.cs && (
                            <p className="text-xs text-destructive">{timeErrors.cs}</p>
                        )}
                    </div>

                    <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <div>
                                <Label htmlFor="cs-custom" className="text-sm font-medium">
                                    Custom recipient list
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Override default role-based distribution for Control Sheet.
                                </p>
                            </div>
                            <Switch
                                id="cs-custom"
                                checked={csUseCustom}
                                onCheckedChange={(checked) => {
                                    setCsUseCustom(checked);
                                    if (!checked) setCsSelectedIds([]);
                                }}
                                disabled={saving || !csEnabled}
                            />
                        </div>

                        {csUseCustom ? (
                            <StaffPicker
                                selectedIds={csSelectedIds}
                                staff={staff}
                                loading={staffLoading}
                                onAdd={(id) => setCsSelectedIds((prev) => prev.includes(id) ? prev : [...prev, id])}
                                onRemove={(id) => setCsSelectedIds((prev) => prev.filter((i) => i !== id))}
                            />
                        ) : (
                            <div className="rounded-lg border bg-muted/40 p-3">
                                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-semibold">
                                    Default role recipients ({csDefaultStaff.length})
                                </p>
                                <ul className="flex flex-wrap gap-1.5">
                                    {csDefaultStaff.map((s) => (
                                        <li key={s.id}>
                                            <Badge variant="secondary" className="text-xs">
                                                {s.fullName} {s.role ? `· ${s.role}` : ''}
                                            </Badge>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Section 3: Daily Stock Movement Summary Email */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Package className="w-5 h-5 text-emerald-600" /> Daily Stock Movement Summary Email
                    </CardTitle>
                    <CardDescription>
                        Configure scheduled delivery time and recipients for the Daily Stock Movement Summary &amp; PDF attachment.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                            <Label htmlFor="sm-enabled" className="text-sm font-medium">
                                Send daily stock movement email
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Automatically emails inventory movement (IN, OUT, B&amp;D, closing stock) with PDF each morning.
                            </p>
                        </div>
                        <Switch
                            id="sm-enabled"
                            checked={smEnabled}
                            onCheckedChange={setSmEnabled}
                            disabled={saving}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="sm-time" className="flex items-center gap-2 text-xs font-semibold">
                            <Clock className="w-4 h-4" /> Send time (Africa/Lagos)
                        </Label>
                        <Input
                            id="sm-time"
                            type="time"
                            value={smTime}
                            onChange={(e) => setSmTime(e.target.value)}
                            disabled
                            className="w-[180px]"
                        />
                        {timeErrors.sm && (
                            <p className="text-xs text-destructive">{timeErrors.sm}</p>
                        )}
                    </div>

                    <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <div>
                                <Label htmlFor="sm-custom" className="text-sm font-medium">
                                    Custom recipient list
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Override default role-based distribution for Stock Movement Summary.
                                </p>
                            </div>
                            <Switch
                                id="sm-custom"
                                checked={smUseCustom}
                                onCheckedChange={(checked) => {
                                    setSmUseCustom(checked);
                                    if (!checked) setSmSelectedIds([]);
                                }}
                                disabled={saving || !smEnabled}
                            />
                        </div>

                        {smUseCustom ? (
                            <StaffPicker
                                selectedIds={smSelectedIds}
                                staff={staff}
                                loading={staffLoading}
                                onAdd={(id) => setSmSelectedIds((prev) => prev.includes(id) ? prev : [...prev, id])}
                                onRemove={(id) => setSmSelectedIds((prev) => prev.filter((i) => i !== id))}
                            />
                        ) : (
                            <div className="rounded-lg border bg-muted/40 p-3">
                                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-semibold">
                                    Default role recipients ({smDefaultStaff.length})
                                </p>
                                <ul className="flex flex-wrap gap-1.5">
                                    {smDefaultStaff.map((s) => (
                                        <li key={s.id}>
                                            <Badge variant="secondary" className="text-xs">
                                                {s.fullName} {s.role ? `· ${s.role}` : ''}
                                            </Badge>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between gap-2 border-t pt-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            {isDirty ? 'You have unsaved changes.' : 'All changes saved.'}
                        </span>
                        {isDirty && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleReset}
                                disabled={saving}
                            >
                                Reset
                            </Button>
                        )}
                    </div>
                    <BrandButton
                        onClick={handleSave}
                        disabled={!canSave}
                        loading={saving}
                        icon={<Save size={16} />}
                        iconPosition="left"
                    >
                        {saving ? 'Saving…' : 'Save all settings'}
                    </BrandButton>
                </CardFooter>
            </Card>
        </div>
    );
}

export { NightAuditSettingsTab as AutomatedReportsSettingsTab };