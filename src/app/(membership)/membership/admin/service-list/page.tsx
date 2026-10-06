'use client';
import {
    createFacility,
    deleteFacility,
    editFacility,
    getFacilities,
} from '@/app/actions/membership';
import BrandButton from '@/components/common/Button';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import CustomTable from '@/components/common/table/CustomTable';
import Header from '@/components/membership/layout/header';
import {
    Facility,
    facilityColumn,
} from '@/components/membership/table/columns/service-column';
import Toast from '@/components/toast';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import FacilityForm from '../../../../../components/membership/forms/facility-form';

export interface MembershipPlan {
    id: number;
    name: string;
    price: number;
    numberOfReferrals: number;
    maxDurationMonths: number;
    createdAt: string;
    updatedAt: string;
    referralTiers?: ReferralTier[];
}

interface ReferralTier {
    id: string;
    name: string;
    description?: string;
    accessLevel?: string;
}

const ServiceListPage = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [selectedFacility, setSelectedFacility] = useState<Facility | null>(
        null,
    );
    const [isLoading, setIsLoading] = useState(false);

    const { data: facilitiesData, mutate } = useSWR('/api/facilities', () =>
        getFacilities(),
    );

    const facilities: Facility[] = facilitiesData?.data?.facilities || [];

    const handleCreateFacility = async (facilityData: any) => {
        setIsLoading(true);
        try {
            const result = await createFacility(facilityData);
            if (result.data) {
                toast.custom(
                    <Toast
                        type="success"
                        title="Facility created successfully"
                        description="Facility created successfully"
                    />,
                );
                setShowCreateDialog(false);
                mutate();
            } else {
                toast.custom(
                    <Toast
                        type="error"
                        title="Failed to create facility"
                        description={
                            result.error || 'Failed to create facility'
                        }
                    />,
                );
            }
        } catch (error: any) {
            toast.error('An error occurred while creating the facility');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditFacility = async (facilityData: any) => {
        if (!selectedFacility) return;

        setIsLoading(true);
        try {
            const result = await editFacility(
                selectedFacility.id,
                facilityData,
            );
            if (result.data) {
                toast.custom(
                    <Toast
                        type="success"
                        title="Facility has been updated successfully"
                        description="Facility has been updated successfully"
                    />,
                );
                setShowEditDialog(false);
                setSelectedFacility(null);
                mutate();
            } else {
                toast.custom(
                    <Toast
                        type="error"
                        title="Failed to update facility"
                        description={
                            result.error || 'Failed to update facility'
                        }
                    />,
                );
            }
        } catch (error: any) {
            toast.custom(
                <Toast
                    type="error"
                    title="An error occurred while updating the facility"
                    description="An error occurred while updating the facility"
                />,
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteFacility = async (facilityId: number) => {
        if (!confirm('Are you sure you want to delete this facility?')) return;

        setIsLoading(true);
        try {
            const result = await deleteFacility(facilityId);
            if (result.message === 'Facility has been removed successfully') {
                toast.custom(
                    <Toast
                        type="success"
                        title="Facility deleted successfully"
                        description="Facility deleted successfully"
                    />,
                );
                mutate();
            } else {
                toast.custom(
                    <Toast
                        type="error"
                        title="Failed to delete facility"
                        description={
                            result.error || 'Failed to delete facility'
                        }
                    />,
                );
            }
        } catch (error: any) {
            toast.custom(
                <Toast
                    type="error"
                    title="An error occurred while deleting the facility"
                    description="An error occurred while deleting the facility"
                />,
            );
        } finally {
            setIsLoading(false);
        }
    };

    const openEditDialog = (facility: Facility) => {
        setSelectedFacility(facility);
        setShowEditDialog(true);
    };

    const enhancedFacilityColumn = facilityColumn.map((column) => {
        if (column.id === 'actions') {
            return {
                ...column,
                cell: ({ row }: { row: { original: Facility } }) => (
                    <div className="flex items-center space-x-2">
                        <button
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            onClick={() => openEditDialog(row.original)}
                            disabled={isLoading}
                        >
                            Edit
                        </button>
                        <button
                            className="text-red-600 hover:text-red-800 text-sm"
                            onClick={() =>
                                handleDeleteFacility(row.original.id)
                            }
                            disabled={isLoading}
                        >
                            Delete
                        </button>
                    </div>
                ),
            };
        }
        return column;
    });

    return (
        <PageWrapper className="p-0 md:px-0" permissions={[PERMISSIONS.MANAGE_MEMBERSHIP_CONFIGURATION]}>
            <Header isOpen={isOpen} setIsOpen={setIsOpen} />

            <div className="p-6 flex flex-col gap-10">
                <PageHeader>
                    <PageHeadertitle
                        title="Service List"
                        subtitle={
                            'Monitor services, categories, and bookable status in one place.'
                        }
                    />
                    <div className="ml-auto flex items-center gap-2">
                        <Dialog
                            open={showCreateDialog}
                            onOpenChange={setShowCreateDialog}
                        >
                            <DialogTrigger asChild>
                                <BrandButton disabled={isLoading}>
                                    Add New Service
                                </BrandButton>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                                <DialogHeader>
                                    <DialogTitle>
                                        Create New Service
                                    </DialogTitle>
                                    <span className="text-muted-foreground">
                                        Create a new service.
                                    </span>
                                </DialogHeader>
                                <FacilityForm
                                    mode="add"
                                    onSubmit={handleCreateFacility}
                                    isLoading={isLoading}
                                    onCancel={() => setShowCreateDialog(false)}
                                />
                            </DialogContent>
                        </Dialog>
                    </div>
                </PageHeader>
            </div>

            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Edit Service</DialogTitle>
                        <span className="text-muted-foreground">
                            Update service details.
                        </span>
                    </DialogHeader>
                    {selectedFacility && (
                        <FacilityForm
                            mode="edit"
                            facility={{
                                ...selectedFacility,
                                id: selectedFacility.id.toString(),
                            }}
                            onSubmit={handleEditFacility}
                            isLoading={isLoading}
                            onCancel={() => setShowEditDialog(false)}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <div className="p-6 bg-white rounded-lg border">
                <CustomTable
                    headerClassName="text-center"
                    cellClassName="text-center"
                    data={facilities}
                    columns={enhancedFacilityColumn}
                    containerClassName="border-none rounded-none"
                />
            </div>
        </PageWrapper>
    );
};

export default ServiceListPage;
