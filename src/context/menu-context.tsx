/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable no-empty */
'use client';

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    useSyncExternalStore,
} from 'react';
import { themes, type ThemeConfig } from '@/components/menu/data/themes';
import { fonts, type FontConfig } from '@/components/menu/data/fonts';
import {
    defaultSettings,
    SETTINGS_STORAGE_KEY,
    FAVOURITES_STORAGE_KEY,
    type AppSettings,
} from '@/components/menu/data/settings';
import { getRestaurantInfo } from '@/app/actions/public-menu';

interface MenuContextType {
    settings: AppSettings;
    currentTheme: ThemeConfig;
    currentFont: FontConfig;
    favourites: string[];
    updateSettings: (partial: Partial<AppSettings>) => void;
    toggleFavourite: (itemId: string) => void;
    isFavourite: (itemId: string) => boolean;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

function loadSettings(): AppSettings {
    if (typeof window === 'undefined') return defaultSettings;
    try {
        const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (stored) {
            return { ...defaultSettings, ...JSON.parse(stored) };
        }
    } catch {}
    return defaultSettings;
}

function loadFavourites(): string[] {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(FAVOURITES_STORAGE_KEY);
        if (stored) return JSON.parse(stored);
    } catch {}
    return [];
}

function applyTheme(theme: ThemeConfig, brandOverride?: string) {
    const root = document.documentElement;
    const colors = theme.colors;
    const brand = brandOverride || colors.brand;

    root.style.setProperty('--menu-background', colors.background);
    root.style.setProperty('--menu-foreground', colors.foreground);
    root.style.setProperty('--menu-card', colors.card);
    root.style.setProperty('--menu-card-foreground', colors.cardForeground);
    root.style.setProperty('--menu-primary', brand);
    root.style.setProperty(
        '--menu-primary-foreground',
        colors.primaryForeground,
    );
    root.style.setProperty('--menu-secondary', colors.secondary);
    root.style.setProperty(
        '--menu-secondary-foreground',
        colors.secondaryForeground,
    );
    root.style.setProperty('--menu-muted', colors.muted);
    root.style.setProperty('--menu-muted-foreground', colors.mutedForeground);
    root.style.setProperty('--menu-accent', colors.accent);
    root.style.setProperty('--menu-accent-foreground', colors.accentForeground);
    root.style.setProperty('--menu-border', colors.border);
    root.style.setProperty('--menu-input', colors.input);
    root.style.setProperty('--menu-ring', brand);
    root.style.setProperty('--menu-brand', brand);
}

function applyFont(font: FontConfig) {
    document.documentElement.style.setProperty(
        '--font-family',
        font.fontFamily,
    );

    const existingLink = document.getElementById('google-font-link');
    if (existingLink) existingLink.remove();

    const link = document.createElement('link');
    link.id = 'google-font-link';
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${font.googleFont}&display=swap`;
    document.head.appendChild(link);
}

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function AppProvider({
    children,
    restaurantId,
}: {
    children: React.ReactNode;
    restaurantId?: string;
}) {
    const [settings, setSettings] = useState<AppSettings>(() => {
        const s = loadSettings();
        // the URL param is always authoritative — never let localStorage override it
        return { ...s, restaurantId: restaurantId ?? s.restaurantId };
    });
    const [favourites, setFavourites] = useState<string[]>(loadFavourites);

    useEffect(() => {
        if (restaurantId) {
            setSettings((prev) => ({ ...prev, restaurantId }));
        }
    }, [restaurantId]);
    const mounted = useSyncExternalStore(
        subscribe,
        getSnapshot,
        getServerSnapshot,
    );

    useEffect(() => {
        const s = loadSettings();
        const id = restaurantId ?? s.restaurantId;
        const theme = themes.find((t) => t.id === s.themeId) || themes[0];
        const font = fonts.find((f) => f.id === s.fontId) || fonts[0];
        applyTheme(
            theme,
            s.brandColor !== defaultSettings.brandColor
                ? s.brandColor
                : undefined,
        );
        applyFont(font);

        // Bootstrap restaurant info from API (source of truth for branding)
        if (
            id &&
            id !== 'NaN' &&
            id !== 'undefined' &&
            id !== '[object Object]'
        ) {
            getRestaurantInfo(id).then(({ data }) => {
                if (!data) return;
                // API values are authoritative (set by back-of-house)
                const resolvedThemeId = data.themeId ?? defaultSettings.themeId;
                const resolvedBrand =
                    data.brandColor ?? defaultSettings.brandColor;
                const resolvedFont = data.fontId ?? defaultSettings.fontId;
                const resolvedTheme =
                    themes.find((t) => t.id === resolvedThemeId) || themes[0];
                const resolvedFontConfig =
                    fonts.find((f) => f.id === resolvedFont) || fonts[0];
                setSettings((prev) => ({
                    ...prev,
                    restaurantId: id,
                    restaurantName: data.name || 'Restaurant',
                    restaurantLogo: data.logoImage || '',
                    brandColor: resolvedBrand,
                    themeId: resolvedThemeId,
                    fontId: resolvedFont,
                    logoImage: data.logoImage || '',
                    coverImage: data.coverImage || '',
                }));
                applyTheme(
                    resolvedTheme,
                    resolvedBrand !== defaultSettings.brandColor
                        ? resolvedBrand
                        : undefined,
                );
                applyFont(resolvedFontConfig);
            });
        }
    }, [restaurantId]);

    const updateSettings = useCallback((partial: Partial<AppSettings>) => {
        setSettings((prev) => {
            const next = { ...prev, ...partial };
            // Never persist restaurantId — it is owned by the URL, not user preferences
            const { restaurantId: _rid, ...toStore } = next;
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(toStore));

            if (partial.themeId || partial.brandColor) {
                const theme =
                    themes.find((t) => t.id === next.themeId) || themes[0];
                applyTheme(
                    theme,
                    next.brandColor !== defaultSettings.brandColor
                        ? next.brandColor
                        : undefined,
                );
            }
            if (partial.fontId) {
                const font =
                    fonts.find((f) => f.id === next.fontId) || fonts[0];
                applyFont(font);
            }

            return next;
        });
    }, []);

    const toggleFavourite = useCallback((itemId: string) => {
        setFavourites((prev) => {
            const next = prev.includes(itemId)
                ? prev.filter((id) => id !== itemId)
                : [...prev, itemId];
            localStorage.setItem(FAVOURITES_STORAGE_KEY, JSON.stringify(next));
            return next;
        });
    }, []);

    const isFavourite = useCallback(
        (itemId: string) => favourites.includes(itemId),
        [favourites],
    );

    const currentTheme =
        themes.find((t) => t.id === settings.themeId) || themes[0];
    const currentFont = fonts.find((f) => f.id === settings.fontId) || fonts[0];

    if (!mounted) {
        return null;
    }

    return (
        <MenuContext.Provider
            value={{
                settings,
                currentTheme,
                currentFont,
                favourites,
                updateSettings,
                toggleFavourite,
                isFavourite,
            }}
        >
            {children}
        </MenuContext.Provider>
    );
}

export function useAppContext() {
    const ctx = useContext(MenuContext);
    if (!ctx) throw new Error('useAppContext must be used within AppProvider');
    return ctx;
}
