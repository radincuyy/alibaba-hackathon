import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from './Navbar';

function ToolLayout({ icon: Icon, title, description, gradient, children, rightPanel, showResults }) {
    return (
        <div className="min-h-screen bg-cream-100">
            <Navbar />

            <main className="pt-24 pb-20" aria-label={title}>
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    {/* Back link */}
                    <nav aria-label="Breadcrumb">
                        <Link
                            to="/generator"
                            className="inline-flex items-center gap-2 text-sm text-cream-500 hover:text-cream-900 transition-colors mb-6"
                        >
                            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                            Kembali ke AI Tools
                        </Link>
                    </nav>

                    {/* Header */}
                    <header className="flex items-center gap-4 mb-8">
                        {Icon && (
                            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient || 'from-accent to-accent-hover'} flex items-center justify-center`}>
                                <Icon className="w-5 h-5 text-white" aria-hidden="true" />
                            </div>
                        )}
                        <div>
                            <h1 className="text-2xl font-bold text-cream-900">{title}</h1>
                            {description && <p className="text-sm text-cream-500">{description}</p>}
                        </div>
                    </header>

                    {/* Content Grid */}
                    <div className={`grid gap-6 ${showResults
                        ? 'grid-cols-1 lg:grid-cols-5'
                        : 'grid-cols-1 lg:grid-cols-2'
                        }`}>
                        {/* Left Panel — Input */}
                        <section className={showResults ? 'lg:col-span-2' : 'lg:col-span-1'} aria-label="Input">
                            {children}
                        </section>

                        {/* Right Panel — Results */}
                        {rightPanel && (
                            <section className={showResults ? 'lg:col-span-3' : 'lg:col-span-1'} aria-label="Hasil">
                                {rightPanel}
                            </section>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default memo(ToolLayout);
