import { Calendar, Clock } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface BookDateTimeProps {
    onDateTimeSelect?: (
        dateTime: { date: string; time: string; duration: number } | null,
    ) => void;
    selectedDateTime?: { date: string; time: string; duration: number } | null;
}

const BookDateTime: React.FC<BookDateTimeProps> = ({
    onDateTimeSelect,
    selectedDateTime,
}) => {
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [duration, setDuration] = useState(1);

    useEffect(() => {
        if (selectedDateTime) {
            setSelectedDate(selectedDateTime.date);
            setSelectedTime(selectedDateTime.time);
            setDuration(selectedDateTime.duration);
        }
    }, [selectedDateTime]);

    const timeSlots = [];
    for (let hour = 9; hour <= 21; hour++) {
        const time12 =
            hour > 12
                ? `${hour - 12}:00 PM`
                : hour === 12
                  ? '12:00 PM'
                  : `${hour}:00 AM`;
        const time24 = `${hour.toString().padStart(2, '0')}:00`;
        timeSlots.push({ display: time12, value: time24 });
    }

    const handleDateChange = (date: string) => {
        setSelectedDate(date);
        updateSelection(date, selectedTime, duration);
    };

    const handleTimeChange = (time: string) => {
        setSelectedTime(time);
        updateSelection(selectedDate, time, duration);
    };

    const handleDurationChange = (newDuration: number) => {
        setDuration(newDuration);
        updateSelection(selectedDate, selectedTime, newDuration);
    };

    const updateSelection = (date: string, time: string, dur: number) => {
        if (date && time) {
            onDateTimeSelect?.({ date, time, duration: dur });
        } else {
            onDateTimeSelect?.(null);
        }
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="space-y-4">
            <div>
                <label className="text-sm font-semibold mb-2 block">
                    Select Date
                </label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="date"
                        value={selectedDate}
                        min={today}
                        onChange={(e) => handleDateChange(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007BFF] focus:border-transparent"
                    />
                </div>
            </div>

            <div>
                <label className="text-sm font-semibold mb-2 block">
                    Select Time
                </label>
                <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                        value={selectedTime}
                        onChange={(e) => handleTimeChange(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007BFF] focus:border-transparent appearance-none bg-white"
                    >
                        <option value="">Select time</option>
                        {timeSlots.map((slot) => (
                            <option key={slot.value} value={slot.value}>
                                {slot.display}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label className="text-sm font-semibold mb-2 block">
                    Duration (hours)
                </label>
                <div className="flex space-x-2">
                    {[1, 2, 3, 4, 6, 8].map((hours) => (
                        <button
                            key={hours}
                            onClick={() => handleDurationChange(hours)}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                duration === hours
                                    ? 'bg-[#007BFF] text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {hours}h
                        </button>
                    ))}
                </div>
            </div>

            {selectedDate && selectedTime && (
                <div className="bg-[#F2F2F2] border border-[#F2F2F2] p-3 rounded-lg">
                    <p className="text-xs font-medium text-[#105F87] mb-2">
                        Booking Summary
                    </p>
                    <div className="text-xs space-y-1">
                        <p>
                            <strong>Date:</strong>{' '}
                            {new Date(selectedDate).toLocaleDateString()}
                        </p>
                        <p>
                            <strong>Time:</strong>{' '}
                            {
                                timeSlots.find(
                                    (slot) => slot.value === selectedTime,
                                )?.display
                            }
                        </p>
                        <p>
                            <strong>Duration:</strong> {duration} hour
                            {duration > 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookDateTime;
