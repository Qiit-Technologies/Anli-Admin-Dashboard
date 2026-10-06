export interface FontConfig {
    id: string;
    name: string;
    fontFamily: string;
    googleFont: string;
}

export const fonts: FontConfig[] = [
    {
        id: 'dm-sans',
        name: 'DM Sans (Default)',
        fontFamily: "'DM Sans', sans-serif",
        googleFont: 'DM+Sans:wght@300;400;500;600;700',
    },
    {
        id: 'inter',
        name: 'Inter',
        fontFamily: "'Inter', sans-serif",
        googleFont: 'Inter:wght@300;400;500;600;700',
    },
    {
        id: 'playfair',
        name: 'Playfair Display',
        fontFamily: "'Playfair Display', serif",
        googleFont: 'Playfair+Display:wght@400;500;600;700',
    },
    {
        id: 'poppins',
        name: 'Poppins',
        fontFamily: "'Poppins', sans-serif",
        googleFont: 'Poppins:wght@300;400;500;600;700',
    },
    {
        id: 'cormorant',
        name: 'Cormorant Garamond',
        fontFamily: "'Cormorant Garamond', serif",
        googleFont: 'Cormorant+Garamond:wght@300;400;500;600;700',
    },
];

export const DEFAULT_FONT_ID = 'dm-sans';
