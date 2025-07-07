import { Bell, Search } from "lucide-react";

const Header = ({ title }: { title: string }) => {
  return (
    <header className="flex sm:flex-row justify-between items-start sm:items-center p-4 sm:p-6 md:p-10 gap-4 sm:gap-0 border-b border-[#B5B5B5] bg-white top-0 z-10">
      <div>
        <h2 className="font-bold text-xl sm:text-2xl">{title}</h2>
      </div>

      <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-4 sm:gap-6 w-full sm:w-auto">
        <div className="gap-4 hidden sm:flex">
          <Search size={20} className="text-gray-500" />
          <Bell size={20} className="text-gray-500" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative">
            <div className="w-10 h-10 bg-orange-100 text-orange-500 font-bold rounded-full flex items-center justify-center">
              CS
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
          </div>
          <div>
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
