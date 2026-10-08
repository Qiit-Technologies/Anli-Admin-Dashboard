'use client';
import { getEmployees } from '@/app/actions/employee';
import { InviteModal } from '@/components/admin/form/invite-modal';
import { StaffMemberFullColumns } from '@/components/admin/Table/column/StaffFullColumn';
import { CustomSheet } from '@/components/common/CustomSheet';
import { PageHeader } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import CustomTable from '@/components/common/table/CustomTable';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useDisclosure } from '@/hooks/useDisclosure';
import { Loader2, PlusCircle } from 'lucide-react';
import useSWR from 'swr';

const StaffingPage = () => {
    const { data: staffMembers, isLoading } = useSWR(
        '/staff-members',
        getEmployees,
    );
    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen w-full">
                <Loader2 className="w-10 h-10 animate-spin text-brand" />
                Loading. Please wait...
            </div>
        );
    }

    return (
        <PageWrapper>
            <PageHeader>
                <h1 className="text-2xl font-semibold text-black font-sans">
                    Manage Team, Roles and Permission
                </h1>
            </PageHeader>
            <div>
                <Tabs defaultValue="manage-team" className="w-full">
                    <TabsContent value="manage-team">
                        <main className="flex-1 p-6 border rounded-lg">
                            <div className="mt-6">
                                <h2 className="text-2xl font-semibold text-black font-sans">
                                    Team Members
                                </h2>
                                <p className="text-sm text-gray-400 font-sans">
                                    Manage who has access to this workspace
                                </p>
                            </div>

                            <div className="mt-8">
                                <CustomTable
                                    data={staffMembers}
                                    columns={StaffMemberFullColumns}
                                    extend={<InviteStaffDialog />}
                                />
                            </div>
                        </main>
                    </TabsContent>
                </Tabs>
            </div>
        </PageWrapper>
    );
};

export default StaffingPage;

const InviteStaffDialog = () => {
    const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

    return (
        <CustomSheet
            title="Invite Staff Member"
            subTitle="Add a new staff member to your team"
            open={isOpen}
            setOpen={onOpenChange}
            onClose={onClose}
            trigger={
                <Button
                    variant="outline"
                    className="border-orion-blue hover:bg-orion-blue text-orion-blue hover:text-white"
                    onClick={onOpen}
                >
                    <PlusCircle className="mr-2" />
                    <span>Invite Member</span>
                </Button>
            }
        >
            <InviteModal
                mode="add"
                onSuccess={() => {
                    onClose();
                }}
                onCancel={onClose}
            />
        </CustomSheet>
    );
};
