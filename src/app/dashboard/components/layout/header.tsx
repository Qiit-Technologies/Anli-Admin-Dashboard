import { Bell, Search } from "lucide-react";

const Header = ({ title }: { title: string }) => {
  return (
    <header className="flex justify-between p-10 items-center border-b-1 border-[#B5B5B5] bg-white top-0 z-10">
      <div>
        <h2 className="font-bold text-[24px]">{title}</h2>
      </div>

      <div className="flex justify-end gap-6 items-center">
        <Search size={20} className="text-gray-500" />
        <Bell size={20} className="text-gray-500" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-100 text-orange-500 font-bold rounded-full flex items-center justify-center">
            CS
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Corner Stone</p>
            <p className="text-sm text-gray-500">cornerstone1@gmail.com</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
