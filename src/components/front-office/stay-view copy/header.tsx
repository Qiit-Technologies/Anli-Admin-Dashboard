import { FaCalendarAlt } from 'react-icons/fa';

interface HeaderProps {
    selectedDate: Date;
    showDatePicker: boolean;
    onDatePickerToggle: () => void;
    onDateSelect: (date: string) => void;
}

export function Header({
    selectedDate,
    showDatePicker,
    onDatePickerToggle,
    onDateSelect,
}: HeaderProps) {
    return (
        <header className="flex items-center justify-between mb-4 border-b pb-4">
            <h1 className="text-xl font-semibold">Stay View</h1>
            <div className="flex items-center gap-4">
                {/* <input
                    type="text"
                    placeholder="Quick Search"
                    className="border rounded px-2 py-1 w-[200px]"
                /> */}
                <div className="relative">
                    <button
                        className="flex items-center gap-2 border rounded px-3 py-1"
                        onClick={onDatePickerToggle}
                    >
                        <FaCalendarAlt />
                        {selectedDate.toDateString()}
                    </button>
                    {showDatePicker && (
                        <div className="absolute right-0 mt-1 bg-white border rounded-lg shadow-lg z-50">
                            <input
                                type="date"
                                className="p-2"
                                onChange={(e) => onDateSelect(e.target.value)}
                            />
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
