import { useState } from 'react';
import { UserCircle, Loader2, Download, Upload, Camera, X, Sparkles, PenLine } from 'lucide-react';
import ToolLayout from '../../components/ToolLayout';
import { avatarStyles } from '../../components/ProductFormSimple';
import { generateAvatarPrompt } from '../../services/qwenApi';
import { generateImage, editImageWithAvatar } from '../../services/wanApi';

/**
 * Ensure image meets minimum size (512px) for API compatibility.
 */
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
    // Form state
    const [productImage, setProductImage] = useState(null);
    const [avatarStyle, setAvatarStyle] = useState('none');
    const [customAvatarImage, setCustomAvatarImage] = useState(null);
    const [instruction, setInstruction] = useState('');

    // Generation state
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
    const isValid = hasAvatar && (isCustom ? customAvatarImage : true);

    const handleSubmit = async () => {
        if (!isValid) return;
        setIsLoading(true);
        setShowResults(true);
        setGeneratedAvatar(null);
        setError(null);

        try {
            if (isCustom && customAvatarImage) {
                // Custom: edit user's photo with product
                const baseInstruction = instruction || 'holding and presenting the product naturally';
                const editPrompt = `Edit this photo of a person (image 1) so they are ${baseInstruction}. ${productImage ? 'The product is shown in image 2.' : ''} Keep the person's face, appearance, and identity exactly the same. Make them smile confidently. Professional advertisement photo, studio lighting.`;
                const editResult = await editImageWithAvatar(customAvatarImage, productImage || null, editPrompt);
                if (editResult.success) {
                    setGeneratedAvatar(editResult.imageUrl);
                } else {
                    setError(editResult.error || 'Gagal mengedit foto. Coba lagi.');
                }
            } else {
                // Preset avatar: generate base avatar first, then composite with product
                const selectedAvatar = avatarStyles.find(a => a.id === avatarStyle);
                const poseInstruction = instruction || 'holding and presenting the product with a confident smile';
                const prompt = `${selectedAvatar.prompt}, ${poseInstruction}. Professional product advertisement photography, studio lighting, clean background, 4K quality.`;
                const imageResult = await generateImage(prompt);
                if (imageResult.success) {
                    // If product photo exists, composite avatar + product
                    if (productImage) {
                        console.log('🔗 Compositing preset avatar with product photo...');
                        const compositePrompt = `Edit this person (image 1) so they are naturally holding and presenting the product shown in image 2. Keep the person's appearance identical. Professional product advertisement photo, studio lighting.`;
                        const compositeResult = await editImageWithAvatar(imageResult.imageUrl, productImage, compositePrompt);
                        if (compositeResult.success) {
                            setGeneratedAvatar(compositeResult.imageUrl);
                        } else {
                            // Fallback: use avatar without product
                            setGeneratedAvatar(imageResult.imageUrl);
                        }
                    } else {
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
                <div className="card p-6">
                    <h3 className="text-lg font-bold text-cream-900 mb-4">👤 Hasil Avatar AI</h3>
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-cream-400">
                            <Loader2 className="w-10 h-10 animate-spin text-violet-400 mb-3" />
                            <p className="text-sm">{isCustom ? 'Mengedit foto avatar...' : 'Generating avatar...'}</p>
                            <p className="text-xs text-white/20 mt-1">Proses ini membutuhkan 30-60 detik</p>
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
            }
        >
            <div className="card p-6 md:p-8 sticky top-24">
                <h2 className="text-lg font-semibold text-cream-900 flex items-center gap-2 mb-6">
                    � Buat Avatar Produk
                </h2>

                <div className="space-y-5">
                    {/* 1. Product Photo */}
                    <div>
                        <label className="label-text flex items-center gap-2">
                            <Upload className="w-4 h-4 text-brand-400" />
                            Foto Produk
                        </label>
                        <p className="text-xs text-cream-400 mb-2">Upload foto produk yang ingin dipegang avatar</p>
                        <div
                            className="border-2 border-dashed border-cream-300 rounded-xl hover:border-brand-500/30 transition-colors cursor-pointer overflow-hidden"
                            onClick={() => document.getElementById('avatar-product-image')?.click()}
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
                        <input id="avatar-product-image" type="file" accept="image/*" className="hidden" onChange={handleProductUpload} />
                    </div>

                    {/* 2. Avatar Selection */}
                    <div>
                        <label className="label-text flex items-center gap-2">
                            <UserCircle className="w-4 h-4 text-purple-400" />
                            Pilih Avatar <span className="text-coral-500">*</span>
                        </label>
                        <p className="text-xs text-cream-400 mb-3">Upload foto wajahmu atau pilih karakter AI</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {avatarStyles.filter(a => a.id !== 'none').map((av) => (
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
                    {isCustom && (
                        <div className="animate-fade-in">
                            <label className="label-text flex items-center gap-2">
                                <Camera className="w-4 h-4 text-purple-400" />
                                Upload Foto Wajah <span className="text-coral-500">*</span>
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
                            <input id="avatar-custom-face" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                        </div>
                    )}

                    {/* 3. Instruction */}
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
                        <p className="text-xs text-cream-400 mt-1">Deskripsikan gaya/pose yang kamu inginkan</p>
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
                            <><Sparkles className="w-5 h-5" /> Generate Avatar</>
                        )}
                    </button>
                </div>
            </div>
        </ToolLayout>
    );
}

