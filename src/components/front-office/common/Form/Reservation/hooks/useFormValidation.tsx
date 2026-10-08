import React from 'react';
import { z } from 'zod';

interface UseFormValidationProps {
    steps: Array<{ schema: z.ZodSchema<any> }>;
    setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export const useFormValidation = ({
    steps,
    setErrors,
}: UseFormValidationProps) => {
    const handleInputChange = (
        field: string,
        value: any,
        formData: any,
        setFormData: React.Dispatch<React.SetStateAction<any>>,
    ) => {
        setFormData((prev: any) => {
            const newData = {
                ...prev,
                [field]: value,
            };

            try {
                const relevantSchema = steps.find((step) =>
                    Object.keys(
                        (step.schema as z.ZodObject<any>).shape,
                    ).includes(field),
                )?.schema;

                if (relevantSchema) {
                    const fieldData = { [field]: value };
                    (relevantSchema as z.ZodObject<any>)
                        .pick({ [field]: true })
                        .parse(fieldData);

                    setErrors((prev) => {
                        if (!prev[field]) return prev;
                        const newErrors = { ...prev };
                        delete newErrors[field];
                        return newErrors;
                    });
                }
            } catch (error: any) {
                if (error instanceof z.ZodError) {
                    const newErrors: Record<string, string> = {};
                    error.errors.forEach((err) => {
                        if (err.path) {
                            newErrors[err.path[0]] = err.message;
                        }
                    });
                    setErrors((prev) => ({ ...prev, ...newErrors }));
                }
            }

            return newData;
        });
    };

    const validateStep = (schema: z.ZodSchema<any>, stepData: any) => {
        try {
            schema.parse(stepData);
            setErrors({});
            return true;
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                const newErrors: Record<string, string> = {};
                error.errors.forEach((err) => {
                    if (err.path) {
                        newErrors[err.path[0]] = err.message;
                    }
                });
                setErrors(newErrors);
            }
            return false;
        }
    };

    return {
        handleInputChange,
        validateStep,
    };
};
