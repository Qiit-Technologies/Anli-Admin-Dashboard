'use client';
import { bulkUploadFBItemsCsv } from '@/app/actions/menu-item';
import { FileUploader } from '@/components/common/FileUploader';
import {
    uploadIllustration,
    uploadInfoIcon,
} from '@/components/common/illustrations';
import Toast from '@/components/toast';
import { Button } from '@/components/ui/button';
import { useFileUpload } from '@/hooks/useFileUpload';
import { Download, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { mutate } from 'swr';

interface UploadFormProps {
    closeBus: () => void;
    loading: boolean;
    setLoading: (loading: boolean) => void;
}
const BulkUploadItem = ({ closeBus, setLoading, loading }: UploadFormProps) => {
    const { files, error, handleFiles, removeFile } = useFileUpload({
        maxFiles: 5,
        maxSize: 1024 * 1024 * 10,
        accept: '.csv',
    });

    const downloadFileFromDrive = () => {
        const fileId =
            process.env.NEXT_PUBLIC_GOOGLE_DRIVE_FILE_ID ||
            '1WUTZwt20EtLRSQXXqO9lo50fDqhGpT-G';
        const fileName =
            process.env.NEXT_PUBLIC_DOWNLOAD_FILENAME || 'data.csv';

        const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', fileName);
        link.style.display = 'none';

        link.setAttribute('rel', 'noopener noreferrer');

        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
            document.body.removeChild(link);
        }, 100);
    };

    const handleFileUpload = async (file: File | null) => {
        if (file) {
            try {
                setLoading(true);
                const response = await bulkUploadFBItemsCsv(file);
                if (
                    response?.message === 'Items have been added successfully.'
                ) {
                    toast.custom(() => (
                        <Toast
                            title="Success!"
                            description={response?.message}
                            type="success"
                        />
                    ));
                    setLoading(false);
                    closeBus();
                } else {
                    toast.custom(() => (
                        <Toast
                            title="Error!"
                            description="An error occurred while uploading the items"
                            type="error"
                        />
                    ));
                    setLoading(false);
                }
            } catch (error: any) {
                console.log(error);
            } finally {
                setLoading(false);
                mutate('/items');
            }
        }
    };

    return (
        <div className="flex flex-col gap-3 h-full w-full">
            <div className="flex items-start gap-4 p-4 border rounded-md bg-gray-100">
                <div>{uploadInfoIcon}</div>
                <div className="flex flex-col gap-2 justify-start">
                    <h1 className="font-semibold leading-tight text-muted-foreground">
                        Download template add item data and upload it here for
                        processing
                    </h1>
                    <span className="text-muted-foreground leading-tight text-sm">
                        Ensure all file headers are maintained and filled with
                        the correct input/items data
                    </span>
                    <button
                        onClick={downloadFileFromDrive}
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

export default BulkUploadItem;
