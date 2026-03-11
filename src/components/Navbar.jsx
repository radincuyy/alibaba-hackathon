import { useState, useEffect, useCallback, memo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { cn } from '../utils/cn';

const NAV_LINKS = [
    { hash: '#tools', label: 'Tools' },
    { hash: '#how-it-works', label: 'Cara Kerja' },
    { hash: '#cta', label: 'Tentang' },
];

function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const isHome = location.pathname === '/';

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    const handleNavClick = useCallback(
        (e, hash) => {
            e.preventDefault();
            setIsOpen(false);
            if (isHome) {
                const el = document.querySelector(hash);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
            } else {
                navigate('/' + hash);
            }
        },
        [isHome, navigate],
    );

    const toggleMenu = useCallback(() => setIsOpen((prev) => !prev), []);

    return (
        <nav
            aria-label="Navigasi utama"
            className={cn(
                'fixed z-50 transition-all duration-500',
                scrolled
                    ? 'top-4 left-6 right-6 bg-white/80 backdrop-blur-xl border border-cream-300/50 shadow-card rounded-2xl'
                    : 'top-0 left-0 right-0 bg-transparent',
            )}
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <img src="/logo.png" alt="" className="w-8 h-8 object-contain" aria-hidden="true" />
                        <span className="font-bold text-cream-900 tracking-tight text-lg">UMKM Kreator</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {NAV_LINKS.map(({ hash, label }) => (
                            <a
                                key={hash}
                                href={`/${hash}`}
                                onClick={(e) => handleNavClick(e, hash)}
                                className="btn-ghost text-sm"
                            >
                                {label}
                            </a>
                        ))}
                        <Link to="/generator" className="btn-primary text-sm ml-3">
                            Mulai Buat Konten
                        </Link>
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        type="button"
                        onClick={toggleMenu}
                        className="md:hidden p-2 rounded-xl hover:bg-cream-200/50 transition-colors cursor-pointer"
                        aria-label={isOpen ? 'Tutup menu' : 'Buka menu'}
                        aria-expanded={isOpen}
                        aria-controls="mobile-menu"
                    >
                        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div
                    id="mobile-menu"
                    className="md:hidden bg-white/95 backdrop-blur-xl border-t border-cream-300/50 rounded-b-2xl animate-slide-in"
                    role="menu"
                >
                    <div className="px-6 py-4 space-y-1">
                        {NAV_LINKS.map(({ hash, label }) => (
                            <a
                                key={hash}
                                href={`/${hash}`}
                                onClick={(e) => handleNavClick(e, hash)}
                                className="block px-4 py-3 rounded-xl hover:bg-cream-100 text-cream-700 hover:text-cream-900 transition-colors"
                                role="menuitem"
                            >
                                {label}
                            </a>
                        ))}
                        <Link
                            to="/generator"
                            onClick={() => setIsOpen(false)}
                            className="btn-accent w-full !mt-3 text-sm"
                            role="menuitem"
                        >
                            Mulai Buat Konten
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}

export default memo(Navbar);
