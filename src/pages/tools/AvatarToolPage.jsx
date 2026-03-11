import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { UserCircle, Loader2, Download, Upload, PenLine } from 'lucide-react';
import ToolLayout from '../../components/ToolLayout';
import ImageUploader from '../../components/ui/ImageUploader';
import AvatarStylePicker from '../../components/ui/AvatarStylePicker';
import TemplateGrid from '../../components/ui/TemplateGrid';
import SubmitButton from '../../components/ui/SubmitButton';
import ProgressSteps from '../../components/ui/ProgressSteps';
import { avatarStyles } from '../../components/ProductForm';
import { generateImage, editImageWithAvatar } from '../../services/wanApi';

const CUSTOM_TEMPLATES = [
    { label: 'Pegang Produk', prompt: 'Memegang produk dengan tangan kanan di samping wajah, tersenyum ke kamera' },
    { label: 'Selfie Style', prompt: 'Pose selfie sambil menunjukkan produk, ekspresi ceria dan natural' },
    { label: 'Profesional', prompt: 'Pose formal memegang produk di depan dada, ekspresi percaya diri dan profesional' },
    { label: 'Tunjuk Produk', prompt: 'Menunjuk produk dengan satu tangan, ekspresi antusias seperti merekomendasikan' },
];

const PRESET_TEMPLATES = [
    { label: 'Friendly', prompt: 'Tersenyum hangat sambil memegang produk, pose santai dan approachable' },
    { label: 'Confident', prompt: 'Pose percaya diri memegang produk, tatapan tegas ke kamera, gaya endorsement' },
    { label: 'Excited', prompt: 'Ekspresi antusias dan excited menunjukkan produk, gerakan dinamis' },
    { label: 'Calm & Elegant', prompt: 'Pose tenang dan elegan memegang produk, nuansa minimalis dan premium' },
];

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
    const abortControllerRef = useRef(null);

    const hasAvatar = avatarStyle !== 'none';
    const isCustom = avatarStyle === 'custom';
    const isValid = productImage && hasAvatar && (isCustom ? customAvatarImage : true);
    const templates = useMemo(() => (isCustom ? CUSTOM_TEMPLATES : PRESET_TEMPLATES), [isCustom]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            abortControllerRef.current?.abort();
        };
    }, []);

    // Build progress steps dynamically
    const progressSteps = useMemo(() => {
        if (isCustom) {
            return [{ id: 'edit', label: 'Edit foto wajah + produk... (30-60 detik)', color: 'text-violet-500' }];
        }
        return [
            { id: 'generate', label: 'Generate avatar... (30-60 detik)', color: 'text-violet-500' },
            { id: 'composite', label: 'Gabungkan dengan produk... (30-60 detik)', color: 'text-violet-500' },
        ];
    }, [isCustom]);

    const completedMap = useMemo(() => {
        const map = {};
        if (isCustom) {
            map.edit = !!generatedAvatar;
        } else {
            map.generate = step === 'composite' || !!generatedAvatar;
            map.composite = !!generatedAvatar;
        }
        return map;
    }, [isCustom, step, generatedAvatar]);

    const handleSubmit = useCallback(async () => {
        if (!isValid) return;

        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;
        const signal = controller.signal;

        setIsLoading(true);
        setShowResults(true);
        setGeneratedAvatar(null);
        setError(null);

        try {
            if (isCustom && customAvatarImage) {
                setStep('edit');
                const baseInstruction = instruction || 'memegang dan menunjukkan produk secara natural';
                const editPrompt = `Edit foto orang ini (gambar 1) agar mereka ${baseInstruction}. Produk ditunjukkan di gambar 2. Pertahankan wajah, penampilan, dan identitas orang tersebut persis sama. Buat mereka tersenyum percaya diri. Foto iklan profesional, pencahayaan studio.`;
                const editResult = await editImageWithAvatar(customAvatarImage, productImage, editPrompt, { signal });
                if (!signal.aborted) {
                    if (editResult.success) {
                        setGeneratedAvatar(editResult.imageUrl);
                    } else {
                        setError(editResult.error || 'Gagal mengedit foto. Coba lagi.');
                    }
                }
            } else {
                setStep('generate');
                const selectedAvatar = avatarStyles.find((a) => a.id === avatarStyle);
                const poseInstruction = instruction || 'memegang dan menunjukkan produk dengan senyum percaya diri';
                const prompt = `${selectedAvatar?.prompt}, ${poseInstruction}. Fotografi iklan produk profesional, pencahayaan studio, latar bersih, kualitas 4K.`;
                const imageResult = await generateImage(prompt, { signal });

                if (signal.aborted) return;

                if (imageResult.success) {
                    setStep('composite');
                    const compositePrompt = `Edit orang ini (gambar 1) agar secara natural memegang dan menunjukkan produk yang ada di gambar 2. Pertahankan penampilan orang tersebut tetap sama. Foto iklan produk profesional, pencahayaan studio.`;
                    const compositeResult = await editImageWithAvatar(imageResult.imageUrl, productImage, compositePrompt, { signal });
                    if (!signal.aborted) {
                        setGeneratedAvatar(compositeResult.success ? compositeResult.imageUrl : imageResult.imageUrl);
                    }
                } else if (!signal.aborted) {
                    setError(imageResult.error || 'Gagal generate avatar');
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
    }, [isValid, isCustom, customAvatarImage, instruction, productImage, avatarStyle]);

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
                        <ProgressSteps
                            steps={progressSteps}
                            currentStep={step}
                            completedMap={completedMap}
                        />
                    )}

                    {/* Result */}
                    <div className="card p-6">
                        <h3 className="text-lg font-bold text-cream-900 mb-4">Hasil Avatar AI</h3>
                        {isLoading && !generatedAvatar ? (
                            <div className="flex flex-col items-center justify-center py-20 text-cream-400" role="status">
                                <Loader2 className="w-10 h-10 animate-spin text-violet-400 mb-3" aria-hidden="true" />
                                <p className="text-sm">{isCustom ? 'Mengedit foto avatar...' : step === 'composite' ? 'Menggabungkan dengan produk...' : 'Generating avatar...'}</p>
                                <p className="text-xs text-cream-300 mt-1">{isCustom ? '30-60 detik' : '1-2 menit (2 tahap)'}</p>
                            </div>
                        ) : generatedAvatar ? (
                            <div>
                                <img src={generatedAvatar} alt="Generated Avatar" className="w-full rounded-xl" />
                                <a href={generatedAvatar} download="avatar-ai.png" target="_blank" rel="noopener noreferrer" className="btn-primary w-full !py-3 mt-4">
                                    <Download className="w-4 h-4" aria-hidden="true" /> Download Avatar
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
                    <UserCircle className="w-5 h-5 text-violet-400" aria-hidden="true" /> Buat Avatar Produk
                </h2>

                <div className="space-y-5">
                    {/* 1. Product Photo */}
                    <ImageUploader
                        value={productImage}
                        onChange={setProductImage}
                        label="Foto Produk"
                        hint="Upload foto produk yang akan dipegang avatar"
                        required
                        labelIcon={Upload}
                        emptyText="Upload foto produk"
                    />

                    {/* 2. Avatar Selection */}
                    <AvatarStylePicker
                        styles={avatarStyles}
                        selectedStyle={avatarStyle}
                        onStyleChange={setAvatarStyle}
                        customImage={customAvatarImage}
                        onCustomImageChange={setCustomAvatarImage}
                        excludeNone
                        label="Pilih Avatar"
                        hint="Upload foto wajahmu atau pilih karakter AI"
                        required
                        labelIcon={UserCircle}
                    />

                    {/* 3. Instruksi Pose */}
                    {hasAvatar && (
                        <>
                            <div>
                                <label className="label-text flex items-center gap-2">
                                    <PenLine className="w-4 h-4 text-violet-400" aria-hidden="true" /> Instruksi Pose (opsional)
                                </label>
                                <textarea
                                    className="textarea-field"
                                    rows={3}
                                    placeholder="Contoh: Memegang produk sambil tersenyum, pose duduk di meja kerja, selfie style sambil nunjukin produk"
                                    value={instruction}
                                    onChange={(e) => setInstruction(e.target.value)}
                                />
                            </div>

                            <TemplateGrid
                                templates={templates}
                                currentValue={instruction}
                                onSelect={setInstruction}
                                heading={isCustom ? 'Template untuk foto wajah:' : 'Template untuk avatar AI:'}
                            />
                        </>
                    )}

                    {/* Submit */}
                    <SubmitButton
                        isLoading={isLoading}
                        disabled={!isValid}
                        onClick={handleSubmit}
                        label="Generate Avatar"
                    />
                </div>
            </div>
        </ToolLayout>
    );
}
