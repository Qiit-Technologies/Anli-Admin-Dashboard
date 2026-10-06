'use client';

import BrandButton from '@/components/common/Button';
import { InputField } from '@/components/common/Form';
import React, { useState } from 'react';
import { z } from 'zod';

export interface Task {
    id?: number;
    title: string;
    date: Date;
    time: string;
    description: string;
}

const taskSchema = z.object({
    title: z.string().min(1, { message: 'Title is required' }),
    date: z.date(),
    time: z.string().min(1, { message: 'Time is required' }),
    description: z.string().min(1, { message: 'Description is required' }),
});

interface TaskFormProps {
    onSubmit?: (data: Task) => void;
    initialValues?: Partial<Task>;
    mode?: 'create' | 'edit';
}

const TaskForm = ({
    onSubmit,
    initialValues,
    mode = 'create',
}: TaskFormProps) => {
    const [formData, setFormData] = useState<Task>({
        title: initialValues?.title || '',
        date: initialValues?.date || new Date(),
        time: initialValues?.time || '',
        description: initialValues?.description || '',
    });

    const handleInputChange = (field: keyof Task, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const result = taskSchema.safeParse(formData);

        if (result.success) {
            onSubmit?.(formData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <InputField
                id="title"
                label="Task Title"
                type="text"
                placeholder="Enter task title"
                name="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
            />

            <InputField
                id="date"
                label="Date"
                type="date"
                name="date"
                value={formData.date.toISOString().split('T')[0]}
                onChange={(e) =>
                    handleInputChange('date', new Date(e.target.value))
                }
            />

            <InputField
                id="time"
                label="Time"
                type="time"
                name="time"
                value={formData.time}
                onChange={(e) => handleInputChange('time', e.target.value)}
            />

            <InputField
                id="description"
                label="Description"
                type="text"
                placeholder="Enter task description"
                name="description"
                value={formData.description}
                onChange={(e) =>
                    handleInputChange('description', e.target.value)
                }
            />

            <BrandButton type="submit">
                {mode === 'edit' ? 'Update Task' : 'Create Task'}
            </BrandButton>
        </form>
    );
};

export default TaskForm;
