import { InputField, SelectField } from '@/components/common/Form';
import { FormColumn, FormGroup } from '../components';
import { GuestSearch } from '../GuestSearch';
import { StepProps } from '../types';

export function GuestInformationStep({
    formData,
    handleInputChange,
    errors,
    inputClass,
    searchQuery,
    setSearchQuery,
    searchingGuest,
    showResults,
    guestHistory,
    autoFillGuestData,
    setShowResults,
    setGuestHistory,
}: StepProps & {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    searchingGuest: boolean;
    showResults: boolean;
    guestHistory: any[];
    autoFillGuestData: (guest: any) => void;
    setShowResults: (show: boolean) => void;
    setGuestHistory: (history: any[]) => void;
}) {
    return (
        <div className="flex flex-col gap-4">
            <FormGroup>
                <FormColumn>
                    <GuestSearch
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        searchingGuest={searchingGuest}
                        showResults={showResults}
                        guestHistory={guestHistory}
                        autoFillGuestData={autoFillGuestData}
                        setShowResults={setShowResults}
                        setGuestHistory={setGuestHistory}
                        inputClass={inputClass}
                        value={formData.fullName || ''}
                        onValueChange={(value) =>
                            handleInputChange('fullName', value)
                        }
                    />
                    {errors.fullName && (
                        <div className="text-red-500 text-sm">
                            {errors.fullName}
                        </div>
                    )}
                </FormColumn>
                <FormColumn>
                    <InputField
                        id="phoneNumber"
                        name="phoneNumber"
                        label="Phone Number"
                        type="text"
                        placeholder="Enter 11-digit phone number"
                        className={inputClass}
                        value={String(formData.phoneNumber || '')
                            .replace(/\D/g, '')
                            .slice(0, 11)}
                        onChange={(e) => {
                            const value = e.target.value
                                .replace(/\D/g, '')
                                .slice(0, 11);
                            handleInputChange('phoneNumber', value);
                        }}
                        maxLength={11}
                    />
                    {errors.phoneNumber && (
                        <div className="text-red-500 text-sm">
                            {errors.phoneNumber}
                        </div>
                    )}
                </FormColumn>
            </FormGroup>
            <FormGroup>
                <FormColumn>
                    <InputField
                        id="email"
                        name="email"
                        label="Email"
                        type="email"
                        placeholder="Enter Guest Email"
                        className={inputClass}
                        value={formData.email || ''}
                        onChange={(e) =>
                            handleInputChange('email', e.target.value)
                        }
                    />
                    {errors.email && (
                        <div className="text-red-500 text-sm">
                            {errors.email}
                        </div>
                    )}
                </FormColumn>
                <FormColumn>
                    <InputField
                        id="numberOfGuests"
                        name="numberOfGuests"
                        label="Number of Guests"
                        type="number"
                        className={inputClass}
                        value={formData.numberOfGuests?.toString() || '1'}
                        onChange={(e) =>
                            handleInputChange(
                                'numberOfGuests',
                                parseInt(e.target.value),
                            )
                        }
                    />
                    {errors.numberOfGuests && (
                        <div className="text-red-500 text-sm">
                            {errors.numberOfGuests}
                        </div>
                    )}
                </FormColumn>
            </FormGroup>
            <FormGroup>
                <FormColumn>
                    <InputField
                        id="secondGuestFullName"
                        name="secondGuestFullName"
                        label="Second Guest Name (Optional)"
                        placeholder="Enter Second Guest Name"
                        className={inputClass}
                        value={formData.secondGuestFullName || ''}
                        onChange={(e) =>
                            handleInputChange(
                                'secondGuestFullName',
                                e.target.value,
                            )
                        }
                    />
                </FormColumn>
                <FormColumn>
                    <SelectField
                        id="secondGuestType"
                        name="secondGuestType"
                        label="Second Guest Type"
                        className={inputClass}
                        value={formData.secondGuestType || 'adult'}
                        onValueChange={(value) =>
                            handleInputChange('secondGuestType', value)
                        }
                        options={[
                            { value: 'adult', label: 'Adult' },
                            { value: 'child', label: 'Child' },
                        ]}
                        placeholder="Select guest type"
                    />
                </FormColumn>
            </FormGroup>
        </div>
    );
}
