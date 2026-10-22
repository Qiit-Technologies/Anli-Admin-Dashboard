'use client';

import { useEffect, useMemo, useState } from 'react';
import {
    Briefcase,
    Calendar,
    Download,
    ExternalLink,
    Mail,
    MapPin,
    Search,
    User,
} from 'lucide-react';
import {
    getCareerApplications,
    updateCareerApplicationStatus,
    type CareerApplication,
    type CareerApplicationStatus,
} from '@/app/actions/careers';
import PageWrapper from '@/components/common/PageWrapper';
import { PageHeader, HeaderActions } from '@/components/common/layout/Header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import toast from 'react-hot-toast';

const STATUSES: CareerApplicationStatus[] = [
    'pending',
    'reviewing',
    'interview',
    'hired',
    'rejected',
];

const AVAILABILITY_LABELS: Record<string, string> = {
    immediate: 'Immediate',
    two_weeks: '2 weeks',
    one_month: '1 month',
    negotiable: 'Negotiable',
};

function statusVariant(status: string) {
    switch (status) {
        case 'hired':
            return 'default' as const;
        case 'interview':
            return 'secondary' as const;
        case 'rejected':
            return 'destructive' as const;
        case 'reviewing':
            return 'outline' as const;
        default:
            return 'outline' as const;
    }
}

function formatDate(iso: string) {
    try {
        return new Date(iso).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    } catch {
        return iso;
    }
}

export default function CareerApplicationsPage() {
    const [applications, setApplications] = useState<CareerApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selected, setSelected] = useState<CareerApplication | null>(null);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    const fetchApplications = async () => {
        setLoading(true);
        setError('');
        const result = await getCareerApplications();
        if (result.error) {
            setError(result.error);
        } else {
            setApplications(result.data ?? []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const counts = useMemo(() => {
        const map: Record<string, number> = { all: applications.length };
        for (const status of STATUSES) map[status] = 0;
        for (const app of applications) {
            if (map[app.status] !== undefined) map[app.status] += 1;
        }
        return map;
    }, [applications]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return applications.filter((app) => {
            if (statusFilter !== 'all' && app.status !== statusFilter)
                return false;
            if (!q) return true;
            return (
                app.fullName.toLowerCase().includes(q) ||
                app.email.toLowerCase().includes(q) ||
                app.positionTitle.toLowerCase().includes(q) ||
                app.currentLocation.toLowerCase().includes(q)
            );
        });
    }, [applications, search, statusFilter]);

    const handleStatusChange = async (
        app: CareerApplication,
        status: CareerApplicationStatus,
    ) => {
        const result = await updateCareerApplicationStatus(app.id, status);
        if (result.error) {
            toast.error(result.error);
            return;
        }
        setApplications((prev) =>
            prev.map((a) => (a.id === app.id ? { ...a, status } : a)),
        );
        setSelected((prev) =>
            prev && prev.id === app.id ? { ...prev, status } : prev,
        );
        toast.success(`${app.fullName} marked as ${status}`);
    };

    const handleDownloadCv = async (app: CareerApplication) => {
        if (!app.cvFilePath) return;
        // CVs stored on Cloudinary (older applications) open directly;
        // locally stored CVs are served by the guarded backend endpoint,
        // fetched through the admin app's authenticated API proxy.
        if (app.cvFilePath.startsWith('http')) {
            window.open(app.cvFilePath, '_blank', 'noopener');
            return;
        }
        setDownloadingId(app.id);
        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(
                `/superadmin/be-api/career-applications/${app.id}/cv`,
                {
                    headers: token
                        ? { Authorization: ['Bearer', token].join(' ') }
                        : {},
                },
            );
            if (!res.ok) throw new Error('download failed');
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${app.fullName}-CV.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch {
            toast.error('Could not download this CV.');
        } finally {
            setDownloadingId(null);
        }
    };

    return (
        <PageWrapper title="Career Applications">
            <PageHeader>
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold">
                        <Briefcase className="h-6 w-6" /> Career Applications
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Applications submitted from the Anli careers page.
                    </p>
                </div>
                <HeaderActions>
                    <Button
                        variant="outline"
                        onClick={fetchApplications}
                        disabled={loading}
                    >
                        Refresh
                    </Button>
                </HeaderActions>
            </PageHeader>

            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {['all', ...STATUSES].map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`rounded-lg border p-3 text-left capitalize transition-colors ${
                            statusFilter === status
                                ? 'border-primary bg-primary/5'
                                : 'hover:bg-muted/50'
                        }`}
                    >
                        <div className="text-2xl font-bold">
                            {counts[status] ?? 0}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {status}
                        </div>
                    </button>
                ))}
            </div>

            <div className="relative mb-6 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search name, email, role or location…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                />
            </div>

            {error && (
                <Card className="mb-6 border-destructive">
                    <CardContent className="p-4 text-sm text-destructive">
                        {error}
                    </CardContent>
                </Card>
            )}

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-28 w-full" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <Card>
                    <CardContent className="p-10 text-center text-muted-foreground">
                        No applications match.
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {filtered.map((app) => (
                        <Card key={app.id}>
                            <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
                                <div className="min-w-0 space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="flex items-center gap-1.5 font-semibold">
                                            <User className="h-4 w-4" />
                                            {app.fullName}
                                        </span>
                                        <Badge
                                            variant={statusVariant(app.status)}
                                            className="capitalize"
                                        >
                                            {app.status}
                                        </Badge>
                                    </div>
                                    <div className="text-sm font-medium text-primary">
                                        {app.positionTitle}
                                    </div>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Mail className="h-3.5 w-3.5" />
                                            {app.email}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MapPin className="h-3.5 w-3.5" />
                                            {app.currentLocation}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {formatDate(app.createdAt)} ·{' '}
                                            {AVAILABILITY_LABELS[
                                                app.availability
                                            ] ?? app.availability}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Select
                                        value={app.status}
                                        onValueChange={(value) =>
                                            handleStatusChange(
                                                app,
                                                value as CareerApplicationStatus,
                                            )
                                        }
                                    >
                                        <SelectTrigger className="w-[140px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {STATUSES.map((status) => (
                                                <SelectItem
                                                    key={status}
                                                    value={status}
                                                    className="capitalize"
                                                >
                                                    {status}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {app.cvFilePath && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                handleDownloadCv(app)
                                            }
                                            disabled={
                                                downloadingId === app.id
                                            }
                                        >
                                            <Download className="mr-1 h-4 w-4" />
                                            CV
                                        </Button>
                                    )}
                                    <Button
                                        size="sm"
                                        onClick={() => setSelected(app)}
                                    >
                                        View
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog
                open={Boolean(selected)}
                onOpenChange={(open) => !open && setSelected(null)}
            >
                <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                    {selected && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    {selected.fullName}
                                    <Badge
                                        variant={statusVariant(selected.status)}
                                        className="capitalize"
                                    >
                                        {selected.status}
                                    </Badge>
                                </DialogTitle>
                                <p className="text-sm text-muted-foreground">
                                    {selected.positionTitle} · Applied{' '}
                                    {formatDate(selected.createdAt)}
                                </p>
                            </DialogHeader>
                            <div className="space-y-4 py-2 text-sm">
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div>
                                        <div className="font-medium">Email</div>
                                        <div className="text-muted-foreground">
                                            {selected.email}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="font-medium">
                                            Location
                                        </div>
                                        <div className="text-muted-foreground">
                                            {selected.currentLocation}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="font-medium">
                                            Availability
                                        </div>
                                        <div className="text-muted-foreground">
                                            {AVAILABILITY_LABELS[
                                                selected.availability
                                            ] ?? selected.availability}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="font-medium">Links</div>
                                        <div className="flex gap-3">
                                            {selected.linkedinUrl && (
                                                <a
                                                    href={selected.linkedinUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center gap-1 text-primary hover:underline"
                                                >
                                                    LinkedIn{' '}
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            )}
                                            {selected.portfolioUrl && (
                                                <a
                                                    href={selected.portfolioUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center gap-1 text-primary hover:underline"
                                                >
                                                    Portfolio{' '}
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            )}
                                            {!selected.linkedinUrl &&
                                                !selected.portfolioUrl && (
                                                    <span className="text-muted-foreground">
                                                        None provided
                                                    </span>
                                                )}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className="font-medium">
                                        Project experience
                                    </div>
                                    <p className="whitespace-pre-wrap text-muted-foreground">
                                        {selected.projectExperience}
                                    </p>
                                </div>
                                <div>
                                    <div className="font-medium">Why Anli</div>
                                    <p className="whitespace-pre-wrap text-muted-foreground">
                                        {selected.whyAnli}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 pt-2">
                                    {selected.cvFilePath && (
                                        <Button
                                            variant="outline"
                                            onClick={() =>
                                                handleDownloadCv(selected)
                                            }
                                            disabled={
                                                downloadingId === selected.id
                                            }
                                        >
                                            <Download className="mr-1 h-4 w-4" />
                                            Download CV
                                        </Button>
                                    )}
                                    <Select
                                        value={selected.status}
                                        onValueChange={(value) =>
                                            handleStatusChange(
                                                selected,
                                                value as CareerApplicationStatus,
                                            )
                                        }
                                    >
                                        <SelectTrigger className="w-[160px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {STATUSES.map((status) => (
                                                <SelectItem
                                                    key={status}
                                                    value={status}
                                                    className="capitalize"
                                                >
                                                    {status}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {applications.length} application
                        {applications.length === 1 ? '' : 's'} received in total
                    </CardTitle>
                </CardHeader>
            </Card>
        </PageWrapper>
    );
}
