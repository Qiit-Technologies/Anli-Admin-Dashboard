import { getItemHistory, getItemInventory } from '@/app/actions/items';
import { formatDate } from '@/lib/helpers';
import { Inventory, SimplifiedInventory } from '@/types/inventory.types';
import { SimplifiedTransaction, Transaction } from '@/types/transaction.types';
import { useEffect, useState } from 'react';

const useDetails = (itemId: number) => {
    const [transactions, setTransactions] = useState<SimplifiedTransaction[]>(
        [],
    );
    const [historyMeta, setHistoryMeta] = useState({ page: 1, lastPage: 1 });
    const [inventoryMeta, setInventoryMeta] = useState({
        page: 1,
        lastPage: 1,
    });
    const [inventory, setInventory] = useState<SimplifiedInventory[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getData = async () => {
            try {
                const { data: history, meta } = await getItemHistory(
                    itemId,
                    historyMeta.page,
                );
                const simplifiedTransactions = history.map(
                    (transaction: Transaction) => ({
                        id: transaction.id,
                        type: transaction.transactionType,
                        quantity: transaction.quantityChange,
                        date: formatDate(transaction.transactionDate),
                        department: transaction.role.department,
                        fullName: transaction.staff.fullName,
                    }),
                );
                setTransactions(simplifiedTransactions);

                setHistoryMeta((prev) => ({
                    ...prev,
                    lastPage: meta.lastPage,
                }));

                const { data: inventory, meta: itemInventoryMeta } =
                    await getItemInventory(itemId, inventoryMeta.page);
                const simplifiedInventory = inventory.map(
                    (item: Inventory) => ({
                        id: item.id,
                        quantity: item.quantity,
                        minStock: item.minStock,
                        department: item.role.department,
                        createdAt: formatDate(item.createdAt),
                    }),
                );
                setInventory(simplifiedInventory);

                setInventoryMeta((prev) => ({
                    ...prev,
                    lastPage: itemInventoryMeta.lastPage,
                }));
            } catch (err) {
                console.error('Failed to fetch:', err);
                setError('An error occurred while fetching.');
            }
        };

        getData();
    }, [historyMeta.page, inventoryMeta.page, itemId]);

    const setHistoryPage = (page: number): void => {
        setHistoryMeta({ ...historyMeta, page });
    };

    const setInventoryPage = (page: number): void => {
        setHistoryMeta({ ...inventoryMeta, page });
    };

    return {
        transactions,
        historyMeta,
        setHistoryPage,
        inventoryMeta,
        setInventoryPage,
        inventory,
        error,
    };
};

export default useDetails;
