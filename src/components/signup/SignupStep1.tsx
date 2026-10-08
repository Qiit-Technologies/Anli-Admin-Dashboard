import { ValidationCriteria } from '@/lib/helpers';
import Link from 'next/link';
import React, { useMemo } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import PasswordInput from './PasswordInput';
import CriteriaItem from './CriteriaItem';

interface SignupStepOneProps {
    phone: string;
    setPhone: (value: string) => void;
    name: string;
    setName: React.Dispatch<React.SetStateAction<string>>;
    email: string;
    setEmail: React.Dispatch<React.SetStateAction<string>>;
    password: string;
    setPassword: React.Dispatch<React.SetStateAction<string>>;
    confirmPassword: string;
    setConfirmPassword: (value: string) => void;
    criteria: ValidationCriteria;
    onContinue: () => void;
}

export default function SignupStepOne({
    phone,
    setPhone,
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    criteria,
    onContinue,
}: SignupStepOneProps) {
    const [isFocused, setIsFocused] = React.useState(false);

    const isFormValid = useMemo(() => {
        const isOrgNameValid =
            typeof name === 'string' && name.trim().length >= 2;
        const isEmailValid =
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
        const isPhoneValid = phone.replace(/\D/g, '').length >= 10;
        const isPasswordConfirmed = criteria.equal;
        // const areCriteriaValid = Object.values(criteria).every(Boolean);

        return (
            isOrgNameValid &&
            isEmailValid &&
            isPhoneValid &&
            isPasswordConfirmed
        );
    }, [name, email, phone, criteria]);

    return (
        <>
            <div className="flex flex-col">
                <label htmlFor="orgName">Organization Name</label>
                <input
                    id="orgName"
                    name="orgName"
                    placeholder="Enter the name of your organization"
                    required
                    aria-label="Organization Name"
                    aria-required="true"
                    minLength={2}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border p-2 w-full rounded-md border-[#D5D4D4]"
                />
            </div>
            <div className="flex flex-col">
                <label htmlFor="email" className="capitalize">
                    Your Work Email Address
                </label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your organization email address"
                    required
                    aria-label="Organization Email"
                    aria-required="true"
                    minLength={2}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border p-2 w-full rounded-md border-[#D5D4D4]"
                />
            </div>
            <div className="flex flex-col">
                <label htmlFor="phone">Phone Number</label>
                <PhoneInput
                    country={'ng'}
                    value={phone}
                    onChange={setPhone}
                    inputProps={{
                        name: 'phone',
                        required: true,
                    }}
                    inputStyle={{
                        width: '100%',
                        paddingBlock: '8px',
                        borderColor: '#D5D4D4',
                        fontSize: '14px',
                        boxShadow: 'none',
                    }}
                />
            </div>
            <div className="flex flex-col">
                <PasswordInput password={password} setPassword={setPassword} />
            </div>
            <div className="flex flex-col">
                <label htmlFor="confirm-password">Confirm Password</label>
                <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    placeholder="Confirm your password"
                    required
                    className="border p-2 w-full rounded-md border-[#D5D4D4]"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />
                <div
                    className={`flex gap-2 transition-all duration-300 ease-in-out ${
                        isFocused
                            ? 'opacity-100 max-h-screen'
                            : 'opacity-0 max-h-0 overflow-hidden'
                    }`}
                >
                    <CriteriaItem
                        showXInsteadOfCheckmark
                        isValid={criteria.equal}
                        label="Passwords match"
                    />
                </div>
            </div>
            <button
                type="button"
                onClick={onContinue}
                disabled={!isFormValid} // Disable button if form is invalid
                className={`transition-colors ease-in-out delay-100 duration-500 ${
                    isFormValid
                        ? 'bg-orion-blue hover:bg-[#0059ff] text-white'
                        : 'bg-gray-300 cursor-not-allowed'
                } p-4 rounded-xl w-full font-semibold self-center`}
            >
                Continue
            </button>
            <p className="text-center">
                Already a user?{' '}
                <Link className="text-orion-blue font-semibold" href="/signin">
                    Login
                </Link>
            </p>
        </>
    );
}
