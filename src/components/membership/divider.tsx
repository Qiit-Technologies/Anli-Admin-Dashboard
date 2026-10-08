import { DividerProps } from "./types";

export const Divider = ({ className = "" }: DividerProps) => (
  <div className={`w-full border-t-1 border-gray-200 ${className}`} />
);
