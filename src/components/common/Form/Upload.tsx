'use client';
import {
    type UploadItemsCsvSuccess,
    uploadItemsCsv,
} from '@/app/actions/items';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import { useFileUpload } from '@/hooks/useFileUpload';
import { downloadStockItemCsvTemplate } from '@/lib/stock-item-csv-template';
import { Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { mutate } from 'swr';
import { FileUploader } from '../FileUploader';
import { uploadIllustration, uploadInfoIcon } from '../illustrations';

interface UploadFormProps {
    closeBus: () => void;
    onError?: (error: string) => void;
    onUploadSuccess?: (summary: UploadItemsCsvSuccess) => void;
}
const UploadForm = ({
    closeBus,
    onError,
    onUploadSuccess,
}: UploadFormProps) => {
    const [loading, setLoading] = useState<boolean>(false);
    const { files, error, handleFiles, removeFile, clearFiles } = useFileUpload(
        {
            maxFiles: 5,
            maxSize: 1024 * 1024 * 10,
            accept: '.csv',
        },
    );

    const handleFileUpload = async (file: File | null) => {
        if (!file) return;

        try {
            setLoading(true);
            const response = await uploadItemsCsv(file);

            if (response?.success) {
                mutate('/items');
                // Set summary in parent first; close sheet on the next frame so Radix
                // unmount does not race the dialog state (response is already complete).
                onUploadSuccess?.(response);
                requestAnimationFrame(() => {
                    clearFiles();
                    closeBus();
                });
            } else if (response) {
                const msg = response.message || 'Something went wrong';
                onError?.(msg);
                toast.custom(() => (
                    <Toast title="Error!" description={msg} type="error" />
                ));
            }
        } catch (error: any) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-3 h-full w-full">
            <div className="flex items-start gap-4 p-4 border rounded-md bg-gray-100">
                <div>{uploadInfoIcon}</div>
                <div className="flex flex-col gap-2 justify-start">
                    <h1 className="font-semibold leading-tight text-muted-foreground">
                        Download the template, fill in item details, then upload
                        here
                    </h1>
                    <span className="text-muted-foreground leading-tight text-sm">
                        Use the same fields as Add Item (name, location,
                        category, units, quantities, costs, vendor). Keep the
                        column headers as-is — no backend IDs or technical
                        mappings required.
                    </span>
                    <button
                        type="button"
                        onClick={downloadStockItemCsvTemplate}
                        className="text-hexbrand hover:underline hover:underline-offset-2 disabled:opacity-20 font-bold flex gap-2 text-sm items-center justify-center w-fit"
                    >
                        <Download className="w-4 h-4" />
                        Download template
                    </button>
                </div>
            </div>
            <FileUploader
                files={files}
                error={error}
                handleFiles={(files) => handleFiles(files as FileList)}
                removeFile={removeFile}
                accept=".csv"
                className="min-h-[100px] rounded-md bg-transparent hover:bg-gray-100"
                dragActiveClassName="bg-hexbrand/15 text-hexbrand border-hexbrand"
                illustration={uploadIllustration}
            />
            <Button
                onClick={() => handleFileUpload(files[0])}
                disabled={files.length === 0}
                className="bg-orion-blue hover:bg-orion-blue h-14 w-full text-white"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Add Items
            </Button>
        </div>
    );
};

export default UploadForm;
