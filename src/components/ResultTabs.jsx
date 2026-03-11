import { useState, memo } from 'react';
import { Copy, Check, RefreshCw, Instagram, ShoppingBag, Music, MessageCircle, Twitter, Facebook, Loader2, UserCircle, Download, Sparkles } from 'lucide-react';
import { useClipboard } from '../hooks/useClipboard';
import { cn } from '../utils/cn';

const PLATFORM_CONFIG = {
    instagram: {
        name: 'Instagram',
        icon: Instagram,
        color: 'from-pink-500 to-purple-500',
        badge: 'bg-pink-500/20 text-pink-400',
    },
    shopee: {
        name: 'Shopee / Tokopedia',
        icon: ShoppingBag,
        color: 'from-orange-500 to-red-500',
        badge: 'bg-orange-500/20 text-orange-400',
    },
    tiktok: {
        name: 'TikTok',
        icon: Music,
        color: 'from-cyan-400 to-pink-500',
        badge: 'bg-cyan-500/20 text-cyan-400',
    },
    whatsapp: {
        name: 'WhatsApp',
        icon: MessageCircle,
        color: 'from-green-500 to-emerald-500',
        badge: 'bg-green-500/20 text-green-400',
    },
    twitter: {
        name: 'Twitter / X',
        icon: Twitter,
        color: 'from-blue-400 to-blue-600',
        badge: 'bg-blue-500/20 text-blue-400',
    },
    facebook: {
        name: 'Facebook',
        icon: Facebook,
        color: 'from-blue-600 to-indigo-600',
        badge: 'bg-indigo-500/20 text-indigo-400',
    },
};

const PLATFORMS = Object.keys(PLATFORM_CONFIG);

/**
 * Copy button with clipboard hook (safe cleanup on unmount).
 */
function CopyButton({ text }) {
    const { copied, copyToClipboard } = useClipboard();

    return (
        <button
            type="button"
            onClick={() => copyToClipboard(text)}
            aria-label={copied ? 'Tersalin' : 'Copy ke clipboard'}
            className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300',
                copied
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-cream-100 text-cream-500 border border-cream-300 hover:bg-cream-200 hover:text-cream-900',
            )}
        >
            {copied ? (
                <>
                    <Check className="w-4 h-4" aria-hidden="true" />
                    Tersalin!
                </>
            ) : (
                <>
                    <Copy className="w-4 h-4" aria-hidden="true" />
                    Copy
                </>
            )}
        </button>
    );
}

/**
 * Media card for displaying generated images/videos.
 */
const MediaCard = memo(function MediaCard({
    icon: Icon,
    title,
    subtitle,
    gradient,
    isLoading,
    loadingText,
    loadingSubtext,
    content,
    error,
    errorMsg,
    emptyText,
    downloadLabel,
    isVideo,
}) {
    return (
        <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-cream-900" aria-hidden="true" />
                </div>
                <div>
                    <span className="text-sm font-semibold text-cream-900">{title}</span>
                    <p className="text-xs text-cream-400">{subtitle}</p>
                </div>
            </div>

            {isLoading ? (
                <div className="aspect-square rounded-xl bg-cream-100 border border-cream-300 flex flex-col items-center justify-center" role="status">
                    <Loader2 className="w-12 h-12 text-accent animate-spin mb-4" aria-hidden="true" />
                    <p className="text-sm text-cream-500 font-medium">{loadingText}</p>
                    <p className="text-xs text-cream-400 mt-1">{loadingSubtext}</p>
                </div>
            ) : content ? (
                <div className="space-y-4">
                    <div className="rounded-xl overflow-hidden border border-cream-300 bg-black/50">
                        {isVideo ? (
                            <video
                                src={content}
                                controls
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full max-h-[500px] object-contain"
                            />
                        ) : (
                            <img
                                src={content}
                                alt={title}
                                className="w-full max-h-[500px] object-contain"
                            />
                        )}
                    </div>
                    <a
                        href={content}
                        download={downloadLabel}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary inline-flex !py-2.5 !px-5 text-sm"
                    >
                        <Download className="w-4 h-4" aria-hidden="true" />
                        Download {isVideo ? 'Video' : 'Gambar'}
                    </a>
                </div>
            ) : error ? (
                <div className="aspect-video rounded-xl bg-red-50 border border-red-200 flex flex-col items-center justify-center p-6" role="alert">
                    <p className="text-sm text-red-600 font-medium mb-2">{errorMsg || 'Gagal generate'}</p>
                    <p className="text-xs text-red-600/60 text-center max-w-sm">{error}</p>
                </div>
            ) : (
                <div className="aspect-video rounded-xl bg-cream-100 border border-cream-300 flex flex-col items-center justify-center text-cream-400">
                    <Icon className="w-12 h-12 mb-3 opacity-50" aria-hidden="true" />
                    <p className="text-sm">{emptyText}</p>
                </div>
            )}
        </div>
    );
});

export default function ResultTabs({
    results,
    isLoading,
    isAvatarLoading,
    onRegenerate,
    generatedAvatar,
    avatarError,
    avatarLabel,
    hasAvatar,
}) {
    const [activeTab, setActiveTab] = useState('instagram');

    if (isLoading) {
        return (
            <div className="space-y-6" role="status" aria-label="Memuat konten">
                <div className="flex items-center gap-3 mb-4">
                    <Loader2 className="w-6 h-6 text-accent animate-spin" aria-hidden="true" />
                    <span className="text-cream-600 font-medium">AI sedang membuat konten marketing...</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {PLATFORMS.map((p) => (
                        <div key={p} className="loading-shimmer h-10 w-32 flex-shrink-0" />
                    ))}
                </div>
                <div className="space-y-3">
                    <div className="loading-shimmer h-4 w-3/4" />
                    <div className="loading-shimmer h-4 w-full" />
                    <div className="loading-shimmer h-4 w-5/6" />
                    <div className="loading-shimmer h-4 w-2/3" />
                </div>
            </div>
        );
    }

    if (!results || Object.keys(results).length === 0) return null;

    const currentPlatform = PLATFORM_CONFIG[activeTab];
    const currentResult = results[activeTab];

    const mediaTabs = [
        ...(hasAvatar ? [{ id: 'avatar', label: 'Avatar AI', icon: UserCircle, loading: isAvatarLoading }] : []),
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-cream-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" aria-hidden="true" /> Konten Siap Posting!
                </h3>
                {onRegenerate && (
                    <button type="button" onClick={onRegenerate} className="btn-ghost text-sm !text-accent hover:!text-brand-300">
                        <RefreshCw className="w-4 h-4" aria-hidden="true" />
                        Regenerate
                    </button>
                )}
            </div>

            {/* Platform Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" role="tablist" aria-label="Platform">
                {PLATFORMS.map((platform) => {
                    const config = PLATFORM_CONFIG[platform];
                    const isActive = activeTab === platform;
                    const hasResult = results[platform]?.success;
                    const PlatformIcon = config.icon;

                    return (
                        <button
                            key={platform}
                            type="button"
                            role="tab"
                            aria-selected={isActive}
                            aria-controls={`tabpanel-${platform}`}
                            onClick={() => setActiveTab(platform)}
                            className={cn(
                                'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium whitespace-nowrap transition-all duration-300',
                                isActive ? 'tab-active' : 'tab-inactive',
                                !hasResult && 'opacity-50',
                            )}
                        >
                            <PlatformIcon className="w-4 h-4" aria-hidden="true" />
                            {config.name}
                        </button>
                    );
                })}

                {/* Media tabs (Avatar) */}
                {mediaTabs.map((tab) => {
                    const TabIcon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            role="tab"
                            aria-selected={activeTab === tab.id}
                            aria-controls={`tabpanel-${tab.id}`}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium whitespace-nowrap transition-all duration-300',
                                activeTab === tab.id ? 'tab-active' : 'tab-inactive',
                            )}
                        >
                            <TabIcon className="w-4 h-4" aria-hidden="true" />
                            {tab.label}
                            {tab.loading && <Loader2 className="w-3 h-3 animate-spin text-accent" aria-hidden="true" />}
                        </button>
                    );
                })}
            </div>

            {/* Content Area */}
            <div role="tabpanel" id={`tabpanel-${activeTab}`} aria-label={activeTab}>
                {activeTab === 'avatar' ? (
                    <MediaCard
                        icon={UserCircle}
                        title={`Avatar AI — ${avatarLabel || 'Promotor'}`}
                        subtitle={avatarLabel === 'Custom Avatar' ? 'Foto aslimu sebagai promotor' : 'Powered by Qwen VL + Wan 2.6'}
                        gradient="from-violet-500 to-fuchsia-500"
                        isLoading={isAvatarLoading}
                        loadingText="Sedang membuat avatar promotor..."
                        loadingSubtext="Avatar sedang mengiklankan produkmu ~30 detik"
                        content={generatedAvatar}
                        error={avatarError}
                        errorMsg="Gagal generate avatar"
                        emptyText="Avatar akan di-generate setelah konten teks selesai"
                        downloadLabel="umkm-kreator-avatar.png"
                    />
                ) : (
                    /* Text platform content */
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${currentPlatform?.color} flex items-center justify-center`}>
                                    {currentPlatform && <currentPlatform.icon className="w-4 h-4 text-cream-900" aria-hidden="true" />}
                                </div>
                                <div>
                                    <span className="text-sm font-semibold text-cream-900">{currentPlatform?.name}</span>
                                    <span className={cn('platform-badge ml-2', currentPlatform?.badge)}>
                                        {currentResult?.success ? 'Ready' : 'Error'}
                                    </span>
                                </div>
                            </div>
                            {currentResult?.success && <CopyButton text={currentResult.content} />}
                        </div>

                        {currentResult?.success ? (
                            <div className="bg-cream-100 rounded-xl p-4 border border-cream-300/50">
                                <pre className="text-sm text-cream-600 whitespace-pre-wrap leading-relaxed font-sans">
                                    {currentResult.content}
                                </pre>
                            </div>
                        ) : (
                            <div className="bg-red-50 rounded-xl p-4 border border-red-200" role="alert">
                                <p className="text-sm text-red-600">
                                    {currentResult?.error || 'Gagal generate konten.'}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
