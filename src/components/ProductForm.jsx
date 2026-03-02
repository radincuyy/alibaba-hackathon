import { useState } from 'react';
import { Package, Tag, DollarSign, Star, Users, Sparkles, ArrowLeft, ArrowRight, Loader2, Upload, UserCircle, Camera, X } from 'lucide-react';

const categories = [
    'Makanan & Minuman',
    'Fashion & Aksesoris',
    'Kecantikan & Skincare',
    'Elektronik & Gadget',
    'Rumah Tangga',
    'Kesehatan',
    'Kerajinan & Handmade',
    'Pertanian',
    'Jasa & Layanan',
    'Lainnya',
];

const avatarStyles = [
    {
        id: 'none',
        label: 'Tanpa Avatar',
        emoji: '🚫',
        description: 'Poster produk saja',
    },
    {
        id: 'custom',
        label: 'Upload Foto Sendiri',
        emoji: '📸',
        description: 'Pakai wajahmu sendiri!',
        prompt: 'The person shown in the reference photo',
    },
    {
        id: 'woman-professional',
        label: 'Wanita Profesional',
        emoji: '👩‍💼',
        description: 'Presenter wanita dewasa',
        prompt: 'A professional Indonesian woman in her 30s, wearing a modern business casual outfit, warm confident smile, clean makeup',
    },
    {
        id: 'man-professional',
        label: 'Pria Profesional',
        emoji: '👨‍💼',
        description: 'Presenter pria dewasa',
        prompt: 'A professional Indonesian man in his 30s, wearing a smart casual shirt, friendly confident smile, well-groomed',
    },
    {
        id: 'woman-young',
        label: 'Influencer Wanita',
        emoji: '💁‍♀️',
        description: 'Style content creator muda',
        prompt: 'A young trendy Indonesian woman in her 20s, stylish casual outfit, energetic pose, bright smile, influencer-style',
    },
    {
        id: 'man-young',
        label: 'Content Creator Pria',
        emoji: '🧑‍🎤',
        description: 'Style creator pria muda',
        prompt: 'A young trendy Indonesian man in his 20s, casual streetwear, dynamic pose, confident smile, content creator style',
    },
    {
        id: 'hijab',
        label: 'Wanita Hijab',
        emoji: '🧕',
        description: 'Presenter wanita berhijab',
        prompt: 'A beautiful Indonesian woman wearing a stylish hijab, modern modest fashion, warm genuine smile, professional yet approachable',
    },
    {
        id: 'cartoon',
        label: 'Kartun / Maskot',
        emoji: '🤖',
        description: 'Karakter kartun lucu',
        prompt: 'A cute friendly cartoon mascot character, chibi style, big expressive eyes, adorable and appealing, Pixar-quality 3D render style',
    },
];

export default function ProductForm({ onSubmit, isLoading, showImage = true, showAvatar = true, showPrice = true, showTarget = true, toolId }) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: '',
        description: '',
        target: '',
        imageFile: null,
        imagePreview: null,
        avatarStyle: 'none',
        customAvatarFile: null,
        customAvatarPreview: null,
    });

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    /**
     * Ensure image meets minimum size requirement for wan2.6-image (min 240px)
     * Uses Canvas to resize if needed
     */
    const ensureMinImageSize = (base64, minSize = 512) => {
        return new Promise((resolve) => {
            const img = new window.Image();
            img.onload = () => {
                const { width, height } = img;
                if (width >= minSize && height >= minSize) {
                    resolve(base64); // Already big enough
                    return;
                }
                // Scale up to meet minimum
                const scale = Math.max(minSize / width, minSize / height);
                const newWidth = Math.round(width * scale);
                const newHeight = Math.round(height * scale);
                const canvas = document.createElement('canvas');
                canvas.width = newWidth;
                canvas.height = newHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, newWidth, newHeight);
                resolve(canvas.toDataURL('image/jpeg', 0.95));
            };
            img.onerror = () => resolve(base64); // fallback to original
            img.src = base64;
        });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            updateField('imageFile', file);
            const reader = new FileReader();
            reader.onload = async (ev) => {
                const resized = await ensureMinImageSize(ev.target.result);
                updateField('imagePreview', resized);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCustomAvatarUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            updateField('customAvatarFile', file);
            const reader = new FileReader();
            reader.onload = async (ev) => {
                const resized = await ensureMinImageSize(ev.target.result);
                updateField('customAvatarPreview', resized);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearCustomAvatar = () => {
        updateField('customAvatarFile', null);
        updateField('customAvatarPreview', null);
        // Reset the file input
        const input = document.getElementById('custom-avatar-image');
        if (input) input.value = '';
    };

    const isStep1Valid = formData.name && formData.category;
    const isStep2Valid = (showPrice ? formData.price : true) && formData.description;

    // Custom avatar requires an uploaded photo
    const isAvatarValid = formData.avatarStyle !== 'custom' || formData.customAvatarPreview;

    const handleSubmit = () => {
        if (isStep2Valid) {
            const selectedAvatar = avatarStyles.find(a => a.id === formData.avatarStyle);
            onSubmit({
                ...formData,
                avatarPrompt: selectedAvatar?.prompt || null,
                avatarLabel: formData.avatarStyle === 'custom' ? 'Custom Avatar' : (selectedAvatar?.label || null),
            });
        }
    };

    return (
        <div className="space-y-6">
            {/* Progress Bar */}
            <div className="flex items-center gap-3">
                {[1, 2].map((s) => (
                    <div key={s} className="flex items-center gap-3 flex-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${step >= s
                            ? 'bg-gradient-to-r from-brand-500 to-coral-500 text-cream-900 shadow-glow-orange'
                            : 'bg-cream-200 text-cream-400'
                            }`}>
                            {s}
                        </div>
                        <span className={`text-sm font-medium hidden sm:block ${step >= s ? 'text-cream-900' : 'text-cream-400'}`}>
                            {s === 1 ? 'Info Produk' : 'Detail & Keunggulan'}
                        </span>
                        {s < 2 && (
                            <div className="flex-1 h-px bg-cream-200">
                                <div className={`h-full bg-gradient-to-r from-brand-500 to-coral-500 transition-all duration-500 ${step > s ? 'w-full' : 'w-0'}`} />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Step 1: Basic Info */}
            {step === 1 && (
                <div className="space-y-5 animate-fade-in">
                    {/* Product Image Upload */}
                    {showImage && (
                        <div>
                            <label className="label-text flex items-center gap-2">
                                <Upload className="w-4 h-4 text-accent" />
                                Foto Produk (opsional)
                            </label>
                            <div
                                className="border-2 border-dashed border-cream-300 rounded-xl hover:border-accent/20 transition-colors cursor-pointer overflow-hidden"
                                onClick={() => document.getElementById('product-image').click()}
                            >
                                {formData.imagePreview ? (
                                    <div className="relative group">
                                        <img src={formData.imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-sm text-cream-900">Klik untuk ganti</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-32 flex flex-col items-center justify-center text-cream-400">
                                        <Upload className="w-8 h-8 mb-2" />
                                        <span className="text-sm">Klik untuk upload foto produk</span>
                                    </div>
                                )}
                            </div>
                            <input
                                id="product-image"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                            />
                        </div>
                    )}

                    {/* Product Name */}
                    <div>
                        <label className="label-text flex items-center gap-2">
                            <Package className="w-4 h-4 text-accent" />
                            Nama Produk <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Contoh: Sambal Bu Darmi Level 5"
                            value={formData.name}
                            onChange={(e) => updateField('name', e.target.value)}
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="label-text flex items-center gap-2">
                            <Tag className="w-4 h-4 text-accent" />
                            Kategori <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left ${formData.category === cat
                                        ? 'bg-gradient-to-r from-brand-500/20 to-coral-500/20 border border-accent/30 text-cream-900'
                                        : 'bg-cream-100 border border-cream-300 text-cream-500 hover:bg-cream-200 hover:text-cream-600'
                                        }`}
                                    onClick={() => updateField('category', cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Avatar Style Selection */}
                    {showAvatar && (
                        <div>
                            <label className="label-text flex items-center gap-2">
                                <UserCircle className="w-4 h-4 text-accent" />
                                AI Avatar Promotor (opsional)
                            </label>
                            <p className="text-xs text-cream-400 mb-3">
                                Pilih gaya avatar atau upload foto sendiri untuk mengiklankan produkmu
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {avatarStyles.map((avatar) => (
                                    <button
                                        key={avatar.id}
                                        className={`px-3 py-3 rounded-xl text-left transition-all duration-200 ${formData.avatarStyle === avatar.id
                                            ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 text-cream-900 ring-1 ring-purple-500/30'
                                            : 'bg-cream-100 border border-cream-300 text-cream-500 hover:bg-cream-200 hover:text-cream-600'
                                            }`}
                                        onClick={() => updateField('avatarStyle', avatar.id)}
                                    >
                                        <span className="text-lg">{avatar.emoji}</span>
                                        <p className="text-xs font-semibold mt-1">{avatar.label}</p>
                                        <p className="text-[10px] text-cream-400 mt-0.5">{avatar.description}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Custom Avatar Upload — shown when "custom" is selected */}
                    {showAvatar && formData.avatarStyle === 'custom' && (
                        <div className="animate-fade-in">
                            <label className="label-text flex items-center gap-2">
                                <Camera className="w-4 h-4 text-purple-400" />
                                Upload Foto Avatar <span className="text-red-500">*</span>
                            </label>
                            <p className="text-xs text-cream-400 mb-2">
                                Upload foto wajah/selfie yang jelas. AI akan membuat avatar berdasarkan foto ini.
                            </p>
                            <div
                                className="border-2 border-dashed border-purple-500/30 rounded-xl hover:border-purple-500/50 transition-colors cursor-pointer overflow-hidden bg-purple-500/5"
                                onClick={() => document.getElementById('custom-avatar-image').click()}
                            >
                                {formData.customAvatarPreview ? (
                                    <div className="relative group">
                                        <img
                                            src={formData.customAvatarPreview}
                                            alt="Avatar preview"
                                            className="w-full h-48 object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-sm text-cream-900">Klik untuk ganti</span>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); clearCustomAvatar(); }}
                                            className="absolute top-2 right-2 w-7 h-7 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center transition-colors"
                                        >
                                            <X className="w-4 h-4 text-cream-900" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="h-40 flex flex-col items-center justify-center text-purple-300/50">
                                        <Camera className="w-10 h-10 mb-2" />
                                        <span className="text-sm font-medium">Upload foto wajahmu</span>
                                        <span className="text-[10px] mt-1 text-purple-300/30">Selfie atau foto portrait yang jelas</span>
                                    </div>
                                )}
                            </div>
                            <input
                                id="custom-avatar-image"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleCustomAvatarUpload}
                            />
                        </div>
                    )}

                    {/* Next Button */}
                    <button
                        className="btn-primary w-full !py-4"
                        disabled={!isStep1Valid || !isAvatarValid}
                        onClick={() => setStep(2)}
                    >
                        Lanjut
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Step 2: Details */}
            {step === 2 && (
                <div className="space-y-5 animate-fade-in">
                    {/* Price */}
                    {showPrice && (
                        <div>
                            <label className="label-text flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-accent" />
                                Harga <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cream-400 text-sm font-medium">Rp</span>
                                <input
                                    type="text"
                                    className="input-field !pl-12"
                                    placeholder="25.000"
                                    value={formData.price}
                                    onChange={(e) => updateField('price', e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {/* Description / Keunggulan / Video Prompt */}
                    <div>
                        <label className="label-text flex items-center gap-2">
                            <Star className="w-4 h-4 text-accent" />
                            {toolId === 'video' ? 'Prompt Video' : 'Keunggulan / Deskripsi Produk'} <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            className="textarea-field"
                            rows={4}
                            placeholder={toolId === 'video'
                                ? 'Contoh: Produk berputar pelan di atas meja dengan latar belakang estetik, cahaya golden hour, close-up detail produk'
                                : 'Contoh: Resep turun temurun dari nenek, tanpa pengawet, pakai cabai rawit pilihan, tersedia level 1-10, cocok untuk lauk sehari-hari'
                            }
                            value={formData.description}
                            onChange={(e) => updateField('description', e.target.value)}
                        />
                        <p className="text-xs text-cream-400 mt-1">
                            {toolId === 'video'
                                ? 'Deskripsikan gerakan/aksi yang kamu inginkan dalam video'
                                : 'Semakin detail, semakin bagus hasil AI-nya!'
                            }
                        </p>
                    </div>

                    {/* Target Audience */}
                    {showTarget && (
                        <div>
                            <label className="label-text flex items-center gap-2">
                                <Users className="w-4 h-4 text-accent" />
                                Target Audience (opsional)
                            </label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Contoh: Pecinta pedas usia 18-35 tahun"
                                value={formData.target}
                                onChange={(e) => updateField('target', e.target.value)}
                            />
                        </div>
                    )}

                    {/* Selected Avatar Summary */}
                    {showAvatar && formData.avatarStyle !== 'none' && (
                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 flex items-center gap-3">
                            {formData.avatarStyle === 'custom' && formData.customAvatarPreview ? (
                                <img
                                    src={formData.customAvatarPreview}
                                    alt="Custom avatar"
                                    className="w-12 h-12 rounded-full object-cover border-2 border-purple-500/50"
                                />
                            ) : (
                                <span className="text-2xl">
                                    {avatarStyles.find(a => a.id === formData.avatarStyle)?.emoji}
                                </span>
                            )}
                            <div>
                                <p className="text-xs text-purple-300 font-semibold">Avatar AI aktif</p>
                                <p className="text-xs text-cream-400">
                                    {formData.avatarStyle === 'custom'
                                        ? 'Foto custom kamu akan mengiklankan produkmu'
                                        : `${avatarStyles.find(a => a.id === formData.avatarStyle)?.label} akan mengiklankan produkmu`
                                    }
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            className="btn-secondary flex-1 !py-4"
                            onClick={() => setStep(1)}
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Kembali
                        </button>
                        <button
                            className="btn-primary flex-1 !py-4"
                            disabled={!isStep2Valid || isLoading}
                            onClick={handleSubmit}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    Generate Konten ✨
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

