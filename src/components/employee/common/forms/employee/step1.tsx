'use client';

import { InputField, SelectField } from '@/components/common/Form';
import { Child, Education, Employee, FormColumn } from './index';
import { MinusIcon, PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Dispatch, SetStateAction, useState } from 'react';

type Props = {
    formData: Partial<Employee>;
    handleInputChange: (field: keyof Employee, value: any) => void;
    childrenProp: Child[];
    setChildren: Dispatch<SetStateAction<Child[]>>;
    educations: Education[];
    setEducations: Dispatch<SetStateAction<Education[]>>;
};

const Step1 = ({
    formData,
    handleInputChange,
    childrenProp,
    setChildren,
    educations,
    setEducations,
}: Props) => {
    console.log('childrenProp', typeof childrenProp);
    const [child, setChild] = useState<Child>({
        name: '',
        age: '',
        dateOfBirth: '',
    });
    const [isChildOpen, setIsChildOpen] = useState(false);

    const [education, setEducation] = useState<Education>({
        address: '',
        qualification: '',
        schoolName: '',
    });
    const [isEducationOpen, setEducationOpen] = useState(false);

    return (
        <div className="flex flex-col gap-4 border rounded-lg p-4">
            <span className="text-sm font-semibold">Profile Information</span>
            <InputField
                id="fullName"
                label="Full Name"
                placeholder="e.g. John Doe"
                type="text"
                name="fullName"
                value={formData.fullName || ''}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
            />
            <FormColumn>
                <InputField
                    id="email"
                    label="Email Address"
                    placeholder="@example.com"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                />
            </FormColumn>
            <div className="flex items-center justify-between gap-4 rounded-md border px-3 py-2">
                <div>
                    <p className="text-sm font-medium">Send invitation email</p>
                    <p className="text-xs text-muted-foreground">
                        Email this employee their login details.
                    </p>
                </div>
                <Switch
                    checked={formData.sendInvite !== false}
                    onCheckedChange={(checked) =>
                        handleInputChange('sendInvite', checked)
                    }
                />
            </div>
            <FormColumn>
                <SelectField
                    id="type"
                    label="Employment Type"
                    name="type"
                    value={formData.type ?? 'Full-time'}
                    onValueChange={(value) => handleInputChange('type', value)}
                    options={[
                        {
                            value: 'Full-time',
                            label: 'Full Time',
                        },
                        {
                            value: 'Part-time',
                            label: 'Part Time',
                        },
                        {
                            value: 'Contract',
                            label: 'Contract',
                        },
                    ]}
                />
            </FormColumn>
            <FormColumn>
                <InputField
                    id="phoneNumber"
                    label="Phone Number"
                    placeholder="Phone number"
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                        handleInputChange('phoneNumber', e.target.value)
                    }
                />
            </FormColumn>
            <FormColumn>
                <InputField
                    id="homeAddress"
                    label="Home Address"
                    type="text"
                    name="homeAddress"
                    placeholder="e.g. 123 Main St, City, Country"
                    value={formData.homeAddress}
                    onChange={(e) =>
                        handleInputChange('homeAddress', e.target.value)
                    }
                />
            </FormColumn>
            <FormColumn>
                <InputField
                    id="fathersName"
                    label="Father's name"
                    type="text"
                    name="fathersName"
                    placeholder="Optional"
                    value={formData.fathersName}
                    onChange={(e) =>
                        handleInputChange('fathersName', e.target.value)
                    }
                />
            </FormColumn>
            <FormColumn>
                <InputField
                    id="fathersAddress"
                    label="Father's Address"
                    type="text"
                    name="fathersAddress"
                    placeholder="Optional"
                    value={formData.fathersAddress}
                    onChange={(e) =>
                        handleInputChange('fathersAddress', e.target.value)
                    }
                />
            </FormColumn>
            <FormColumn>
                <InputField
                    id="mothersName"
                    label="Mother's Name"
                    type="text"
                    name="mothersName"
                    placeholder="Optional"
                    value={formData.mothersName}
                    onChange={(e) =>
                        handleInputChange('mothersName', e.target.value)
                    }
                />
            </FormColumn>
            <FormColumn>
                <InputField
                    id="mothersAddress"
                    label="Mother's Address"
                    type="text"
                    name="mothersAddress"
                    placeholder="Optional"
                    value={formData.mothersAddress}
                    onChange={(e) =>
                        handleInputChange('mothersAddress', e.target.value)
                    }
                />
            </FormColumn>
            <FormColumn>
                <SelectField
                    options={[
                        { label: 'Single', value: 'Single' },
                        { label: 'Married', value: 'Married' },
                        { label: 'Divorced', value: 'Divorced' },
                        { label: 'Seperated', value: 'Seperated' },
                    ]}
                    id="maritalStatus"
                    label="Marital status"
                    name="maritalStatus"
                    placeholder="Optional"
                    value={formData.maritalStatus || ''}
                    onValueChange={(value) =>
                        handleInputChange('maritalStatus', value)
                    }
                />
            </FormColumn>
            <FormColumn>
                <InputField
                    id="spouseName"
                    label="Spouse name"
                    type="text"
                    name="spouseName"
                    placeholder="Optional"
                    value={formData.spouseName}
                    onChange={(e) =>
                        handleInputChange('spouseName', e.target.value)
                    }
                />
            </FormColumn>
            <FormColumn>
                <InputField
                    id="maidenName"
                    label="Mainden Name (if applicable)"
                    type="text"
                    name="maidenName"
                    placeholder="Optional"
                    value={formData.maidenName}
                    onChange={(e) =>
                        handleInputChange('maidenName', e.target.value)
                    }
                />
            </FormColumn>
            <FormColumn>
                <InputField
                    id="noOfChildren"
                    label="Number of children"
                    type="number"
                    name="noOfChildren"
                    placeholder="Optional"
                    value={formData.noOfChildren}
                    onChange={(e) =>
                        handleInputChange('noOfChildren', e.target.value)
                    }
                />
            </FormColumn>
            <div className="flex flex-row justify-between items-center">
                <p className="font-bold text-lg">Children</p>
                {!isChildOpen ? (
                    <PlusIcon
                        color="#000"
                        className="cursor-pointer"
                        onClick={() => setIsChildOpen(!isChildOpen)}
                    />
                ) : (
                    <MinusIcon
                        color="#000"
                        className="cursor-pointer"
                        onClick={() => setIsChildOpen(!isChildOpen)}
                    />
                )}
            </div>
            <table>
                <thead>
                    <tr>
                        <td>Name</td>
                        <td>Age</td>
                        <td>Date of Birth</td>
                    </tr>
                </thead>
                <tbody>
                    {childrenProp?.map((child: Child, i) => (
                        <tr key={i}>
                            <td>{child.name}</td>
                            <td>{child.age}</td>
                            <td>{child.dateOfBirth}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {isChildOpen && (
                <>
                    <FormColumn>
                        <InputField
                            id="name"
                            label="Name"
                            type="text"
                            name="name"
                            value={child.name}
                            onChange={(e) => {
                                setChild((child) => ({
                                    ...child,
                                    name: e.target.value,
                                }));
                            }}
                        />
                    </FormColumn>
                    <FormColumn>
                        <InputField
                            id="age"
                            label="Age"
                            type="number"
                            name="age"
                            value={child.age}
                            onChange={(e) => {
                                setChild((child) => ({
                                    ...child,
                                    age: e.target.value,
                                }));
                            }}
                        />
                    </FormColumn>
                    <FormColumn>
                        <InputField
                            id="dateOfBirth"
                            label="Date Of Birth"
                            type="date"
                            name="dateOfBirth"
                            value={child.dateOfBirth}
                            onChange={(e) => {
                                setChild((child) => ({
                                    ...child,
                                    dateOfBirth: e.target.value,
                                }));
                            }}
                        />
                    </FormColumn>
                    <Button
                        className="bg-orion-blue hover:bg-orion-blue"
                        onClick={() => {
                            setChildren([...childrenProp, child]);
                            setChild({
                                name: '',
                                age: '',
                                dateOfBirth: '',
                            });
                            setIsChildOpen(false);
                        }}
                    >
                        Add child
                    </Button>
                </>
            )}

            <div className="flex flex-row justify-between items-center mt-6">
                <p className="font-bold text-lg">Education</p>
                {!isEducationOpen ? (
                    <PlusIcon
                        color="#000"
                        className="cursor-pointer"
                        onClick={() => setEducationOpen(!isEducationOpen)}
                    />
                ) : (
                    <MinusIcon
                        color="#000"
                        className="cursor-pointer"
                        onClick={() => setEducationOpen(!isEducationOpen)}
                    />
                )}
            </div>
            <table>
                <thead>
                    <tr>
                        <td>School Name</td>
                        <td>Qualification</td>
                        <td>Address</td>
                    </tr>
                </thead>
                <tbody>
                    {educations?.map((education: Education, i) => (
                        <tr key={i}>
                            <td>{education.schoolName}</td>
                            <td>{education.qualification}</td>
                            <td>{education.address}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {isEducationOpen && (
                <>
                    <FormColumn>
                        <InputField
                            id="schoolName"
                            label="School Name"
                            type="text"
                            name="schoolName"
                            value={education.schoolName}
                            onChange={(e) => {
                                setEducation((education) => ({
                                    ...education,
                                    schoolName: e.target.value,
                                }));
                            }}
                        />
                    </FormColumn>
                    <FormColumn>
                        <InputField
                            id="qualification"
                            label="Qualification"
                            type="text"
                            name="qualification"
                            value={education.qualification}
                            onChange={(e) => {
                                setEducation((education) => ({
                                    ...education,
                                    qualification: e.target.value,
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
                            value={education.address}
                            onChange={(e) => {
                                setEducation((education) => ({
                                    ...education,
                                    address: e.target.value,
                                }));
                            }}
                        />
                    </FormColumn>
                    <Button
                        className="bg-orion-blue hover:bg-orion-blue"
                        onClick={() => {
                            setEducations([...educations, education]);
                            setEducation({
                                address: '',
                                qualification: '',
                                schoolName: '',
                            });
                            setEducationOpen(false);
                        }}
                    >
                        Add education
                    </Button>
                </>
            )}
        </div>
    );
};

export default Step1;
