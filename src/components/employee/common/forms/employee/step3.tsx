'use client';

import { InputField, SelectField } from '@/components/common/Form';
import { Employee, FormColumn } from './index';
import { useBankList } from '@/hooks/useBankList';

type Props = {
    formData: Partial<Employee>;
    handleInputChange: (field: keyof Employee, value: any) => void;
};

const Step3 = ({ formData, handleInputChange }: Props) => {
    const banks = useBankList();
    const bankOptions = banks.map((bank) => ({
        label: bank.name,
        value: `${bank.code}-${bank.name}`,
    }));

    return (
        <div className="flex flex-col gap-4 border rounded-lg p-4">
            <span className="text-sm font-semibold">
                Bank Account Information
            </span>
            <FormColumn>
                <SelectField
                    id="bankName"
                    label="Bank Name"
                    name="bankName"
                    value={formData.bankName ?? ''}
                    onValueChange={(value) => {
                        handleInputChange('bankName', value); // full "code-name"
                        const [code] = value.split('-');
                        handleInputChange('bankCode', code); // optional, if you need to store separately
                    }}
                    options={bankOptions}
                />
            </FormColumn>
            {/* <FormColumn>
                <InputField
                    id="bankCode"
                    label="Bank Code"
                    placeholder="Bank code"
                    type="text"
                    name="bankCode"
                    value={formData.bankCode}
                    onChange={() => {}}
                    readOnly
                />
            </FormColumn> */}
            <FormColumn>
                <InputField
                    id="accountNumber"
                    label="Account Number"
                    placeholder="e.g. 1234567890"
                    type="text"
                    maxLength={10}
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={(e) =>
                        handleInputChange('accountNumber', e.target.value)
                    }
                />
            </FormColumn>
            <FormColumn>
                <InputField
                    id="accountName"
                    label="Account Name"
                    placeholder="e.g. John Doe"
                    type="text"
                    name="accountName"
                    value={formData.accountName}
                    onChange={(e) =>
                        handleInputChange('accountName', e.target.value)
                    }
                />
            </FormColumn>
            <FormColumn>
                <InputField
                    id="salary"
                    label="Salary"
                    name="salary"
                    placeholder="Enter salary amount"
                    type="number"
                    value={
                        formData.salary === 0 ? '' : formData.salary?.toString()
                    }
                    onChange={(e) =>
                        handleInputChange(
                            'salary',
                            e.target.value === '' ? 0 : Number(e.target.value),
                        )
                    }
                />
            </FormColumn>
        </div>
    );
};

export default Step3;
