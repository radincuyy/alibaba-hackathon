import { Link } from 'react-router-dom';
import { PenTool, Image, UserCircle, Video, ShoppingBag, Film, ArrowUpRight } from 'lucide-react';

const tools = [
    {
        icon: PenTool,
        title: 'Caption & Konten',
        description: 'Generate caption Instagram, deskripsi Shopee, script TikTok, broadcast WhatsApp, thread X, dan postingan Facebook.',
        tag: 'Qwen AI',
        color: 'bg-amber-500',
        link: '/generator/caption',
    },
    {
        icon: Image,
        title: 'Poster Produk',
        description: 'Buat poster produk profesional dengan deskripsi dan foto. AI generate visual eye-catching otomatis.',
        tag: 'Qwen Image 2.0 Pro',
        color: 'bg-blue-500',
        link: '/generator/poster',
    },
    {
        icon: UserCircle,
        title: 'Avatar Produk',
        description: 'Buat avatar virtual yang mengiklankan produkmu. Pakai wajah sendiri atau karakter AI preset.',
        tag: 'Qwen VL',
        color: 'bg-violet-500',
        link: '/generator/avatar',
    },
    {
        icon: Video,
        title: 'Video Promosi',
        description: 'Generate video promosi pendek dari foto produk atau avatar. Atur resolusi, durasi, dan audio.',
        tag: 'Wan I2V',
        color: 'bg-rose-500',
        link: '/generator/video',
    },
    {
        icon: ShoppingBag,
        title: 'Deskripsi Marketplace',
        description: 'Buat deskripsi SEO-friendly untuk Shopee, Tokopedia, dan Lazada.',
        tag: 'Shopee & Tokped',
        color: 'bg-emerald-500',
        link: '/generator/marketplace',
    },
    {
        icon: Film,
        title: 'Avatar Video Studio',
        description: 'Upload foto/video wajahmu dan buat video dimana avatar AI bergerak dan berbicara mempromosikan produk.',
        tag: 'R2V',
        color: 'bg-fuchsia-500',
        link: '/generator/r2v-studio',
    },
];

export default function Features() {
    return (
        <section id="tools" className="relative py-24 md:py-32">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                {/* Section Header */}
                <div className="mb-16 max-w-2xl">
                    <span className="section-label text-accent mb-4 block">AI Tools</span>
                    <h2 className="section-title mb-4 text-balance">
                        Semua yang UMKM<br />
                        <span className="font-display italic text-accent">Butuhkan</span>
                    </h2>
                    <p className="section-subtitle">
                        Tools AI lengkap untuk membuat konten marketing profesional — dari copywriting, poster visual, hingga video promo.
                    </p>
                </div>

                {/* Tools Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                    {tools.map((tool, i) => (
                        <Link
                            key={i}
                            to={tool.link}
                            className="card-hover p-6 md:p-8 group opacity-0 animate-fade-up"
                            style={{ animationDelay: `${i * 0.1}s` }}
                        >
                            <div className="flex items-start justify-between mb-5">
                                <div className={`w-12 h-12 rounded-2xl ${tool.color} flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                                    <tool.icon className="w-5 h-5 text-white" />
                                </div>
                                <ArrowUpRight className="w-5 h-5 text-cream-400 group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
                            </div>

                            <div className="mb-3">
                                <span className="tag-accent text-[10px]">{tool.tag}</span>
                            </div>

                            <h3 className="text-lg font-bold text-cream-900 mb-2 group-hover:text-accent transition-colors duration-300">
                                {tool.title} AI
                            </h3>

                            <p className="text-sm text-cream-600 leading-relaxed">
                                {tool.description}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
