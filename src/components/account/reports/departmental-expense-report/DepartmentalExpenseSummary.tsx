import { formatCurrency } from '@/lib/utils';

const DepartmentalExpenseSummary = ({ totalExpenses }: any) => {
    return (
        <div className="flex flex-col sm:flex-row gap-3 w-full">
            <div className="flex-1 bg-[rgba(252,244,244,1)] rounded-2xl px-7 py-4 flex items-center justify-center max-w-[360px] w-full">
                <span className="whitespace-nowrap text-[#23272E] text-[15px] font-semibold mr-2 max-md:text-[13px]">
                    Total Expenses Shown:
                </span>
                <span className="whitespace-nowrap text-[#23272E] text-[1.5rem] font-extrabold max-md:text-[17px]">
                    {formatCurrency(totalExpenses)}
                </span>
            </div>
            <div className="flex-1 bg-[rgba(252,244,244,1)] rounded-2xl px-7 py-4 flex items-center justify-center max-w-[360px] w-full">
                <span className="text-[#23272E] text-[15px] font-semibold mr-2 max-md:text-[13px]">
                    Top Expense Category:
                </span>
                <span className="text-[#23272E] text-[1.5rem] font-extrabold max-md:text-[17px]">
                    {/* Supplies */}-
                </span>
            </div>
        </div>
    );
};

export default DepartmentalExpenseSummary;
