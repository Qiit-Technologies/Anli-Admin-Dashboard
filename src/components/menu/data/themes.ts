export interface ThemeConfig {
    id: string;
    name: string;
    colors: {
        background: string;
        foreground: string;
        card: string;
        cardForeground: string;
        primary: string;
        primaryForeground: string;
        secondary: string;
        secondaryForeground: string;
        muted: string;
        mutedForeground: string;
        accent: string;
        accentForeground: string;
        border: string;
        input: string;
        ring: string;
        brand: string;
    };
}

function lightTheme(id: string, name: string, brand: string): ThemeConfig {
    return {
        id,
        name,
        colors: {
            background: '#ffffff',
            foreground: '#1a1a1a',
            card: '#f9f9f9',
            cardForeground: '#1a1a1a',
            primary: brand,
            primaryForeground: '#ffffff',
            secondary: '#f3f4f6',
            secondaryForeground: '#1a1a1a',
            muted: '#f3f4f6',
            mutedForeground: '#6b7280',
            accent: '#f3f4f6',
            accentForeground: '#1a1a1a',
            border: '#e5e7eb',
            input: '#e5e7eb',
            ring: brand,
            brand,
        },
    };
}

export const themes: ThemeConfig[] = [
    lightTheme('orange', 'Orange (Default)', '#FF6F00'),
    lightTheme('emerald', 'Emerald', '#059669'),
    lightTheme('rose', 'Rosé', '#e11d48'),
    lightTheme('ocean', 'Ocean Blue', '#0284c7'),
    lightTheme('violet', 'Violet', '#7c3aed'),
    lightTheme('gold', 'Gold', '#b8860b'),
];

export const DEFAULT_THEME_ID = 'orange';
