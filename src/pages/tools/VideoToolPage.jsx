import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Video, Loader2, Download, Upload, UserCircle, Clock, Monitor, Volume2, VolumeX, Film, Settings, PenLine, AlertTriangle } from 'lucide-react';
import ToolLayout from '../../components/ToolLayout';
import ImageUploader from '../../components/ui/ImageUploader';
import AvatarStylePicker from '../../components/ui/AvatarStylePicker';
import TemplateGrid from '../../components/ui/TemplateGrid';
import SubmitButton from '../../components/ui/SubmitButton';
import ProgressSteps from '../../components/ui/ProgressSteps';
import OptionButton from '../../components/ui/OptionButton';
import { avatarStyles } from '../../components/ProductForm';
import { generateImage, editImageWithAvatar, generateVideoFromImage, generateVideo } from '../../services/wanApi';

const RESOLUTION_OPTIONS = {
    '720P': [
        { label: '16:9', value: '1280*720', desc: '1280x720' },
        { label: '9:16', value: '720*1280', desc: '720x1280' },
        { label: '1:1', value: '960*960', desc: '960x960' },
    ],
    '1080P': [
        { label: '16:9', value: '1920*1080', desc: '1920x1080' },
        { label: '9:16', value: '1080*1920', desc: '1080x1920' },
        { label: '1:1', value: '1440*1440', desc: '1440x1440' },
    ],
};

const AVATAR_TEMPLATES = [
    { label: 'Senyum & Tunjukkan', prompt: 'Orang tersenyum hangat lalu mengangkat produk ke depan kamera, gerakan natural dan percaya diri, background blur estetik' },
    { label: 'Unboxing', prompt: 'Orang membuka kemasan produk dengan antusias, ekspresi kagum, close-up tangan dan produk, pencahayaan studio' },
    { label: 'Fashion Show', prompt: 'Orang berjalan percaya diri sambil menunjukkan produk, gerakan elegan, studio lighting, gaya iklan TV premium' },
    { label: 'Review Style', prompt: 'Orang menunjukkan produk dari berbagai sudut ke kamera, gerakan natural seperti review produk, pencahayaan hangat' },
];

const PRODUCT_TEMPLATES = [
    { label: 'Rotate', prompt: 'Produk berputar pelan 360 derajat, pencahayaan dramatis, background gelap, efek refleksi di permukaan meja' },
    { label: 'Golden Hour', prompt: 'Produk diam di atas meja kayu, cahaya golden hour masuk dari samping, partikel debu berkilau, suasana hangat' },
    { label: 'Smoke Effect', prompt: 'Produk muncul dari kabut tipis, kamera zoom in pelan, pencahayaan neon biru dan ungu, suasana misterius dan premium' },
    { label: 'Floating', prompt: 'Produk melayang dan berputar pelan di udara, background gradient warna pastel, partikel berkilau di sekitar produk' },
    { label: 'Splash', prompt: 'Produk dengan percikan air yang dramatis, gerakan slow motion, pencahayaan studio profesional, background gelap' },
    { label: 'Cinematic', prompt: 'Kamera orbit pelan mengelilingi produk, depth of field dangkal, bokeh lights di background, nuansa sinematik premium' },
];

const TEXT_TEMPLATES = [
    { label: 'Kopi', prompt: 'Secangkir kopi panas mengepul di atas meja kayu, kamera zoom in pelan, uap naik indah, suasana kedai cozy pagi hari' },
    { label: 'Makanan', prompt: 'Hidangan makanan lezat dengan saus meleleh slow motion, pencahayaan studio, background gelap, food photography sinematik' },
    { label: 'Beauty', prompt: 'Produk skincare elegan di atas permukaan marmer, tetesan air berkilau, kelopak bunga beterbangan, nuansa pink pastel' },
    { label: 'Sneakers', prompt: 'Sepatu sneakers stylish berputar di udara, latar urban modern, percikan cat warna-warni, gerakan dinamis' },
    { label: 'Tech', prompt: 'Gadget modern melayang di ruang futuristik, hologram biru berkilau, kamera orbit pelan, suasana high-tech' },
    { label: 'Herbal', prompt: 'Produk herbal di tengah alam hijau, daun-daun berjatuhan pelan, sinar matahari menembus dedaunan, suasana segar natural' },
];

const PROGRESS_STEPS = [
    { id: 'avatar', label: 'Generate avatar...', color: 'text-violet-500' },
    { id: 'video', label: 'Generate video... (1-3 menit)', color: 'text-pink-500' },
];

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
    const abortControllerRef = useRef(null);

    const hasAvatar = avatarStyle !== 'none';
    const isCustomAvatar = avatarStyle === 'custom';
    const isValid = productImage && (isCustomAvatar ? customAvatarImage : true);

    const templates = useMemo(
        () => (hasAvatar ? AVATAR_TEMPLATES : productImage ? PRODUCT_TEMPLATES : TEXT_TEMPLATES),
        [hasAvatar, productImage],
    );

    const currentRatioDesc = useMemo(
        () => RESOLUTION_OPTIONS[resolution]?.find((r) => r.label === aspectRatio)?.desc || '',
        [resolution, aspectRatio],
    );

    const completedMap = useMemo(() => ({
        avatar: !!generatedAvatar || (!hasAvatar && step !== 'avatar'),
        video: !!generatedVideo,
    }), [generatedAvatar, generatedVideo, hasAvatar, step]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            abortControllerRef.current?.abort();
        };
    }, []);

    const handleSubmit = useCallback(async () => {
        if (!isValid) return;

        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;
        const signal = controller.signal;

        setIsLoading(true);
        setShowResults(true);
        setGeneratedVideo(null);
        setGeneratedAvatar(null);
        setAvatarError(null);
        setError(null);

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
                    const editResult = await editImageWithAvatar(customAvatarImage, productImage, editPrompt, { signal });
                    if (signal.aborted) return;
                    if (editResult.success) {
                        sourceImage = editResult.imageUrl;
                        setGeneratedAvatar(sourceImage);
                    } else {
                        setAvatarError('Avatar gagal di-generate, menggunakan foto produk sebagai fallback.');
                    }
                } else {
                    const selectedAvatar = avatarStyles.find((a) => a.id === avatarStyle);
                    const avatarPrompt = `${selectedAvatar?.prompt}, pose profesional dengan tangan siap memegang sesuatu. Iklan profesional, pencahayaan studio, latar bersih, kualitas 4K.`;
                    const avatarResult = await generateImage(avatarPrompt, { signal });
                    if (signal.aborted) return;
                    if (avatarResult.success) {
                        const compositePrompt = `Edit orang ini agar secara natural memegang produk dari gambar 2. Pertahankan penampilan tetap sama. Foto iklan profesional.`;
                        const compositeResult = await editImageWithAvatar(avatarResult.imageUrl, productImage, compositePrompt, { signal });
                        if (signal.aborted) return;
                        sourceImage = compositeResult.success ? compositeResult.imageUrl : avatarResult.imageUrl;
                        setGeneratedAvatar(sourceImage);
                    } else {
                        setAvatarError('Avatar gagal di-generate. ' + (avatarResult.error || ''));
                    }
                }
            } catch (e) {
                if (signal.aborted) return;
                setAvatarError('Avatar error: ' + e.message);
            }
        }

        if (signal.aborted) return;
        if (!sourceImage) sourceImage = productImage;

        // Step 2: Generate video
        setStep('video');
        try {
            let videoResult;
            if (sourceImage) {
                videoResult = await generateVideoFromImage(sourceImage, userPrompt, {
                    resolution,
                    duration,
                    audio: audioEnabled,
                    signal,
                });
            } else {
                videoResult = await generateVideo(userPrompt, { signal });
            }

            if (!signal.aborted) {
                if (videoResult.success) {
                    setGeneratedVideo(videoResult.videoUrl);
                } else {
                    setError(videoResult.error);
                }
            }
        } catch (e) {
            if (!signal.aborted) {
                setError(e.message);
            }
        } finally {
            if (!signal.aborted) {
                setIsLoading(false);
                setStep(null);
            }
        }
    }, [isValid, prompt, hasAvatar, isCustomAvatar, customAvatarImage, productImage, avatarStyle, resolution, duration, audioEnabled]);

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
                        <ProgressSteps
                            steps={PROGRESS_STEPS.map((s) =>
                                s.id === 'avatar' ? { ...s, label: hasAvatar ? 'Generate avatar...' : 'Avatar (dilewati)' } : s,
                            )}
                            currentStep={step}
                            completedMap={completedMap}
                        />
                    )}

                    {/* Avatar Error */}
                    {avatarError && (
                        <div className="card p-3 border border-amber-200 bg-amber-50" role="alert">
                            <p className="text-xs text-amber-700 flex items-start gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden="true" />
                                {avatarError}
                            </p>
                        </div>
                    )}

                    {/* Avatar Preview */}
                    {generatedAvatar && (
                        <div className="card p-4">
                            <h4 className="text-sm font-bold text-cream-900 mb-2">Avatar (input video)</h4>
                            <img src={generatedAvatar} alt="Avatar" className="w-full rounded-lg object-contain" />
                        </div>
                    )}

                    {/* Video Result */}
                    <div className="card p-6">
                        <h3 className="text-lg font-bold text-cream-900 mb-4 flex items-center gap-2">
                            <Film className="w-5 h-5 text-pink-400" aria-hidden="true" /> Video Promosi
                        </h3>
                        {isLoading && !generatedVideo ? (
                            <div className="flex flex-col items-center justify-center py-20 text-cream-400" role="status">
                                <Loader2 className="w-10 h-10 animate-spin text-pink-400 mb-3" aria-hidden="true" />
                                <p className="text-sm">{step === 'avatar' ? 'Generating avatar...' : 'Generating video...'}</p>
                                <p className="text-xs text-cream-300 mt-1">
                                    {resolution} &bull; {aspectRatio} &bull; {duration}s &bull; {audioEnabled ? 'Audio' : 'Silent'}
                                </p>
                            </div>
                        ) : generatedVideo ? (
                            <div>
                                <video src={generatedVideo} controls autoPlay loop className="w-full rounded-xl" />
                                <a href={generatedVideo} download="video-promo.mp4" target="_blank" rel="noopener noreferrer" className="btn-primary w-full !py-3 mt-4">
                                    <Download className="w-4 h-4" aria-hidden="true" /> Download Video
                                </a>
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center" role="alert">
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        ) : null}
                    </div>
                </div>
            }
        >
            <div className="card p-6 md:p-8 sticky top-24">
                <h2 className="text-lg font-semibold text-cream-900 flex items-center gap-2 mb-6">
                    <Film className="w-5 h-5 text-pink-400" aria-hidden="true" /> Setting Video
                </h2>

                <div className="space-y-5">
                    {/* 1. Product Photo */}
                    <ImageUploader
                        value={productImage}
                        onChange={setProductImage}
                        label="Foto Produk"
                        hint="Foto produk yang akan dianimasikan jadi video"
                        required
                        labelIcon={Upload}
                        emptyText="Upload foto produk"
                    />

                    {/* 2. Avatar */}
                    <AvatarStylePicker
                        styles={avatarStyles}
                        selectedStyle={avatarStyle}
                        onStyleChange={setAvatarStyle}
                        customImage={customAvatarImage}
                        onCustomImageChange={setCustomAvatarImage}
                        label="Avatar Promotor (opsional)"
                        hint="Tambahkan karakter yang bergerak dalam video"
                        labelIcon={UserCircle}
                    />

                    {/* 3. Prompt */}
                    <div>
                        <label className="label-text flex items-center gap-2">
                            <PenLine className="w-4 h-4 text-accent" aria-hidden="true" /> Prompt Video
                        </label>
                        <textarea
                            className="textarea-field"
                            rows={3}
                            placeholder={
                                hasAvatar
                                    ? 'Contoh: Orang tersenyum menunjukkan produk ke kamera, gerakan natural, pencahayaan studio'
                                    : 'Contoh: Produk berputar pelan di atas meja, cahaya hangat golden hour, close-up detail kemasan'
                            }
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                        />
                    </div>

                    {/* Template Prompts */}
                    <TemplateGrid
                        templates={templates}
                        currentValue={prompt}
                        onSelect={setPrompt}
                        heading={hasAvatar ? 'Template dengan avatar:' : productImage ? 'Template untuk foto produk:' : 'Template tanpa foto:'}
                    />

                    {/* Video Settings */}
                    <div className="border-t border-cream-200 pt-4">
                        <h3 className="text-sm font-semibold text-cream-500 mb-4 flex items-center gap-2">
                            <Settings className="w-4 h-4 text-blue-400" aria-hidden="true" /> Pengaturan Video
                        </h3>

                        {/* Resolution */}
                        <div className="mb-4">
                            <label className="label-text text-xs mb-2 flex items-center gap-1">
                                <Monitor className="w-3 h-3" aria-hidden="true" /> Resolusi
                            </label>
                            <div className="flex gap-2" role="radiogroup" aria-label="Resolusi video">
                                {['720P', '1080P'].map((res) => (
                                    <OptionButton
                                        key={res}
                                        isSelected={resolution === res}
                                        onClick={() => setResolution(res)}
                                        activeClass="bg-brand-500/20 border border-brand-500/50 text-brand-400"
                                        inactiveClass="bg-cream-100 border border-cream-300 text-cream-400 hover:bg-cream-200"
                                        className="flex-1 !rounded-lg !text-sm !text-center"
                                    >
                                        {res}
                                    </OptionButton>
                                ))}
                            </div>
                        </div>

                        {/* Aspect Ratio */}
                        <div className="mb-4">
                            <label className="label-text text-xs mb-2 block">Aspect Ratio</label>
                            <div className="flex gap-2 flex-wrap" role="radiogroup" aria-label="Aspect ratio">
                                {RESOLUTION_OPTIONS[resolution]?.map((opt) => (
                                    <OptionButton
                                        key={opt.label}
                                        isSelected={aspectRatio === opt.label}
                                        onClick={() => setAspectRatio(opt.label)}
                                        activeClass="bg-brand-500/20 border border-brand-500/50 text-brand-400"
                                        inactiveClass="bg-cream-100 border border-cream-300 text-cream-400 hover:bg-cream-200"
                                        className="!rounded-lg !text-xs"
                                    >
                                        {opt.label}
                                    </OptionButton>
                                ))}
                            </div>
                            {currentRatioDesc && (
                                <p className="text-[10px] text-cream-300 mt-1">{currentRatioDesc} px</p>
                            )}
                        </div>

                        {/* Duration */}
                        <div className="mb-4">
                            <label className="label-text text-xs mb-2 flex items-center gap-1">
                                <Clock className="w-3 h-3" aria-hidden="true" /> Durasi: {duration} detik
                            </label>
                            <input
                                type="range"
                                min={2}
                                max={15}
                                step={1}
                                value={duration}
                                onChange={(e) => setDuration(Number(e.target.value))}
                                className="w-full accent-pink-500"
                                aria-label={`Durasi ${duration} detik`}
                            />
                            <div className="flex justify-between text-[10px] text-cream-300 mt-1">
                                <span>2s</span><span>5s</span><span>10s</span><span>15s</span>
                            </div>
                        </div>

                        {/* Audio */}
                        <div>
                            <label className="label-text text-xs mb-2 block">Audio</label>
                            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Audio">
                                <button
                                    type="button"
                                    role="radio"
                                    aria-checked={audioEnabled}
                                    className={`px-3 py-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2 ${audioEnabled
                                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600'
                                        : 'bg-cream-100 border border-cream-300 text-cream-400 hover:bg-cream-200'
                                    }`}
                                    onClick={() => setAudioEnabled(true)}
                                >
                                    <Volume2 className="w-4 h-4" aria-hidden="true" /> Auto Audio
                                </button>
                                <button
                                    type="button"
                                    role="radio"
                                    aria-checked={!audioEnabled}
                                    className={`px-3 py-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2 ${!audioEnabled
                                        ? 'bg-cream-200 border border-cream-300 text-cream-600'
                                        : 'bg-cream-100 border border-cream-300 text-cream-400 hover:bg-cream-200'
                                    }`}
                                    onClick={() => setAudioEnabled(false)}
                                >
                                    <VolumeX className="w-4 h-4" aria-hidden="true" /> Silent
                                </button>
                            </div>
                            <p className="text-[10px] text-cream-300 mt-1.5">
                                {audioEnabled ? 'AI otomatis generate musik/sound effect' : 'Video tanpa suara'}
                            </p>
                        </div>
                    </div>

                    {/* Validation */}
                    {!productImage && (
                        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl" role="alert">
                            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" aria-hidden="true" />
                            <p className="text-xs text-amber-700">Upload foto produk untuk mulai generate video</p>
                        </div>
                    )}

                    {/* Submit */}
                    <SubmitButton
                        isLoading={isLoading}
                        disabled={!isValid}
                        onClick={handleSubmit}
                        label="Generate Video"
                    />
                </div>
            </div>
        </ToolLayout>
    );
}
