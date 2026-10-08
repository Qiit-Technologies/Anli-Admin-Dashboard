'use client';

import Header from '@/components/reservations/layout/Header';
import TableServiceComponent from '@/components/front-of-house/TableServices';

export default function Menu() {
    const handleTableSelect = () => {
        console.log('Table selected for reservation');
    };

    return (
        <main className="bg-white min-h-screen">
            <Header />

            <TableServiceComponent onTableSelect={handleTableSelect} />
        </main>
    );
}
