'use client';

import { InputField, SelectField } from '@/components/common/Form';
import { Employee, FormColumn, WorkExperience } from './index';
import { getDepartments } from '@/app/actions/department';
import { fetchRoles } from '@/app/actions/staff';
import useSWR from 'swr';
import { Role } from '@/types/staff.types';
import { Dispatch, SetStateAction, useState } from 'react';
import { MinusIcon, PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
    formData: Partial<Employee>;
    handleInputChange: (field: keyof Employee, value: any) => void;
    workExperiences: WorkExperience[];
    setWorkExperiences: Dispatch<SetStateAction<WorkExperience[]>>;
};

const Step2 = ({
    formData,
    handleInputChange,
    workExperiences,
    setWorkExperiences,
}: Props) => {
    const { data: roles } = useSWR('/roles', fetchRoles);
    const { data: departments } = useSWR('/departments', getDepartments);

    const [workExperience, setWorkExperience] = useState<WorkExperience>({
        address: '',
        nameOfOrg: '',
        designation: '',
        keyFunctions: '',
        date: '',
    });
    const [isWorkExperienceOpen, setWorkExperienceOpen] = useState(false);

    return (
        <div className="flex flex-col gap-4 border rounded-lg p-4">
            <span className="text-sm font-semibold">
                Employment Information
            </span>
            {!!formData.id && (
                <FormColumn>
                    <InputField
                        id="code"
                        label="Employee Code"
                        placeholder="e.g. EMP12345"
                        type="text"
                        name="code"
                        value={`EMP${formData.id}`}
                        disabled
                        // onChange={(e) => handleInputChange('code', e.target.value)}
                    />
                </FormColumn>
            )}
            <FormColumn>
                <InputField
                    id="startDate"
                    label="Start Date"
                    type="date"
                    name="startDate"
                    value={formData.startDate?.toString() ?? ''}
                    onChange={(e) =>
                        handleInputChange('startDate', e.target.value)
                    }
                />
            </FormColumn>
            <FormColumn>
                <SelectField
                    id="workMode"
                    label="Work Mode"
                    name="workMode"
                    value={formData.workMode ?? 'Monthly'}
                    onValueChange={(value) =>
                        handleInputChange('workMode', value)
                    }
                    options={[
                        { value: 'Monthly', label: 'Monthly' },
                        { value: 'Weekly', label: 'Weekly' },
                        { value: 'Daily', label: 'Daily' },
                        { value: 'Hourly', label: 'Hourly' },
                    ]}
                />
            </FormColumn>
            <FormColumn>
                <SelectField
                    id="department"
                    label="Department"
                    name="department"
                    value={String(formData.department ?? '')}
                    onValueChange={(value) =>
                        handleInputChange('department', value)
                    }
                    options={departments?.map((item: Role) => ({
                        value: item.id,
                        name: item.name,
                        label: item.name,
                    }))}
                />
            </FormColumn>
            <FormColumn>
                <SelectField
                    id="userRole"
                    label="Role"
                    name="userRole"
                    value={String(formData.userRole || '')}
                    onValueChange={(value) =>
                        handleInputChange('userRole', value)
                    }
                    options={roles?.data.map((item: Role) => ({
                        value: item.id,
                        name: item.name,
                        label: item.name,
                    }))}
                />
            </FormColumn>

            <div className="flex flex-row justify-between items-center">
                <p className="font-bold text-lg">Work Experience</p>
                {!isWorkExperienceOpen ? (
                    <PlusIcon
                        color="#000"
                        className="cursor-pointer"
                        onClick={() =>
                            setWorkExperienceOpen(!isWorkExperienceOpen)
                        }
                    />
                ) : (
                    <MinusIcon
                        color="#000"
                        className="cursor-pointer"
                        onClick={() =>
                            setWorkExperienceOpen(!isWorkExperienceOpen)
                        }
                    />
                )}
            </div>
            <table>
                <thead>
                    <tr>
                        <td>Name of Organization</td>
                        <td>Designation</td>
                        <td>Key functions</td>
                        <td>Address</td>
                        <td>Date</td>
                    </tr>
                </thead>
                <tbody>
                    {workExperiences?.map(
                        (workExperience: WorkExperience, i) => (
                            <tr key={i}>
                                <td>{workExperience.nameOfOrg}</td>
                                <td>{workExperience.designation}</td>
                                <td>{workExperience.keyFunctions}</td>
                                <td>{workExperience.address}</td>
                                <td>{workExperience.date}</td>
                            </tr>
                        ),
                    )}
                </tbody>
            </table>
            {isWorkExperienceOpen && (
                <>
                    <FormColumn>
                        <InputField
                            id="nameOfOrg"
                            label="Name of organization"
                            type="text"
                            name="nameOfOrg"
                            value={workExperience.nameOfOrg}
                            onChange={(e) => {
                                setWorkExperience((workExperience) => ({
                                    ...workExperience,
                                    nameOfOrg: e.target.value,
                                }));
                            }}
                        />
                    </FormColumn>

                    <FormColumn>
                        <InputField
                            id="designation"
                            label="Designation"
                            type="text"
                            name="designation"
                            value={workExperience.designation}
                            onChange={(e) => {
                                setWorkExperience((workExperience) => ({
                                    ...workExperience,
                                    designation: e.target.value,
                                }));
                            }}
                        />
                    </FormColumn>

                    <FormColumn>
                        <InputField
                            id="keyFunctions"
                            label="Key functions"
                            type="text"
                            name="keyFunctions"
                            value={workExperience.keyFunctions}
                            onChange={(e) => {
                                setWorkExperience((workExperience) => ({
                                    ...workExperience,
                                    keyFunctions: e.target.value,
                                }));
                            }}
                        />
                    </FormColumn>

                    <FormColumn>
                        <InputField
                            id="address"
                            label="Address"
                            type="text"
                            name="address"
                            value={workExperience.address}
                            onChange={(e) => {
                                setWorkExperience((workExperience) => ({
                                    ...workExperience,
                                    address: e.target.value,
                                }));
                            }}
                        />
                    </FormColumn>

                    <FormColumn>
                        <InputField
                            id="date"
                            label="Date"
                            type="date"
                            name="date"
                            value={workExperience.date}
                            onChange={(e) => {
                                setWorkExperience((workExperience) => ({
                                    ...workExperience,
                                    date: e.target.value,
                                }));
                            }}
                        />
                    </FormColumn>

                    <Button
                        className="bg-orion-blue hover:bg-orion-blue"
                        onClick={() => {
                            setWorkExperiences([
                                ...workExperiences,
                                workExperience,
                            ]);
                            setWorkExperience({
                                address: '',
                                nameOfOrg: '',
                                designation: '',
                                keyFunctions: '',
                                date: '',
                            });
                            setWorkExperienceOpen(false);
                        }}
                    >
                        Add Work Experience
                    </Button>
                </>
            )}

            {/* <FormColumn>
                                <SelectField
                                    id="branch"
                                    label="Branch"
                                    name="branch"
                                    value={formData.branch ?? ''}
                                    onValueChange={(value) =>
                                        handleInputChange('branch', value)
                                    }
                                    options={[
                                        { value: 'HQ', label: 'Headquarters' },
                                        { value: 'Branch1', label: 'Branch 1' },
                                        { value: 'Branch2', label: 'Branch 2' },
                                    ]}
                                />
                            </FormColumn> */}
        </div>
    );
};

export default Step2;
