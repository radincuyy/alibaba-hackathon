import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from './Navbar';

export default function ToolLayout({ icon: Icon, title, description, gradient, children, rightPanel, showResults }) {
    return (
        <div className="min-h-screen bg-cream-100">
            <Navbar />

            <main className="pt-24 pb-20">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    {/* Back link */}
                    <Link
                        to="/generator"
                        className="inline-flex items-center gap-2 text-sm text-cream-500 hover:text-cream-900 transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Kembali ke AI Tools
                    </Link>

                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        {Icon && (
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient || 'from-accent to-accent-hover'} flex items-center justify-center`}>
                                <Icon className="w-5 h-5 text-white" />
                            </div>
                        )}
                        <div>
                            <h1 className="text-2xl font-bold text-cream-900">{title}</h1>
                            {description && <p className="text-sm text-cream-500">{description}</p>}
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className={`grid gap-6 ${showResults
                        ? 'grid-cols-1 lg:grid-cols-5'
                        : 'grid-cols-1 lg:grid-cols-2'
                        }`}>
                        {/* Left Panel — Input */}
                        <div className={showResults ? 'lg:col-span-2' : 'lg:col-span-1'}>
                            {children}
                        </div>

                        {/* Right Panel — Results */}
                        {rightPanel && (
                            <div className={showResults ? 'lg:col-span-3' : 'lg:col-span-1'}>
                                {rightPanel}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
