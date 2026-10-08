import { BUSINESS_TYPES, BusinessType } from '@/constants/businessTypes';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { CgSpinner } from 'react-icons/cg';
import { IoIosArrowDown } from 'react-icons/io';
import Select, { SingleValue } from 'react-select';
import countryList from 'react-select-country-list';

interface SignupStepTwoProps {
    country: CountryOption | null;
    setCountry: (value: SingleValue<CountryOption>) => void;
    // setCountry: React.Dispatch<React.SetStateAction<string>>;
    isLoading: boolean;
    error: string | null;
}

interface CountryOption {
    label: string;
    value: string;
}

export default function SignupStepTwo({
    country,
    setCountry,
    isLoading,
    error,
}: SignupStepTwoProps) {
    const [address, setAddress] = useState('');
    const [state, setState] = useState('');
    const [businessType, setBusinessType] = useState<BusinessType | ''>('');
    //const [registration, setRegistration] = useState('');

    const options = useMemo<CountryOption[]>(() => countryList().getData(), []);

    const isFormValid =
        address.trim().length > 1 &&
        state.trim().length > 1 &&
        businessType.trim().length > 0 &&
        //  registration.trim().length > 1 &&
        country !== null;

    return (
        <>
            <div className="flex flex-col">
                <label htmlFor="address">Organization Address</label>
                <input
                    id="address"
                    name="address"
                    placeholder="Enter street address or P.O box"
                    required
                    aria-label="Organization Address"
                    aria-required="true"
                    minLength={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="border p-2 w-full rounded-lg border-[#D5D4D4]"
                />
            </div>
            <div className="flex flex-col">
                <label htmlFor="state" className="capitalize">
                    State of residence
                </label>
                <input
                    id="state"
                    name="state"
                    placeholder="Enter State or Province"
                    required
                    aria-label="Organization State"
                    aria-required="true"
                    minLength={2}
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="border p-2 w-full rounded-lg border-[#D5D4D4]"
                />
            </div>
            <div className="flex flex-col">
                <label htmlFor="country" className="capitalize">
                    Country
                </label>
                <Select
                    id="country"
                    options={options}
                    value={country}
                    onChange={(selectedOption) => setCountry(selectedOption)}
                    placeholder="Select a country"
                    className="rounded-lg"
                    isClearable
                />
            </div>
            <div className="flex flex-col mb-4">
                <label htmlFor="businessType" className="capitalize">
                    Business Type
                </label>
                <div className="grid grid-cols-1 items-center">
                    <select
                        id="businessType"
                        name="businessType"
                        required
                        value={businessType}
                        onChange={(e) =>
                            setBusinessType(e.target.value as BusinessType)
                        }
                        className="col-start-1 row-start-1 outline outline-1 -outline-offset-1 outline-[#D5D4D4] appearance-none p-2 pr-10 w-full rounded-lg text-[#919191]"
                    >
                        <option value="" disabled hidden>
                            Select Business type
                        </option>
                        {BUSINESS_TYPES.map(({ value, label }) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                    <IoIosArrowDown className="col-start-1 pointer-events-none row-start-1 justify-self-end mr-2" />
                </div>
            </div>
            {/* <div className="flex flex-col">
                <label htmlFor="registrationNumber" className="capitalize">
                    Registration Number (C.A.C)
                </label>
                <input
                    id="registrationNumber"
                    name="registrationNumber"
                    placeholder="Enter Official Registration Number"
                    required
                    aria-label="Registration Number"
                    aria-required="true"
                    minLength={2}
                    value={registration}
                    onChange={(e) => setRegistration(e.target.value)}
                    className="border p-2 w-full rounded-lg border-[#D5D4D4]"
                />
            </div> */}
            <p>
                By signing up, you agree to our{' '}
                <Link href="/terms" className="text-blue-500">
                    terms and conditions
                </Link>
                .
            </p>
            {error && <p className="text-red-500">{error}</p>}
            <button
                type="submit"
                disabled={!isFormValid || isLoading}
                className={`transition-colors ease-in-out delay-100 duration-500 p-2 rounded-lg w-full font-semibold ${
                    isFormValid && !isLoading
                        ? 'bg-orion-blue hover:bg-[#0059ff] text-white'
                        : 'bg-gray-300 cursor-not-allowed'
                } p-4 rounded-xl w-full font-semibold self-center`}
            >
                {isLoading ? (
                    <span className="flex justify-center items-center">
                        <CgSpinner className="animate-spin h-5 w-5 mr-3" />
                        <span className="animate-pulse">Registering...</span>
                    </span>
                ) : (
                    'Register'
                )}
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
