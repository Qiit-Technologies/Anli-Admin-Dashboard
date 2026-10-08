import { createPrinter, deletePrinter, getPrinters } from '@/app/actions/printer';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface Printer {
    id: number;
    name: string;
    ip: string;
    port: number;
    type?: 'kot' | 'bot' | 'receipt' | 'general';
}

export default function PrinterManagement() {
    const [printers, setPrinters] = useState<Printer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newPrinter, setNewPrinter] = useState<{
        name: string;
        ip: string;
        port: number;
        type: 'kot' | 'bot' | 'receipt' | 'general';
    }>({
        name: '',
        ip: '',
        port: 9100,
        type: 'general',
    });

    useEffect(() => {
        loadPrinters();
    }, []);

    async function loadPrinters() {
        setIsLoading(true);
        const result = await getPrinters();
        if (result.data) {
            setPrinters(result.data);
        } else {
            toast.error('Failed to load printers');
        }
        setIsLoading(false);
    }

    async function handleAddPrinter() {
        if (!newPrinter.name || !newPrinter.ip) {
            toast.error('Please fill in all fields');
            return;
        }

        setIsAdding(true);
        const result = await createPrinter(newPrinter);
        if (result.data) {
            toast.success('Printer added successfully');
            setNewPrinter({ name: '', ip: '', port: 9100, type: 'general' });
            loadPrinters();
        } else {
            toast.error('Failed to add printer');
        }
        setIsAdding(false);
    }

    async function handleDeletePrinter(id: number) {
        if (!confirm('Are you sure you want to delete this printer?')) return;

        const result = await deletePrinter(id);
        if (result.data) {
            toast.success('Printer deleted successfully');
            loadPrinters();
        } else {
            toast.error('Failed to delete printer');
        }
    }

    return (
        <Card className='shadow-none'>
            <CardHeader>
                <CardTitle>Network Printers</CardTitle>
                <CardDescription>
                    Manage the IP printers available for this hotel.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 shadow-none">
                <div className="grid gap-4 md:grid-cols-5 items-end">
                    <div className="space-y-2">
                        <Label htmlFor="printerName">Name</Label>
                        <Input
                            id="printerName"
                            placeholder="e.g. Kitchen Printer"
                            value={newPrinter.name}
                            onChange={(e) =>
                                setNewPrinter({ ...newPrinter, name: e.target.value })
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="printerIp">IP Address</Label>
                        <Input
                            id="printerIp"
                            placeholder="e.g. 192.168.1.200"
                            value={newPrinter.ip}
                            onChange={(e) =>
                                setNewPrinter({ ...newPrinter, ip: e.target.value })
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="printerPort">Port</Label>
                        <Input
                            id="printerPort"
                            type="number"
                            placeholder="9100"
                            value={newPrinter.port}
                            onChange={(e) =>
                                setNewPrinter({
                                    ...newPrinter,
                                    port: parseInt(e.target.value) || 9100,
                                })
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="printerType">Station</Label>
                        <select
                            id="printerType"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={newPrinter.type}
                            onChange={(e) =>
                                setNewPrinter({
                                    ...newPrinter,
                                    type: e.target.value as
                                        | 'kot'
                                        | 'bot'
                                        | 'receipt'
                                        | 'general',
                                })
                            }
                        >
                            <option value="general">General</option>
                            <option value="kot">Kitchen (KOT)</option>
                            <option value="bot">Bar (BOT)</option>
                            <option value="receipt">Receipt</option>
                        </select>
                    </div>
                    <Button onClick={handleAddPrinter} disabled={isAdding}>
                        {isAdding ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Plus className="h-4 w-4 mr-2" />
                        )}
                        Add Printer
                    </Button>
                </div>

                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Station</TableHead>
                                <TableHead>IP Address</TableHead>
                                <TableHead>Port</TableHead>
                                <TableHead className="w-[100px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-4">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : printers.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="text-center py-4 text-muted-foreground"
                                    >
                                        No printers configured.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                printers.map((printer) => (
                                    <TableRow key={printer.id}>
                                        <TableCell>{printer.name}</TableCell>
                                        <TableCell className="uppercase text-xs">
                                            {printer.type || 'general'}
                                        </TableCell>
                                        <TableCell>{printer.ip}</TableCell>
                                        <TableCell>{printer.port}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => handleDeletePrinter(printer.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
