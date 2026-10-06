'use client';

import useSWR from 'swr';
import { TimelineComponent } from '../common/TimelineComponent';
import { getDepartments } from '@/app/actions/department';
import { getPunctualityStats } from '@/app/actions/employee';

interface Department {
    id: number;
    name: string;
}

function formatEndTime(start: string): string {
    const [h, m] = start.split(':').map(Number);
    const end = new Date();
    end.setHours(h);
    end.setMinutes(m + 30);
    return end.toTimeString().slice(0, 5);
}

function generateColor(index: number): string {
    const colors = [
        'orange',
        'darkBlue',
        'lightBlue',
        'green',
        'purple',
        'red',
        'teal',
        'yellow',
    ];
    return colors[index % colors.length];
}

const PunctualityChart = () => {
    // ✅ Fetch departments
    const { data: departments = [] } = useSWR<Department[]>(
        `/departments`,
        getDepartments,
    );

    // ✅ Build color map dynamically
    const deptColorMap = departments.reduce<Record<string, string>>(
        (acc, dept, index) => {
            acc[dept.name] = generateColor(index);
            return acc;
        },
        {},
    );

    // ✅ Fetch punctuality stats
    const { data: punctualityStats } = useSWR(
        `/employees/punctuality-stats`,
        getPunctualityStats,
    );

    // ✅ Filter for today's date
    const today = new Date().toISOString().split('T')[0];

    const timelineData = punctualityStats?.data
        ?.map((entry: any, i: any) => {
            const todayEntry = entry.punctuality.find(
                (p: any) => p.date === today,
            );
            if (!todayEntry) return null;

            return todayEntry.events.map((event: any, idx: any) => ({
                id: i * 100 + idx,
                name: entry.department,
                start: event.time,
                end: formatEndTime(event.time),
                color: deptColorMap[entry.department] || 'gray',
            }));
        })
        .flat()
        .filter(Boolean);

    return (
        <TimelineComponent
            title="Most Punctual Departments"
            description="Export or share insights with department heads"
            data={timelineData || []}
        />
    );
};

export default PunctualityChart;
