'use client';

import {
    getMenuSettings,
    updateMenuSettings,
    uploadMenuLogo,
    uploadMenuCover,
} from '@/app/actions/hotel';
import PageWrapper from '@/components/common/PageWrapper';
import { PageHeader, PageHeadertitle } from '@/components/common/layout/Header';
import {
    MenuBrandingSettings,
    type MenuBrandingValue,
} from '@/components/menu/components/menu-branding-settings';
import Toast from '@/components/toast';
import { Loader2, Save } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';

const DEFAULT_BRAND_COLOR = '#FF6F00';

const fetchMenuSettings = async () => {
    const response = await getMenuSettings();
    if ('error' in response && response.error) {
        throw new Error(response.error);
    }
    return response.data;
};

export default function BackOfHouseMenuSettingsPage() {
    const {
        data: serverData,
        isLoading,
        mutate,
    } = useSWR('menu-settings', fetchMenuSettings, {
        revalidateOnFocus: false,
    });

    const [menuDisplayName, setMenuDisplayName] = useState('');
    const [menuLogoUrl, setMenuLogoUrl] = useState('');
    const [menuCoverImageUrl, setMenuCoverImageUrl] = useState('');
    const [menuThemeId, setMenuThemeId] = useState('');
    const [menuFontId, setMenuFontId] = useState('');
    const [menuBrandColor, setMenuBrandColor] = useState(DEFAULT_BRAND_COLOR);
    const [savingMenuSettings, setSavingMenuSettings] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);

    const serverRef = useRef<typeof serverData>(null);

    useEffect(() => {
        if (serverData && serverData !== serverRef.current) {
            serverRef.current = serverData;
            setMenuDisplayName(serverData.restaurantName ?? '');
            setMenuLogoUrl(serverData.restaurantLogo ?? '');
            setMenuCoverImageUrl(serverData.coverImage ?? '');
            setMenuThemeId(serverData.theme ?? '');
            setMenuFontId(serverData.font ?? '');
            setMenuBrandColor(serverData.brandColor ?? DEFAULT_BRAND_COLOR);
        }
    }, [serverData]);

    const isDirty = useCallback(() => {
        if (!serverRef.current) return false;
        const s = serverRef.current;
        return (
            menuDisplayName !== (s.restaurantName ?? '') ||
            menuCoverImageUrl !== (s.coverImage ?? '') ||
            menuThemeId !== (s.theme ?? '') ||
            menuFontId !== (s.font ?? '') ||
            menuBrandColor !== (s.brandColor ?? DEFAULT_BRAND_COLOR)
        );
    }, [
        menuDisplayName,
        menuCoverImageUrl,
        menuThemeId,
        menuFontId,
        menuBrandColor,
    ]);

    const hasChanges = isDirty();

    const handleMenuSettingsSave = async () => {
        setSavingMenuSettings(true);
        try {
            const payload = {
                restaurantName: menuDisplayName || null,
                restaurantLogo: menuLogoUrl || null,
                coverImage: menuCoverImageUrl || null,
                theme: menuThemeId || null,
                font: menuFontId || null,
                brandColor: menuBrandColor || null,
            };
            const response = await updateMenuSettings(payload);
            if ('error' in response && response.error) {
                toast.custom(() => (
                    <Toast
                        title="Error!"
                        description={
                            response.error ||
                            'Unable to update menu settings right now.'
                        }
                        type="error"
                    />
                ));
            } else {
                mutate();
                toast.custom(() => (
                    <Toast
                        title="Success!"
                        description="Menu settings updated successfully"
                        type="success"
                    />
                ));
            }
        } catch (error: any) {
            console.error('Error updating menu settings:', error);
            toast.custom(() => (
                <Toast
                    title="Error!"
                    description="Unable to update menu settings right now."
                    type="error"
                />
            ));
        } finally {
            setSavingMenuSettings(false);
        }
    };

    const value: MenuBrandingValue = {
        restaurantName: menuDisplayName,
        logoImage: menuLogoUrl,
        coverImage: menuCoverImageUrl,
        themeId: menuThemeId,
        fontId: menuFontId,
        brandColor: menuBrandColor,
    };

    return (
        <PageWrapper>
            <PageHeader>
                <PageHeadertitle
                    title="Menu Settings"
                    subtitle="Manage how your menu appears to guests"
                />
            </PageHeader>

            {isLoading ? (
                <div className="flex items-center gap-2 px-6 py-12 justify-center text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading menu settings…</span>
                </div>
            ) : (
                <div className="mx-auto w-full max-w-lg px-4 pb-10 sm:px-6">
                    {/* Branding Settings */}
                    <MenuBrandingSettings
                        value={value}
                        onChange={(partial) => {
                            if (partial.restaurantName !== undefined)
                                setMenuDisplayName(partial.restaurantName);
                            if (partial.logoImage !== undefined)
                                setMenuLogoUrl(partial.logoImage);
                            if (partial.coverImage !== undefined)
                                setMenuCoverImageUrl(partial.coverImage);
                            if (partial.themeId !== undefined)
                                setMenuThemeId(partial.themeId);
                            if (partial.fontId !== undefined)
                                setMenuFontId(partial.fontId);
                            if (partial.brandColor !== undefined)
                                setMenuBrandColor(partial.brandColor);
                        }}
                        showSaveButton={false}
                        logoUrl={menuLogoUrl}
                        uploadingLogo={uploadingLogo}
                        onUploadLogo={async (file) => {
                            setUploadingLogo(true);
                            try {
                                const result = await uploadMenuLogo(file);
                                if ('error' in result && result.error) {
                                    toast.custom(() => (
                                        <Toast
                                            title="Error!"
                                            description={
                                                result.error ||
                                                'Failed to upload logo image.'
                                            }
                                            type="error"
                                        />
                                    ));
                                } else if (result.data?.url) {
                                    setMenuLogoUrl(result.data.url);
                                    await updateMenuSettings({
                                        restaurantLogo: result.data.url,
                                    });
                                    mutate();
                                    toast.custom(() => (
                                        <Toast
                                            title="Success!"
                                            description="Logo updated successfully"
                                            type="success"
                                        />
                                    ));
                                }
                            } catch (error: any) {
                                console.error('Error uploading logo:', error);
                                toast.custom(() => (
                                    <Toast
                                        title="Error!"
                                        description="Failed to upload logo image."
                                        type="error"
                                    />
                                ));
                            } finally {
                                setUploadingLogo(false);
                            }
                        }}
                        onRemoveLogo={async () => {
                            setMenuLogoUrl('');
                            await updateMenuSettings({
                                restaurantLogo: null,
                            });
                            mutate();
                        }}
                        onUploadCoverImage={async (file) => {
                            setUploadingCover(true);
                            try {
                                const result = await uploadMenuCover(file);
                                if ('error' in result && result.error) {
                                    toast.custom(() => (
                                        <Toast
                                            title="Error!"
                                            description={
                                                result.error ||
                                                'Failed to upload cover image.'
                                            }
                                            type="error"
                                        />
                                    ));
                                } else if (result.data?.url) {
                                    setMenuCoverImageUrl(result.data.url);
                                    await updateMenuSettings({
                                        coverImage: result.data.url,
                                    });
                                    mutate();
                                    toast.custom(() => (
                                        <Toast
                                            title="Success!"
                                            description="Cover image updated successfully"
                                            type="success"
                                        />
                                    ));
                                }
                            } catch (error: any) {
                                console.error(
                                    'Error uploading cover image:',
                                    error,
                                );
                                toast.custom(() => (
                                    <Toast
                                        title="Error!"
                                        description="Failed to upload cover image."
                                        type="error"
                                    />
                                ));
                            } finally {
                                setUploadingCover(false);
                            }
                        }}
                        uploadingCover={uploadingCover}
                    />

                    <div className="sticky bottom-0 -mx-4 sm:-mx-6 border-t border-border bg-background/95 backdrop-blur px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                            {hasChanges ? (
                                <span className="text-xs text-amber-600 font-medium">
                                    You have unsaved changes
                                </span>
                            ) : (
                                <span className="text-xs text-muted-foreground">
                                    All changes saved
                                </span>
                            )}
                            <button
                                onClick={handleMenuSettingsSave}
                                disabled={savingMenuSettings || !hasChanges}
                                className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all ${
                                    hasChanges
                                        ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
                                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                                }`}
                            >
                                {savingMenuSettings ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                {savingMenuSettings
                                    ? 'Saving…'
                                    : hasChanges
                                      ? 'Save Changes'
                                      : 'Saved'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </PageWrapper>
    );
}
