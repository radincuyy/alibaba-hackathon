import { useState, useEffect, useRef, useCallback } from 'react';
import { FileText, Package } from 'lucide-react';
import ToolLayout from '../../components/ToolLayout';
import ProductForm from '../../components/ProductForm';
import ResultTabs from '../../components/ResultTabs';
import { generateAllContent } from '../../services/qwenApi';

export default function CaptionToolPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [showResults, setShowResults] = useState(false);
    const abortControllerRef = useRef(null);

    // Cleanup on unmount — abort any in-flight requests
    useEffect(() => {
        return () => {
            abortControllerRef.current?.abort();
        };
    }, []);

    const handleSubmit = useCallback(async (formData) => {
        // Abort previous request if still running
        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setIsLoading(true);
        setShowResults(true);
        setResults(null);

        try {
            const allResults = await generateAllContent(formData, { signal: controller.signal });
            if (!controller.signal.aborted) {
                setResults(allResults);
            }
        } catch (e) {
            if (!controller.signal.aborted) {
                console.error('Caption generation error:', e);
            }
        } finally {
            if (!controller.signal.aborted) {
                setIsLoading(false);
            }
        }
    }, []);

    return (
        <ToolLayout
            icon={FileText}
            title="Caption & Konten AI"
            description="Generate caption 6 platform sosial media sekaligus"
            gradient="from-orange-500 to-amber-500"
            showResults={showResults}
            rightPanel={
                <ResultTabs
                    results={results}
                    isLoading={isLoading}
                    isAvatarLoading={false}
                    onRegenerate={null}
                    hasAvatar={false}
                />
            }
        >
            <div className="card p-6 md:p-8 sticky top-24">
                <h2 className="text-lg font-semibold text-cream-900 flex items-center gap-2 mb-6">
                    <Package className="w-5 h-5 text-brand-400" aria-hidden="true" /> Detail Produk
                </h2>
                <ProductForm
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                    fields={{ image: false, price: true, target: false }}
                />
            </div>
        </ToolLayout>
    );
}
