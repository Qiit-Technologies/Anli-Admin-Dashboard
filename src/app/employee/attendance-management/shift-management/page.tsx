'use client';
import { CreateShift, getShiftData } from '@/app/actions/employee';
import BrandButton from '@/components/common/Button';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import CustomTable from '@/components/common/table/CustomTable';
import ShiftForm from '@/components/employee/common/forms/shift';
import { ShiftColumns } from '@/components/employee/tables/columns/shift';
import Toast from '@/components/toast';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';

const ShiftManagement = () => {
    const { data: shiftData } = useSWR('/employees/shift-data', getShiftData);
    const [openShiftDialog, setOpenShiftDialog] = useState(false);
    const [activeShift, setActiveShift] = useState('all');

    const shiftTitle =
        (shiftData?.data.find((shift: any) => shift.shiftName === activeShift)
            ?.shiftName || 'All') + ' shift';

    const groupedShifts = shiftData?.data?.reduce((acc: any, shift: any) => {
        if (!acc?.[shift.shiftName]) {
            acc[shift.shiftName] = [];
        }
        acc?.[shift?.shiftName].push(shift);
        return acc;
    }, {});
    const shiftNames = Object.keys(groupedShifts || {});

    const dataToShow = !shiftData?.data
        ? []
        : shiftData?.data && activeShift === 'all'
          ? shiftData?.data
          : groupedShifts?.[activeShift];

    console.log('dataToShow', dataToShow);

    // const getGroupedShifts = () => {
    //     if (!shiftData?.data?.length) return;
    //     const groupedShifts = shiftData?.data?.reduce(
    //         (acc: any, shift: any) => {
    //             if (!acc?.[shift.shiftName]) {
    //                 acc[shift.shiftName] = [];
    //             }
    //             acc?.[shift?.shiftName].push(shift);
    //             return acc;
    //         },
    //         {},
    //     );
    //     console.log('groupedShift', Object.values(groupedShifts));
    // };

    // useEffect(() => {
    //     getGroupedShifts();
    // }, [shiftData]);

    const handleSubmit = async (formData: any) => {
        try {
            setOpenShiftDialog(false);
            const response = await CreateShift(formData);
            console.log('response', response);
            if (response.message === 'Shift created Successful!') {
                toast.custom(() => (
                    <Toast
                        title="Success"
                        description="Shift created successfully!"
                        type="success"
                    />
                ));
                window.location.reload();
                return;
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error"
                        description={
                            response.message ??
                            'Something went wrong. Please try again.'
                        }
                        type="error"
                    />
                ));
            }
            setOpenShiftDialog(false);
        } catch (error: any) {
            toast.custom(() => (
                <Toast
                    title="Error"
                    description="Something went wrong. Please try again."
                    type="error"
                />
            ));
        } finally {
            setOpenShiftDialog(false);
        }
    };

    const onCancel = () => setOpenShiftDialog(false);

    const renderShiftTabs = () => {
        return (
            <>
                <TabsTrigger
                    value="all"
                    onClick={() => setActiveShift('all')}
                    className="text-base capitalize px-0 data-[state=active]:text-hexbrand data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-hexbrand"
                >
                    All
                </TabsTrigger>
                {shiftNames?.map((shift: any) => (
                    <TabsTrigger
                        key={shift}
                        value={shift}
                        onClick={() => setActiveShift(shift)}
                        className="text-base capitalize px-0 data-[state=active]:text-hexbrand data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-hexbrand"
                    >
                        {shift}
                    </TabsTrigger>
                ))}
            </>
        );
    };

    useEffect(() => {
        if (shiftData?.data?.length && !activeShift) {
            setActiveShift(shiftData.data[0].shiftName);
        }
    }, [shiftData]);

    return (
        <PageWrapper>
            <PageHeader>
                <PageHeadertitle
                    title="Shift Management"
                    subtitle={`All shift management related information`}
                />
                <Dialog
                    open={openShiftDialog}
                    onOpenChange={setOpenShiftDialog}
                >
                    <DialogTrigger asChild>
                        <BrandButton className="ml-auto">
                            Create Shift
                        </BrandButton>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogTitle className="sr-only">
                            Create Shift
                        </DialogTitle>
                        <ShiftForm
                            onSubmit={handleSubmit}
                            onCancel={onCancel}
                        />
                    </DialogContent>
                </Dialog>
            </PageHeader>
            <div>
                <Tabs
                    defaultValue={shiftData?.data?.[0]?.shiftName ?? 'all'}
                    className="w-full"
                >
                    <TabsList className="w-full px-0 justify-start gap-4 bg-transparent">
                        {renderShiftTabs()}
                    </TabsList>
                    <TabsContent value={activeShift}>
                        <div className="mt-6">
                            <CustomTable
                                title={shiftTitle}
                                variant="default"
                                columns={ShiftColumns}
                                data={dataToShow}
                                hasHeader={false}
                            />
                        </div>
                    </TabsContent>
                    {/* {activeShift === 'all' && (
                        <div className="flex flex-col gap-4 mt-6">
                            {shifts?.map((shiftName: any) => {
                                const shiftDets = shiftData?.data.find(
                                    (shift: any) =>
                                        shift.shiftName === shiftName,
                                );
                                return (
                                    <CustomTable
                                        key={shiftDets?.shiftName}
                                        title={shiftDets?.shiftName + ' shift'}
                                        variant="default"
                                        columns={ShiftColumns}
                                        data={[shiftDets]}
                                        hasHeader={false}
                                    />
                                );
                            })}
                        </div>
                    )} */}
                </Tabs>
            </div>
        </PageWrapper>
    );
};

export default ShiftManagement;
