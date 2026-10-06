import { fonts } from '@/components/menu/data/fonts';
import { themes } from '@/components/menu/data/themes';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Check, Loader2, Save, Upload } from 'lucide-react';
import React from 'react';

export type MenuBrandingValue = {
    restaurantName: string;
    logoImage: string;
    coverImage: string;
    themeId: string;
    fontId: string;
    brandColor: string;
};

type MenuBrandingSettingsProps = {
    title?: string;
    description?: string;
    value: MenuBrandingValue;
    onChange: (partial: Partial<MenuBrandingValue>) => void;
    onSave?: () => void;
    saving?: boolean;
    showSaveButton?: boolean;
    logoUrl?: string;
    uploadingLogo?: boolean;
    onUploadLogo?: (file: File) => void;
    onRemoveLogo?: () => void;
    onUploadCoverImage?: (file: File) => void;
    uploadingCover?: boolean;
};

const DEFAULT_BRAND = '#FF6F00';

export function MenuBrandingSettings({
    title = 'Settings',
    description = 'Customize your menu experience',
    value,
    onChange,
    onSave,
    saving = false,
    showSaveButton = false,
    logoUrl,
    uploadingLogo = false,
    onUploadLogo,
    onRemoveLogo,
    onUploadCoverImage,
    uploadingCover = false,
}: Readonly<MenuBrandingSettingsProps>) {
    const brandColor = value.brandColor || DEFAULT_BRAND;
    const hasHeader = title || description;

    return (
        <div className="mx-auto max-w-lg py-6">
            {(hasHeader || (showSaveButton && onSave)) && (
                <>
                    <div className="flex items-center justify-between">
                        {hasHeader ? (
                            <div>
                                {title && (
                                    <h1 className="text-2xl font-bold text-foreground">
                                        {title}
                                    </h1>
                                )}
                                {description && (
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {description}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div />
                        )}
                        {showSaveButton && onSave && (
                            <button
                                onClick={onSave}
                                disabled={saving}
                                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                                style={{ backgroundColor: brandColor }}
                            >
                                {saving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                Save Design
                            </button>
                        )}
                    </div>
                    <Separator className="my-6" />
                </>
            )}

            <section className="mb-8">
                <Label className="text-sm font-semibold text-foreground">
                    Restaurant Display Name
                </Label>
                <p className="mt-1 text-xs text-muted-foreground">
                    Override the fetched restaurant name shown on the landing
                    page
                </p>
                <div className="mt-3">
                    <Input
                        value={value.restaurantName}
                        onChange={(e) =>
                            onChange({ restaurantName: e.target.value })
                        }
                        placeholder="Enter restaurant name"
                        className="bg-card"
                    />
                </div>
            </section>

            {onUploadLogo && (
                <section className="mb-8">
                    <Label className="text-sm font-semibold text-foreground">
                        Restaurant Logo
                    </Label>
                    <p className="mt-1 text-xs text-muted-foreground">
                        This logo appears on your public menu and landing page
                    </p>
                    <div className="mt-3 flex items-center gap-4">
                        {logoUrl ? (
                            <img
                                src={logoUrl}
                                alt="Restaurant logo"
                                className="h-16 w-16 rounded-xl border border-border object-contain bg-secondary p-1"
                            />
                        ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-dashed border-border text-xs text-muted-foreground">
                                No logo
                            </div>
                        )}
                        <div className="flex flex-col gap-1.5">
                            <label className="inline-flex cursor-pointer items-center justify-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                                {uploadingLogo ? (
                                    <span className="inline-flex items-center gap-1">
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        Uploading…
                                    </span>
                                ) : logoUrl ? (
                                    'Change Logo'
                                ) : (
                                    'Upload Logo'
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        onUploadLogo(file);
                                        e.target.value = '';
                                    }}
                                />
                            </label>
                            {logoUrl && onRemoveLogo && (
                                <button
                                    type="button"
                                    className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                                    onClick={onRemoveLogo}
                                >
                                    Remove logo
                                </button>
                            )}
                        </div>
                    </div>
                </section>
            )}

            <section className="mb-8">
                <Label className="text-sm font-semibold text-foreground">
                    Cover Image
                </Label>
                <p className="mt-1 text-xs text-muted-foreground">
                    Background image shown on the landing page
                </p>
                <div className="mt-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Input
                            value={value.coverImage}
                            onChange={(e) =>
                                onChange({ coverImage: e.target.value })
                            }
                            placeholder="https://example.com/cover.jpg"
                            className="bg-card sm:flex-1"
                        />
                        {onUploadCoverImage && (
                            <label className="inline-flex cursor-pointer items-center justify-center gap-1 rounded-md border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors">
                                {uploadingCover ? (
                                    <>
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        Uploading…
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-3 w-3" />
                                        Upload
                                    </>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        onUploadCoverImage(file);
                                        e.target.value = '';
                                    }}
                                />
                            </label>
                        )}
                    </div>
                    {value.coverImage && (
                        <div className="mt-2 overflow-hidden rounded-lg border border-border">
                            <img
                                src={value.coverImage}
                                alt="Cover preview"
                                className="h-24 w-full object-cover"
                            />
                        </div>
                    )}
                </div>
            </section>

            <section className="mb-8">
                <Label className="text-sm font-semibold text-foreground">
                    Theme
                </Label>
                <p className="mt-1 text-xs text-muted-foreground">
                    Choose a color palette for the menu
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                    {themes.map((theme) => {
                        const isActive = value.themeId === theme.id;
                        return (
                            <button
                                key={theme.id}
                                type="button"
                                onClick={() => onChange({ themeId: theme.id })}
                                className={`relative flex items-center gap-3 rounded-xl border-2 p-3 transition-all ${
                                    isActive
                                        ? 'border-primary bg-primary/5 shadow-sm'
                                        : 'border-transparent bg-secondary/50 hover:bg-secondary'
                                }`}
                            >
                                <div className="flex gap-1">
                                    <div
                                        className="h-5 w-5 rounded-full border border-black/5"
                                        style={{
                                            backgroundColor:
                                                theme.colors.background,
                                        }}
                                    />
                                    <div
                                        className="h-5 w-5 rounded-full border border-black/5"
                                        style={{
                                            backgroundColor: theme.colors.brand,
                                        }}
                                    />
                                    <div
                                        className="h-5 w-5 rounded-full border border-black/5"
                                        style={{
                                            backgroundColor:
                                                theme.colors.foreground,
                                        }}
                                    />
                                </div>
                                <span className="flex-1 text-left text-xs font-medium text-foreground">
                                    {theme.name}
                                </span>
                                {isActive && (
                                    <Check className="h-4 w-4 text-primary" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </section>

            <section className="mb-8">
                <Label className="text-sm font-semibold text-foreground">
                    Font
                </Label>
                <p className="mt-1 text-xs text-muted-foreground">
                    Choose a typeface for the menu
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                    {fonts.map((font) => {
                        const isActive = value.fontId === font.id;
                        return (
                            <button
                                key={font.id}
                                type="button"
                                onClick={() => onChange({ fontId: font.id })}
                                className={`relative flex items-center gap-3 rounded-xl border-2 p-3 transition-all ${
                                    isActive
                                        ? 'border-primary bg-primary/5 shadow-sm'
                                        : 'border-transparent bg-secondary/50 hover:bg-secondary'
                                }`}
                            >
                                <span
                                    className="flex-1 text-left text-sm font-medium text-foreground"
                                    style={{ fontFamily: font.fontFamily }}
                                >
                                    {font.name}
                                </span>
                                {isActive && (
                                    <Check className="h-4 w-4 text-primary" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </section>

            <section className="mb-8">
                <Label className="text-sm font-semibold text-foreground">
                    Brand Color
                </Label>
                <p className="mt-1 text-xs text-muted-foreground">
                    Accent color used throughout the menu
                </p>
                <div className="mt-3 flex items-center gap-3">
                    <input
                        type="color"
                        value={brandColor}
                        onChange={(e) =>
                            onChange({ brandColor: e.target.value })
                        }
                        className="h-10 w-10 cursor-pointer rounded-lg border border-border bg-transparent"
                    />
                    <Input
                        className="w-32 bg-secondary font-mono text-sm"
                        value={brandColor}
                        onChange={(e) =>
                            onChange({ brandColor: e.target.value })
                        }
                        maxLength={7}
                    />
                    {brandColor !== DEFAULT_BRAND && (
                        <button
                            type="button"
                            onClick={() =>
                                onChange({ brandColor: DEFAULT_BRAND })
                            }
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Reset
                        </button>
                    )}
                </div>
            </section>
        </div>
    );
}
