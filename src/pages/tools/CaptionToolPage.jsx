import { useState } from 'react';
import { FileText, Package } from 'lucide-react';
import ToolLayout from '../../components/ToolLayout';
import ProductFormSimple from '../../components/ProductFormSimple';
import ResultTabs from '../../components/ResultTabs';
import { generateAllContent } from '../../services/qwenApi';

export default function CaptionToolPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [showResults, setShowResults] = useState(false);

    const handleSubmit = async (formData) => {
        setIsLoading(true);
        setShowResults(true);
        setResults(null);
        try {
            const allResults = await generateAllContent(formData);
            setResults(allResults);
        } catch (e) {
            console.error('Caption generation error:', e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ToolLayout
            icon={FileText}
            title="Caption & Konten AI"
            description="Generate caption 5 platform sosial media sekaligus"
            gradient="from-orange-500 to-amber-500"
            showResults={showResults}
            rightPanel={
                <ResultTabs
                    results={results}
                    isLoading={isLoading}
                    isImageLoading={false}
                    isVideoLoading={false}
                    isAvatarLoading={false}
                    onRegenerate={() => { }}
                    hasAvatar={false}
                />
            }
        >
            <div className="card p-6 md:p-8 sticky top-24">
                <h2 className="text-lg font-semibold text-cream-900 flex items-center gap-2 mb-6"><Package className="w-5 h-5 text-brand-400" /> Detail Produk</h2>
                <ProductFormSimple
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                    fields={{ image: false, price: true, target: true }}
                />
            </div>
        </ToolLayout>
    );
}

