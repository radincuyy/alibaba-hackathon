import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Image, Loader2, Package, Palette, Sparkles, Download, RotateCcw, ImageIcon } from 'lucide-react';
import ToolLayout from '../../components/ToolLayout';
import ImageUploader from '../../components/ui/ImageUploader';
import TemplateGrid from '../../components/ui/TemplateGrid';
import SubmitButton from '../../components/ui/SubmitButton';
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

export default function PosterToolPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showResults, setShowResults] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [productImage, setProductImage] = useState(null);
    const [generatedImage, setGeneratedImage] = useState(null);
    const abortControllerRef = useRef(null);

    const templates = useMemo(
        () => (productImage ? PHOTO_TEMPLATES : TEXT_TEMPLATES),
        [productImage],
    );

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            abortControllerRef.current?.abort();
        };
    }, []);

    const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) return;

        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setIsLoading(true);
        setShowResults(true);
        setError(null);
        setGeneratedImage(null);

        try {
            const enhancedPrompt = `${prompt.trim()}. Iklan produk profesional, kualitas tinggi, warna cerah, desain modern.`;
            const result = await generatePosterImage(enhancedPrompt, productImage || null, { signal: controller.signal });

            if (!controller.signal.aborted) {
                if (result.success) {
                    setGeneratedImage(result.imageUrl);
                } else {
                    setError(result.error || 'Gagal generate poster');
                }
            }
        } catch (e) {
            if (!controller.signal.aborted) {
                setError(e.message);
            }
        } finally {
            if (!controller.signal.aborted) {
                setIsLoading(false);
            }
        }
    }, [prompt, productImage]);

    const handleReset = useCallback(() => {
        setShowResults(false);
        setGeneratedImage(null);
        setError(null);
    }, []);

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
                        <Palette className="w-5 h-5 text-blue-400" aria-hidden="true" /> Hasil Poster
                    </h3>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-cream-400" role="status">
                            <Loader2 className="w-10 h-10 animate-spin text-blue-400 mb-3" aria-hidden="true" />
                            <p className="text-sm font-medium">Generating poster...</p>
                            <p className="text-xs text-cream-300 mt-1">Proses ini memakan waktu 30-60 detik</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center" role="alert">
                            <p className="text-red-600 text-sm">{error}</p>
                            <button type="button" onClick={handleReset} className="btn-outline !py-2 !px-4 mt-3 !text-xs">
                                Coba Lagi
                            </button>
                        </div>
                    ) : generatedImage ? (
                        <div>
                            <img src={generatedImage} alt="Generated Poster" className="w-full rounded-xl" />
                            <div className="flex gap-3 mt-4">
                                <a href={generatedImage} download="poster-ai.png" target="_blank" rel="noopener noreferrer" className="btn-accent flex-1 !py-3">
                                    <Download className="w-4 h-4" aria-hidden="true" /> Download
                                </a>
                                <button type="button" onClick={handleReset} className="btn-outline !py-3 !px-4" title="Generate ulang" aria-label="Generate ulang">
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
                    <Package className="w-5 h-5 text-brand-400" aria-hidden="true" /> Buat Poster
                </h2>

                <div className="space-y-5">
                    {/* Photo Upload */}
                    <ImageUploader
                        value={productImage}
                        onChange={setProductImage}
                        label="Foto Produk (opsional)"
                        labelIcon={ImageIcon}
                        emptyText="Klik untuk upload foto produk"
                        emptySubtext="AI akan menggunakan foto ini dalam poster"
                        emptyIcon={ImageIcon}
                        previewHeight="h-40"
                    />

                    {/* Prompt */}
                    <div>
                        <label className="label-text flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-accent" aria-hidden="true" />
                            Deskripsi Poster <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            className="textarea-field"
                            rows={4}
                            placeholder={
                                productImage
                                    ? 'Deskripsikan poster yang ingin dibuat dari foto ini...'
                                    : 'Deskripsikan poster yang ingin kamu buat...'
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
                        heading={productImage ? 'Template untuk foto produk:' : 'Template tanpa foto:'}
                    />

                    {/* Generate Button */}
                    <SubmitButton
                        isLoading={isLoading}
                        disabled={!prompt.trim()}
                        onClick={handleGenerate}
                        label="Generate Poster"
                    />
                </div>
            </div>
        </ToolLayout>
    );
}
