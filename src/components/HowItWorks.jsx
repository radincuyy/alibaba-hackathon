import { memo } from 'react';
import { FileText, Sparkles, Rocket } from 'lucide-react';

const steps = [
    {
        number: '01',
        title: 'Masukkan Produk',
        description: 'Isi nama produk, deskripsi singkat, dan upload foto. Cukup 30 detik — AI mengurus sisanya.',
        icon: FileText,
    },
    {
        number: '02',
        title: 'AI Generate Konten',
        description: 'Qwen AI + Wan Model memproses inputmu dan menghasilkan caption, poster, video, dan deskripsi marketplace secara otomatis.',
        icon: Sparkles,
    },
    {
        number: '03',
        title: 'Posting & Jualan',
        description: 'Download hasil dan langsung posting ke Instagram, Shopee, TikTok, WhatsApp, dan platform lainnya.',
        icon: Rocket,
    },
];

function HowItWorks() {
    return (
        <section id="how-it-works" className="relative py-24 md:py-32" aria-label="Cara Kerja">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                {/* Section Header */}
                <div className="mb-20 max-w-2xl">
                    <span className="section-label text-accent mb-4 block">Cara Kerja</span>
                    <h2 className="section-title mb-4">
                        Semudah <span className="font-display italic text-accent">1, 2, 3</span>
                    </h2>
                    <p className="section-subtitle">
                        Tidak perlu skill desain atau copywriting. Tinggal input, generate, posting.
                    </p>
                </div>

                {/* Steps — Semantic ordered list with editorial layout */}
                <ol className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 list-none p-0 m-0">
                    {steps.map((step, i) => (
                        <li
                            key={i}
                            className="relative group opacity-0 animate-fade-up"
                            style={{ animationDelay: `${i * 0.15}s` }}
                        >
                            {/* Big number */}
                            <div className="text-[7rem] md:text-[8rem] font-display font-bold text-cream-200 leading-none select-none mb-[-2rem] relative z-0" aria-hidden="true">
                                {step.number}
                            </div>

                            {/* Content */}
                            <div className="relative z-10 pl-2">
                                <div className="w-11 h-11 rounded-xl bg-cream-900 flex items-center justify-center mb-4 group-hover:bg-accent transition-colors duration-300">
                                    <step.icon className="w-5 h-5 text-cream-50" aria-hidden="true" />
                                </div>

                                <h3 className="text-xl font-bold text-cream-900 mb-3">
                                    {step.title}
                                </h3>

                                <p className="text-cream-600 leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}

export default memo(HowItWorks);
