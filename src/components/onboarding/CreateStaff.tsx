'use client';
import { fetchRoles, inviteOnboardingStaff } from '@/app/actions/staff';
import { Role } from '@/types/staff.types';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'nextjs-toploader/app';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Toast from '../toast';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';
import { useVerifiedAccessGuard } from '../VerifiedAccessGuard';

interface InputFieldProps extends React.ComponentPropsWithoutRef<'input'> {
    label: string;
    placeholder: string;
    type: string;
}

const InputField = ({
    label,
    placeholder,
    type,
    ...props
}: InputFieldProps) => {
    return (
        <div className="w-full flex flex-col items-start">
            <label className="text-sm text-muted-foreground">{label}</label>
            <Input
                type={type}
                {...props}
                className="w-full h-12 shadow-none focus-visible:ring-1 focus-visible:ring-orion-blue"
                placeholder={placeholder}
            />
        </div>
    );
};

const CreateStaffPage = () => {
    const router = useRouter();
    const [refreshTable, setRefreshTable] = useState(1);
    const { hotel, loading: loadingHotel } = useVerifiedAccessGuard();
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = React.useState({
        fullName: '',
        email: '',
        roleId: 1,
    });

    useEffect(() => {
        const getRoles = async () => {
            const response = await fetchRoles();
            const data = response.data;
            setRoles(
                data.map((item: Role) => ({
                    value: item.id,
                    name: item.name,
                    label: item.department,
                })),
            );
        };
        getRoles();
    }, []);

    if (loadingHotel) {
        return (
            <div className="flex w-full h-screen items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin" />{' '}
                    <p className="text-muted-foreground">
                        Checking verification status...
                    </p>
                </div>
            </div>
        );
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event?.preventDefault();
        try {
            setLoading(true);
            const response = await inviteOnboardingStaff({
                fullName: formData.fullName,
                email: formData.email,
                roleId: formData.roleId,
                username: formData.email,
            });
            if (response) {
                if (response.message === 'Staff invited successfully') {
                    toast.custom(() => (
                        <Toast
                            title="Success!"
                            description={`Staff invited successfully: ${formData.email}`}
                            type="success"
                        />
                    ));
                    setRefreshTable(refreshTable + 1);
                    setLoading(false);
                } else {
                    toast.custom(() => (
                        <Toast
                            title="Error!"
                            description={response.message}
                            type="error"
                        />
                    ));
                    setLoading(false);
                }
            }
        } catch (error: any) {
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description={`Failed to invite staff: ${error.message}`}
                    type="error"
                />
            ));
            setLoading(false);
        }
    };

    return (
        <div className="flex w-full h-screen">
            <div className="w-full h-full flex items-center justify-center">
                <div className="w-full gap-4 h-full max-w-lg flex flex-col items-center justify-center p-10">
                    <div className="flex text-center flex-col gap-1 items-center text-muted-foreground">
                        <div>
                            <Image
                                src="https://placehold.co/400x400.png"
                                alt="verify-role"
                                width={100}
                                height={100}
                                className="rounded-full"
                            />
                        </div>
                        <h1 className="text-lg font-bold">{hotel?.name}</h1>
                        <p>{`You will be the first administrator of your account.`}</p>
                    </div>
                    <form
                        className="w-full flex flex-col gap-4 mt-3"
                        onSubmit={handleSubmit}
                    >
                        <InputField
                            label="Full Name"
                            placeholder="John Doe"
                            type="text"
                            value={formData.fullName}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    fullName: e.target.value,
                                })
                            }
                        />
                        <InputField
                            label="Email Address"
                            placeholder="example@email.com"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    email: e.target.value,
                                })
                            }
                        />
                        <div className="w-full flex flex-col items-start">
                            <label className="text-sm text-muted-foreground">
                                Role
                            </label>
                            <Select
                                value={formData.roleId.toString()}
                                onValueChange={(value) =>
                                    setFormData({
                                        ...formData,
                                        roleId: parseInt(value),
                                    })
                                }
                            >
                                <SelectTrigger className="w-full h-12">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((role) => (
                                        <SelectItem
                                            key={role.value}
                                            value={role.value.toString()}
                                        >
                                            {role.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            type="submit"
                            className="bg-orion-blue w-full hover:bg-orion-blue text-white h-12"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" />
                            ) : null}
                            {loading ? 'Loading...' : 'Invite Staffs'}
                        </Button>
                    </form>
                    <Button
                        variant="outline"
                        className="bg-white w-full text-orion-blue h-12"
                        onClick={() => router.replace('/welcome')}
                    >
                        Continue
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CreateStaffPage;
