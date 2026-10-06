import React, { useState } from 'react';
import CriteriaItem from './CriteriaItem';
import { HiMiniEyeSlash, HiMiniEye } from 'react-icons/hi2';

interface PasswordInputProps {
    password: string;
    setPassword: React.Dispatch<React.SetStateAction<string>>;
}

export default function PasswordInput({
    password,
    setPassword,
}: PasswordInputProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const criteria = React.useMemo(
        () => ({
            hasUpperCase: /[A-Z]/.test(password),
            hasSymbol: /[^a-zA-Z0-9]/.test(password),
            hasMinLength: password.length >= 8,
        }),
        [password],
    );

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    };

    return (
        <>
            <div className="relative">
                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Enter your password"
                    className="w-full p-2 border border-[#D5D4D4] rounded-md pr-10"
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    autoComplete="new-password"
                    aria-invalid={!Object.values(criteria).every(Boolean)}
                />
                {/* Toggle Password Visibility Icon */}
                <span
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-2/3 -translate-y-1/2 cursor-pointer text-gray-500 flex items-center justify-center h-full"
                    aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                    }
                >
                    {showPassword ? <HiMiniEyeSlash /> : <HiMiniEye />}
                </span>
            </div>
            <div
                className={`flex gap-2 transition-all duration-300 ease-in-out ${
                    isFocused
                        ? 'opacity-100 max-h-screen'
                        : 'opacity-0 max-h-0 overflow-hidden'
                }`}
            >
                <CriteriaItem isValid={criteria.hasUpperCase} label="a-A" />
                <CriteriaItem isValid={criteria.hasSymbol} label="Symbols" />
                <CriteriaItem
                    isValid={criteria.hasMinLength}
                    label="8 - lettered password"
                />
            </div>
        </>
    );
}
