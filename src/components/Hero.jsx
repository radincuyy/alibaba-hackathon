import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
    return (
        <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-20 pb-12">
            {/* Subtle background decoration */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-20 right-[15%] w-72 h-72 bg-accent/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-20 left-[10%] w-96 h-96 bg-accent/3 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full">
                <div className="max-w-5xl">
                    {/* Label */}
                    <div className="flex items-center gap-2 mb-8 opacity-0 animate-fade-up">
                        <span className="section-label text-accent">Powered by Qwen AI × Wan Model</span>
                    </div>

                    {/* Main Headline — Garden Eight inspired typography */}
                    <h1 className="display-hero mb-8 opacity-0 animate-fade-up stagger-1">
                        Konten Marketing<br />
                        yang <em>Menjual</em>
                    </h1>

                    {/* Subtitle */}
                    <p className="section-subtitle max-w-xl mb-10 opacity-0 animate-fade-up stagger-2">
                        Buat caption sosmed, poster produk, video promosi, dan deskripsi marketplace
                        semuanya dalam hitungan detik dengan AI.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row items-start gap-4 opacity-0 animate-fade-up stagger-3">
                        <Link to="/generator" className="btn-accent text-base !px-9 !py-4 group">
                            Mulai Buat Konten
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <a href="#how-it-works" className="btn-outline text-base">
                            Lihat Cara Kerja
                        </a>
                    </div>

                    {/* Stats row */}
                    <div className="flex flex-wrap gap-8 mt-16 pt-8 border-t border-cream-300/50 opacity-0 animate-fade-up stagger-4">
                        {[
                            { value: '64M+', label: 'UMKM Indonesia' },
                            { value: '<30s', label: 'Generate Konten' },
                            { value: '6', label: 'AI Tools' },
                            { value: '5+', label: 'Platform' },
                        ].map((stat, i) => (
                            <div key={i} className="text-left">
                                <div className="text-2xl md:text-3xl font-bold text-cream-900 font-display">{stat.value}</div>
                                <div className="text-sm text-cream-500 mt-0.5">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Horizontal Marquee — Garden Eight signature element */}
            <div className="mt-20 overflow-hidden opacity-0 animate-fade-up stagger-5">
                <div className="flex animate-marquee">
                    {[...Array(2)].map((_, setIdx) => (
                        <div key={setIdx} className="marquee-track">
                            {['CAPTION', 'POSTER', 'VIDEO', 'AVATAR', 'MARKETPLACE', 'STUDIO'].map((word, i) => (
                                <span key={i} className="text-[8vw] md:text-[6vw] font-display font-bold text-cream-300/40 select-none leading-none">
                                    {word}
                                    <span className="text-accent/20 mx-4">✦</span>
                                </span>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
