import { fetchHotelDetailsById, updateHotel } from '@/app/actions/hotel';
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
import { Loader2, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function PrintoutConfig() {
    const [hotelId, setHotelId] = useState<number | null>(null);
    const [config, setConfig] = useState({
        printoutName: '',
        printoutAddress: '',
        printoutEmail: '',
        printoutPhone: '',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadHotelSettings();
    }, []);

    async function loadHotelSettings() {
        try {
            const result = await fetchHotelDetailsById();
            if (result.data) {
                setHotelId(result.data.id);
                setConfig({
                    printoutName: result.data.printoutName || '',
                    printoutAddress: result.data.printoutAddress || '',
                    printoutEmail: result.data.printoutEmail || '',
                    printoutPhone: result.data.printoutPhone || '',
                });
            }
        } catch (error: any) {
            console.error('Failed to load hotel settings:', error);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleSave() {
        if (!hotelId) return;

        setIsSaving(true);
        const result = await updateHotel(hotelId, config);

        if (result.data) {
            toast.success('Printout settings saved successfully');
        } else {
            toast.error(result.error || 'Failed to save settings');
        }
        setIsSaving(false);
    }

    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-6 flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-none">
            <CardHeader>
                <CardTitle>Custom Printout Details</CardTitle>
                <CardDescription>
                    Customize the hotel information displayed on receipts and
                    KOTs. Leave blank to use default hotel details.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 shadow-none">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="printoutName">Display Name</Label>
                        <Input
                            id="printoutName"
                            placeholder="Hotel Name on Receipt"
                            value={config.printoutName}
                            onChange={(e) =>
                                setConfig({
                                    ...config,
                                    printoutName: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="printoutPhone">Display Phone</Label>
                        <Input
                            id="printoutPhone"
                            placeholder="Phone Number on Receipt"
                            value={config.printoutPhone}
                            onChange={(e) =>
                                setConfig({
                                    ...config,
                                    printoutPhone: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="printoutEmail">Display Email</Label>
                        <Input
                            id="printoutEmail"
                            placeholder="Email on Receipt"
                            value={config.printoutEmail}
                            onChange={(e) =>
                                setConfig({
                                    ...config,
                                    printoutEmail: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="printoutAddress">Display Address</Label>
                        <Input
                            id="printoutAddress"
                            placeholder="Address on Receipt"
                            value={config.printoutAddress}
                            onChange={(e) =>
                                setConfig({
                                    ...config,
                                    printoutAddress: e.target.value,
                                })
                            }
                        />
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Changes
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
