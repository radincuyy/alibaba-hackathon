import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ArrowLeft, Upload, Video, Loader2, Download, Trash2, Plus, Film, Volume2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import OptionButton from '../../components/ui/OptionButton';
import SubmitButton from '../../components/ui/SubmitButton';
import { ensureMinImageSize } from '../../utils/imageUtils';
import { cn } from '../../utils/cn';
import { generateR2V } from '../../services/wanApi';

const PROMPT_SUGGESTIONS = [
    'character1 sedang mempresentasikan produk baru di depan kamera dengan senyum ramah, berbicara dalam Bahasa Indonesia',
    'character1 duduk di studio profesional, menjelaskan keunggulan produk dengan antusias sambil memegang produk',
    'character1 berjalan di toko sambil menunjukkan produk ke kamera, gaya vlog casual dan energik',
    'character1 sedang unboxing produk dengan ekspresi excited, close-up tangan dan produk',
    'character1 memegang character2 sambil tersenyum ke kamera, memperkenalkan produk dengan bangga',
    'character1 menunjukkan character2 dari dekat, menjelaskan fitur-fitur produk secara detail di studio lighting profesional',
    'character1 berkata ke character2: "produk ini bagus sekali!" character2 menjawab: "iya saya sudah pakai sebulan!"',
];

const RESOLUTION_TIERS = {
    '720P': [
        { value: '1280*720', label: '16:9', desc: 'Landscape' },
        { value: '720*1280', label: '9:16', desc: 'Portrait / Reels' },
        { value: '960*960', label: '1:1', desc: 'Square / IG' },
        { value: '1088*832', label: '4:3', desc: 'Klasik' },
        { value: '832*1088', label: '3:4', desc: 'Potrait Klasik' },
    ],
    '1080P': [
        { value: '1920*1080', label: '16:9', desc: 'HD Landscape' },
        { value: '1080*1920', label: '9:16', desc: 'HD Portrait / Reels' },
        { value: '1440*1440', label: '1:1', desc: 'HD Square' },
        { value: '1632*1248', label: '4:3', desc: 'HD Klasik' },
        { value: '1248*1632', label: '3:4', desc: 'HD Potrait Klasik' },
    ],
};

const MAX_REFERENCES = 5;

export default function R2VStudioPage() {
    const [references, setReferences] = useState([]);
    const [prompt, setPrompt] = useState('');
    const [duration, setDuration] = useState(5);
    const [resolution, setResolution] = useState('720P');
    const [size, setSize] = useState('1280*720');
    const [shotType, setShotType] = useState('single');
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedVideo, setGeneratedVideo] = useState(null);
    const [error, setError] = useState(null);
    const [progress, setProgress] = useState('');
    const fileInputRef = useRef(null);
    const abortControllerRef = useRef(null);

    const currentSizeOptions = useMemo(() => RESOLUTION_TIERS[resolution], [resolution]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            abortControllerRef.current?.abort();
        };
    }, []);

    const handleFileUpload = useCallback(async (e) => {
        const files = Array.from(e.target.files || []);
        if (references.length + files.length > MAX_REFERENCES) {
            alert('Maksimal 5 referensi!');
            return;
        }

        for (const file of files) {
            const isVideo = file.type.startsWith('video/');
            const reader = new FileReader();
            reader.onload = async (ev) => {
                let data = ev.target?.result;
                if (!isVideo && data) {
                    data = await ensureMinImageSize(data);
                }
                setReferences((prev) => [
                    ...prev,
                    {
                        preview: data,
                        type: isVideo ? 'video' : 'image',
                        name: file.name,
                        id: Date.now() + Math.random(),
                    },
                ]);
            };
            reader.readAsDataURL(file);
        }

        if (fileInputRef.current) fileInputRef.current.value = '';
    }, [references.length]);

    const removeReference = useCallback((id) => {
        setReferences((prev) => prev.filter((r) => r.id !== id));
    }, []);

    const handleResolutionChange = useCallback((newRes) => {
        setResolution(newRes);
        setSize((prevSize) => {
            const currentOption = RESOLUTION_TIERS[resolution]?.find((s) => s.value === prevSize);
            const currentLabel = currentOption?.label || '16:9';
            const newOption = RESOLUTION_TIERS[newRes]?.find((s) => s.label === currentLabel);
            return newOption ? newOption.value : RESOLUTION_TIERS[newRes][0].value;
        });
    }, [resolution]);

    const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) {
            alert('Masukkan deskripsi video!');
            return;
        }
        if (references.length === 0) {
            alert('Upload minimal 1 foto/video referensi!');
            return;
        }

        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;
        const signal = controller.signal;

        setIsGenerating(true);
        setGeneratedVideo(null);
        setError(null);
        setProgress('Mengirim referensi ke AI...');

        try {
            const referenceUrls = references.map((r) => r.preview);
            setProgress('Menghasilkan video R2V... (1-5 menit)');

            const result = await generateR2V(prompt, referenceUrls, {
                duration,
                size,
                shotType,
                audio: audioEnabled,
                signal,
            });

            if (!signal.aborted) {
                if (result.success) {
                    setGeneratedVideo(result.videoUrl);
                } else {
                    setError(result.error || 'Gagal menghasilkan video');
                }
                setProgress('');
            }
        } catch (e) {
            if (!signal.aborted) {
                setError(e.message);
                setProgress('');
            }
        } finally {
            if (!signal.aborted) {
                setIsGenerating(false);
            }
        }
    }, [prompt, references, duration, size, shotType, audioEnabled]);

    return (
        <div className="min-h-screen bg-dark-950">
            <Navbar />

            <main className="pt-24 pb-20 px-4 sm:px-6">
                <div className="max-w-5xl mx-auto">
                    <Link
                        to="/generator"
                        className="inline-flex items-center gap-2 text-sm text-cream-400 hover:text-cream-600 transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                        Kembali ke AI Tools
                    </Link>

                    <header className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg">
                                <Film className="w-6 h-6 text-cream-900" aria-hidden="true" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-black text-cream-900">
                                    Avatar Video Studio AI
                                </h1>
                                <p className="text-cream-400 text-sm">
                                    Powered by Wan 2.6 R2V Flash — Reference to Video
                                </p>
                            </div>
                        </div>
                        <p className="text-cream-500 max-w-2xl">
                            Upload foto atau video referensi karakter, lalu AI akan membuat video baru dimana karakter tersebut
                            bergerak dan berbicara sesuai instruksimu. Wajah dan penampilan dipertahankan secara konsisten!
                        </p>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left: Input */}
                        <div className="space-y-6">
                            {/* Reference Upload */}
                            <section className="card p-6">
                                <h2 className="text-lg font-bold text-cream-900 mb-1 flex items-center gap-2">
                                    <Upload className="w-5 h-5 text-violet-400" aria-hidden="true" />
                                    Upload Referensi Karakter
                                </h2>
                                <p className="text-xs text-cream-400 mb-4">
                                    Upload 1-5 foto/video karakter. Urutan = character1, character2, dst di prompt. character juga bisa berupa produk
                                </p>

                                <div className="grid grid-cols-3 gap-3 mb-4">
                                    {references.map((ref, idx) => (
                                        <div key={ref.id} className="relative group rounded-xl overflow-hidden border border-cream-300 bg-cream-50">
                                            {ref.type === 'video' ? (
                                                <div className="aspect-square flex items-center justify-center bg-cream-50">
                                                    <video src={ref.preview} className="w-full h-full object-cover" muted />
                                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                        <Film className="w-8 h-8 text-violet-400/60" aria-hidden="true" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="aspect-square">
                                                    <img src={ref.preview} alt={`Referensi ${idx + 1}`} className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1 text-center">
                                                <span className="text-[10px] text-violet-300 font-medium">character{idx + 1}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeReference(ref.id)}
                                                className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                aria-label={`Hapus referensi ${idx + 1}`}
                                            >
                                                <Trash2 className="w-3 h-3 text-cream-900" aria-hidden="true" />
                                            </button>
                                        </div>
                                    ))}

                                    {references.length < MAX_REFERENCES && (
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="aspect-square rounded-xl border-2 border-dashed border-violet-500/30 hover:border-violet-500/60 flex flex-col items-center justify-center text-violet-300/50 hover:text-violet-300 transition-all cursor-pointer hover:bg-violet-500/5"
                                            aria-label="Upload referensi baru"
                                        >
                                            <Plus className="w-6 h-6" aria-hidden="true" />
                                            <span className="text-[10px] mt-1">Upload</span>
                                            <span className="text-[8px] text-cream-300 mt-0.5">Foto / Video</span>
                                        </button>
                                    )}
                                </div>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*,video/*"
                                    multiple
                                    className="hidden"
                                    onChange={handleFileUpload}
                                    tabIndex={-1}
                                />

                                <p className="text-[10px] text-cream-300">
                                    {references.length}/{MAX_REFERENCES} referensi &bull; Foto: JPG, PNG, WEBP &bull; Video: MP4
                                </p>
                            </section>

                            {/* Prompt */}
                            <section className="card p-6">
                                <h2 className="text-lg font-bold text-cream-900 mb-1 flex items-center gap-2">
                                    Deskripsi Video
                                </h2>
                                <p className="text-xs text-cream-400 mb-3">
                                    Gunakan &quot;character1&quot;, &quot;character2&quot; untuk merujuk ke karakter yang di-upload
                                </p>

                                <textarea
                                    className="textarea-field"
                                    rows={4}
                                    placeholder='Contoh: character1 sedang mempresentasikan produk di depan kamera, tersenyum dan berbicara dalam Bahasa Indonesia'
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                />

                                <div className="mt-3">
                                    <p className="text-[12px] text-cream-400 mb-2">Saran prompt:</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {PROMPT_SUGGESTIONS.map((s, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => setPrompt(s)}
                                                className={cn(
                                                    'text-[12px] px-2 py-1 rounded-lg border transition-colors truncate max-w-[320px]',
                                                    prompt === s
                                                        ? 'bg-violet-500/20 border-violet-500/30 text-cream-900'
                                                        : 'bg-cream-100 border-cream-500/20 text-cream-600 hover:text-cream-900 hover:bg-violet-500/20',
                                                )}
                                            >
                                                {s.substring(0, 55)}...
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            {/* Settings */}
                            <section className="card p-6">
                                <h2 className="text-lg font-bold text-cream-900 mb-4 flex items-center gap-2">
                                    <Video className="w-5 h-5 text-violet-400" aria-hidden="true" />
                                    Pengaturan Video
                                </h2>

                                {/* Duration */}
                                <div className="mb-4">
                                    <label className="text-xs text-cream-500 mb-1.5 block">Durasi</label>
                                    <div className="flex gap-2" role="radiogroup" aria-label="Durasi video">
                                        {[2, 5, 10].map((d) => (
                                            <OptionButton
                                                key={d}
                                                isSelected={duration === d}
                                                onClick={() => setDuration(d)}
                                                activeClass="bg-violet-500/20 border border-violet-500/50 text-cream-900"
                                                inactiveClass="bg-cream-100 border border-cream-300 text-cream-400 hover:text-cream-600"
                                                className="flex-1 !text-center"
                                            >
                                                {d} detik
                                            </OptionButton>
                                        ))}
                                    </div>
                                </div>

                                {/* Resolution Tier */}
                                <div className="mb-4">
                                    <label className="text-xs text-cream-500 mb-1.5 block">Resolusi</label>
                                    <div className="flex gap-2" role="radiogroup" aria-label="Resolusi">
                                        {['720P', '1080P'].map((res) => (
                                            <OptionButton
                                                key={res}
                                                isSelected={resolution === res}
                                                onClick={() => handleResolutionChange(res)}
                                                activeClass="bg-violet-500/20 border border-violet-500/50 text-cream-900"
                                                inactiveClass="bg-cream-100 border border-cream-300 text-cream-400 hover:text-cream-600"
                                                className="flex-1 !text-center"
                                            >
                                                {res}
                                                {res === '1080P' && <span className="text-[9px] opacity-50 ml-1">(HD)</span>}
                                            </OptionButton>
                                        ))}
                                    </div>
                                </div>

                                {/* Aspect Ratio */}
                                <div className="mb-4">
                                    <label className="text-xs text-cream-500 mb-1.5 block">Rasio Video</label>
                                    <div className="grid grid-cols-5 gap-1.5" role="radiogroup" aria-label="Rasio video">
                                        {currentSizeOptions.map((s) => (
                                            <OptionButton
                                                key={s.value}
                                                isSelected={size === s.value}
                                                onClick={() => setSize(s.value)}
                                                activeClass="bg-violet-500/20 border border-violet-500/50 text-cream-900"
                                                inactiveClass="bg-cream-100 border border-cream-300 text-cream-400 hover:text-cream-600"
                                                className="!py-2 !px-1 !text-center"
                                            >
                                                <div className="font-semibold text-[11px]">{s.label}</div>
                                                <div className="text-[8px] opacity-50 leading-tight">{s.desc}</div>
                                            </OptionButton>
                                        ))}
                                    </div>
                                    <p className="text-[9px] text-cream-300 mt-1.5">{size.replace('*', ' x ')} px</p>
                                </div>

                                {/* Video Style + Audio */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-cream-500 mb-1.5 block">Gaya Video</label>
                                        <div className="flex gap-2" role="radiogroup" aria-label="Gaya video">
                                            <OptionButton
                                                isSelected={shotType === 'single'}
                                                onClick={() => setShotType('single')}
                                                activeClass="bg-violet-500/20 border border-violet-500/50 text-cream-900"
                                                inactiveClass="bg-cream-100 border border-cream-300 text-cream-400 hover:text-cream-600"
                                                className="flex-1 !text-xs !text-center"
                                                title="Video satu shot tanpa ganti angle"
                                            >
                                                Single-Shot
                                            </OptionButton>
                                            <OptionButton
                                                isSelected={shotType === 'multi'}
                                                onClick={() => setShotType('multi')}
                                                activeClass="bg-violet-500/20 border border-violet-500/50 text-cream-900"
                                                inactiveClass="bg-cream-100 border border-cream-300 text-cream-400 hover:text-cream-600"
                                                className="flex-1 !text-xs !text-center"
                                                title="Video dengan pergantian angle/shot, cocok untuk dialog"
                                            >
                                                Multi-Shot
                                            </OptionButton>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs text-cream-500 mb-1.5 block">Suara</label>
                                        <button
                                            type="button"
                                            onClick={() => setAudioEnabled(!audioEnabled)}
                                            aria-pressed={audioEnabled}
                                            className={cn(
                                                'w-full py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5',
                                                audioEnabled
                                                    ? 'bg-violet-500/20 border border-violet-500/50 text-cream-900'
                                                    : 'bg-cream-100 border border-cream-300 text-cream-400',
                                            )}
                                        >
                                            {audioEnabled ? 'Aktif' : 'Mati'}
                                        </button>
                                    </div>
                                </div>
                            </section>

                            {/* Generate Button */}
                            <SubmitButton
                                isLoading={isGenerating}
                                disabled={!prompt.trim() || references.length === 0}
                                onClick={handleGenerate}
                                label="Generate Video"
                                loadingLabel={progress || 'Generating...'}
                                icon={Film}
                                className="!bg-gradient-to-r !from-violet-600 !to-fuchsia-600 hover:!from-violet-500 hover:!to-fuchsia-500"
                            />
                        </div>

                        {/* Right: Result */}
                        <div className="space-y-6">
                            <div className="card p-6 min-h-[400px] flex flex-col">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center">
                                        <Film className="w-5 h-5 text-cream-900" aria-hidden="true" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-cream-900">Hasil Video</h3>
                                        <p className="text-xs text-cream-400 flex items-center gap-1">
                                            <Volume2 className="w-3 h-3" aria-hidden="true" />
                                            {audioEnabled ? 'Dengan suara' : 'Tanpa suara'} &bull; Wan 2.6 R2V Flash
                                        </p>
                                    </div>
                                </div>

                                {isGenerating ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-cream-400" role="status">
                                        <div className="relative">
                                            <div className="w-20 h-20 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
                                            <Film className="w-8 h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-violet-400" aria-hidden="true" />
                                        </div>
                                        <p className="text-sm mt-4 font-medium text-violet-300">{progress}</p>
                                        <p className="text-xs text-cream-400 mt-1">Proses ini membutuhkan waktu 1-5 menit</p>
                                    </div>
                                ) : generatedVideo ? (
                                    <div className="flex-1 flex flex-col">
                                        <div className="flex-1 rounded-xl overflow-hidden bg-black">
                                            <video
                                                src={generatedVideo}
                                                controls
                                                autoPlay
                                                loop
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <a
                                            href={generatedVideo}
                                            download="avatar-video.mp4"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn-primary w-full !py-3 mt-4 !bg-gradient-to-r !from-violet-600 !to-fuchsia-600"
                                        >
                                            <Download className="w-4 h-4" aria-hidden="true" />
                                            Download Video
                                        </a>
                                    </div>
                                ) : error ? (
                                    <div className="flex-1 flex flex-col items-center justify-center" role="alert">
                                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center w-full">
                                            <p className="text-red-400 text-sm font-medium mb-1">Gagal Generate Video</p>
                                            <p className="text-red-300/60 text-xs break-all">{error}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-cream-400">
                                        <Film className="w-16 h-16 mb-3" aria-hidden="true" />
                                        <p className="text-sm text-center">
                                            Upload foto/video referensi dan isi prompt,
                                            <br />lalu klik Generate untuk membuat video
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Info Card */}
                            <aside className="card p-5 bg-amber-50 border-amber-200">
                                <h3 className="text-sm font-bold text-amber-700 mb-2">Tips</h3>
                                <ul className="text-xs text-cream-600 space-y-1.5">
                                    <li>Upload foto wajah yang <strong className="text-cream-900">jelas dan terang</strong></li>
                                    <li>Urutan upload = <strong className="text-cream-900">character1, character2, character3...</strong></li>
                                    <li>Bisa upload <strong className="text-cream-900">foto (.jpg/.png)</strong> atau <strong className="text-cream-900">video (.mp4)</strong></li>
                                    <li><strong className="text-cream-900">Single-Shot</strong> = satu shot tanpa ganti angle kamera</li>
                                    <li><strong className="text-cream-900">Multi-Shot</strong> = beberapa angle, cocok untuk dialog</li>
                                    <li>Tulis prompt dalam <strong className="text-cream-900">Bahasa Indonesia</strong> untuk dubbing Indonesia</li>
                                </ul>
                            </aside>

                            {/* Example */}
                            <aside className="card p-5 bg-cream-50 border-cream-300">
                                <h3 className="text-sm font-bold text-cream-900 mb-2">Contoh Prompt</h3>
                                <div className="space-y-2">
                                    <div className="bg-cream-100 rounded-lg p-3">
                                        <p className="text-[10px] text-cream-500 mb-1">1 karakter (orang):</p>
                                        <p className="text-xs text-cream-700 italic">&quot;character1 sedang duduk di kafe, memperkenalkan produk kopi ke kamera sambil tersenyum hangat&quot;</p>
                                    </div>
                                    <div className="bg-cream-100 rounded-lg p-3">
                                        <p className="text-[10px] text-cream-500 mb-1">Karakter + Produk (upload foto wajah + foto produk):</p>
                                        <p className="text-xs text-cream-700 italic">&quot;character1 memegang character2 sambil tersenyum ke kamera, memperkenalkan produk dengan bangga di studio profesional&quot;</p>
                                    </div>
                                    <div className="bg-cream-100 rounded-lg p-3">
                                        <p className="text-[10px] text-cream-500 mb-1">2 karakter dialog (gunakan Multi-Shot):</p>
                                        <p className="text-xs text-cream-700 italic">&quot;character1 berkata ke character2: &apos;produk ini bagus sekali!&apos; character2 menjawab: &apos;iya saya sudah pakai sebulan!&apos;&quot;</p>
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
