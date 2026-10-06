// useBankList.ts
import { useEffect, useState } from 'react';
import axios from 'axios';

type Bank = {
    name: string;
    code: string;
    slug?: string;
    active: boolean;
};

export function useBankList() {
    const [banks, setBanks] = useState<Bank[]>([]);
    useEffect(() => {
        axios
            .get('https://api.paystack.co/bank', {
                headers: {
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_PAYSTACK_SECRET_KEY}`,
                },
            })
            .then((res) => {
                const activeBanks = res.data.data.filter(
                    (bank: any) => bank.active,
                );
                setBanks(activeBanks);
            })
            .catch(console.error);
    }, []);

    return banks;
}
