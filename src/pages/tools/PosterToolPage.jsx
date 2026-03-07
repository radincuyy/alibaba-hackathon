import { useState } from 'react';
import { Image, Loader2, Download, Package, Palette } from 'lucide-react';
import ToolLayout from '../../components/ToolLayout';
import ProductForm from '../../components/ProductForm';
import { generateImagePrompt } from '../../services/qwenApi';
import { generateImage } from '../../services/wanApi';

export default function PosterToolPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [generatedImage, setGeneratedImage] = useState(null);
    const [error, setError] = useState(null);
    const [showResults, setShowResults] = useState(false);

    const handleSubmit = async (formData) => {
        setIsLoading(true);
        setShowResults(true);
        setGeneratedImage(null);
        setError(null);
        try {
            const promptResult = await generateImagePrompt(formData);
            if (promptResult.success) {
                const imageResult = await generateImage(promptResult.prompt);
                if (imageResult.success) {
                    setGeneratedImage(imageResult.imageUrl);
                } else {
                    setError(imageResult.error || 'Gagal generate poster');
                }
            } else {
                setError(promptResult.error);
            }
        } catch (e) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
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
                    <h3 className="text-lg font-bold text-cream-900 mb-4 flex items-center gap-2"><Palette className="w-5 h-5 text-blue-400" /> Poster AI</h3>
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-cream-400">
                            <Loader2 className="w-10 h-10 animate-spin text-blue-400 mb-3" />
                            <p className="text-sm">Generating poster...</p>
                        </div>
                    ) : generatedImage ? (
                        <div>
                            <img src={generatedImage} alt="Generated Poster" className="w-full rounded-xl" />
                            <a href={generatedImage} download="poster-ai.png" target="_blank" rel="noopener noreferrer" className="btn-primary w-full !py-3 mt-4">
                                <Download className="w-4 h-4" /> Download Poster
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
                <h2 className="text-lg font-semibold text-cream-900 flex items-center gap-2 mb-6"><Package className="w-5 h-5 text-brand-400" /> Detail Produk</h2>
                <ProductForm
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                    fields={{ image: true }}
                />
            </div>
        </ToolLayout>
    );
}

