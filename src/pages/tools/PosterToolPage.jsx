import { useState, useRef } from 'react';
import { Image, Loader2, Package, Palette, Sparkles, Download, RotateCcw, Upload, X, ImageIcon } from 'lucide-react';
import ToolLayout from '../../components/ToolLayout';
import { generatePosterImage } from '../../services/wanApi';

const PHOTO_TEMPLATES = [
    { label: 'Poster Promosi', prompt: 'Buatkan poster promosi produk ini yang eye-catching dan profesional, cocok untuk feed Instagram' },
    { label: 'Diskon / Sale', prompt: 'Buat poster sale/diskon produk ini dengan nuansa merah dan kuning yang mencolok, berikan kesan urgensi' },
    { label: 'Elegant & Premium', prompt: 'Buat poster elegand dan premium untuk produk ini dengan background gelap, pencahayaan dramatis, dan nuansa mewah' },
    { label: 'Natural & Fresh', prompt: 'Buat poster bernuansa natural dan segar untuk produk ini, gunakan warna hijau dan elemen alam' },
    { label: 'Playful & Colorful', prompt: 'Buat poster yang playful dan colorful untuk produk ini, cocok untuk target audience anak muda' },
    { label: 'Story / Reels', prompt: 'Buat poster vertikal untuk Instagram Story/Reels yang menarik dan modern untuk produk ini' },
];

const TEXT_TEMPLATES = [
    { label: 'Minuman', prompt: 'Poster promosi minuman dengan gelas minuman yang mengepul, latar belakang coklat hangat, suasana kedai kopi cozy' },
    { label: 'Makanan', prompt: 'Poster produk makanan pedas dengan latar merah menyala, cabai segar, dan percikan saus yang dramatis' },
    { label: 'Skincare', prompt: 'Poster produk skincare minimalis dengan nuansa pink pastel, botol produk yang elegan, dan kelopak bunga' },
    { label: 'Fashion', prompt: 'Poster fashion streetwear dengan gaya urban modern, background grafiti, dan pencahayaan neon' },
    { label: 'Snack', prompt: 'Poster makanan ringan dengan warna-warna cerah dan playful, serpihan snack yang beterbangan' },
    { label: 'Herbal', prompt: 'Poster produk herbal dengan nuansa hijau alami, daun-daun segar, dan tetesan air yang berkilau' },
];

const ensureMinImageSize = (base64, minSize = 512) => {
    return new Promise((resolve) => {
        const img = new window.Image();
        img.onload = () => {
            const { width, height } = img;
            if (width >= minSize && height >= minSize) { resolve(base64); return; }
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
};

export default function PosterToolPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showResults, setShowResults] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [productImage, setProductImage] = useState(null);
    const [generatedImage, setGeneratedImage] = useState(null);
    const fileInputRef = useRef(null);

    const templates = productImage ? PHOTO_TEMPLATES : TEXT_TEMPLATES;

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (ev) => setProductImage(await ensureMinImageSize(ev.target.result));
        reader.readAsDataURL(file);
    };

    const clearImage = () => {
        setProductImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        setShowResults(true);
        setError(null);
        setGeneratedImage(null);

        try {
            let result;

            const enhancedPrompt = `${prompt.trim()}. Iklan produk profesional, kualitas tinggi, warna cerah, desain modern.`;

            // Use qwen-image-2.0-pro (handles both with/without photo)
            result = await generatePosterImage(enhancedPrompt, productImage || null);

            if (result.success) {
                setGeneratedImage(result.imageUrl);
            } else {
                setError(result.error || 'Gagal generate poster');
            }
        } catch (e) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setShowResults(false);
        setGeneratedImage(null);
        setError(null);
    };

    return (
        <ToolLayout
            icon={Image}
            title="Poster Produk AI"
            description="Buat poster produk profesional dengan AI"
            gradient="from-blue-500 to-cyan-500"
            showResults={showResults}
            rightPanel={
                <div className="card p-6">
                    <h3 className="text-lg font-bold text-cream-900 mb-4 flex items-center gap-2">
                        <Palette className="w-5 h-5 text-blue-400" /> Hasil Poster
                    </h3>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-cream-400">
                            <Loader2 className="w-10 h-10 animate-spin text-blue-400 mb-3" />
                            <p className="text-sm font-medium">Generating poster...</p>
                            <p className="text-xs text-cream-300 mt-1">Proses ini memakan waktu 30-60 detik</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                            <p className="text-red-600 text-sm">{error}</p>
                            <button onClick={handleReset} className="btn-outline !py-2 !px-4 mt-3 !text-xs">Coba Lagi</button>
                        </div>
                    ) : generatedImage ? (
                        <div>
                            <img src={generatedImage} alt="Generated Poster" className="w-full rounded-xl" />
                            <div className="flex gap-3 mt-4">
                                <a href={generatedImage} download="poster-ai.png" target="_blank" rel="noopener noreferrer" className="btn-accent flex-1 !py-3">
                                    <Download className="w-4 h-4" /> Download
                                </a>
                                <button onClick={handleReset} className="btn-outline !py-3 !px-4" title="Generate ulang">
                                    <RotateCcw className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ) : null}
                </div>
            }
        >
            <div className="card p-6 md:p-8 sticky top-24">
                <h2 className="text-lg font-semibold text-cream-900 flex items-center gap-2 mb-6">
                    <Package className="w-5 h-5 text-brand-400" /> Buat Poster
                </h2>

                <div className="space-y-5">
                    {/* Photo Upload */}
                    <div>
                        <label className="label-text flex items-center gap-2">
                            <Upload className="w-4 h-4 text-accent" />
                            Foto Produk (opsional)
                        </label>
                        <div
                            className="border-2 border-dashed border-cream-300 rounded-xl hover:border-accent/30 transition-colors cursor-pointer overflow-hidden"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {productImage ? (
                                <div className="relative group">
                                    <img src={productImage} alt="Preview" className="w-full h-40 object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-sm text-white font-medium">Klik untuk ganti</span>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); clearImage(); }}
                                        className="absolute top-2 right-2 w-7 h-7 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center transition-colors"
                                    >
                                        <X className="w-4 h-4 text-white" />
                                    </button>
                                </div>
                            ) : (
                                <div className="h-28 flex flex-col items-center justify-center text-cream-400">
                                    <ImageIcon className="w-8 h-8 mb-2" />
                                    <span className="text-sm">Klik untuk upload foto produk</span>
                                    <span className="text-xs text-cream-300 mt-0.5">AI akan menggunakan foto ini dalam poster</span>
                                </div>
                            )}
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </div>

                    {/* Prompt */}
                    <div>
                        <label className="label-text flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-accent" />
                            Deskripsi Poster <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            className="textarea-field"
                            rows={4}
                            placeholder={productImage
                                ? 'Deskripsikan poster yang ingin dibuat dari foto ini...'
                                : 'Deskripsikan poster yang ingin kamu buat...'
                            }
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                        />
                    </div>

                    {/* Template Prompts */}
                    <div>
                        <p className="text-xs text-cream-400 mb-2 flex items-center gap-1">
                            💡 {productImage ? 'Template untuk foto produk:' : 'Template tanpa foto:'}
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

                    {/* Generate Button */}
                    <button
                        className="btn-primary w-full !py-4"
                        disabled={!prompt.trim() || isLoading}
                        onClick={handleGenerate}
                    >
                        {isLoading ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</>
                        ) : (
                            <><Sparkles className="w-5 h-5" /> Generate Poster</>
                        )}
                    </button>
                </div>
            </div>
        </ToolLayout>
    );
}
