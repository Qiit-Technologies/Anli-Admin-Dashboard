'use client';

import { CreateEmployee, UpdateEmployee } from '@/app/actions/employee';
import StepperItem from '@/components/common/Form/StepperItem';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import { LoaderCircle } from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { z } from 'zod';
import Step1 from './step1';
import Step2 from './step2';
import Step3 from './step3';
import Step4 from './step4';
import { useParams } from 'next/navigation';
import { mutate } from 'swr';

export interface Employee {
    // profile information
    id: string;
    fullName: string;
    email: string;
    type: 'Full-time' | 'Part-time' | 'Contract';
    homeAddress: string;
    phoneNumber: string;
    imageUrl: string | null;
    sendInvite: boolean;

    // employment information
    code: string;
    startDate: string;
    workMode: 'Monthly' | 'Weekly' | 'Daily';
    department: number;
    userRole: number;
    branch: string;
    employmentLetter: string | null;

    // bank account information
    bankName: string;
    accountNumber: string;
    accountName: string;
    salary: number;
    bankCode: string;

    // emergency contact information
    emergencyContactName: string;
    emergencyContactPhone: string;
    relationship: 'Parent' | 'Sibling' | 'Spouse' | 'Child' | 'Other';
    fathersName: string;
    fathersAddress: string;
    mothersName: string;
    mothersAddress: string;
    maritalStatus: string;
    spouseName: string;
    maidenName: string;
    noOfChildren: string;

    emergencyContact: EmergencyContact;
    medicalInfo: MedicalInfo;
    nextOfKin: NextOfKin;
    children: Child[];
    education: Education[];
    workExperience: WorkExperience[];
    refrees: Refree[];
}

export type Child = { name: string; age: string; dateOfBirth: string };
export type Education = {
    address: string;
    qualification: string;
    schoolName: string;
};
export type WorkExperience = {
    address: string;
    nameOfOrg: string;
    designation: string;
    keyFunctions: string;
    date: string;
};
export type Refree = {
    name: string;
    phone: string;
    profession: string;
    occupation: string;
};

export type MedicalInfo = {
    bloodGroup: string;
    genotype: string;
    allergy: string;
};

export type NextOfKin = {
    name: string;
    phone: string;
    email: string;
    relationship: string;
    address: string;
};

export type EmergencyContact = {
    name: string;
    phone: string;
    email: string;
    relationship: string;
    address: string;
};

const profileInfoSchema = z.object({
    fullName: z.string().min(1, { message: 'Name is required' }),
    email: z.string().email({ message: 'Invalid email address' }),
    type: z.string().optional(),
    homeAddress: z.string().min(1, { message: 'Home address is required' }),
    phoneNumber: z.string().min(1, { message: 'Phone number is required' }),
});

const employmentInfoSchema = z.object({
    code: z.string().optional(),
    startDate: z.string().min(1, { message: 'Start date is required' }),
    workMode: z.string().optional(),
    department: z.number().min(1, { message: 'Department is required' }),
    userRole: z.number().min(1, { message: 'Role is required' }),
    branch: z.string().optional(),
});

const bankInfoSchema = z.object({
    bankName: z.string().optional(),
    accountNumber: z.any().optional(),
    accountName: z.string().optional(),
    salary: z.any().optional(),
});

const emergencyContactSchema = z.object({
    emergencyContactName: z
        .string()
        .min(1, { message: 'Contact name is required' }),
    emergencyContactPhone: z
        .string()
        .min(1, { message: 'Contact phone is required' }),
    relationship: z.enum(['Parent', 'Sibling', 'Spouse', 'Child', 'Other']),
});

const steps = [
    {
        step: 1,
        title: 'Profile',
        description: 'Basic profile information',
        schema: profileInfoSchema,
    },
    {
        step: 2,
        title: 'Employment',
        description: 'Employment details',
        schema: employmentInfoSchema,
    },
    {
        step: 3,
        title: 'Bank',
        description: 'Bank account details',
        schema: bankInfoSchema,
    },
    {
        step: 4,
        title: 'Emergency',
        description: 'Emergency contact',
        schema: emergencyContactSchema,
    },
];

interface EmployeeFormProps {
    mode?: 'add' | 'update';
    initialValues?: Partial<Employee>;
    onClose?: () => void;
}

const EmployeeMultiStepForm = ({
    mode = 'add',
    initialValues,
    onClose,
}: EmployeeFormProps) => {
    const { id } = useParams();

    const [stepIndex, setStepIndex] = useState(1);

    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Employee>>({
        fullName: '',
        email: '',
        type: 'Full-time',
        homeAddress: '',
        phoneNumber: '',
        sendInvite: true,
        code: '',
        startDate: new Date().toISOString().split('T')[0],
        workMode: 'Monthly',
        department: 0,
        userRole: 0,
        branch: '',
        bankName: '',
        accountNumber: '',
        accountName: '',
        bankCode: '',
        salary: 0,
        emergencyContactName: '',
        emergencyContactPhone: '',
        relationship: 'Parent',
        imageUrl: '',
        employmentLetter: '',
        fathersName: '',
        fathersAddress: '',
        mothersName: '',
        mothersAddress: '',
        maritalStatus: '',
        spouseName: '',
        maidenName: '',
        noOfChildren: '',
        emergencyContact: {
            name: '',
            phone: '',
            email: '',
            relationship: '',
            address: '',
        },
        medicalInfo: {
            bloodGroup: '',
            genotype: '',
            allergy: '',
        },
        nextOfKin: {
            name: '',
            phone: '',
            email: '',
            relationship: '',
            address: '',
        },
        children: [],
        education: [],
        workExperience: [],
        refrees: [],
    });

    useEffect(() => {
        if (initialValues) {
            setFormData((prev) => ({
                ...prev,
                ...Object.fromEntries(
                    Object.entries(initialValues).map(([key, value]) => [
                        key,
                        value === null ? '' : value,
                    ]),
                ),
                startDate:
                    initialValues.startDate ||
                    new Date().toISOString().split('T')[0],
                type: initialValues.type || 'Full-time',
                workMode: initialValues.workMode || 'Monthly',
                relationship: initialValues.relationship || 'Parent',
                userRole: initialValues.userRole || 0,
                salary: initialValues.salary || 0,

                emergencyContact: initialValues?.emergencyContact || {
                    name: '',
                    phone: '',
                    email: '',
                    relationship: '',
                    address: '',
                },
                medicalInfo: initialValues?.medicalInfo || {
                    bloodGroup: '',
                    genotype: '',
                    allergy: '',
                },
                nextOfKin: initialValues?.nextOfKin || {
                    name: '',
                    phone: '',
                    email: '',
                    relationship: '',
                    address: '',
                },
                children: initialValues?.children || [],
                education: initialValues?.education || [],
                workExperience: initialValues?.workExperience || [],
                refrees: initialValues?.refrees || [],
            }));
        }
    }, [initialValues]);

    const handleInputChange = (field: keyof Employee, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleNextStep = () => {
        if (stepIndex < steps.length) {
            const currentStep = steps[stepIndex - 1];
            const validationResult = currentStep.schema.safeParse(formData);

            if (!validationResult.success) {
                setError(validationResult.error.errors[0].message);
                toast.custom(() => (
                    <Toast
                        title="Validation Error"
                        description={validationResult.error.errors[0].message}
                        type="error"
                    />
                ));
                return;
            }

            setError(null);
            setStepIndex(stepIndex + 1);
        } else {
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        // const allValid = steps.every((step) => {
        //     const validationResult = step.schema.safeParse(formData);
        //     return validationResult.success;
        // });

        // if (!allValid) {
        //     setError('Please fill all required fields correctly.');
        //     toast.custom(() => (
        //         <Toast
        //             title="Validation Error"
        //             description="Please fill all required fields correctly."
        //             type="error"
        //         />
        //     ));
        //     return;
        // }

        setIsLoading(true);
        if (mode === 'add') {
            handleAddEmployee(formData);
        } else {
            handleUpdateEmployee(formData);
        }
    };

    const handleAddEmployee = async (formData: Partial<Employee>) => {
        try {
            const response = await CreateEmployee({
                ...formData,
                sendInvite: formData.sendInvite !== false,
                department: Number(formData.department) || formData.department,
                userRole: Number(formData.userRole) || formData.userRole,
            });
            if (response.message === 'Employee created Successful!') {
                setError(response.message);
                toast.custom(() => (
                    <Toast
                        title="Success"
                        description={`Employee ${mode === 'update' ? 'updated' : 'created'} successfully`}
                        type="success"
                    />
                ));
                if (onClose) {
                    mutate(`/employees/${id}`);
                    onClose();
                }

                return;
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error"
                        description={
                            response.message ??
                            'Something went wrong. Please try again.'
                        }
                        type="error"
                    />
                ));
            }

            if (onClose) onClose();
        } catch (error: any) {
            toast.custom(() => (
                <Toast
                    title="Error"
                    description="Something went wrong. Please try again."
                    type="error"
                />
            ));
        } finally {
            if (onClose) onClose();
            setIsLoading(false);
        }
    };

    const handleUpdateEmployee = async (formData: Partial<Employee>) => {
        try {
            const response = await UpdateEmployee(formData.id || '', formData);
            if (response.message === 'Employee updated Successful!') {
                setError(response.message);
                toast.custom(() => (
                    <Toast
                        title="Success"
                        description={`Employee ${mode === 'update' ? 'updated' : 'updated'} successfully`}
                        type="success"
                    />
                ));
                if (onClose) {
                    mutate(`/employees/${id}`);
                    onClose();
                }

                return;
            } else {
                toast.custom(() => (
                    <Toast
                        title="Error"
                        description={
                            response.message ??
                            'Something went wrong. Please try again.'
                        }
                        type="error"
                    />
                ));
            }
        } catch (error: any) {
            toast.custom(() => (
                <Toast
                    title="Error"
                    description="Something went wrong. Please try again."
                    type="error"
                />
            ));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex w-full flex-start gap-2">
                {steps.map((step) => (
                    <StepperItem
                        key={step.step}
                        step={step}
                        currentStep={stepIndex}
                        totalSteps={steps.length}
                        isValid={!error}
                        onClick={() => {
                            if (step.step < stepIndex) {
                                setStepIndex(step.step);
                            }
                        }}
                    />
                ))}
            </div>

            <div className="flex flex-col gap-4 mt-4">
                {stepIndex === 1 && (
                    <Step1
                        formData={formData}
                        handleInputChange={handleInputChange}
                        childrenProp={formData?.children as Child[]}
                        setChildren={(data) =>
                            handleInputChange('children', data)
                        }
                        educations={formData?.education as Education[]}
                        setEducations={(data) =>
                            handleInputChange('education', data)
                        }
                    />
                )}
                {stepIndex === 2 && (
                    <Step2
                        formData={formData}
                        handleInputChange={handleInputChange}
                        workExperiences={
                            formData?.workExperience as WorkExperience[]
                        }
                        setWorkExperiences={(data) =>
                            handleInputChange('workExperience', data)
                        }
                    />
                )}

                {stepIndex === 3 && (
                    <Step3
                        formData={formData}
                        handleInputChange={handleInputChange}
                    />
                )}

                {stepIndex === 4 && (
                    <Step4
                        refrees={formData?.refrees as Refree[]}
                        setRefrees={(data) =>
                            handleInputChange('refrees', data)
                        }
                        medicalInfo={formData?.medicalInfo as MedicalInfo}
                        setMedicalInfo={(data) =>
                            handleInputChange('medicalInfo', data)
                        }
                        nextOfKin={formData?.nextOfKin as NextOfKin}
                        setNextOfKin={(data) =>
                            handleInputChange('nextOfKin', data)
                        }
                        emergencyContact={
                            formData?.emergencyContact as EmergencyContact
                        }
                        setEmergencyContact={(data) =>
                            handleInputChange('emergencyContact', data)
                        }
                    />
                )}
            </div>

            <div className="flex items-center justify-between mt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStepIndex(stepIndex - 1)}
                    disabled={stepIndex === 1}
                >
                    Back
                </Button>
                <Button
                    className="bg-orion-blue hover:bg-orion-blue"
                    type="submit"
                    disabled={isLoading}
                    onClick={handleNextStep}
                >
                    {isLoading && (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                    )}
                    {stepIndex === steps.length
                        ? mode === 'update'
                            ? 'Update Employee'
                            : 'Create Employee'
                        : 'Continue'}
                </Button>
            </div>
        </div>
    );
};

export default EmployeeMultiStepForm;

export const FormColumn = ({ children }: { children: ReactNode }) => {
    return <div className="flex flex-col gap-1">{children}</div>;
};
