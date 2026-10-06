export type PaginationProps = {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
};

export type DividerProps = {
    className?: string;
};

export type FileUploaderProps = {
    label: string;
    onFileChange: (file: File | null) => void;
    hideLabel?: boolean;
    value?: string;
    labelClassName?: string;
};
