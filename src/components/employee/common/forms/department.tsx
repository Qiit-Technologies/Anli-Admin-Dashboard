'use client';

import { createDepartment } from '@/app/actions/department';
import BrandButton from '@/components/common/Button';
import { InputField } from '@/components/common/Form';
import Toast from '@/components/toast';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface DepartmentFormProps {
    name: string;
    description: string;
}
// dummy function to simulate API call
// const createDepartment = async (data: DepartmentFormProps) => {
//     console.log(data);
//     return new Promise<{ message: string }>((resolve) => {
//         setTimeout(() => {
//             resolve({ message: 'Department created' });
//         }, 1000);
//     });
// };

const DepartmentForm = () => {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<DepartmentFormProps>({
        name: '',
        description: '',
    });

    const handleSubmit = async () => {
        setError(null);
        setIsLoading(true);
        try {
            const response = await createDepartment(formData);
            if (response) {
                if (response.message === 'Department created successfully!') {
                    toast.custom(() => (
                        <Toast
                            title="Success!"
                            description={response.message}
                            type="success"
                        />
                    ));
                    setIsLoading(false);
                } else {
                    toast.custom(() => (
                        <Toast
                            title="Error!"
                            description={response.message}
                            type="error"
                        />
                    ));
                }
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div>
                <h1 className="text-xl font-semibold">Create Department</h1>
                <span className="text-sm text-gray-500">
                    Add a new department to your organization
                </span>
            </div>
            <div className="mt-4">
                <form className="space-y-4">
                    <InputField
                        id="name"
                        label="Department Name"
                        type="text"
                        placeholder="e.g. Human Resources, IT, Finance"
                        name="name"
                        value={formData.name}
                        onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                        }
                    />
                    <InputField
                        id="description"
                        label="Description"
                        type="text"
                        placeholder="Enter department description"
                        name="description"
                        value={formData.description}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                description: e.target.value,
                            })
                        }
                    />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <BrandButton
                        type="submit"
                        className="w-full bg-orion-blue hover:bg-orion-blue h-12"
                        loading={isLoading}
                        onClick={handleSubmit}
                    >
                        {isLoading ? 'Creating...' : 'Create Department'}
                    </BrandButton>
                </form>
            </div>
        </div>
    );
};

export default DepartmentForm;
