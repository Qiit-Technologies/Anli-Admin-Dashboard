'use client';

import { DeactivateEmployee, getEmployeeById } from '@/app/actions/employee';
import BrandButton from '@/components/common/Button';
import { CustomSheet } from '@/components/common/CustomSheet';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import EmployeeMultiStepForm from '@/components/employee/common/forms/employee';
// import ResignForm from '@/components/employee/common/forms/resign';
// import TransferEmployeeForm from '@/components/employee/common/forms/transfer';
import { itemOrderRejectedIllustration } from '@/components/house-keeping/common/illustrations';
import { PERMISSIONS } from '@/components/permission/data/permissions';
import { PermissionGate } from '@/components/permission/PermissionGate';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { cn, formatCurrency } from '@/lib/utils';
import { BreadcrumbItem, Breadcrumbs } from '@heroui/react';
// import { DialogDescription } from '@radix-ui/react-dialog';
import {
    differenceInMonths,
    differenceInYears,
    format,
    parseISO,
} from 'date-fns';
import { DownloadCloud, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { ReactNode, useState } from 'react';
import useSWR, { mutate } from 'swr';
import Toast from '@/components/toast';
import toast from 'react-hot-toast';

const statusStyles = {
    active: {
        bg: 'bg-green-100',
        dot: 'bg-green-500',
        text: 'text-green-600',
    },
    onLeave: {
        bg: 'bg-orange-100',
        dot: 'bg-orange-500',
        text: 'text-orange-600',
    },
    inActive: {
        bg: 'bg-red-100',
        dot: 'bg-red-500',
        text: 'text-red-600',
    },
};

const StatusBadges = ({
    status,
}: {
    status: 'active' | 'onLeave' | 'inActive';
}) => {
    return (
        <div
            className={cn(
                statusStyles[status]?.bg || 'bg-gray-100',
                'flex items-center justify-center gap-2 w-fit px-3 py-1 rounded-full',
            )}
        >
            <div
                className={cn(
                    statusStyles[status]?.dot || 'bg-gray-500',
                    'w-2 h-2 rounded-full',
                )}
            />
            <span
                className={cn(
                    statusStyles[status]?.text || 'text-gray-600',
                    'text-xs caption-top',
                )}
            >
                {status}
            </span>
        </div>
    );
};
const UserCard = ({ employeeData }: { employeeData: any }) => {
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [opened, setOpened] = useState(false);

    const updateEmployeeStatus = async (id: string | number) => {
        setLoadingDelete(true);

        try {
            const response = await DeactivateEmployee(id);
            if (response.message === 'Employee status updated Successfully!') {
                toast.custom(() => (
                    <Toast
                        title="Success"
                        description={`Employee status updated Successfully!`}
                        type="success"
                    />
                ));

                mutate(`/employees/${id}`);
                setDeleteDialog(false);

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
        } catch (error: any) {
            toast.custom(() => (
                <Toast
                    title="Error"
                    description="Something went wrong. Please try again."
                    type="error"
                />
            ));
        } finally {
            setLoadingDelete(false);
        }
    };
    return (
        <div className="border w-full h-full py-6 text-white bg-black rounded-xl">
            <div className="flex items-center py-2 justify-center flex-col w-full h-full">
                <div className="rounded-full">
                    <Image
                        src={'https://placehold.co/200x200'}
                        width={100}
                        height={100}
                        className="object-cover rounded-full"
                        alt="guest image"
                    />
                </div>
                <div className="flex items-center flex-col text-center p-4 gap-1">
                    <h1 className="text-xl font-semibold">
                        {employeeData?.name}
                    </h1>
                    <span className=""> {employeeData?.email}</span>
                    <span className="text-sm">
                        {' '}
                        {employeeData?.phoneNumber}
                    </span>
                    <div className="mt-2">
                        <StatusBadges
                            status={
                                employeeData?.isActive ? 'active' : 'inActive'
                            }
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-2 w-full px-4">
                    {/* <PermissionGate
                        permissions={[
                            PERMISSIONS.VIEW_EMPLOYEE_MANAGEMENT,
                            PERMISSIONS.MANAGE_EMPLOYEE,
                        ]}
                        permissionType="any"
                        blockType="modal"
                    >
                        <Dialog>
                            <DialogTrigger asChild>
                                <BrandButton className="w-full">
                                    Transfer Employee
                                </BrandButton>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Transfer Employee</DialogTitle>
                                    <DialogDescription className="text-xs text-muted-foreground">
                                        You can move employee to a different
                                        department
                                    </DialogDescription>
                                </DialogHeader>
                                <TransferEmployeeForm />
                            </DialogContent>
                        </Dialog>
                    </PermissionGate> */}

                    <PermissionGate
                        permissions={[
                            PERMISSIONS.VIEW_EMPLOYEE_MANAGEMENT,
                            PERMISSIONS.MANAGE_EMPLOYEE,
                        ]}
                        permissionType="any"
                        blockType="modal"
                    >
                        <Dialog
                            open={deleteDialog}
                            onOpenChange={setDeleteDialog}
                        >
                            <DialogTrigger asChild>
                                <BrandButton
                                    className={`w-full ${employeeData?.isActive ? 'bg-red-600 hover:bg-red-600' : 'bg-green-500 hover:bg-green-500'}`}
                                >
                                    {employeeData?.isActive
                                        ? 'Deactivate Employee'
                                        : 'Activate Employee'}
                                </BrandButton>
                            </DialogTrigger>
                            <DialogContent className="w-[400px]">
                                <DialogHeader>
                                    <DialogTitle>
                                        <span className="flex justify-center items-center">
                                            {itemOrderRejectedIllustration}
                                        </span>
                                    </DialogTitle>
                                    <div className="flex flex-col ">
                                        <h1 className="text-center text-lg font-semibold">
                                            {employeeData?.isActive
                                                ? 'Deactivate Employee'
                                                : 'Activate Employee'}
                                        </h1>
                                        <p className="text-center text-sm text-muted-foreground">
                                            Are you sure you want to{' '}
                                            {employeeData?.isActive
                                                ? 'deactivate'
                                                : 'activate'}{' '}
                                            this employee?
                                        </p>
                                    </div>
                                </DialogHeader>
                                <div className="flex items-center gap-4 mt-4">
                                    <Button
                                        className="h-12 bg-orion-blue text-white w-full"
                                        onClick={() =>
                                            updateEmployeeStatus(
                                                employeeData.id,
                                            )
                                        }
                                    >
                                        {loadingDelete ? (
                                            <Loader2 className="animate-spin mr-2" />
                                        ) : null}
                                        Yes, Sure
                                    </Button>
                                    <Button
                                        variant={'outline'}
                                        className="h-12 text-orion-blue border-orion-blue w-full"
                                        type="button"
                                        onClick={() => setDeleteDialog(false)}
                                    >
                                        No, Cancel
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </PermissionGate>

                    {employeeData && (
                        <PermissionGate
                            permissions={[
                                PERMISSIONS.VIEW_EMPLOYEE_MANAGEMENT,
                                PERMISSIONS.MANAGE_EMPLOYEE,
                            ]}
                            permissionType="any"
                            blockType="modal"
                        >
                            <CustomSheet
                                open={opened}
                                setOpen={setOpened}
                                className="md:max-w-[700px]"
                                title="Edit Employee Detail"
                                trigger={
                                    <Button
                                        variant={'ghost'}
                                        className="w-full bg-white hover:bg-white text-black"
                                    >
                                        Edit Info
                                    </Button>
                                }
                            >
                                <EmployeeMultiStepForm
                                    mode="update"
                                    initialValues={employeeData}
                                    onClose={() => setOpened(false)}
                                />
                            </CustomSheet>
                        </PermissionGate>
                    )}
                </div>
            </div>
        </div>
    );
};

const InfoField = ({
    title,
    data,
}: {
    title: string;
    data: Array<{ label: string; value: string | number | ReactNode }>;
}) => {
    return (
        <div className="w-full bg-white h-full border rounded-xl p-4">
            <div className="font-semibold">
                <h1>{title}</h1>
            </div>
            <div className="flex flex-col mt-4 gap-4">
                {data.map((info, index) => {
                    return (
                        <div
                            key={`${info.value ?? ''}-${index}`}
                            className="grid grid-cols-2"
                        >
                            <span className="text-muted-foreground text-start">
                                {info.label}
                            </span>
                            {!info.value ? (
                                <span className="font-semibold text-end">
                                    -
                                </span>
                            ) : typeof info.value === 'string' ||
                              typeof info.value === 'number' ? (
                                <span className="font-semibold text-end">
                                    {info.value}
                                </span>
                            ) : (
                                <div className="ml-auto">{info.value}</div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const EmploymentCard = () => {
    return (
        <div className="w-full bg-white h-full border rounded-xl p-4">
            <div className="font-semibold flex items-center justify-between">
                <h1>Employment Letter</h1>
                <PermissionGate
                    permissions={[
                        PERMISSIONS.VIEW_EMPLOYEE_MANAGEMENT,
                        PERMISSIONS.MANAGE_EMPLOYEE,
                    ]}
                    permissionType="any"
                    blockType="modal"
                >
                    <Button variant={'outline'}>
                        Download Letter
                        <DownloadCloud className="ml-1 w-4 h-4" />
                    </Button>
                </PermissionGate>
            </div>
            <div className="flex flex-col mt-4 gap-4">
                <span>No Files Yet</span>
            </div>
        </div>
    );
};

const EmployeePage = () => {
    const { id } = useParams();

    const { data: employeeData } = useSWR(id ? `/employees/${id}` : null, () =>
        getEmployeeById(String(id)),
    );
    if (!id) {
        return <div>Error: Department ID is required</div>;
    }
    console.log(id);
    // fetch sample data based on the employee ID

    console.log(employeeData);
    const createdAt = employeeData?.data.createdAt;

    const dateJoined = createdAt
        ? format(parseISO(createdAt), 'yyyy-MM-dd')
        : 'N/A';

    let yearsOrMonths = 'N/A';
    if (createdAt) {
        const dateObj = parseISO(createdAt);
        const years = differenceInYears(new Date(), dateObj);
        if (years >= 1) {
            yearsOrMonths = `${years} year${years > 1 ? 's' : ''}`;
        } else {
            const months = differenceInMonths(new Date(), dateObj);
            yearsOrMonths = `${months} month${months !== 1 ? 's' : ''}`;
        }
    }

    const employeeInfo = [
        { label: 'Employee Code', value: `EMP${employeeData?.data.id}` },
        { label: 'Position', value: employeeData?.data.position },
        { label: 'Department', value: employeeData?.data.department },
        { label: 'Employment Type', value: employeeData?.data.type },
        { label: 'Work Mode', value: employeeData?.data.workMode },
        // { label: 'Branch', value: employeeData?.data.branch },
    ];

    const jobHistoryInfo = [
        {
            label: 'Date Joined',
            value: dateJoined,
        },
        {
            label: 'Years in Organization',
            value: (
                <Badge className="w-fit ml-auto rounded-full">
                    {yearsOrMonths}
                </Badge>
            ),
        },
    ];

    const bankInfo = [
        {
            label: 'Account Holder',
            value: employeeData?.data.accountName,
        },
        { label: 'Bank Name', value: employeeData?.data.bankName },
        { label: 'Account Number', value: employeeData?.data.accountNumber },
        {
            label: 'Salary Amount',
            value: `${formatCurrency(employeeData?.data.salary)}`,
        },
    ];

    const emergencyInfo = [
        {
            label: 'Contact Name',
            value: employeeData?.data?.emergencyContact?.name,
        },
        {
            label: 'Relationship',
            value: employeeData?.data?.emergencyContact?.relationship,
        },
        {
            label: 'Phone Number',
            value: employeeData?.data?.emergencyContact?.phone,
        },
        { label: 'Email', value: employeeData?.data?.emergencyContact?.email },
        {
            label: 'Address',
            value: employeeData?.data?.emergencyContact?.address,
        },
    ];

    const nextOfKinInfo = [
        {
            label: 'Name',
            value: employeeData?.data?.nextOfKin?.name,
        },
        {
            label: 'Relationship',
            value: employeeData?.data?.nextOfKin?.relationship,
        },
        {
            label: 'Phone Number',
            value: employeeData?.data?.nextOfKin?.phone,
        },
        { label: 'Email', value: employeeData?.data?.nextOfKin?.email },
        {
            label: 'Address',
            value: employeeData?.data?.nextOfKin?.address,
        },
    ];

    const medicalInfo = [
        {
            label: 'Blood Group',
            value: employeeData?.data?.medicalInfo?.bloodGroup,
        },
        {
            label: 'Genotype',
            value: employeeData?.data?.medicalInfo?.genotype,
        },
        {
            label: 'Allergy',
            value: employeeData?.data?.medicalInfo?.allergy,
        },
    ];

    return (
        <PageWrapper className="bg-white">
            <div>
                <Breadcrumbs>
                    <BreadcrumbItem
                        classNames={{
                            item: [
                                'hover:underline',
                                'hover:text-brand',
                                'text-base',
                            ],
                        }}
                        href="/employee/employee-management"
                    >
                        Back
                    </BreadcrumbItem>
                    <BreadcrumbItem
                        classNames={{
                            item: ['text-orion-blue text-base'],
                        }}
                    >
                        {`Employee's Profile`}
                    </BreadcrumbItem>
                </Breadcrumbs>
            </div>
            <PageHeader>
                <div className="w-full flex flex-col gap-4 md:flex-row items-start md:items-center justify-between">
                    <PageHeadertitle
                        title={`Employee Profile`}
                        subtitle={`Here are the details for ${employeeData?.data.fullName}, a ${employeeData?.data.position ? employeeData.data.position : 'staff'} in the ${employeeData?.data.department} department.`}
                    />

                    {/* <PermissionGate
                        permissions={[
                            PERMISSIONS.VIEW_EMPLOYEE_MANAGEMENT,
                            PERMISSIONS.MANAGE_EMPLOYEE,
                        ]}
                        permissionType="any"
                        blockType="modal"
                    >
                        <Dialog>
                            <DialogTrigger asChild>
                                <BrandButton>Resign Employee</BrandButton>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Resign Employee</DialogTitle>
                                    <DialogDescription className="text-xs text-muted-foreground">
                                        Resign an Employee
                                    </DialogDescription>
                                </DialogHeader>
                                <ResignForm />
                            </DialogContent>
                        </Dialog>
                    </PermissionGate> */}
                </div>
            </PageHeader>
            <div className="flex flex-col gap-4 mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div>
                        <UserCard employeeData={employeeData?.data} />
                    </div>
                    <div className="col-span-2 flex flex-col gap-4">
                        <InfoField
                            title={`More information about ${employeeData?.data.fullName}`}
                            data={employeeInfo}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div>
                        <EmploymentCard />
                    </div>
                    <div className="col-span-2">
                        <InfoField
                            title="Bank Account Information"
                            data={bankInfo}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="col-span-1">
                        <InfoField title="Job History" data={jobHistoryInfo} />
                    </div>
                    <div className="col-span-1">
                        <InfoField
                            title="Emergency Contact"
                            data={emergencyInfo}
                        />
                    </div>

                    <div className="col-span-1">
                        <InfoField title="Next Of Kin" data={nextOfKinInfo} />
                    </div>

                    <div className="col-span-1">
                        <InfoField title="Medical Info" data={medicalInfo} />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {!!employeeData?.data?.children?.length && (
                        <div>
                            <div className="font-semibold mb-3">
                                <h1>Children</h1>
                            </div>
                            {employeeData?.data?.children?.map((child: any) => {
                                const dataToDisplay = [
                                    {
                                        label: 'Name',
                                        value: child?.name,
                                    },
                                    {
                                        label: 'Age',
                                        value: child?.age,
                                    },
                                    {
                                        label: 'Date Of Birth',
                                        value: child?.dateOfBirth,
                                    },
                                ];

                                return (
                                    <div
                                        key={child?.id}
                                        className="col-span-1 mt-3"
                                    >
                                        <InfoField
                                            title={child?.name}
                                            data={dataToDisplay}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    {!!employeeData?.data?.education?.length && (
                        <div>
                            <div className="font-semibold mb-3">
                                <h1>Education </h1>
                            </div>
                            {employeeData?.data?.education?.map(
                                (education: any) => {
                                    const dataToDisplay = [
                                        {
                                            label: 'School Name',
                                            value: education?.schoolName,
                                        },
                                        {
                                            label: 'Qualification',
                                            value: education?.qualification,
                                        },
                                        {
                                            label: 'Address',
                                            value: education?.address,
                                        },
                                    ];

                                    return (
                                        <div
                                            key={education?.id}
                                            className="col-span-1 mt-3"
                                        >
                                            <InfoField
                                                title={education?.schoolName}
                                                data={dataToDisplay}
                                            />
                                        </div>
                                    );
                                },
                            )}
                        </div>
                    )}
                    {!!employeeData?.data?.workExperience?.length && (
                        <div>
                            <div className="font-semibold mb-3">
                                <h1>Work Experience</h1>
                            </div>
                            {employeeData?.data?.workExperience?.map(
                                (workExperience: any) => {
                                    const dataToDisplay = [
                                        {
                                            label: 'Name of Organization',
                                            value: workExperience?.nameOfOrg,
                                        },
                                        {
                                            label: 'Designation',
                                            value: workExperience?.designation,
                                        },
                                        {
                                            label: 'Key Functions',
                                            value: workExperience?.keyFunctions,
                                        },
                                        {
                                            label: 'Address',
                                            value: workExperience?.address,
                                        },
                                        {
                                            label: 'Date',
                                            value: workExperience?.date,
                                        },
                                    ];

                                    return (
                                        <div
                                            key={workExperience?.id}
                                            className="col-span-1 mt-3"
                                        >
                                            <InfoField
                                                title={
                                                    workExperience?.nameOfOrg
                                                }
                                                data={dataToDisplay}
                                            />
                                        </div>
                                    );
                                },
                            )}
                        </div>
                    )}
                    {!!employeeData?.data?.refrees?.length && (
                        <div>
                            <div className="font-semibold mb-3">
                                <h1>Refrees</h1>
                            </div>
                            {employeeData?.data?.refrees?.map((refree: any) => {
                                const dataToDisplay = [
                                    {
                                        label: 'Name',
                                        value: refree?.name,
                                    },
                                    {
                                        label: 'Phone',
                                        value: refree?.phone,
                                    },
                                    {
                                        label: 'Profession',
                                        value: refree?.profession,
                                    },
                                    {
                                        label: 'Cccupation',
                                        value: refree?.occupation,
                                    },
                                ];

                                return (
                                    <div
                                        key={refree?.id}
                                        className="col-span-1 mt-3"
                                    >
                                        <InfoField
                                            title={refree?.name}
                                            data={dataToDisplay}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </PageWrapper>
    );
};

export default EmployeePage;
