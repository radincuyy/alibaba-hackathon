import { memo } from 'react';
import { ExternalLink } from 'lucide-react';

const platforms = ['Instagram', 'Shopee / Tokopedia', 'TikTok', 'WhatsApp', 'Twitter / X'];

const poweredBy = [
    { name: 'Qwen AI (Alibaba Cloud)', url: 'https://qwen.ai' },
    { name: 'Wan Model', url: 'https://wanx.aliyun.com' },
    { name: 'Vite + React', url: 'https://vitejs.dev' },
];

function Footer() {
    return (
        <footer className="border-t border-cream-300/50">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 md:py-20">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
                    {/* Brand */}
                    <div className="md:col-span-5">
                        <div className="flex items-center gap-2.5 mb-4">
                            <img src="/logo.png" alt="UMKM Kreator" className="w-8 h-8 object-contain" />
                            <span className="font-bold text-cream-900 text-lg">UMKM Kreator</span>
                        </div>
                        <p className="text-cream-500 text-sm max-w-xs leading-relaxed">
                            AI-powered marketing content generator untuk membantu 64 juta UMKM Indonesia go digital.
                        </p>
                    </div>

                    {/* Platform */}
                    <nav className="md:col-span-3" aria-label="Platform yang didukung">
                        <h4 className="section-label mb-4">Platform</h4>
                        <ul className="space-y-2.5">
                            {platforms.map((item) => (
                                <li key={item}>
                                    <span className="text-sm text-cream-600 hover:text-cream-900 transition-colors cursor-default">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Powered By */}
                    <nav className="md:col-span-4" aria-label="Powered by">
                        <h4 className="section-label mb-4">Powered By</h4>
                        <ul className="space-y-2.5">
                            {poweredBy.map((item) => (
                                <li key={item.name}>
                                    <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-cream-600 hover:text-accent transition-colors inline-flex items-center gap-1.5"
                                    >
                                        {item.name}
                                        <ExternalLink className="w-3 h-3" aria-hidden="true" />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>

                {/* Bottom bar */}
                <div className="mt-16 pt-6 border-t border-cream-300/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-cream-400">
                        © 2025 UMKM Kreator. Built for Alibaba Cloud × Qoder Hackathon.
                    </p>
                    <p className="text-xs text-cream-400">
                        Made with ❤️ in Indonesia
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default memo(Footer);
