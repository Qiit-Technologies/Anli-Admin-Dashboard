import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { LucideIcon, LucideProps } from 'lucide-react';
import React, { ReactNode } from 'react';

interface FormFieldProps {
    label: string | ReactNode;
    htmlFor: string;
    className?: string;
    children: ReactNode;
    required?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
    label,
    htmlFor,
    className = '',
    children,
    required = false,
}) => {
    return (
        <div className={`flex flex-col w-full ${className}`}>
            {typeof label === 'string' ? (
                <label
                    htmlFor={htmlFor}
                    className="text-sm font-medium text-muted-foreground mb-1"
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            ) : (
                <div className="text-sm font-medium text-muted-foreground mb-1">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </div>
            )}
            {children}
        </div>
    );
};

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    id: string;
    name: string;
    label: string | ReactNode;
    type?: string;
    placeholder?: string;
    value?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    min?: string;
    step?: string;
    readOnly?: boolean;
    className?: string;
    icon?: React.ForwardRefExoticComponent<
        Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>
    >;
    iconPosition?: 'left' | 'right';
    rightIcon?: React.ReactElement;
    defaultValue?: string;
    onRightIconClick?: () => void;
}

export const InputField: React.FC<InputFieldProps> = ({
    id,
    name,
    label,
    type = 'text',
    placeholder = '',
    value,
    onChange,
    required = false,
    min,
    step,
    readOnly = false,
    className = '',
    defaultValue,
    icon,
    iconPosition,
    rightIcon,
    onRightIconClick,
    max,
    ...props
}) => {
    const inputClassName = `w-full focus-visible:ring-brand rounded-md h-10 bg-gray-100 border-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${className}`;
    const Icon = icon as LucideIcon;
    return (
        <FormField label={label} htmlFor={id} required={required}>
            <div className="relative">
                {icon && iconPosition === 'left' && (
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Icon className="w-5 h-5 text-gray-500" />
                    </span>
                )}
                {icon && iconPosition === 'right' && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <Icon className="w-5 h-5 text-gray-500" />
                    </span>
                )}
                <Input
                    type={type}
                    id={id}
                    name={name}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className={cn(
                        inputClassName,
                        'w-full',
                        icon && iconPosition === 'left' && 'pl-10',
                        icon && iconPosition === 'right' && 'pr-10',
                    )}
                    required={required}
                    min={min}
                    max={max}
                    step={step}
                    readOnly={readOnly}
                    disabled={readOnly}
                    defaultValue={defaultValue}
                    {...props}
                />
                {rightIcon &&
                    React.cloneElement(rightIcon, {
                        className: cn(
                            'absolute inset-y-0 right-0 flex items-center pr-3',
                            rightIcon.props.className,
                        ),
                        onClick: onRightIconClick,
                    })}
            </div>
        </FormField>
    );
};

interface SelectFieldProps {
    id: string;
    name: string;
    label: string;
    value: string;
    onValueChange?: (value: string) => void;
    options?: { value: string; label: string; badge?: string }[];
    placeholder?: string;
    required?: boolean;
    className?: string;
    disabled?: boolean;
    defaultValue?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({
    id,
    name,
    label,
    value,
    onValueChange,
    options,
    placeholder = 'Select an option',
    required = false,
    className = '',
    disabled = false,
}) => {
    const triggerClassName = `bg-gray-100 border-gray-100 h-full focus:border-blue-500 focus:ring-blue-500 ${className}`;
    const safeOptions = (options ?? []).filter(
        (option) => option.value !== '' && option.value != null,
    );
    const isEmptyOptions = safeOptions.length === 0;
    const selectValue =
        value === '' || value == null ? undefined : String(value);

    return (
        <FormField label={label} htmlFor={id} required={required}>
            <Select
                value={selectValue}
                onValueChange={onValueChange}
                required={required}
                disabled={disabled || isEmptyOptions}
            >
                <SelectTrigger id={id} name={name} className={triggerClassName}>
                    <SelectValue
                        placeholder={
                            isEmptyOptions
                                ? 'No options available'
                                : placeholder
                        }
                    />
                </SelectTrigger>
                <SelectContent>
                    {isEmptyOptions ? (
                        <SelectItem value="__none" disabled>
                            No options available
                        </SelectItem>
                    ) : (
                        safeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                <span className="flex min-w-0 flex-1 items-center justify-between gap-3">
                                    <span className="truncate">
                                        {option.label}
                                    </span>
                                    {option.badge ? (
                                        <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                                            {option.badge}
                                        </span>
                                    ) : null}
                                </span>
                            </SelectItem>
                        ))
                    )}
                </SelectContent>
            </Select>
        </FormField>
    );
};

interface TextAreaFieldProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    id: string;
    name: string;
    label: string | ReactNode;
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    required?: boolean;
    readOnly?: boolean;
    className?: string;
    defaultValue?: string;
    rows?: number;
}

export const TextAreaField: React.FC<TextAreaFieldProps> = ({
    id,
    name,
    label,
    placeholder = '',
    value,
    onChange,
    required = false,
    readOnly = false,
    className = '',
    defaultValue,
    rows = 4,
    ...props
}) => {
    const textareaClassName = `w-full focus-visible:ring-brand rounded-md bg-gray-100 border-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${className}`;

    return (
        <FormField label={label} htmlFor={id} required={required}>
            <textarea
                id={id}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
                readOnly={readOnly}
                disabled={readOnly}
                defaultValue={defaultValue}
                rows={rows}
                className={cn(textareaClassName, 'p-3 resize-none')}
                {...props}
            />
        </FormField>
    );
};
export { default as AmountInput } from '../AmountInput';
export * from './SearchableSelect';
