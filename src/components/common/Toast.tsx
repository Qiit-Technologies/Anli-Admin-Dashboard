import React, { useCallback, useEffect, useState } from "react";
import { FaCheckCircle, FaInfoCircle, FaTimes } from "react-icons/fa";

interface ToastProps {
  title: string;
  description: string;
  type: "success" | "error" | "info";
  onClose?: () => void;
}

const Toast: React.FC<ToastProps> = ({ title, description, type, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);
  const typeStyles = {
    success: "bg-green-100 border-green-500 text-green-700",
    error: "bg-red-100 border-red-500 text-red-700",
    info: "bg-[#B3E5FC] border-orion-blue text-[#2196F3]",
  };

  const icons = {
    success: <FaCheckCircle className="h-5 w-5 text-green-500" />,
    error: <FaTimes className="h-5 w-5 text-red-500" />,
    info: <FaInfoCircle className="h-5 w-5 text-orion-blue" />,
  };

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      if (onClose) {
        onClose();
      }
    }, 300);
  }, [onClose]);

  useEffect(() => {
    // Automatically close the toast after 5 seconds
    const timeout = setTimeout(() => {
      handleClose();
    }, 4000); // 5 seconds auto-dismiss

    return () => clearTimeout(timeout); // Clear timeout if component unmounts
  }, [handleClose]);

  return (
    <div
      role="alert"
      className={`toast max-w-md w-full p-4 rounded-lg shadow-lg border-l-4 flex items-start space-x-4 transition-all duration-300 ${
        isClosing ? "animate-slideOutRight" : "animate-slideInRight"
      } ease-out ${typeStyles[type]}`}
    >
      <div className="flex-shrink-0 pt-1">{icons[type]}</div>
      <div className="flex-1">
        <h3 className="font-semibold text-lg mb-1">{title}</h3>
        <p className="text-sm opacity-90">{description}</p>
      </div>
      {onClose && (
        <button
          onClick={handleClose}
          className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 rounded"
          aria-label="Close"
        >
          <FaTimes className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default Toast;
