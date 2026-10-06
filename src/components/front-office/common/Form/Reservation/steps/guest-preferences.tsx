import { InputField, SelectField } from '@/components/common/Form';
import { FormColumn, FormGroup } from '../components';
import { StepProps } from '../types';
import { allCountries } from 'country-region-data';
import { useMemo } from 'react';
import { DatePicker } from '@/components/common/DatePicker';

export interface GuestPreferencesStepProps extends Omit<StepProps, 'errors'> {
    errors: Record<string, string>;
}

export function GuestPreferencesStep({
    formData,
    handleInputChange,
    inputClass,
}: GuestPreferencesStepProps) {
    const countryOptions = useMemo(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return allCountries.map((country: any) => ({
            value: country[0],
            label: country[0],
        }));
    }, []);

    return (
        <div className="flex flex-col gap-4">
            <FormGroup>
                <FormColumn>
                    <SelectField
                        id="gender"
                        name="gender"
                        label="Gender"
                        className={inputClass}
                        value={formData.gender || ''}
                        onValueChange={(value) =>
                            handleInputChange('gender', value)
                        }
                        options={[
                            { value: 'male', label: 'Male' },
                            { value: 'female', label: 'Female' },
                            { value: 'other', label: 'Other' },
                            {
                                value: 'prefer_not_to_say',
                                label: 'Prefer not to say',
                            },
                        ]}
                        placeholder="Select gender"
                    />
                </FormColumn>
                <FormColumn>
                    <DatePicker
                        id="birthday"
                        name="birthday"
                        label="Birthday"
                        className={inputClass}
                        value={formData.birthday || ''}
                        onChange={(date) => handleInputChange('birthday', date)}
                        placeholder="Select birthday"
                    />
                </FormColumn>
            </FormGroup>

            <FormGroup>
                <FormColumn>
                    <SelectField
                        id="nationality"
                        name="nationality"
                        label="Nationality"
                        className={inputClass}
                        value={formData.nationality || ''}
                        onValueChange={(value) =>
                            handleInputChange('nationality', value)
                        }
                        options={countryOptions}
                        placeholder="Select nationality"
                    />
                </FormColumn>
                <FormColumn>
                    <InputField
                        id="address"
                        name="address"
                        label="Address"
                        placeholder="Enter address"
                        className={inputClass}
                        value={formData.address || ''}
                        onChange={(e) =>
                            handleInputChange('address', e.target.value)
                        }
                    />
                </FormColumn>
            </FormGroup>

            <FormGroup>
                <FormColumn>
                    <SelectField
                        id="purposeOfVisit"
                        name="purposeOfVisit"
                        label="Purpose of Visit"
                        className={inputClass}
                        value={formData.purposeOfVisit || ''}
                        onValueChange={(value) =>
                            handleInputChange('purposeOfVisit', value)
                        }
                        options={[
                            { value: 'business', label: 'Business' },
                            { value: 'leisure', label: 'Leisure' },
                            { value: 'dining', label: 'Dining' },
                            { value: 'event', label: 'Event' },
                            { value: 'conference', label: 'Conference' },
                            { value: 'wedding', label: 'Wedding' },
                            { value: 'other', label: 'Other' },
                        ]}
                        placeholder="Select purpose of visit"
                    />
                </FormColumn>
                <FormColumn>
                    <SelectField
                        id="loyaltyTier"
                        name="loyaltyTier"
                        label="Loyalty Tier"
                        className={inputClass}
                        value={formData.loyaltyTier || ''}
                        onValueChange={(value) =>
                            handleInputChange('loyaltyTier', value)
                        }
                        options={[
                            { value: 'silver', label: 'Silver' },
                            { value: 'gold', label: 'Gold' },
                            { value: 'platinum', label: 'Platinum' },
                            { value: 'diamond', label: 'Diamond' },
                            { value: 'none', label: 'None' },
                        ]}
                        placeholder="Select loyalty tier"
                    />
                </FormColumn>
            </FormGroup>

            <FormGroup>
                <FormColumn>
                    <InputField
                        id="loyaltyPoints"
                        name="loyaltyPoints"
                        label="Loyalty Points"
                        type="number"
                        placeholder="Enter loyalty points"
                        className={inputClass}
                        value={
                            formData.loyaltyPoints !== undefined &&
                            formData.loyaltyPoints !== null
                                ? String(formData.loyaltyPoints)
                                : ''
                        }
                        onChange={(e) =>
                            handleInputChange(
                                'loyaltyPoints',
                                e.target.value === ''
                                    ? undefined
                                    : Number(e.target.value),
                            )
                        }
                    />
                </FormColumn>
                <FormColumn>
                    <SelectField
                        id="eligibleForReward"
                        name="eligibleForReward"
                        label="Eligible for Reward"
                        className={inputClass}
                        value={
                            formData.eligibleForReward === undefined
                                ? ''
                                : String(formData.eligibleForReward)
                        }
                        onValueChange={(value) =>
                            handleInputChange(
                                'eligibleForReward',
                                value === '' ? undefined : value === 'true',
                            )
                        }
                        options={[
                            { value: 'true', label: 'Yes' },
                            { value: 'false', label: 'No' },
                        ]}
                        placeholder="Select option"
                    />
                </FormColumn>
            </FormGroup>

            <FormGroup>
                <FormColumn>
                    <SelectField
                        id="customerType"
                        name="customerType"
                        label="Customer Type"
                        className={inputClass}
                        value={formData.customerType || ''}
                        onValueChange={(value) =>
                            handleInputChange('customerType', value)
                        }
                        options={[
                            { value: 'hotel', label: 'Hotel' },
                            { value: 'restaurant', label: 'Restaurant' },
                        ]}
                        placeholder="Select customer type"
                    />
                </FormColumn>
                <FormColumn>
                    <SelectField
                        id="emailConsent"
                        name="emailConsent"
                        label="Email Consent"
                        className={inputClass}
                        value={
                            formData.emailConsent === undefined
                                ? ''
                                : String(formData.emailConsent)
                        }
                        onValueChange={(value) =>
                            handleInputChange(
                                'emailConsent',
                                value === '' ? undefined : value === 'true',
                            )
                        }
                        options={[
                            { value: 'true', label: 'Yes' },
                            { value: 'false', label: 'No' },
                        ]}
                        placeholder="Select option"
                    />
                </FormColumn>
            </FormGroup>

            <FormGroup>
                <FormColumn>
                    <SelectField
                        id="preferredContactMethod"
                        name="preferredContactMethod"
                        label="Preferred Contact Method"
                        className={inputClass}
                        value={formData.preferredContactMethod || ''}
                        onValueChange={(value) =>
                            handleInputChange(
                                'preferredContactMethod',
                                value === '' ? undefined : value,
                            )
                        }
                        options={[
                            { value: 'email', label: 'Email' },
                            { value: 'phone', label: 'Phone' },
                            { value: 'sms', label: 'SMS' },
                            { value: 'whatsapp', label: 'WhatsApp' },
                        ]}
                        placeholder="Select contact method"
                    />
                </FormColumn>
                <FormColumn>
                    <InputField
                        id="feedbackNotes"
                        name="feedbackNotes"
                        label="Feedback / Notes"
                        placeholder="Enter feedback or notes"
                        className={inputClass}
                        value={formData.feedbackNotes || ''}
                        onChange={(e) =>
                            handleInputChange('feedbackNotes', e.target.value)
                        }
                    />
                </FormColumn>
            </FormGroup>
        </div>
    );
}
