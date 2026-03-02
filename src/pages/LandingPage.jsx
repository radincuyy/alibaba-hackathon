import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import Footer from '../components/Footer';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-cream-100">
            <Navbar />
            <Hero />

            {/* Divider */}
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="divider" />
            </div>

            <Features />

            {/* Divider */}
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="divider" />
            </div>

            <HowItWorks />

            {/* CTA Section */}
            <section id="cta" className="py-24 md:py-32">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="card bg-cream-900 text-cream-50 p-10 md:p-16 lg:p-20 text-center relative overflow-hidden">
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-80 h-80 bg-accent/10 rounded-full blur-[100px]" />
                        <div className="absolute bottom-0 left-0 w-60 h-60 bg-accent/5 rounded-full blur-[80px]" />

                        <div className="relative z-10">
                            <span className="section-label text-accent mb-6 block">Mulai Sekarang</span>
                            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                                Siap Buat Konten<br />
                                <span className="font-display italic text-accent">Profesional?</span>
                            </h2>
                            <p className="text-cream-400 text-lg max-w-lg mx-auto mb-10 leading-relaxed">
                                Bergabung dengan jutaan UMKM Indonesia yang sudah menggunakan AI untuk marketing mereka.
                            </p>
                            <Link to="/generator" className="btn-accent text-base !px-10 !py-4 group">
                                Mulai Buat Konten — Gratis
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
