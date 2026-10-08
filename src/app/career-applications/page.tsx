'use client';

import {
    downloadCareerApplicationCV,
    getCareerApplications,
    updateCareerApplicationStatus,
} from '@/app/actions/career';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Calendar,
    Download,
    ExternalLink,
    Mail,
    MapPin,
    User,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface CareerApplication {
    id: string;
    fullName: string;
    email: string;
    positionId: string;
    positionTitle: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
    cvFilePath?: string;
    currentLocation: string;
    projectExperience: string;
    whyAnli: string;
    availability: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export default function AdminCareerApplications() {
    const [applications, setApplications] = useState<CareerApplication[]>([]);
    const [selectedApp, setSelectedApp] = useState<CareerApplication | null>(
        null,
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchApplications = async () => {
        setLoading(true);
        setError('');

        try {
            const result = await getCareerApplications();

            if (result.error) {
                setError(result.error);
            } else if (result.data) {
                setApplications(result.data);
            }
        } catch (err) {
            setError('Failed to fetch applications');
            console.error('Failed to fetch applications:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, status: string) => {
        try {
            const result = await updateCareerApplicationStatus(
                id,
                status as
                    | 'pending'
                    | 'reviewing'
                    | 'interview'
                    | 'hired'
                    | 'rejected',
            );

            if (result.error) {
                setError(result.error);
            } else {
                fetchApplications();

                if (selectedApp && selectedApp.id === id) {
                    setSelectedApp({ ...selectedApp, status });
                }
            }
        } catch (err) {
            setError('Failed to update status');
            console.error('Failed to update status:', err);
        }
    };

    const downloadCV = async (applicationId: string, fileName: string) => {
        try {
            const result = await downloadCareerApplicationCV(
                applicationId,
                fileName,
            );
            if (result.error) {
                setError(result.error);
            }
        } catch (err) {
            setError('Failed to download CV');
            console.error('Failed to download CV:', err);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'reviewing':
                return 'bg-blue-100 text-blue-800';
            case 'interview':
                return 'bg-purple-100 text-purple-800';
            case 'hired':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Career Applications Management
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Internal Admin Interface - Public Access
                    </p>
                    {error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600">{error}</p>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <Card className="shadow-none">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>
                                        Applications ({applications.length})
                                    </span>
                                    <Button
                                        onClick={fetchApplications}
                                        variant="outline"
                                        size="sm"
                                        disabled={loading}
                                    >
                                        {loading ? 'Loading...' : 'Refresh'}
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 max-h-96 overflow-y-auto shadow-none">
                                {applications.map((app) => (
                                    <div
                                        key={app.id}
                                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                            selectedApp?.id === app.id
                                                ? 'border-orion-blue bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                        onClick={() => setSelectedApp(app)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-medium text-gray-900">
                                                    {app.fullName}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    {app.positionTitle}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {formatDate(app.createdAt)}
                                                </p>
                                            </div>
                                            <Badge
                                                className={getStatusColor(
                                                    app.status,
                                                )}
                                            >
                                                {app.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                                {applications.length === 0 && !loading && (
                                    <p className="text-gray-500 text-center py-8">
                                        No applications found
                                    </p>
                                )}
                                {loading && (
                                    <p className="text-gray-500 text-center py-8">
                                        Loading applications...
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div>
                        {selectedApp ? (
                            <Card className="shadow-none">
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span>{selectedApp.fullName}</span>
                                        <Select
                                            value={selectedApp.status}
                                            onValueChange={(value) =>
                                                updateStatus(
                                                    selectedApp.id,
                                                    value,
                                                )
                                            }
                                        >
                                            <SelectTrigger className="w-32">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">
                                                    Pending
                                                </SelectItem>
                                                <SelectItem value="reviewing">
                                                    Reviewing
                                                </SelectItem>
                                                <SelectItem value="interview">
                                                    Interview
                                                </SelectItem>
                                                <SelectItem value="hired">
                                                    Hired
                                                </SelectItem>
                                                <SelectItem value="rejected">
                                                    Rejected
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6 shadow-none">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="font-semibold text-gray-900 mb-3">
                                            Contact Information
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm text-gray-700">
                                                    {selectedApp.email}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm text-gray-700">
                                                    {
                                                        selectedApp.currentLocation
                                                    }
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm text-gray-700">
                                                    {selectedApp.positionTitle}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm text-gray-700">
                                                    {selectedApp.availability}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <h3 className="font-semibold text-gray-900 mb-3">
                                            Links & Documents
                                        </h3>
                                        <div className="flex flex-wrap gap-3">
                                            {selectedApp.linkedinUrl && (
                                                <a
                                                    href={
                                                        selectedApp.linkedinUrl
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline font-medium"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                    LinkedIn Profile
                                                </a>
                                            )}
                                            {selectedApp.portfolioUrl && (
                                                <a
                                                    href={
                                                        selectedApp.portfolioUrl
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline font-medium"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                    Portfolio
                                                </a>
                                            )}
                                            {selectedApp.cvFilePath && (
                                                <button
                                                    onClick={() =>
                                                        downloadCV(
                                                            selectedApp.id,
                                                            `${selectedApp.fullName}-CV.pdf`,
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline font-medium cursor-pointer"
                                                >
                                                    <Download className="h-4 w-4" />
                                                    Download CV
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <hr />
                                    <div className="p-4 rounded-lg">
                                        <h3 className="font-semibold text-gray-900 mb-3">
                                            Project Experience
                                        </h3>
                                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                            {selectedApp.projectExperience}
                                        </p>
                                    </div>
                                    <hr />
                                    <div className="p-4 rounded-lg">
                                        <h3 className="font-semibold text-gray-900 mb-3">
                                            Why Anli?
                                        </h3>
                                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                            {selectedApp.whyAnli}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="shadow-none">
                                <CardContent className="flex items-center justify-center h-64">
                                    <p className="text-gray-500">
                                        Select an application to view details
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
