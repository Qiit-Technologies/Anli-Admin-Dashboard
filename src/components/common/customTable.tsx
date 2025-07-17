import React from "react";
import { CircleQuestionMark } from "lucide-react"; // Adjust import path as needed

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
  minWidth?: string;
}

interface ThProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  withIcon?: boolean;
  icon?: React.ReactNode;
}

interface TrProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
}

interface TdProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}
interface StatusBadgeProps {
  statusColorMap: Record<string, "green" | "yellow" | "red" | "gray">;
  status: string;
}

const Table = ({ children, minWidth = "600px", ...props }: TableProps) => {
  return (
    <table
      className={`w-full text-sm text-left min-w-[${minWidth}]`}
      {...props}
    >
      {children}
    </table>
  );
};

const Thead = ({ children }: { children: React.ReactNode }) => {
  return <thead className="text-gray-500 border-b">{children}</thead>;
};

const Tbody = ({ children }: { children: React.ReactNode }) => {
  return <tbody className="text-gray-700">{children}</tbody>;
};

const Tr = ({ children, ...props }: TrProps) => {
  return (
    <tr className="border-t" {...props}>
      {children}
    </tr>
  );
};

const Th = ({
  children,
  withIcon = false,
  icon,
  className = "",
  ...props
}: ThProps) => {
  return (
    <th className={`py-3 px-4 bg-[#EAECF0] ${className}`} {...props}>
      <div className="flex items-center gap-2 font-medium text-[#667085]">
        {children}
        {withIcon && (icon || <CircleQuestionMark size={16} color="#667085" />)}
      </div>
    </th>
  );
};

const Td = ({ children, ...props }: TdProps) => {
  return (
    <td className="py-4 px-4" {...props}>
      {children}
    </td>
  );
};

const StatusBadge = ({ status, statusColorMap }: StatusBadgeProps) => {
  const color = statusColorMap[status] || "gray";

  const badgeColorClasses = {
    green: "bg-green-100 text-green-600",
    yellow: "bg-yellow-100 text-yellow-800",
    red: "bg-red-100 text-red-700",
    gray: "bg-gray-100 text-gray-600",
  };

  const dotColorClasses = {
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
    gray: "bg-gray-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeColorClasses[color]}`}
    >
      <span className={`w-2 h-2 rounded-full ${dotColorClasses[color]}`}></span>
      {status}
    </span>
  );
};

export { Table, Tbody, Thead, Th, Td, Tr, StatusBadge };
