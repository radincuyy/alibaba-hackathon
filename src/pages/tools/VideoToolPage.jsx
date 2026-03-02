import { useState } from 'react';
import { Video, Loader2, Download, Upload, UserCircle, Camera, X, Sparkles, Clock, Monitor, Volume2, VolumeX, Music, CheckCircle2, Film, Settings, PenLine } from 'lucide-react';
import ToolLayout from '../../components/ToolLayout';
import { avatarStyles } from '../../components/ProductFormSimple';
import { generateAvatarPrompt } from '../../services/qwenApi';
import { generateImage, editImageWithAvatar, generateVideoFromImage, generateVideo } from '../../services/wanApi';

// Resolution presets keyed by tier
const resolutionOptions = {
    '720P': [
        { label: '16:9', value: '1280*720', desc: '1280×720' },
        { label: '9:16', value: '720*1280', desc: '720×1280' },
        { label: '1:1', value: '960*960', desc: '960×960' },
        { label: '4:3', value: '1088*832', desc: '1088×832' },
        { label: '3:4', value: '832*1088', desc: '832×1088' },
    ],
    '1080P': [
        { label: '16:9', value: '1920*1080', desc: '1920×1080' },
        { label: '9:16', value: '1080*1920', desc: '1080×1920' },
        { label: '1:1', value: '1440*1440', desc: '1440×1440' },
        { label: '4:3', value: '1632*1248', desc: '1632×1248' },
        { label: '3:4', value: '1248*1632', desc: '1248×1632' },
    ],
};



const ensureMinImageSize = (base64, minSize = 512) =>
    new Promise((resolve) => {
        const img = new window.Image();
        img.onload = () => {
            const { width, height } = img;
            if (width >= minSize && height >= minSize) return resolve(base64);
            const scale = Math.max(minSize / width, minSize / height);
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(width * scale);
            canvas.height = Math.round(height * scale);
            canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', 0.95));
        };
        img.onerror = () => resolve(base64);
        img.src = base64;
    });

export default function VideoToolPage() {
    // Form state
    const [productImage, setProductImage] = useState(null);
    const [avatarStyle, setAvatarStyle] = useState('none');
    const [customAvatarImage, setCustomAvatarImage] = useState(null);
    const [prompt, setPrompt] = useState('');

    // Video settings
    const [resolution, setResolution] = useState('1080P');
    const [aspectRatio, setAspectRatio] = useState('9:16');
    const [duration, setDuration] = useState(5);
    const [audioMode, setAudioMode] = useState('auto'); // 'auto' | 'custom' | 'silent'
    const [audioUrl, setAudioUrl] = useState('');
    const [audioFileName, setAudioFileName] = useState('');

    // Generation state
    const [step, setStep] = useState(null); // 'avatar' | 'video' | null
    const [isLoading, setIsLoading] = useState(false);
    const [generatedVideo, setGeneratedVideo] = useState(null);
    const [generatedAvatar, setGeneratedAvatar] = useState(null);
    const [error, setError] = useState(null);
    const [showResults, setShowResults] = useState(false);

    const handleProductUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (ev) => setProductImage(await ensureMinImageSize(ev.target.result));
        reader.readAsDataURL(file);
    };

    const handleAvatarUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (ev) => setCustomAvatarImage(await ensureMinImageSize(ev.target.result));
        reader.readAsDataURL(file);
    };

    const handleAudioFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 15 * 1024 * 1024) {
            alert('File audio maksimal 15MB');
            return;
        }
        setAudioFileName(`${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)`);
        // Convert to object URL for potential future use, but API needs public URL
        // For now, create a temporary URL
        const objectUrl = URL.createObjectURL(file);
        setAudioUrl(objectUrl);
    };

    const hasAvatar = avatarStyle !== 'none';
    const isCustomAvatar = avatarStyle === 'custom';
    const isValid = prompt || productImage; // Need at least a prompt or image

    const handleSubmit = async () => {
        if (!isValid) return;
        setIsLoading(true);
        setShowResults(true);
        setGeneratedVideo(null);
        setGeneratedAvatar(null);
        setError(null);

        const userPrompt = prompt || 'Smooth cinematic animation, professional lighting, gentle camera movement';
        let sourceImage = null;

        // Step 1: Generate avatar if selected
        if (hasAvatar) {
            setStep('avatar');
            try {
                if (isCustomAvatar && customAvatarImage) {
                    // Custom avatar: directly composite person + product
                    const editPrompt = `Edit this photo of a person so they are presenting a product naturally. ${productImage ? 'The product is shown in image 2.' : ''} Keep the face identical. Professional advertisement style.`;
                    const editResult = await editImageWithAvatar(customAvatarImage, productImage || null, editPrompt);
                    if (editResult.success) {
                        sourceImage = editResult.imageUrl;
                        setGeneratedAvatar(sourceImage);
                    }
                } else {
                    // Preset avatar: generate base avatar first
                    const selectedAvatar = avatarStyles.find(a => a.id === avatarStyle);
                    const avatarPrompt = `${selectedAvatar.prompt}, holding and presenting a product with confident smile. Professional advertisement photography, studio lighting, clean background, 4K quality.`;
                    const avatarImageResult = await generateImage(avatarPrompt);
                    if (avatarImageResult.success) {
                        // If product photo exists, composite avatar + product together
                        if (productImage) {
                            console.log('🔗 Compositing preset avatar with product photo...');
                            const compositePrompt = `Edit this person (image 1) so they are naturally holding and presenting the product shown in image 2. Keep the person's appearance identical. Professional product advertisement photo, studio lighting.`;
                            const compositeResult = await editImageWithAvatar(avatarImageResult.imageUrl, productImage, compositePrompt);
                            if (compositeResult.success) {
                                sourceImage = compositeResult.imageUrl;
                                setGeneratedAvatar(sourceImage);
                            } else {
                                // Fallback: use avatar without product
                                sourceImage = avatarImageResult.imageUrl;
                                setGeneratedAvatar(sourceImage);
                            }
                        } else {
                            sourceImage = avatarImageResult.imageUrl;
                            setGeneratedAvatar(sourceImage);
                        }
                    }
                }
            } catch (e) {
                console.warn('Avatar gen failed:', e.message);
            }
        }

        // Fallback to product image
        if (!sourceImage) {
            sourceImage = productImage || null;
        }

        // Step 2: Generate video
        setStep('video');
        try {
            let videoResult;
            const videoOptions = {
                resolution,
                duration,
                audio: audioMode !== 'silent',
                audioUrl: audioMode === 'custom' && audioUrl ? audioUrl : null,
            };

            if (sourceImage) {
                videoResult = await generateVideoFromImage(sourceImage, userPrompt, videoOptions);
            } else {
                videoResult = await generateVideo(userPrompt);
            }

            if (videoResult.success) {
                setGeneratedVideo(videoResult.videoUrl);
            } else {
                setError(videoResult.error);
            }
        } catch (e) {
            setError(e.message);
        } finally {
            setIsLoading(false);
            setStep(null);
        }
    };

    // Get pixel description for selected ratio
    const currentRatioDesc = resolutionOptions[resolution]?.find(r => r.label === aspectRatio)?.desc || '';

    return (
        <ToolLayout
            icon={Video}
            title="Video Promosi AI"
            description="Generate video promosi dari foto produkmu"
            gradient="from-pink-500 to-rose-500"
            showResults={showResults}
            rightPanel={
                <div className="space-y-4">
                    {/* Progress Steps */}
                    {isLoading && (
                        <div className="card p-4">
                            <h4 className="text-sm font-bold text-cream-900 mb-3">📊 Progress</h4>
                            <div className="space-y-2">
                                <div className={`flex items-center gap-2 text-sm ${step === 'avatar' ? 'text-violet-400' : generatedAvatar ? 'text-green-400' : 'text-white/20'}`}>
                                    {step === 'avatar' ? <Loader2 className="w-4 h-4 animate-spin" /> : generatedAvatar ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border border-white/20" />}
                                    {hasAvatar ? 'Generate avatar...' : 'Avatar (dilewati)'}
                                </div>
                                <div className={`flex items-center gap-2 text-sm ${step === 'video' ? 'text-pink-400' : generatedVideo ? 'text-green-400' : 'text-white/20'}`}>
                                    {step === 'video' ? <Loader2 className="w-4 h-4 animate-spin" /> : generatedVideo ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border border-white/20" />}
                                    Generate video... (1-3 menit)
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Avatar Preview */}
                    {generatedAvatar && (
                        <div className="card p-4">
                            <h4 className="text-sm font-bold text-cream-900 mb-2">👤 Avatar (input video)</h4>
                            <img src={generatedAvatar} alt="Avatar" className="w-full rounded-lg object-contain" />
                        </div>
                    )}

                    {/* Video Result */}
                    <div className="card p-6">
                        <h3 className="text-lg font-bold text-cream-900 mb-4 flex items-center gap-2"><Film className="w-5 h-5 text-pink-400" /> Video Promosi</h3>
                        {isLoading && !generatedVideo ? (
                            <div className="flex flex-col items-center justify-center py-20 text-cream-400">
                                <Loader2 className="w-10 h-10 animate-spin text-pink-400 mb-3" />
                                <p className="text-sm">
                                    {step === 'avatar' ? 'Generating avatar...' : 'Generating video...'}
                                </p>
                                <p className="text-xs text-white/20 mt-1">
                                    {resolution} • {aspectRatio} • {duration}s • {audioMode === 'silent' ? 'Silent' : 'With Audio'}
                                </p>
                            </div>
                        ) : generatedVideo ? (
                            <div>
                                <video src={generatedVideo} controls autoPlay loop className="w-full rounded-xl" />
                                <a href={generatedVideo} download="video-promo.mp4" target="_blank" rel="noopener noreferrer" className="btn-primary w-full !py-3 mt-4">
                                    <Download className="w-4 h-4" /> Download Video
                                </a>
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        ) : null}
                    </div>
                </div>
            }
        >
            <div className="card p-6 md:p-8 sticky top-24">
                <h2 className="text-lg font-semibold text-cream-900 flex items-center gap-2 mb-6">
                    <Film className="w-5 h-5 text-pink-400" /> Setting Video
                </h2>

                <div className="space-y-5">
                    {/* 1. Product Photo */}
                    <div>
                        <label className="label-text flex items-center gap-2">
                            <Upload className="w-4 h-4 text-brand-400" />
                            Foto Produk
                        </label>
                        <p className="text-xs text-cream-400 mb-2">Foto yang akan dianimasikan jadi video</p>
                        <div
                            className="border-2 border-dashed border-cream-300 rounded-xl hover:border-brand-500/30 transition-colors cursor-pointer overflow-hidden"
                            onClick={() => document.getElementById('video-product-image')?.click()}
                        >
                            {productImage ? (
                                <div className="relative group">
                                    <img src={productImage} alt="Produk" className="w-full h-48 object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-sm text-cream-900">Klik untuk ganti</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-32 flex flex-col items-center justify-center text-cream-400">
                                    <Upload className="w-8 h-8 mb-2" />
                                    <span className="text-sm">Upload foto produk</span>
                                </div>
                            )}
                        </div>
                        <input id="video-product-image" type="file" accept="image/*" className="hidden" onChange={handleProductUpload} />
                    </div>

                    {/* 2. Avatar Selection */}
                    <div>
                        <label className="label-text flex items-center gap-2">
                            <UserCircle className="w-4 h-4 text-purple-400" />
                            Avatar Promotor (opsional)
                        </label>
                        <p className="text-xs text-cream-400 mb-3">Tambahkan karakter yang bergerak dalam video</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {avatarStyles.map((av) => (
                                <button
                                    key={av.id}
                                    className={`px-3 py-3 rounded-xl text-left transition-all ${avatarStyle === av.id
                                        ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 text-cream-900 ring-1 ring-purple-500/30'
                                        : 'bg-cream-100 border border-cream-300 text-cream-500 hover:bg-white/10'
                                        }`}
                                    onClick={() => setAvatarStyle(av.id)}
                                >
                                    <span className="text-lg">{av.emoji}</span>
                                    <p className="text-xs font-semibold mt-1">{av.label}</p>
                                    <p className="text-[10px] text-cream-400 mt-0.5">{av.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Avatar Upload */}
                    {isCustomAvatar && (
                        <div className="animate-fade-in">
                            <label className="label-text flex items-center gap-2">
                                <Camera className="w-4 h-4 text-purple-400" />
                                Upload Foto Wajah <span className="text-coral-500">*</span>
                            </label>
                            <div
                                className="border-2 border-dashed border-purple-500/30 rounded-xl hover:border-purple-500/50 transition-colors cursor-pointer overflow-hidden bg-purple-500/5"
                                onClick={() => document.getElementById('video-custom-face')?.click()}
                            >
                                {customAvatarImage ? (
                                    <div className="relative group">
                                        <img src={customAvatarImage} alt="Avatar" className="w-full h-48 object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-sm text-cream-900">Klik untuk ganti</span>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setCustomAvatarImage(null); }}
                                            className="absolute top-2 right-2 w-7 h-7 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center"
                                        >
                                            <X className="w-4 h-4 text-cream-900" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="h-40 flex flex-col items-center justify-center text-purple-300/50">
                                        <Camera className="w-10 h-10 mb-2" />
                                        <span className="text-sm font-medium">Upload foto wajahmu</span>
                                    </div>
                                )}
                            </div>
                            <input id="video-custom-face" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                        </div>
                    )}

                    {/* 3. Video Prompt */}
                    <div>
                        <label className="label-text flex items-center gap-2">
                            <PenLine className="w-4 h-4 text-coral-400" /> Prompt Video <span className="text-coral-500">*</span>
                        </label>
                        <textarea
                            className="textarea-field"
                            rows={3}
                            placeholder={hasAvatar
                                ? 'Contoh: Orang tersenyum menunjukkan produk ke kamera, gerakan natural, pencahayaan studio profesional seperti iklan TV'
                                : 'Contoh: Produk berputar pelan di atas meja kayu, cahaya hangat golden hour, close-up detail kemasan, background blur estetik'
                            }
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                        />
                        <p className="text-xs text-cream-400 mt-1">Deskripsikan gerakan/aksi yang ingin terjadi di video</p>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-cream-200 pt-4">
                        <h3 className="text-sm font-semibold text-cream-500 mb-4 flex items-center gap-2">
                            <Settings className="w-4 h-4 text-blue-400" /> Pengaturan Video
                        </h3>


                        {/* Resolution Tier */}
                        <div className="mb-4">
                            <label className="label-text text-xs mb-2 flex items-center gap-1">
                                <Monitor className="w-3 h-3" /> Resolusi
                            </label>
                            <div className="flex gap-2">
                                {['720P', '1080P'].map((res) => (
                                    <button
                                        key={res}
                                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${resolution === res
                                            ? 'bg-brand-500/20 border border-brand-500/50 text-brand-300'
                                            : 'bg-cream-100 border border-cream-300 text-cream-400 hover:bg-white/10'
                                            }`}
                                        onClick={() => setResolution(res)}
                                    >
                                        {res}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Aspect Ratio */}
                        <div className="mb-4">
                            <label className="label-text text-xs mb-2 block">Aspect Ratio</label>
                            <div className="flex gap-2 flex-wrap">
                                {resolutionOptions[resolution].map((opt) => (
                                    <button
                                        key={opt.label}
                                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${aspectRatio === opt.label
                                            ? 'bg-brand-500/20 border border-brand-500/50 text-brand-300'
                                            : 'bg-cream-100 border border-cream-300 text-cream-400 hover:bg-white/10'
                                            }`}
                                        onClick={() => setAspectRatio(opt.label)}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                            {currentRatioDesc && (
                                <p className="text-[10px] text-white/20 mt-1">{currentRatioDesc} px</p>
                            )}
                        </div>

                        {/* Duration */}
                        <div className="mb-4">
                            <label className="label-text text-xs mb-2 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Durasi: {duration} detik
                            </label>
                            <input
                                type="range"
                                min={2} max={15} step={1}
                                value={duration}
                                onChange={(e) => setDuration(Number(e.target.value))}
                                className="w-full accent-pink-500"
                            />
                            <div className="flex justify-between text-[10px] text-white/20 mt-1">
                                <span>2s</span>
                                <span>5s</span>
                                <span>10s</span>
                                <span>15s</span>
                            </div>
                        </div>

                        {/* Audio */}
                        <div>
                            <label className="label-text text-xs mb-2 block">Audio</label>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    className={`px-3 py-2.5 rounded-lg text-xs font-medium transition-all flex flex-col items-center gap-1 ${audioMode === 'auto'
                                        ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
                                        : 'bg-cream-100 border border-cream-300 text-cream-400 hover:bg-white/10'
                                        }`}
                                    onClick={() => setAudioMode('auto')}
                                >
                                    <Volume2 className="w-4 h-4" />
                                    Auto
                                </button>
                                <button
                                    className={`px-3 py-2.5 rounded-lg text-xs font-medium transition-all flex flex-col items-center gap-1 ${audioMode === 'custom'
                                        ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
                                        : 'bg-cream-100 border border-cream-300 text-cream-400 hover:bg-white/10'
                                        }`}
                                    onClick={() => setAudioMode('custom')}
                                >
                                    <Music className="w-4 h-4" />
                                    Custom
                                </button>
                                <button
                                    className={`px-3 py-2.5 rounded-lg text-xs font-medium transition-all flex flex-col items-center gap-1 ${audioMode === 'silent'
                                        ? 'bg-white/10 border border-white/20 text-cream-500'
                                        : 'bg-cream-100 border border-cream-300 text-cream-400 hover:bg-white/10'
                                        }`}
                                    onClick={() => setAudioMode('silent')}
                                >
                                    <VolumeX className="w-4 h-4" />
                                    Silent
                                </button>
                            </div>
                            <p className="text-[10px] text-white/20 mt-1.5">
                                {audioMode === 'auto' && 'AI otomatis generate musik/sound effect'}
                                {audioMode === 'custom' && 'Pakai file audio sendiri (MP3/WAV, max 15MB)'}
                                {audioMode === 'silent' && 'Video tanpa suara'}
                            </p>

                            {/* Custom Audio Upload */}
                            {audioMode === 'custom' && (
                                <div className="mt-3 animate-fade-in">
                                    <div
                                        className="border-2 border-dashed border-emerald-500/20 rounded-xl hover:border-emerald-500/40 transition-colors cursor-pointer overflow-hidden bg-emerald-500/5"
                                        onClick={() => document.getElementById('video-audio-file')?.click()}
                                    >
                                        {audioFileName ? (
                                            <div className="px-4 py-3 flex items-center gap-3">
                                                <Music className="w-5 h-5 text-emerald-400 shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-xs text-emerald-300 font-medium truncate">{audioFileName}</p>
                                                    <p className="text-[10px] text-cream-400">Klik untuk ganti</p>
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setAudioUrl(''); setAudioFileName(''); }}
                                                    className="ml-auto w-6 h-6 bg-red-500/60 hover:bg-red-500 rounded-full flex items-center justify-center shrink-0"
                                                >
                                                    <X className="w-3 h-3 text-cream-900" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="px-4 py-4 flex flex-col items-center text-emerald-300/40">
                                                <Music className="w-6 h-6 mb-1" />
                                                <span className="text-xs font-medium">Upload file audio</span>
                                                <span className="text-[10px] text-white/20 mt-0.5">MP3 / WAV • max 15MB • 3-30 detik</span>
                                            </div>
                                        )}
                                    </div>
                                    <input id="video-audio-file" type="file" accept="audio/mp3,audio/wav,audio/mpeg,.mp3,.wav" className="hidden" onChange={handleAudioFileUpload} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        className="btn-primary w-full !py-4"
                        disabled={!isValid || isLoading}
                        onClick={handleSubmit}
                    >
                        {isLoading ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</>
                        ) : (
                            <><Sparkles className="w-5 h-5" /> Generate Video</>
                        )}
                    </button>
                </div>
            </div>
        </ToolLayout>
    );
}

