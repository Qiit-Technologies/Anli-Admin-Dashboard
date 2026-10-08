import React, { useState } from "react";

const timeFilters = ["12 months", "30 days", "7 days", "24 hours"];

const ButtonGroup = () => {
  const [selected, setSelected] = useState("7 days");

  return (
    <div className="inline-flex rounded-md border border-[#D0D5DD] overflow-hidden">
      {timeFilters.map((label, index) => (
        <button
          key={label}
          onClick={() => setSelected(label)}
          className={`px-4 py-2 text-sm font-medium text-[#344054] transition-colors duration-200
            ${selected === label ? "bg-gray-100" : "bg-white hover:bg-gray-50"}
            ${
              index !== timeFilters.length - 1 ? "border-r border-gray-300" : ""
            }
          `}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default ButtonGroup;
