'use client';
import { getStaff } from '@/app/actions/staff';
import { InputField, SelectField } from '@/components/common/Form';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import PageWrapper from '@/components/common/PageWrapper';
import { Switch } from '@/components/ui/switch';
import { useEffect, useMemo, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import Toast from '@/components/toast';
import { updateHotelComplimentSettings } from '@/app/actions/hotel';
import useHotel from '@/hooks/useHotel';
import { IoClose } from 'react-icons/io5';
import { Spinner } from '@heroui/react';
import { Staff } from '@/types/staff.types';

type SettingsProp = {
    enabled: boolean;
    maxAmountPerOrder: number | string;
    allowedApprovers: Staff[];
    appliesTo: string[];
};

const MANAGERIAL_ROLE_KEYWORDS = [
    'manager',
    'admin',
    'supervisor',
    'owner',
    'director',
    'lead',
    'head',
];

const serializeSettings = (settings: SettingsProp) =>
    JSON.stringify({
        enabled: Boolean(settings.enabled),
        maxAmountPerOrder: Number(settings.maxAmountPerOrder || 0),
        allowedApproverIds: (settings.allowedApprovers || [])
            .map((approver) => Number(approver?.id))
            .sort((a, b) => a - b),
        appliesTo: [...(settings.appliesTo || [])].sort((a, b) =>
            a.localeCompare(b),
        ),
    });

export default function ComplementaryPolicyPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [staffs, setStaffs] = useState<Staff[]>([]);
    const [initialSettingsSnapshot, setInitialSettingsSnapshot] = useState('');

    const staffsToUse = staffs.filter((staff) => {
        const roleName = staff?.roles?.name?.toLowerCase() ?? '';
        return MANAGERIAL_ROLE_KEYWORDS.some((keyword) =>
            roleName.includes(keyword),
        );
    });

    const { organization: hotel } = useHotel();
    const hotelId = hotel?.id;

    const [settings, setSettings] = useState<SettingsProp>({
        enabled: false,
        maxAmountPerOrder: '',
        allowedApprovers: [],
        appliesTo: [],
    });

    useEffect(() => {
        const nextSettings = {
            enabled: hotel?.complimentarySettings?.enabled || false,
            maxAmountPerOrder:
                hotel?.complimentarySettings?.maxAmountPerOrder || '',
            allowedApprovers:
                hotel?.complimentarySettings?.allowedApprovers || [],
            appliesTo: hotel?.complimentarySettings?.appliesTo || [],
        };
        setSettings(nextSettings);
        setInitialSettingsSnapshot(serializeSettings(nextSettings));
    }, [hotel]);

    const isDirty = useMemo(() => {
        return serializeSettings(settings) !== initialSettingsSnapshot;
    }, [settings, initialSettingsSnapshot]);

    const fetchStaffData = async () => {
        setIsLoading(true);
        try {
            const response = (await getStaff(1, 1000)) as any;
            setStaffs(response.data);
        } catch (err) {
            console.error('Error fetching staffs:', err);
            setStaffs([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStaffData();
    }, []);

    const sections = [
        { label: 'Table services', value: 'DINE_IN' },
        { label: 'Room services', value: 'ROOM' },
        { label: 'Take away', value: 'TAKE_AWAY' },
        { label: 'Fast food', value: 'FAST_FOOD' },
        { label: 'Home delivery', value: 'DELIVERY' },
    ];

    const showApprovers = () => {
        return (
            <div className="flex flex-wrap w-full">
                {settings?.allowedApprovers?.map((allowedApprovers) => (
                    <div
                        key={allowedApprovers?.id}
                        className="relative bg-blue w-fit p-2 rounded-sm m-1"
                    >
                        <div
                            onClick={() => {
                                setSettings((settings) => ({
                                    ...settings,
                                    allowedApprovers:
                                        settings.allowedApprovers.filter(
                                            (appliesToHere) =>
                                                appliesToHere?.id !==
                                                allowedApprovers?.id,
                                        ),
                                }));
                            }}
                            className="-top-2 -right-2 absolute w-4 h-4 rounded-full bg-red-600 justify-center items-center cursor-pointer"
                        >
                            <IoClose size={16} color="#fff" />
                        </div>
                        <div className="">{allowedApprovers?.fullName}</div>
                    </div>
                ))}
            </div>
        );
    };

    const renderAppliesTo = () => {
        return (
            <div className="flex flex-wrap w-full">
                {settings?.appliesTo?.map((appliesTo) => (
                    <div
                        key={appliesTo}
                        className="relative bg-blue w-fit p-2 rounded-sm m-1"
                    >
                        <div
                            onClick={() => {
                                setSettings((settings) => ({
                                    ...settings,
                                    appliesTo: settings.appliesTo.filter(
                                        (appliesToHere) =>
                                            appliesToHere !== appliesTo,
                                    ),
                                }));
                            }}
                            className="-top-2 -right-2 absolute w-4 h-4 rounded-full bg-red-600 justify-center items-center cursor-pointer"
                        >
                            <IoClose size={16} color="#fff" />
                        </div>
                        <div className="">
                            {
                                sections?.find(
                                    (section) => section.value === appliesTo,
                                )?.label
                            }
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const optionsList = [
        {
            title: 'Enable Complimentary Feature',
            detail: '',
            comp: (
                <Switch
                    checked={settings.enabled}
                    onCheckedChange={(value) =>
                        setSettings((settings) => ({
                            ...settings,
                            enabled: value,
                        }))
                    }
                    className="data-[state=checked]:bg-hexbrand"
                />
            ),
        },
        {
            title: 'Max Complimentary Amount (Per Order)',
            detail: settings?.maxAmountPerOrder,
            comp: (
                <InputField
                    id="maxAmountPerOrder"
                    name="maxAmountPerOrder"
                    label=""
                    type="number"
                    value={settings?.maxAmountPerOrder}
                    onChange={(e) => {
                        setSettings((settings) => ({
                            ...settings,
                            maxAmountPerOrder: Number(e.target.value),
                        }));
                    }}
                    placeholder="Max Complimentary Amount (Per Order)"
                />
            ),
        },
        {
            title: 'Allowed Approvers',
            detail: <span>{showApprovers()}</span>,
            comp: (
                <SelectField
                    id="allowedApprovers"
                    name="allowedApprovers"
                    label=""
                    value={''}
                    onValueChange={(value: string) => {
                        const staffId = Number(value);
                        const selectedStaff = staffs?.find(
                            (staff) => Number(staff?.id) === staffId,
                        );
                        if (
                            !settings.allowedApprovers?.find(
                                (staff) => Number(staff?.id) === staffId,
                            )
                        ) {
                            if (selectedStaff) {
                                setSettings((settings) => ({
                                    ...settings,
                                    allowedApprovers: [
                                        ...settings.allowedApprovers,
                                        selectedStaff,
                                    ],
                                }));
                            }
                        }
                    }}
                    options={staffsToUse.map((staff: Staff) => ({
                        value: String(staff.id),
                        label: staff.fullName,
                    }))}
                    placeholder="Select a staff"
                    className="w-full"
                />
            ),
        },
        {
            title: 'Complimentary Applies To',
            detail: <>{renderAppliesTo()}</>,
            comp: (
                <SelectField
                    id="appliesTo"
                    name="appliesTo"
                    label=""
                    value={''}
                    onValueChange={(value: any) => {
                        if (!settings.appliesTo?.includes(value))
                            setSettings((settings) => ({
                                ...settings,
                                appliesTo: [...settings.appliesTo, value],
                            }));
                    }}
                    options={sections.map((section: any) => ({
                        value: section.value,
                        label: section.label,
                    }))}
                    placeholder="Select a section"
                    className="w-full"
                />
            ),
        },
    ];

    const handleSubmit = async () => {
        setIsSubmitting(true);

        const dataToSubmit = {
            enabled: settings.enabled,
            appliesTo: settings.appliesTo,
            allowedApproverIds: settings.allowedApprovers?.map((approver) =>
                Number(approver?.id),
            ),
            maxAmountPerOrder: Number(settings.maxAmountPerOrder),
        };

        try {
            const result = await updateHotelComplimentSettings(
                hotelId || 0,
                dataToSubmit,
            );
            console.log('result', result);

            if (result.data?.success) {
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description="Complimentary settings updated"
                        type="success"
                    />
                ));
                setInitialSettingsSnapshot(
                    serializeSettings({
                        ...settings,
                        maxAmountPerOrder: Number(settings.maxAmountPerOrder),
                    }),
                );
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description="Failed to save Complimentary settings"
                        type="error"
                    />
                ));
            }
        } catch (error: any) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="Failed to save Complimentary settings"
                    type="error"
                />
            ));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <PageWrapper>
            <PageHeader>
                <PageHeadertitle
                    title="Table Management"
                    subtitle={`Manage your restaurant's tables`}
                />
            </PageHeader>

            {isLoading ? (
                <div className="w-full h-full min-h-[50vh] justify-center items-center">
                    <Spinner />
                </div>
            ) : (
                <Table>
                    <TableHeader className="bg-gray-100 py-4">
                        <TableRow>
                            <TableHead>Feature</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {optionsList.map((option) => (
                            <TableRow key={option.title}>
                                <TableCell>{option.title}</TableCell>
                                <TableCell>{option.detail}</TableCell>
                                <TableCell>{option.comp}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            <Button
                onClick={handleSubmit}
                variant={'default'}
                size="lg"
                disabled={isSubmitting || !isDirty}
                className="mt-4 mx-auto flex items-center text-white bg-orion-blue hover:bg-orion-blue"
            >
                {isSubmitting ? 'Saving...' : 'Save'}
            </Button>
        </PageWrapper>
    );
}
