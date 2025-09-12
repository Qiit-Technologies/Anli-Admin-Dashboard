import { cn } from "@/utils/utils";
import { FormField } from "./form";
import { Textarea } from "../ui/textarea";
import { ReactNode } from "react";

interface InputFieldProps {
  id: string;
  name: string;
  required?: boolean;
  readOnly?: boolean;
  className?: string;
  placeholder?: string;
  defaultValue?: string;
  value?: string | number;
  label: string | ReactNode;
  onRightIconClick?: () => void;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const TextAreaInput: React.FC<InputFieldProps> = ({
  id,
  name,
  value,
  label,
  onChange,
  defaultValue,
  className = "",
  placeholder = "",
  required = false,
  readOnly = false,
}: InputFieldProps) => {
  const inputClassName = `w-full focus-visible:ring-brand rounded-md h-10 bg-gray-100 border-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${className}`;

  return (
    <FormField label={label} htmlFor={id}>
      <div className="relative">
        <Textarea
          id={id}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={cn(inputClassName, "w-full")}
          required={required}
          readOnly={readOnly}
          disabled={readOnly}
          defaultValue={defaultValue}
        />
      </div>
    </FormField>
  );
};
