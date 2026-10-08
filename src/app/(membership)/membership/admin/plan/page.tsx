'use client';
import {
    createMembershipPlan,
    getMembershipPlans,
} from '@/app/actions/membership';
import BrandButton from '@/components/common/Button';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import CustomTable from '@/components/common/table/CustomTable';
import CreatePlanForm from '@/components/membership/forms/create-plan';
import Header from '@/components/membership/layout/header';
import { planColumn } from '@/components/membership/table/columns/plan-column';
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

const AdminPlanPage = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isCreatingPlan, setIsCreatingPlan] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    // const [isOptingIn, setIsOptingIn] = useState(false);

    const { data: data, mutate: mutatePlans } = useSWR(
        '/api/membership-plans',
        () => getMembershipPlans(),
    );

    const membershipPlans = data?.data?.membershipPlans || [];

    const handleCreatePlan = async (planData: {
        name: string;
        price: number;
        numberOfReferrals: number;
        maxDurationMonths: number;
    }) => {
        setIsCreatingPlan(true);

        try {
            await createMembershipPlan(planData);
            toast.custom(
                <Toast
                    title="Success"
                    type="success"
                    description="Plan created successfully"
                />,
            );
            setShowCreateDialog(false);
            mutatePlans();
        } catch (error: any) {
            console.error('Error creating membership plan:', error);
            toast.custom(
                <Toast
                    title="Error"
                    type="error"
                    description="Failed to create plan"
                />,
            );
            throw error;
        } finally {
            setIsCreatingPlan(false);
        }
    };

    const handleCancelCreate = () => {
        setShowCreateDialog(false);
    };

    // const handleOptInMembership = async () => {
    //     setIsOptingIn(true);

    //     try {
    //         const result = await joinMembershipModule();

    //         if (result.error) {
    //             toast.custom(
    //                 <Toast
    //                     title="Error"
    //                     type="error"
    //                     description={result.error}
    //                 />,
    //             );
    //         } else {
    //             toast.custom(
    //                 <Toast
    //                     title="Success"
    //                     type="success"
    //                     description={
    //                         result.message ||
    //                         'Successfully opted into membership module'
    //                     }
    //                 />,
    //             );
    //         }
    //     } catch (error: any) {
    //         console.error('Error opting into membership:', error);
    //         toast.custom(
    //             <Toast
    //                 title="Error"
    //                 type="error"
    //                 description="Failed to opt into membership module"
    //             />,
    //         );
    //     } finally {
    //         setIsOptingIn(false);
    //     }
    // };

    return (
        <PageWrapper className="p-0 md:px-0" permissions={[PERMISSIONS.MANAGE_MEMBERSHIP_CONFIGURATION]}>
            <Header isOpen={isOpen} setIsOpen={setIsOpen} />

            <div className="p-6 flex flex-col gap-10">
                <PageHeader>
                    <PageHeadertitle
                        title="Membership Plan"
                        subtitle={
                            'Monitor registrations, referrals, renewals, and guest activity in one place.'
                        }
                    />
                    <div className="ml-auto flex items-center gap-2">
                        <Dialog
                            open={showCreateDialog}
                            onOpenChange={setShowCreateDialog}
                        >
                            <DialogTrigger asChild>
                                <BrandButton>Create New Plan</BrandButton>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader className="max-w-3xl">
                                    <DialogTitle>
                                        Create New Membership Plan
                                    </DialogTitle>
                                    <span className="text-muted-foreground">
                                        Create a new membership plan for your
                                        community.
                                    </span>
                                </DialogHeader>
                                <CreatePlanForm
                                    onSubmit={handleCreatePlan}
                                    onCancel={handleCancelCreate}
                                    isLoading={isCreatingPlan}
                                />
                            </DialogContent>
                        </Dialog>
                        {/* <BrandButton
                            className="bg-white hover:bg-white border-orion-blue border shadow-none text-orion-blue"
                            onClick={handleOptInMembership}
                            disabled={isOptingIn}
                        >
                            {isOptingIn ? 'Opting In...' : 'Opt-In Membership'}
                        </BrandButton> */}
                    </div>
                </PageHeader>
            </div>

            <div className="p-6 bg-white rounded-lg border">
                <CustomTable
                    data={membershipPlans}
                    containerClassName="border-none rounded-none"
                    columns={planColumn}
                />
            </div>
        </PageWrapper>
    );
};

export default AdminPlanPage;
