'use client';

import SignupImage from '@/components/signup/SignupImage';
import SignupStepOne from '@/components/signup/SignupStep1';
import SignupStepTwo from '@/components/signup/SignupStep2';
import StepProgressBar from '@/components/signup/StepProgressBar';
import Toast from '@/components/toast';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'nextjs-toploader/app';
import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import { SingleValue } from 'react-select';
import { signup } from '../actions/auth';

interface CountryOption {
    label: string;
    value: string;
}

export default function SignupPage() {
    const [step, setStep] = useState(1);
    const [phone, setPhone] = useState<string>('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [country, setCountry] = useState<SingleValue<CountryOption>>(null);
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const criteria = {
        equal: password === confirmPassword,
        length: password.length >= 8,
        hasSpecial: /[!@#$%^&*]/.test(password),
        hasUpperCase: /[A-Z]/.test(password),
        hasLowerCase: /[a-z]/.test(password),
    };

    const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        // if (!Object.values(criteria).every(Boolean)) {
        //     setError('Your Password is weak or passwords do not match');
        //     return;
        // }

        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        formData.append('password', password);
        formData.append('phone', phone);
        formData.append('name', name);
        formData.append('email', email);
        formData.append('country', country?.value || '');

        try {
            const response = await signup(formData);
            const { data } = response;
            toast.custom(() => (
                <Toast
                    title="Success!"
                    description={data.message}
                    type="success"
                />
            ));

            if (typeof window !== 'undefined') {
                localStorage.setItem('hotelId', data.id);
            }
            setTimeout(() => {
                router.push(
                    `/signup/onboarding/${data.id}?token=${data.token}`,
                );
            }, 100);
        } catch (err: any) {
            toast.custom(() => (
                <Toast title="Error!" description={err.message} type="error" />
            ));
            setError(
                err instanceof Error
                    ? err.message
                    : 'An unexpected error occurred',
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex lg:grid lg:grid-cols-2 grid-rows-1 w-full h-screen text-[#6C6C6C]">
            <div className="flex flex-col items-left justify-center place-self-center p-4 w-full max-w-2xl lg:max-w-lg gap-8">
                <div className="flex flex-col gap-2">
                    <h1 className="font-bold text-4xl text-black">
                        Welcome to Anli
                    </h1>
                    <p>
                        Anli is your one-stop to help manage hotel inventory and
                        keep your business running.
                    </p>
                    {step > 1 && (
                        <button
                            type="button"
                            onClick={() => setStep(step - 1)}
                            className="flex items-center w-[100px] gap-2 py-2 px-2 bg-transparent text-orion-blue hover:bg-blue-200 rounded-lg shadow-md focus:outline-none transition duration-200 ease-in-out transform hover:scale-105"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            <span className="text-sm font-medium">Back</span>
                        </button>
                    )}
                </div>
                <form
                    onSubmit={handleSignup}
                    className="flex flex-col space-y-6 text-sm"
                    aria-busy={isLoading}
                >
                    <StepProgressBar currentStep={step} totalSteps={2} />
                    {step === 1 && (
                        <SignupStepOne
                            phone={phone}
                            setPhone={setPhone}
                            name={name}
                            setName={setName}
                            email={email}
                            setEmail={setEmail}
                            password={password}
                            setPassword={setPassword}
                            confirmPassword={confirmPassword}
                            setConfirmPassword={setConfirmPassword}
                            criteria={criteria}
                            onContinue={() => setStep(2)}
                        />
                    )}
                    {step === 2 && (
                        <SignupStepTwo
                            country={country}
                            setCountry={setCountry}
                            isLoading={isLoading}
                            error={error}
                        />
                    )}
                </form>
            </div>
            <SignupImage />
        </div>
    );
}
