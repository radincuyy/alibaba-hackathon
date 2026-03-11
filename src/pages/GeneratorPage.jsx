import { Link } from 'react-router-dom';
import {
    ArrowLeft, FileText, Image, UserCircle, Video,
    Film, ShoppingBag, ArrowUpRight
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const tools = [
    {
        id: 'caption',
        icon: FileText,
        title: 'Caption & Konten AI',
        subtitle: 'Multi-Platform Generator',
        description: 'Generate caption Instagram, deskripsi Shopee, script TikTok, broadcast WhatsApp, thread X, dan postingan Facebook sekaligus.',
        tags: ['Instagram', 'Shopee', 'TikTok', 'WhatsApp', 'X', 'Facebook'],
        color: 'bg-amber-500',
        link: '/generator/caption',
    },
    {
        id: 'poster',
        icon: Image,
        title: 'Poster Produk AI',
        subtitle: 'Image Generator',
        description: 'Buat poster produk profesional dengan AI. Cukup deskripsikan poster yang kamu inginkan, upload foto produk, dan AI akan membuatkannya.',
        tags: ['Qwen Image 2.0 Pro', 'Feed IG', 'Banner'],
        color: 'bg-blue-500',
        link: '/generator/poster',
    },
    {
        id: 'avatar',
        icon: UserCircle,
        title: 'Avatar Produk AI',
        subtitle: 'AI Model Generator',
        description: 'Buat avatar AI yang memegang dan mempromosikan produkmu. Bisa pakai wajah sendiri atau pilih karakter preset.',
        tags: ['Custom Face', 'Preset Avatar', 'Brand Ambassador'],
        color: 'bg-violet-500',
        link: '/generator/avatar',
    },
    {
        id: 'video',
        icon: Video,
        title: 'Video Promosi AI',
        subtitle: 'Video Generator',
        description: 'Generate video promosi produk secara otomatis dari gambar atau avatar. Lengkap dengan audio dan gerakan natural.',
        tags: ['Reels', 'Shorts', 'TikTok'],
        color: 'bg-rose-500',
        link: '/generator/video',
    },
    {
        id: 'marketplace',
        icon: ShoppingBag,
        title: 'Deskripsi Marketplace AI',
        subtitle: 'Shopee & Tokopedia',
        description: 'Generate deskripsi produk SEO-friendly untuk marketplace. Otomatis format judul, bullet points, dan spesifikasi.',
        tags: ['Shopee', 'Tokopedia', 'Lazada'],
        color: 'bg-emerald-500',
        link: '/generator/marketplace',
    },
    {
        id: 'r2v-studio',
        icon: Film,
        title: 'Avatar Video Studio AI',
        subtitle: 'R2V Generator',
        description: 'Upload foto/video wajahmu dan buat video dimana avatar AI bergerak dan berbicara mempromosikan produk.',
        tags: ['Face Swap', 'Talking Head', 'R2V'],
        color: 'bg-fuchsia-500',
        link: '/generator/r2v-studio',
    },
];

export default function GeneratorPage() {
    return (
        <div className="min-h-screen bg-cream-100">
            <Navbar />

            <main className="pt-28 pb-20" aria-label="AI Tools Generator">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    {/* Back link */}
                    <nav aria-label="Breadcrumb">
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 text-sm text-cream-500 hover:text-cream-900 transition-colors mb-8"
                        >
                            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                            Kembali ke Home
                        </Link>
                    </nav>

                    {/* Header */}
                    <header className="mb-14 max-w-2xl">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="section-label text-accent">Powered by Qwen AI & Wan 2.6</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-cream-900 mb-4 leading-tight">
                            AI Tools untuk{' '}
                            <span className="font-display italic text-accent">UMKM</span>
                        </h1>
                        <p className="section-subtitle">
                            Pilih tools AI yang kamu butuhkan untuk membuat konten marketing profesional.
                        </p>
                    </header>

                    {/* Tool Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5" role="list">
                        {tools.map((tool, i) => (
                            <Link
                                key={tool.id}
                                to={tool.link}
                                className="card-hover p-6 md:p-8 group opacity-0 animate-fade-up"
                                style={{ animationDelay: `${i * 0.08}s` }}
                                role="listitem"
                                aria-label={`${tool.title} — ${tool.description}`}
                            >
                                <div className="flex items-start justify-between mb-5">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl ${tool.color} flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                                            <tool.icon className="w-5 h-5 text-white" aria-hidden="true" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-cream-900 group-hover:text-accent transition-colors">{tool.title}</h3>
                                            <p className="text-xs text-cream-500">{tool.subtitle}</p>
                                        </div>
                                    </div>
                                    <ArrowUpRight className="w-5 h-5 text-cream-400 group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" aria-hidden="true" />
                                </div>

                                <p className="text-sm text-cream-600 leading-relaxed mb-5">
                                    {tool.description}
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    {tool.tags.map((tag, j) => (
                                        <span key={j} className="tag text-[10px]">{tag}</span>
                                    ))}
                                </div>
                            </Link>
                        ))}
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}
