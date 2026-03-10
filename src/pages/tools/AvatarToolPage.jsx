import { useState } from 'react';
import { UserCircle, Loader2, Download, Upload, Camera, X, Sparkles, PenLine, CheckCircle2, AlertTriangle } from 'lucide-react';
import ToolLayout from '../../components/ToolLayout';
import { avatarStyles } from '../../components/ProductForm';
import { generateImage, editImageWithAvatar } from '../../services/wanApi';

// Template instruksi pose - custom avatar
const CUSTOM_TEMPLATES = [
    { label: 'Pegang Produk', prompt: 'Memegang produk dengan tangan kanan di samping wajah, tersenyum ke kamera' },
    { label: 'Selfie Style', prompt: 'Pose selfie sambil menunjukkan produk, ekspresi ceria dan natural' },
    { label: 'Profesional', prompt: 'Pose formal memegang produk di depan dada, ekspresi percaya diri dan profesional' },
    { label: 'Tunjuk Produk', prompt: 'Menunjuk produk dengan satu tangan, ekspresi antusias seperti merekomendasikan' },
];

// Template instruksi pose — preset avatar
const PRESET_TEMPLATES = [
    { label: 'Friendly', prompt: 'Tersenyum hangat sambil memegang produk, pose santai dan approachable' },
    { label: 'Confident', prompt: 'Pose percaya diri memegang produk, tatapan tegas ke kamera, gaya endorsement' },
    { label: 'Excited', prompt: 'Ekspresi antusias dan excited menunjukkan produk, gerakan dinamis' },
    { label: 'Calm & Elegant', prompt: 'Pose tenang dan elegan memegang produk, nuansa minimalis dan premium' },
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

export default function AvatarToolPage() {
    const [productImage, setProductImage] = useState(null);
    const [avatarStyle, setAvatarStyle] = useState('none');
    const [customAvatarImage, setCustomAvatarImage] = useState(null);
    const [instruction, setInstruction] = useState('');

    const [step, setStep] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
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

    const hasAvatar = avatarStyle !== 'none';
    const isCustom = avatarStyle === 'custom';
    const isValid = productImage && hasAvatar && (isCustom ? customAvatarImage : true);

    const templates = isCustom ? CUSTOM_TEMPLATES : PRESET_TEMPLATES;

    const handleSubmit = async () => {
        if (!isValid) return;
        setIsLoading(true);
        setShowResults(true);
        setGeneratedAvatar(null);
        setError(null);

        try {
            if (isCustom && customAvatarImage) {
                setStep('edit');
                const baseInstruction = instruction || 'memegang dan menunjukkan produk secara natural';
                const editPrompt = `Edit foto orang ini (gambar 1) agar mereka ${baseInstruction}. Produk ditunjukkan di gambar 2. Pertahankan wajah, penampilan, dan identitas orang tersebut persis sama. Buat mereka tersenyum percaya diri. Foto iklan profesional, pencahayaan studio.`;
                const editResult = await editImageWithAvatar(customAvatarImage, productImage, editPrompt);
                if (editResult.success) {
                    setGeneratedAvatar(editResult.imageUrl);
                } else {
                    setError(editResult.error || 'Gagal mengedit foto. Coba lagi.');
                }
            } else {
                // Step 1: Generate avatar
                setStep('generate');
                const selectedAvatar = avatarStyles.find(a => a.id === avatarStyle);
                const poseInstruction = instruction || 'memegang dan menunjukkan produk dengan senyum percaya diri';
                const prompt = `${selectedAvatar.prompt}, ${poseInstruction}. Fotografi iklan produk profesional, pencahayaan studio, latar bersih, kualitas 4K.`;
                const imageResult = await generateImage(prompt);

                if (imageResult.success) {
                    // Step 2: Composite with product
                    setStep('composite');
                    const compositePrompt = `Edit orang ini (gambar 1) agar secara natural memegang dan menunjukkan produk yang ada di gambar 2. Pertahankan penampilan orang tersebut tetap sama. Foto iklan produk profesional, pencahayaan studio.`;
                    const compositeResult = await editImageWithAvatar(imageResult.imageUrl, productImage, compositePrompt);
                    if (compositeResult.success) {
                        setGeneratedAvatar(compositeResult.imageUrl);
                    } else {
                        // Fallback: avatar tanpa produk
                        setGeneratedAvatar(imageResult.imageUrl);
                    }
                } else {
                    setError(imageResult.error || 'Gagal generate avatar');
                }
            }
        } catch (e) {
            setError(e.message);
        } finally {
            setIsLoading(false);
            setStep(null);
        }
    };

    return (
        <ToolLayout
            icon={UserCircle}
            title="Avatar Produk AI"
            description="Gabungkan avatar AI dengan foto produkmu"
            gradient="from-violet-500 to-purple-500"
            showResults={showResults}
            rightPanel={
                <div className="space-y-4">
                    {/* Progress */}
                    {isLoading && (
                        <div className="card p-4">
                            <h4 className="text-sm font-bold text-cream-900 mb-3">📊 Progress</h4>
                            <div className="space-y-2">
                                {isCustom ? (
                                    <div className={`flex items-center gap-2 text-sm ${step === 'edit' ? 'text-violet-500' : generatedAvatar ? 'text-green-500' : 'text-cream-300'}`}>
                                        {step === 'edit' ? <Loader2 className="w-4 h-4 animate-spin" /> : generatedAvatar ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border border-cream-300" />}
                                        Edit foto wajah + produk... (30-60 detik)
                                    </div>
                                ) : (
                                    <>
                                        <div className={`flex items-center gap-2 text-sm ${step === 'generate' ? 'text-violet-500' : (step === 'composite' || generatedAvatar) ? 'text-green-500' : 'text-cream-300'}`}>
                                            {step === 'generate' ? <Loader2 className="w-4 h-4 animate-spin" /> : (step === 'composite' || generatedAvatar) ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border border-cream-300" />}
                                            Generate avatar... (30-60 detik)
                                        </div>
                                        <div className={`flex items-center gap-2 text-sm ${step === 'composite' ? 'text-violet-500' : generatedAvatar ? 'text-green-500' : 'text-cream-300'}`}>
                                            {step === 'composite' ? <Loader2 className="w-4 h-4 animate-spin" /> : generatedAvatar ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border border-cream-300" />}
                                            Gabungkan dengan produk... (30-60 detik)
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Result */}
                    <div className="card p-6">
                        <h3 className="text-lg font-bold text-cream-900 mb-4">👤 Hasil Avatar AI</h3>
                        {isLoading && !generatedAvatar ? (
                            <div className="flex flex-col items-center justify-center py-20 text-cream-400">
                                <Loader2 className="w-10 h-10 animate-spin text-violet-400 mb-3" />
                                <p className="text-sm">{isCustom ? 'Mengedit foto avatar...' : step === 'composite' ? 'Menggabungkan dengan produk...' : 'Generating avatar...'}</p>
                                <p className="text-xs text-cream-300 mt-1">{isCustom ? '30-60 detik' : '1-2 menit (2 tahap)'}</p>
                            </div>
                        ) : generatedAvatar ? (
                            <div>
                                <img src={generatedAvatar} alt="Generated Avatar" className="w-full rounded-xl" />
                                <a href={generatedAvatar} download="avatar-ai.png" target="_blank" rel="noopener noreferrer" className="btn-primary w-full !py-3 mt-4">
                                    <Download className="w-4 h-4" /> Download Avatar
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
                    <UserCircle className="w-5 h-5 text-violet-400" /> Buat Avatar Produk
                </h2>

                <div className="space-y-5">
                    {/* 1. Product Photo */}
                    <div>
                        <label className="label-text flex items-center gap-2">
                            <Upload className="w-4 h-4 text-brand-400" />
                            Foto Produk <span className="text-red-500">*</span>
                        </label>
                        <p className="text-xs text-cream-400 mb-2">Upload foto produk yang akan dipegang avatar</p>
                        <div
                            className="border-2 border-dashed border-cream-300 rounded-xl hover:border-brand-500/30 transition-colors cursor-pointer overflow-hidden"
                            onClick={() => document.getElementById('avatar-product-image')?.click()}
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
                        <input id="avatar-product-image" type="file" accept="image/*" className="hidden" onChange={handleProductUpload} />
                    </div>

                    {/* 2. Avatar Selection */}
                    <div>
                        <label className="label-text flex items-center gap-2">
                            <UserCircle className="w-4 h-4 text-purple-400" />
                            Pilih Avatar <span className="text-red-500">*</span>
                        </label>
                        <p className="text-xs text-cream-400 mb-3">Upload foto wajahmu atau pilih karakter AI</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {avatarStyles.filter(a => a.id !== 'none').map((av) => (
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
                    {isCustom && (
                        <div className="animate-fade-in">
                            <label className="label-text flex items-center gap-2">
                                <Camera className="w-4 h-4 text-purple-400" />
                                Upload Foto Wajah <span className="text-red-500">*</span>
                            </label>
                            <p className="text-xs text-cream-400 mb-2">Selfie atau foto portrait yang jelas</p>
                            <div
                                className="border-2 border-dashed border-purple-500/30 rounded-xl hover:border-purple-500/50 transition-colors cursor-pointer overflow-hidden bg-purple-500/5"
                                onClick={() => document.getElementById('avatar-custom-face')?.click()}
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
                            <input id="avatar-custom-face" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                        </div>
                    )}

                    {/* 3. Instruksi Pose */}
                    {hasAvatar && (
                        <>
                            <div>
                                <label className="label-text flex items-center gap-2">
                                    <PenLine className="w-4 h-4 text-violet-400" /> Instruksi Pose (opsional)
                                </label>
                                <textarea
                                    className="textarea-field"
                                    rows={3}
                                    placeholder="Contoh: Memegang produk sambil tersenyum, pose duduk di meja kerja, selfie style sambil nunjukin produk"
                                    value={instruction}
                                    onChange={(e) => setInstruction(e.target.value)}
                                />
                            </div>

                            {/* Template Prompts */}
                            <div>
                                <p className="text-xs text-cream-400 mb-2 flex items-center gap-1">
                                    💡 {isCustom ? 'Template untuk foto wajah:' : 'Template untuk avatar AI:'}
                                </p>
                                <div className="grid grid-cols-2 gap-1.5">
                                    {templates.map((t, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setInstruction(t.prompt)}
                                            className={`text-xs px-3 py-2 rounded-xl text-left transition-all cursor-pointer border ${
                                                instruction === t.prompt
                                                    ? 'bg-accent/10 border-accent/30 text-accent font-medium'
                                                    : 'bg-cream-100 text-cream-500 hover:bg-cream-200 hover:text-cream-700 border-cream-200'
                                            }`}
                                        >
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
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
                            <><Sparkles className="w-5 h-5" /> Generate Avatar</>
                        )}
                    </button>
                </div>
            </div>
        </ToolLayout>
    );
}
