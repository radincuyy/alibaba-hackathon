import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const isHome = location.pathname === '/';

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleNavClick = (e, hash) => {
        e.preventDefault();
        setIsOpen(false);
        if (isHome) {
            // Already on home, just scroll
            const el = document.querySelector(hash);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        } else {
            // Navigate to home + hash
            navigate('/' + hash);
        }
    };

    return (
        <nav
            className={`fixed z-50 transition-all duration-500 ${scrolled
                ? 'top-4 left-6 right-6 bg-white/80 backdrop-blur-xl border border-cream-300/50 shadow-card rounded-2xl'
                : 'top-0 left-0 right-0 bg-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <img src="/logo.png" alt="UMKM Kreator" className="w-8 h-8 object-contain" />
                        <span className="font-bold text-cream-900 tracking-tight text-lg">UMKM Kreator</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        <a href="/#tools" onClick={(e) => handleNavClick(e, '#tools')} className="btn-ghost text-sm">Tools</a>
                        <a href="/#how-it-works" onClick={(e) => handleNavClick(e, '#how-it-works')} className="btn-ghost text-sm">Cara Kerja</a>
                        <a href="/#cta" onClick={(e) => handleNavClick(e, '#cta')} className="btn-ghost text-sm">Tentang</a>
                        <Link to="/generator" className="btn-primary text-sm ml-3">
                            Mulai Buat Konten
                        </Link>
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2 rounded-xl hover:bg-cream-200/50 transition-colors cursor-pointer"
                        aria-label="Toggle menu"
                    >
                        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-cream-300/50 rounded-b-2xl animate-slide-in">
                    <div className="px-6 py-4 space-y-1">
                        <a href="/#tools" onClick={(e) => handleNavClick(e, '#tools')} className="block px-4 py-3 rounded-xl hover:bg-cream-100 text-cream-700 hover:text-cream-900 transition-colors">Tools</a>
                        <a href="/#how-it-works" onClick={(e) => handleNavClick(e, '#how-it-works')} className="block px-4 py-3 rounded-xl hover:bg-cream-100 text-cream-700 hover:text-cream-900 transition-colors">Cara Kerja</a>
                        <a href="/#cta" onClick={(e) => handleNavClick(e, '#cta')} className="block px-4 py-3 rounded-xl hover:bg-cream-100 text-cream-700 hover:text-cream-900 transition-colors">Tentang</a>
                        <Link to="/generator" onClick={() => setIsOpen(false)} className="btn-accent w-full !mt-3 text-sm">
                            Mulai Buat Konten
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
