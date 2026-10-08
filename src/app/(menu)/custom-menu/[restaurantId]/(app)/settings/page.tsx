'use client';

import React from 'react';
import { useAppContext } from '@/context/menu-context';
import { MenuBrandingSettings } from '@/components/menu/components/menu-branding-settings';

export default function SettingsPage() {
    const { settings } = useAppContext();

    return (
        <MenuBrandingSettings
            value={{
                restaurantName: settings.restaurantName,
                logoImage: settings.logoImage,
                coverImage: settings.coverImage,
                themeId: settings.themeId,
                fontId: settings.fontId,
                brandColor: settings.brandColor,
            }}
            onChange={() => {
                // Public custom menu settings are view-only; updates are managed in back of house.
            }}
            showSaveButton={false}
        />
    );
}
