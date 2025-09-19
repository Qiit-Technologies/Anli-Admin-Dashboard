import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/utils/utils";
import { LucideIcon, LucideProps } from "lucide-react";
import React, { ReactNode } from "react";

interface FormFieldProps {
  label: string | ReactNode;
  htmlFor: string;
  className?: string;
  children: ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  className = "",
  children,
}) => {
  return (
    <div className={`flex flex-col w-full ${className}`}>
      {typeof label === "string" ? (
        <label
          htmlFor={htmlFor}
          className="text-sm font-medium text-muted-foreground mb-1"
        >
          {label}
        </label>
      ) : (
        <div className="text-sm font-medium text-muted-foreground mb-1">
          {label}
        </div>
      )}
      {children}
    </div>
  );
};

interface InputFieldProps {
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
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  iconPosition?: "left" | "right";
  rightIcon?: React.ReactElement;
  defaultValue?: string;
  onRightIconClick?: () => void;
}

export const InputField: React.FC<InputFieldProps> = ({
  id,
  name,
  label,
  type = "text",
  placeholder = "",
  value,
  onChange,
  required = false,
  min,
  step,
  readOnly = false,
  className = "",
  defaultValue,
  icon,
  iconPosition,
  rightIcon,
  onRightIconClick,
}: InputFieldProps) => {
  const inputClassName = `w-full focus-visible:ring-brand rounded-md h-10 bg-gray-100 border-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${className}`;
  const Icon = icon as LucideIcon;
  return (
    <FormField label={label} htmlFor={id}>
      <div className="relative">
        {icon && iconPosition === "left" && (
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Icon className="w-5 h-5 text-gray-500" />
          </span>
        )}
        {icon && iconPosition === "right" && (
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
            "w-full",
            icon && iconPosition === "left" && "pl-10",
            icon && iconPosition === "right" && "pr-10",
          )}
          required={required}
          min={min}
          step={step}
          readOnly={readOnly}
          disabled={readOnly}
          defaultValue={defaultValue}
        />

        {rightIcon &&
          React.cloneElement(
            rightIcon as React.ReactElement<{
              className?: string;
              onClick?: () => void;
            }>,
            {
              className: cn(
                "absolute inset-y-0 right-0 flex items-center pr-3",
                (rightIcon as React.ReactElement<{ className?: string }>).props
                  .className,
              ),
              onClick: onRightIconClick,
            },
          )}
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
  options?: { value: string; label: string }[];
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
  placeholder = "Select an option",
  required = false,
  className = "",
  disabled = false,
  defaultValue,
}) => {
  const triggerClassName = `bg-gray-100 border-gray-100 h-full focus:border-blue-500 focus:ring-blue-500 ${className}`;
  const selectedOptionLabel =
    options &&
    options.find((opt) => String(opt.value) === String(value) && value !== "")
      ?.label;

  const isEmptyOptions = !options || options.length === 0;

  return (
    <FormField label={label} htmlFor={id}>
      <Select
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        required={required}
        disabled={disabled}
      >
        <SelectTrigger id={id} name={name} className={triggerClassName}>
          <SelectValue className="text-gray-100" placeholder={placeholder}>
            {selectedOptionLabel ?? placeholder}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {isEmptyOptions ? (
            <SelectItem value="none" disabled>
              No options available
            </SelectItem>
          ) : (
            options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </FormField>
  );
};
