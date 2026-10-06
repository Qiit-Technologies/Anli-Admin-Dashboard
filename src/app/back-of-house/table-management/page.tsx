'use client';
import { createTable, getTables } from '@/app/actions/back-of-house';
import MutateAreaTableForm, {
    TableMutateProps,
} from '@/components/back-of-house/common/Form/MutateTableAreaForm';
import {
    TableAreaColumns,
    TableAreaFilters,
} from '@/components/back-of-house/tables/columns/TableManagement';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import CustomTable from '@/components/common/table/CustomTable';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';
import toast from 'react-hot-toast';
import useSWR, { mutate } from 'swr';

export default function TableManagementPage() {
    const [openTable, setOpenTable] = useState(false);

    const { data: tables } = useSWR('/restaurants/table', getTables);

    const handleTableSubmit = async (data: TableMutateProps) => {
        try {
            const response = await createTable(data);
            if (response?.message === 'Table created successfully!') {
                setOpenTable(false);
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={response.message}
                        type="success"
                    />
                ));
                mutate('/restaurants/table');
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={response?.message}
                        type="error"
                    />
                ));
            }
        } catch (err) {
            if (err instanceof Error) {
                console.log(err.message);
            } else {
                console.log('An unexpected error occurred');
            }
        }
        setOpenTable(false);
    };

    return (
        <PageWrapper>
            <PageHeader>
                <PageHeadertitle
                    title="Table Management"
                    subtitle={`Manage your restaurant's tables`}
                />
            </PageHeader>

            <div>
                <CustomTable
                    data={
                        tables?.data
                            ? [...tables.data].sort(
                                  (a: any, b: any) => b.id - a.id,
                              )
                            : []
                    }
                    columns={TableAreaColumns}
                    filters={TableAreaFilters}
                    title="Table Management"
                    extend={
                        <Dialog open={openTable} onOpenChange={setOpenTable}>
                            <DialogTrigger asChild>
                                <Button className="bg-orion-blue">
                                    Create Table
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle className="">
                                        Create Table
                                    </DialogTitle>
                                    <DialogDescription>
                                        Add a new table to area
                                    </DialogDescription>
                                </DialogHeader>
                                <MutateAreaTableForm
                                    onSubmit={handleTableSubmit}
                                    mode="add"
                                />
                            </DialogContent>
                        </Dialog>
                    }
                />
            </div>
        </PageWrapper>
    );
}
