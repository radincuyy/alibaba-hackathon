import { useState } from 'react';
import { Video, Loader2, Download, Upload, UserCircle, Camera, X, Sparkles, Clock, Monitor, Volume2, VolumeX, CheckCircle2, Film, Settings, PenLine, AlertTriangle } from 'lucide-react';
import ToolLayout from '../../components/ToolLayout';
import { avatarStyles } from '../../components/ProductForm';
import { generateImage, editImageWithAvatar, generateVideoFromImage, generateVideo } from '../../services/wanApi';

// Resolution presets
const resolutionOptions = {
    '720P': [
        { label: '16:9', value: '1280*720', desc: '1280×720' },
        { label: '9:16', value: '720*1280', desc: '720×1280' },
        { label: '1:1', value: '960*960', desc: '960×960' },
    ],
    '1080P': [
        { label: '16:9', value: '1920*1080', desc: '1920×1080' },
        { label: '9:16', value: '1080*1920', desc: '1080×1920' },
        { label: '1:1', value: '1440*1440', desc: '1440×1440' },
    ],
};

// Template prompts dengan avatar
const AVATAR_TEMPLATES = [
    { label: 'Senyum & Tunjukkan', prompt: 'Orang tersenyum hangat lalu mengangkat produk ke depan kamera, gerakan natural dan percaya diri, background blur estetik' },
    { label: 'Unboxing', prompt: 'Orang membuka kemasan produk dengan antusias, ekspresi kagum, close-up tangan dan produk, pencahayaan studio' },
    { label: 'Fashion Show', prompt: 'Orang berjalan percaya diri sambil menunjukkan produk, gerakan elegan, studio lighting, gaya iklan TV premium' },
    { label: 'Review Style', prompt: 'Orang menunjukkan produk dari berbagai sudut ke kamera, gerakan natural seperti review produk, pencahayaan hangat' },
];

// Template prompts dengan foto produk
const PRODUCT_TEMPLATES = [
    { label: 'Rotate', prompt: 'Produk berputar pelan 360 derajat, pencahayaan dramatis, background gelap, efek refleksi di permukaan meja' },
    { label: 'Golden Hour', prompt: 'Produk diam di atas meja kayu, cahaya golden hour masuk dari samping, partikel debu berkilau, suasana hangat' },
    { label: 'Smoke Effect', prompt: 'Produk muncul dari kabut tipis, kamera zoom in pelan, pencahayaan neon biru dan ungu, suasana misterius dan premium' },
    { label: 'Floating', prompt: 'Produk melayang dan berputar pelan di udara, background gradient warna pastel, partikel berkilau di sekitar produk' },
    { label: 'Splash', prompt: 'Produk dengan percikan air yang dramatis, gerakan slow motion, pencahayaan studio profesional, background gelap' },
    { label: 'Cinematic', prompt: 'Kamera orbit pelan mengelilingi produk, depth of field dangkal, bokeh lights di background, nuansa sinematik premium' },
];

// Template prompts tanpa foto
const TEXT_TEMPLATES = [
    { label: 'Kopi', prompt: 'Secangkir kopi panas mengepul di atas meja kayu, kamera zoom in pelan, uap naik indah, suasana kedai cozy pagi hari' },
    { label: 'Makanan', prompt: 'Hidangan makanan lezat dengan saus meleleh slow motion, pencahayaan studio, background gelap, food photography sinematik' },
    { label: 'Beauty', prompt: 'Produk skincare elegan di atas permukaan marmer, tetesan air berkilau, kelopak bunga beterbangan, nuansa pink pastel' },
    { label: 'Sneakers', prompt: 'Sepatu sneakers stylish berputar di udara, latar urban modern, percikan cat warna-warni, gerakan dinamis' },
    { label: 'Tech', prompt: 'Gadget modern melayang di ruang futuristik, hologram biru berkilau, kamera orbit pelan, suasana high-tech' },
    { label: 'Herbal', prompt: 'Produk herbal di tengah alam hijau, daun-daun berjatuhan pelan, sinar matahari menembus dedaunan, suasana segar natural' },
];

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
    const [productImage, setProductImage] = useState(null);
    const [avatarStyle, setAvatarStyle] = useState('none');
    const [customAvatarImage, setCustomAvatarImage] = useState(null);
    const [prompt, setPrompt] = useState('');

    const [resolution, setResolution] = useState('1080P');
    const [aspectRatio, setAspectRatio] = useState('9:16');
    const [duration, setDuration] = useState(5);
    const [audioEnabled, setAudioEnabled] = useState(true);

    const [step, setStep] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [generatedVideo, setGeneratedVideo] = useState(null);
    const [generatedAvatar, setGeneratedAvatar] = useState(null);
    const [avatarError, setAvatarError] = useState(null);
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

    const hasAvatar = avatarStyle !== 'none';
    const isCustomAvatar = avatarStyle === 'custom';
    const isValid = productImage && (isCustomAvatar ? customAvatarImage : true);

    // Foto produk wajib → selalu pakai I2V
    const effectiveDuration = duration;

    const templates = hasAvatar ? AVATAR_TEMPLATES : productImage ? PRODUCT_TEMPLATES : TEXT_TEMPLATES;

    const handleSubmit = async () => {
        if (!isValid) return;
        setIsLoading(true);
        setShowResults(true);
        setGeneratedVideo(null);
        setGeneratedAvatar(null);
        setAvatarError(null);
        setError(null);

        // Enhance prompt with quality instructions
        const userPrompt = prompt.trim()
            ? `${prompt.trim()}. Kualitas sinematik, gerakan halus, pencahayaan profesional.`
            : 'Animasi sinematik halus, pencahayaan profesional, gerakan kamera lembut, tampilan produk.';

        let sourceImage = null;

        // Step 1: Generate avatar if selected
        if (hasAvatar) {
            setStep('avatar');
            try {
                if (isCustomAvatar && customAvatarImage) {
                    const editPrompt = `Edit foto ini agar orang tersebut secara natural memegang/menunjukkan produk dari gambar 2. Pertahankan wajah tetap sama. Gaya iklan profesional, pencahayaan studio.`;
                    const editResult = await editImageWithAvatar(customAvatarImage, productImage, editPrompt);
                    if (editResult.success) {
                        sourceImage = editResult.imageUrl;
                        setGeneratedAvatar(sourceImage);
                    } else {
                        setAvatarError('Avatar gagal di-generate, menggunakan foto produk sebagai fallback.');
                    }
                } else {
                    const selectedAvatar = avatarStyles.find(a => a.id === avatarStyle);
                    const avatarPrompt = `${selectedAvatar.prompt}, pose profesional dengan tangan siap memegang sesuatu. Iklan profesional, pencahayaan studio, latar bersih, kualitas 4K.`;
                    const avatarResult = await generateImage(avatarPrompt);
                    if (avatarResult.success) {
                        const compositePrompt = `Edit orang ini agar secara natural memegang produk dari gambar 2. Pertahankan penampilan tetap sama. Foto iklan profesional.`;
                        const compositeResult = await editImageWithAvatar(avatarResult.imageUrl, productImage, compositePrompt);
                        sourceImage = compositeResult.success ? compositeResult.imageUrl : avatarResult.imageUrl;
                        setGeneratedAvatar(sourceImage);
                    } else {
                        setAvatarError('Avatar gagal di-generate. ' + (avatarResult.error || ''));
                    }
                }
            } catch (e) {
                setAvatarError('Avatar error: ' + e.message);
            }
        }

        // Fallback to product image (always available since required)
        if (!sourceImage) sourceImage = productImage;

        // Step 2: Generate video
        setStep('video');
        try {
            let videoResult;
            if (sourceImage) {
                videoResult = await generateVideoFromImage(sourceImage, userPrompt, {
                    resolution,
                    duration: effectiveDuration,
                    audio: audioEnabled,
                });
            } else {
                // Safety fallback — should not happen since productImage is required
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
                    {/* Progress */}
                    {isLoading && (
                        <div className="card p-4">
                            <h4 className="text-sm font-bold text-cream-900 mb-3">📊 Progress</h4>
                            <div className="space-y-2">
                                <div className={`flex items-center gap-2 text-sm ${step === 'avatar' ? 'text-violet-500' : generatedAvatar ? 'text-green-500' : 'text-cream-300'}`}>
                                    {step === 'avatar' ? <Loader2 className="w-4 h-4 animate-spin" /> : generatedAvatar ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border border-cream-300" />}
                                    {hasAvatar ? 'Generate avatar...' : 'Avatar (dilewati)'}
                                </div>
                                <div className={`flex items-center gap-2 text-sm ${step === 'video' ? 'text-pink-500' : generatedVideo ? 'text-green-500' : 'text-cream-300'}`}>
                                    {step === 'video' ? <Loader2 className="w-4 h-4 animate-spin" /> : generatedVideo ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border border-cream-300" />}
                                    Generate video... (1-3 menit)
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Avatar Error */}
                    {avatarError && (
                        <div className="card p-3 border border-amber-200 bg-amber-50">
                            <p className="text-xs text-amber-700 flex items-start gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                {avatarError}
                            </p>
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
                        <h3 className="text-lg font-bold text-cream-900 mb-4 flex items-center gap-2">
                            <Film className="w-5 h-5 text-pink-400" /> Video Promosi
                        </h3>
                        {isLoading && !generatedVideo ? (
                            <div className="flex flex-col items-center justify-center py-20 text-cream-400">
                                <Loader2 className="w-10 h-10 animate-spin text-pink-400 mb-3" />
                                <p className="text-sm">{step === 'avatar' ? 'Generating avatar...' : 'Generating video...'}</p>
                                <p className="text-xs text-cream-300 mt-1">
                                    {resolution} • {aspectRatio} • {effectiveDuration}s • {audioEnabled ? 'Audio' : 'Silent'}
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
                            <Upload className="w-4 h-4 text-brand-400" /> Foto Produk <span className="text-red-500">*</span>
                        </label>
                        <p className="text-xs text-cream-400 mb-2">Foto produk yang akan dianimasikan jadi video</p>
                        <div
                            className="border-2 border-dashed border-cream-300 rounded-xl hover:border-brand-500/30 transition-colors cursor-pointer overflow-hidden"
                            onClick={() => document.getElementById('video-product-image')?.click()}
                        >
                            {productImage ? (
                                <div className="relative group">
                                    <img src={productImage} alt="Produk" className="w-full h-48 object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-sm text-white font-medium">Klik untuk ganti</span>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setProductImage(null); }}
                                        className="absolute top-2 right-2 w-7 h-7 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center"
                                    >
                                        <X className="w-4 h-4 text-white" />
                                    </button>
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

                    {/* 2. Avatar */}
                    <div>
                        <label className="label-text flex items-center gap-2">
                            <UserCircle className="w-4 h-4 text-purple-400" /> Avatar Promotor (opsional)
                        </label>
                        <p className="text-xs text-cream-400 mb-3">Tambahkan karakter yang bergerak dalam video</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {avatarStyles.map((av) => (
                                <button
                                    key={av.id}
                                    className={`px-3 py-3 rounded-xl text-left transition-all ${avatarStyle === av.id
                                        ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 text-cream-900 ring-1 ring-purple-500/30'
                                        : 'bg-cream-100 border border-cream-300 text-cream-500 hover:bg-cream-200'
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
                                <Camera className="w-4 h-4 text-purple-400" /> Upload Foto Wajah <span className="text-red-500">*</span>
                            </label>
                            <div
                                className="border-2 border-dashed border-purple-500/30 rounded-xl hover:border-purple-500/50 transition-colors cursor-pointer overflow-hidden bg-purple-500/5"
                                onClick={() => document.getElementById('video-custom-face')?.click()}
                            >
                                {customAvatarImage ? (
                                    <div className="relative group">
                                        <img src={customAvatarImage} alt="Avatar" className="w-full h-48 object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-sm text-white font-medium">Klik untuk ganti</span>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setCustomAvatarImage(null); }}
                                            className="absolute top-2 right-2 w-7 h-7 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center"
                                        >
                                            <X className="w-4 h-4 text-white" />
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

                    {/* 3. Prompt */}
                    <div>
                        <label className="label-text flex items-center gap-2">
                            <PenLine className="w-4 h-4 text-accent" /> Prompt Video
                        </label>
                        <textarea
                            className="textarea-field"
                            rows={3}
                            placeholder={hasAvatar
                                ? 'Contoh: Orang tersenyum menunjukkan produk ke kamera, gerakan natural, pencahayaan studio'
                                : 'Contoh: Produk berputar pelan di atas meja, cahaya hangat golden hour, close-up detail kemasan'
                            }
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                        />
                    </div>

                    {/* Template Prompts */}
                    <div>
                        <p className="text-xs text-cream-400 mb-2 flex items-center gap-1">
                            💡 {hasAvatar ? 'Template dengan avatar:' : productImage ? 'Template untuk foto produk:' : 'Template tanpa foto:'}
                        </p>
                        <div className="grid grid-cols-2 gap-1.5">
                            {templates.map((t, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPrompt(t.prompt)}
                                    className={`text-xs px-3 py-2 rounded-xl text-left transition-all cursor-pointer border ${
                                        prompt === t.prompt
                                            ? 'bg-accent/10 border-accent/30 text-accent font-medium'
                                            : 'bg-cream-100 text-cream-500 hover:bg-cream-200 hover:text-cream-700 border-cream-200'
                                    }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Video Settings */}
                    <div className="border-t border-cream-200 pt-4">
                        <h3 className="text-sm font-semibold text-cream-500 mb-4 flex items-center gap-2">
                            <Settings className="w-4 h-4 text-blue-400" /> Pengaturan Video
                        </h3>

                        {/* Resolution */}
                        <div className="mb-4">
                            <label className="label-text text-xs mb-2 flex items-center gap-1">
                                <Monitor className="w-3 h-3" /> Resolusi
                            </label>
                            <div className="flex gap-2">
                                {['720P', '1080P'].map((res) => (
                                    <button
                                        key={res}
                                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${resolution === res
                                            ? 'bg-brand-500/20 border border-brand-500/50 text-brand-400'
                                            : 'bg-cream-100 border border-cream-300 text-cream-400 hover:bg-cream-200'
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
                                            ? 'bg-brand-500/20 border border-brand-500/50 text-brand-400'
                                            : 'bg-cream-100 border border-cream-300 text-cream-400 hover:bg-cream-200'
                                            }`}
                                        onClick={() => setAspectRatio(opt.label)}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                            {currentRatioDesc && (
                                <p className="text-[10px] text-cream-300 mt-1">{currentRatioDesc} px</p>
                            )}
                        </div>

                        {/* Duration */}
                        <div className="mb-4">
                            <label className="label-text text-xs mb-2 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Durasi: {effectiveDuration} detik
                            </label>
                            <input
                                type="range"
                                min={2} max={15} step={1}
                                value={duration}
                                onChange={(e) => setDuration(Number(e.target.value))}
                                className="w-full accent-pink-500"
                            />
                            <div className="flex justify-between text-[10px] text-cream-300 mt-1">
                                <span>2s</span><span>5s</span><span>10s</span><span>15s</span>
                            </div>
                        </div>

                        {/* Audio */}
                        <div>
                            <label className="label-text text-xs mb-2 block">Audio</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    className={`px-3 py-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2 ${audioEnabled
                                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600'
                                        : 'bg-cream-100 border border-cream-300 text-cream-400 hover:bg-cream-200'
                                        }`}
                                    onClick={() => setAudioEnabled(true)}
                                >
                                    <Volume2 className="w-4 h-4" /> Auto Audio
                                </button>
                                <button
                                    className={`px-3 py-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2 ${!audioEnabled
                                        ? 'bg-cream-200 border border-cream-300 text-cream-600'
                                        : 'bg-cream-100 border border-cream-300 text-cream-400 hover:bg-cream-200'
                                        }`}
                                    onClick={() => setAudioEnabled(false)}
                                >
                                    <VolumeX className="w-4 h-4" /> Silent
                                </button>
                            </div>
                            <p className="text-[10px] text-cream-300 mt-1.5">
                                {audioEnabled ? 'AI otomatis generate musik/sound effect' : 'Video tanpa suara'}
                            </p>
                        </div>
                    </div>

                    {/* Validation */}
                    {!productImage && (
                        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                            <p className="text-xs text-amber-700">Upload foto produk untuk mulai generate video</p>
                        </div>
                    )}

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
