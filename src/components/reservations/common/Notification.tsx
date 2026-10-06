import React from 'react';
import { Zap, Settings, Bell } from 'lucide-react';
import Image from 'next/image';

export default function Notification() {
    return (
        <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 py-[10px] px-[16px] rounded-lg border border-[#D0D5DD]">
                <Zap /> Upgrade now
            </button>

            <Settings className="h-5 w-5 text-[#667085]" />
            <Bell className="h-5 w-5 text-[#667085]" />

            <div className="flex items-center gap-2">
                <div className="relative w-10 h-10">
                    <Image
                        src={'/reservation/profile.png'}
                        width={40}
                        height={40}
                        alt="Profile"
                        priority
                    />
                </div>
            </div>
        </div>
    );
}
