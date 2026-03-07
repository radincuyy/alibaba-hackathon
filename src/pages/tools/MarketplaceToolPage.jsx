import { useState } from 'react';
import { ShoppingBag, Loader2, Copy, Check, Package, ShoppingCart } from 'lucide-react';
import ToolLayout from '../../components/ToolLayout';
import ProductForm from '../../components/ProductForm';
import { generateMarketingContent } from '../../services/qwenApi';

export default function MarketplaceToolPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [textResult, setTextResult] = useState(null);
    const [error, setError] = useState(null);
    const [showResults, setShowResults] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = async (formData) => {
        setIsLoading(true);
        setShowResults(true);
        setTextResult(null);
        setError(null);
        try {
            const result = await generateMarketingContent(formData, 'shopee');
            if (result.success) {
                setTextResult(result.content);
            } else {
                setError(result.error);
            }
        } catch (e) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ToolLayout
            icon={ShoppingBag}
            title="Deskripsi Marketplace AI"
            description="Buat deskripsi produk SEO-friendly untuk marketplace"
            gradient="from-emerald-500 to-green-500"
            showResults={showResults}
            rightPanel={
                <div className="card p-6">
                    <h3 className="text-lg font-bold text-cream-900 mb-4 flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-emerald-400" /> Deskripsi Marketplace</h3>
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-cream-400">
                            <Loader2 className="w-10 h-10 animate-spin text-emerald-400 mb-3" />
                            <p className="text-sm">Generating deskripsi...</p>
                        </div>
                    ) : textResult ? (
                        <div>
                            <div className="bg-cream-50 rounded-xl p-4 text-cream-600 text-sm whitespace-pre-wrap leading-relaxed max-h-[60vh] overflow-y-auto">
                                {textResult}
                            </div>
                            <button onClick={() => handleCopy(textResult)} className="btn-primary w-full !py-3 mt-4">
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {copied ? 'Tersalin!' : 'Copy ke Clipboard'}
                            </button>
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
                    fields={{ image: false, price: true, target: true }}
                />
            </div>
        </ToolLayout>
    );
}

