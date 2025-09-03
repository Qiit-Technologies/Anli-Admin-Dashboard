import { Button } from "@/components/ui/button";
import { cn } from "@/utils/utils";
import { Loader2 } from "lucide-react";
import React from "react";

interface BrandButtonProps {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  type?: "submit" | "button" | "reset";
  variant?: "primary" | "secondary" | "tertiary";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  rounded?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const BrandButton: React.FC<BrandButtonProps> = ({
  children,
  loading = false,
  disabled = false,
  onClick,
  className,
  type = "button",
  variant = "primary",
  size = "md",
  fullWidth = false,
  rounded = false,
  icon,
  iconPosition = "left",
}) => {
  const getVariant = () => {
    switch (variant) {
      case "primary":
        return "default";
      case "secondary":
        return "secondary";
      case "tertiary":
        return "ghost";
      default:
        return "default";
    }
  };

  const getSize = () => {
    switch (size) {
      case "sm":
        return "sm";
      case "md":
        return "default";
      case "lg":
        return "lg";
      default:
        return "default";
    }
  };

  const isDisabled = disabled || loading;

  return (
    <Button
      type={type}
      variant={getVariant()}
      size={getSize()}
      disabled={isDisabled}
      onClick={onClick}
      className={cn(
        "relative transition-all bg-orion-blue hover:bg-orion-blue duration-200",
        fullWidth && "w-full",
        rounded && "rounded-full",
        loading && "cursor-not-allowed",
        className,
      )}
    >
      {icon && iconPosition === "left" && !loading && (
        <span className="mr-1 flex items-center">{icon}</span>
      )}

      {loading && (
        <span className="mr-1 flex items-center">
          <Loader2 className="h-4 w-4 animate-spin" />
        </span>
      )}

      <span className={cn(loading && "opacity-70")}>{children}</span>
      {icon && iconPosition === "right" && !loading && (
        <span className="ml-1 flex items-center">{icon}</span>
      )}
    </Button>
  );
};

export default BrandButton;
