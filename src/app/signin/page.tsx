'use client';

import CustomLoader from '@/components/Loader';
import Toast from '@/components/toast';
import { useUserProfile } from '@/hooks/useUser';
import {
    getDefaultPathForRole,
    getDefaultPathForModules,
    hasMultipleRolePaths,
} from '@/lib/role-paths';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'nextjs-toploader/app';
import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { signin } from '../actions/auth';
import image from '../assets/sign-image.svg';
import { useUser } from '@/context/useUser';
import { useSWRConfig } from 'swr';
import { TUser } from '@/types/user';

export default function SigninPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { setUser } = useUser();
    const { mutate } = useSWRConfig();
    const { refreshProfile } = useUserProfile();

    const handleSignin = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);

        try {
            const response = await signin(formData);
            if (response?.message === 'Sign-in successful!') {
                if (typeof window !== 'undefined') {
                    const hotelId =
                        response?.data?.hotel?.id ?? response?.data.id;
                    if (hotelId) {
                        localStorage.setItem('hotelId', hotelId.toString());
                        // Also preserve it for staff login page
                        localStorage.setItem(
                            'staffLoginHotelId',
                            hotelId.toString(),
                        );
                    }
                }

                if (response.data) {
                    setUser(response.data as TUser);
                    localStorage.setItem('user', JSON.stringify(response.data));
                    localStorage.setItem('authToken', response.token);
                }

                // refresh related data
                mutate('user-profile');
                mutate('hotel-details');
                refreshProfile();

                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description={response.message}
                        type="success"
                    />
                ));

                const userRole = response.data?.roles.name;
                const userModules = response.data?.modules || [];
                const isManager = userRole === 'manager';
                const isAdministrator = userRole === 'administrator';

                let redirectPath = '/manager';

                if (isAdministrator) {
                    redirectPath = '/admin';
                } else if (isManager) {
                    redirectPath = '/manager';
                } else if (hasMultipleRolePaths(userRole)) {
                    redirectPath = '/manager';
                } else {
                    const rolePath = getDefaultPathForRole(userRole);
                    if (rolePath && rolePath !== '/manager') {
                        redirectPath = rolePath;
                    } else {
                        redirectPath = getDefaultPathForModules(userModules);
                    }
                }

                router.push(redirectPath);
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={response.message}
                        type="error"
                    />
                ));
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {isLoading && <CustomLoader />}
            <div className="flex justify-center md:grid grid-cols-2 grid-rows-1 max-h-screen w-full min-h-screen text-[#6C6C6C]">
                <div className="flex flex-col items-left justify-center place-self-center p-4 w-full max-w-md gap-8">
                    <div className="flex flex-col gap-2">
                        <h1 className="font-bold text-4xl text-black">
                            Welcome to Anli
                        </h1>
                        <h2>Intelligent Hotel Insights</h2>
                    </div>
                    <form
                        onSubmit={handleSignin}
                        method="POST"
                        autoComplete="on"
                        id="loginForm"
                        className="space-y-4 text-sm border-[#D5D4D4]"
                    >
                        <div>
                            <label htmlFor="email">email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                placeholder="Enter your email"
                                required
                                className="border p-2 w-full rounded-md border-[#D5D4D4]"
                            />
                        </div>
                        <div className="relative">
                            <label htmlFor="password">Password</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="password"
                                    placeholder="Enter your password"
                                    required
                                    className="border p-2 w-full rounded-md border-[#D5D4D4] pr-10"
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                >
                                    {showPassword ? (
                                        <AiOutlineEyeInvisible size={20} />
                                    ) : (
                                        <AiOutlineEye size={20} />
                                    )}
                                </button>
                            </div>
                        </div>
                        {error && <p className="text-red-500">{error}</p>}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="transition-colors ease-in-out delay-100 duration-500 bg-orion-blue hover:bg-[#0059ff] text-white p-2 rounded w-full font-semibold"
                        >
                            {isLoading ? 'Logging in...' : 'Login'}
                        </button>
                        <div className="space-y-2">
                            <p className="text-center">
                                Don&apos;t have an account?{' '}
                                <Link
                                    className="text-orion-blue font-semibold"
                                    href="/signup"
                                >
                                    Register
                                </Link>
                            </p>
                            <p className="text-center">
                                <Link
                                    className="text-orion-blue font-semibold hover:underline"
                                    href="/staff-login"
                                >
                                    Switch to Fast Login
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
                <div className="hidden md:flex">
                    <Image
                        className="object-cover object-left-bottom w-full"
                        src={image}
                        width={785}
                        height={1024}
                        alt="Hotel La Grand, in Logos, Nigeria"
                    />
                </div>
            </div>
        </>
    );
}
