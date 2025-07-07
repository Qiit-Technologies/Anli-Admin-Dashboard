import { Bell, Menu, Search, X } from "lucide-react";

const Header = ({
  title,
  isOpen,
  setIsOpen,
}: {
  title: string;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}) => {
  return (
    <header className="flex sm:flex-row justify-between items-center p-4 sm:p-6 md:p-10 gap-4 sm:gap-0 border-b border-[#B5B5B5] bg-white top-0 z-10 relative">
      {/* Page title */}
      <h2 className="font-bold text-xl sm:text-2xl">{title}</h2>

      {/* Right Section (icons + avatar) */}
      <div className="flex items-center gap-4">
        {/* Menu Toggle (visible only on mobile) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="sm:hidden text-gray-700 bg-gray-100 p-2 rounded-md"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Icons (only on larger screens) */}
        <div className="hidden sm:flex gap-4">
          <Search size={20} className="text-gray-500" />
          <Bell size={20} className="text-gray-500" />
        </div>

        {/* Profile Avatar (hide text on small screens) */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-10 h-10 bg-orange-100 text-orange-500 font-bold rounded-full flex items-center justify-center">
              CS
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-[#344054]">Corner Stone</p>
            <p className="text-xs text-[#667085] break-words">
              cornerstone1@gmail.com
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
export default Header;
