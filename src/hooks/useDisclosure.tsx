import { useCallback, useState } from 'react';

interface UseDisclosureReturn {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
    onOpenChange: (open: boolean) => void;
}

export function useDisclosure(
    initialState: boolean = false,
): UseDisclosureReturn {
    const [isOpen, setIsOpen] = useState(initialState);

    const onOpen = useCallback(() => setIsOpen(true), []);
    const onClose = useCallback(() => setIsOpen(false), []);
    const onOpenChange = useCallback((open: boolean) => setIsOpen(open), []);

    return { isOpen, onOpen, onClose, onOpenChange };
}
