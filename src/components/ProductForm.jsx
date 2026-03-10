import { useState } from 'react';
import { Package, Tag, DollarSign, Star, Sparkles, Loader2, Upload, UserCircle, Camera, X } from 'lucide-react';

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

export const avatarStyles = [
    { id: 'none', label: 'Tanpa Avatar', emoji: '🚫', description: 'Tanpa avatar', prompt: null },
    { id: 'custom', label: 'Upload Foto Sendiri', emoji: '📸', description: 'Pakai wajahmu sendiri!', prompt: 'The person shown in the reference photo' },
    { id: 'woman-professional', label: 'Wanita Profesional', emoji: '👩‍💼', description: 'Presenter wanita dewasa', prompt: 'A professional Indonesian woman in her 30s, wearing a modern business casual outfit, warm confident smile, clean makeup' },
    { id: 'man-professional', label: 'Pria Profesional', emoji: '👨‍💼', description: 'Presenter pria dewasa', prompt: 'A professional Indonesian man in his 30s, wearing a smart casual shirt, friendly confident smile, well-groomed' },
    { id: 'woman-young', label: 'Influencer Wanita', emoji: '💁‍♀️', description: 'Style content creator muda', prompt: 'A young trendy Indonesian woman in her 20s, stylish casual outfit, energetic pose, bright smile, influencer-style' },
    { id: 'man-young', label: 'Content Creator Pria', emoji: '🧑‍🎤', description: 'Style creator pria muda', prompt: 'A young trendy Indonesian man in his 20s, casual streetwear, dynamic pose, confident smile, content creator style' },
    { id: 'hijab', label: 'Wanita Hijab', emoji: '🧕', description: 'Presenter wanita berhijab', prompt: 'A beautiful Indonesian woman wearing a stylish hijab, modern modest fashion, warm genuine smile, professional yet approachable' },
    { id: 'cartoon', label: 'Kartun / Maskot', emoji: '🤖', description: 'Karakter kartun lucu', prompt: 'A cute friendly cartoon mascot character, chibi style, big expressive eyes, adorable and appealing, Pixar-quality 3D render style' },
];

/**
 * Ensure image meets minimum size requirement (min 240px for API)
 */
const ensureMinImageSize = (base64, minSize = 512) => {
    return new Promise((resolve) => {
        const img = new window.Image();
        img.onload = () => {
            const { width, height } = img;
            if (width >= minSize && height >= minSize) {
                resolve(base64);
                return;
            }
            const scale = Math.max(minSize / width, minSize / height);
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(width * scale);
            canvas.height = Math.round(height * scale);
            canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', 0.95));
        };
        img.onerror = () => resolve(base64);
        img.src = base64;
    });
};

/**
 * Reusable product form.
 *
 * @param {Object} fields - Which fields to show:
 *   { image, name, category, avatar, price, description }
 * @param {Object} labels - Custom labels/placeholders:
 *   { description: { label, placeholder, hint } }
 */
export default function ProductForm({ onSubmit, isLoading, fields = {}, labels = {} }) {
    const defaults = { image: true, name: true, category: true, avatar: false, price: false, description: true };
    const f = { ...defaults, ...fields };

    const descLabels = {
        label: 'Keunggulan / Deskripsi Produk',
        placeholder: 'Contoh: Resep turun temurun, tanpa pengawet, cabai rawit pilihan',
        hint: 'Semakin detail, semakin bagus hasil AI-nya!',
        ...labels.description,
    };

    const [formData, setFormData] = useState({
        name: '', category: '', price: '', description: '',
        imageFile: null, imagePreview: null,
        avatarStyle: 'none', customAvatarFile: null, customAvatarPreview: null,
    });

    const update = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        update('imageFile', file);
        const reader = new FileReader();
        reader.onload = async (ev) => update('imagePreview', await ensureMinImageSize(ev.target.result));
        reader.readAsDataURL(file);
    };

    const handleAvatarUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        update('customAvatarFile', file);
        const reader = new FileReader();
        reader.onload = async (ev) => update('customAvatarPreview', await ensureMinImageSize(ev.target.result));
        reader.readAsDataURL(file);
    };

    const clearAvatar = () => {
        update('customAvatarFile', null);
        update('customAvatarPreview', null);
    };

    const isValid = formData.name && formData.category && formData.description
        && (f.price ? formData.price : true)
        && (f.avatar && formData.avatarStyle === 'custom' ? formData.customAvatarPreview : true);

    const handleSubmit = () => {
        if (!isValid) return;
        const selected = avatarStyles.find(a => a.id === formData.avatarStyle);
        onSubmit({
            ...formData,
            avatarPrompt: selected?.prompt || null,
            avatarLabel: formData.avatarStyle === 'custom' ? 'Custom Avatar' : (selected?.label || null),
        });
    };

    return (
        <div className="space-y-5">
            {/* Image Upload */}
            {f.image && (
                <div>
                    <label className="label-text flex items-center gap-2">
                        <Upload className="w-4 h-4 text-accent" />
                        Foto Produk (opsional)
                    </label>
                    <div
                        className="border-2 border-dashed border-cream-300 rounded-xl hover:border-accent/20 transition-colors cursor-pointer overflow-hidden"
                        onClick={() => document.getElementById('pf-product-image')?.click()}
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
                    <input id="pf-product-image" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </div>
            )}

            {/* Name */}
            {f.name && (
                <div>
                    <label className="label-text flex items-center gap-2">
                        <Package className="w-4 h-4 text-accent" />
                        Nama Produk <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text" className="input-field"
                        placeholder="Contoh: Sambal Bu Darmi Level 5"
                        value={formData.name} onChange={(e) => update('name', e.target.value)}
                    />
                </div>
            )}

            {/* Category */}
            {f.category && (
                <div>
                    <label className="label-text flex items-center gap-2">
                        <Tag className="w-4 h-4 text-accent" />
                        Kategori <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${formData.category === cat
                                    ? 'bg-gradient-to-r from-brand-500/20 to-coral-500/20 border border-accent/30 text-cream-900'
                                    : 'bg-cream-100 border border-cream-300 text-cream-500 hover:bg-cream-200'
                                    }`}
                                onClick={() => update('category', cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Avatar */}
            {f.avatar && (
                <>
                    <div>
                        <label className="label-text flex items-center gap-2">
                            <UserCircle className="w-4 h-4 text-accent" />
                            AI Avatar Promotor (opsional)
                        </label>
                        <p className="text-xs text-cream-400 mb-3">Pilih gaya avatar untuk mengiklankan produkmu</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {avatarStyles.map((av) => (
                                <button
                                    key={av.id}
                                    className={`px-3 py-3 rounded-xl text-left transition-all ${formData.avatarStyle === av.id
                                        ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 text-cream-900 ring-1 ring-purple-500/30'
                                        : 'bg-cream-100 border border-cream-300 text-cream-500 hover:bg-cream-200'
                                        }`}
                                    onClick={() => update('avatarStyle', av.id)}
                                >
                                    <span className="text-lg">{av.emoji}</span>
                                    <p className="text-xs font-semibold mt-1">{av.label}</p>
                                    <p className="text-[10px] text-cream-400 mt-0.5">{av.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Avatar Upload */}
                    {formData.avatarStyle === 'custom' && (
                        <div className="animate-fade-in">
                            <label className="label-text flex items-center gap-2">
                                <Camera className="w-4 h-4 text-purple-400" />
                                Upload Foto Avatar <span className="text-red-500">*</span>
                            </label>
                            <p className="text-xs text-cream-400 mb-2">Upload foto wajah/selfie yang jelas.</p>
                            <div
                                className="border-2 border-dashed border-purple-500/30 rounded-xl hover:border-purple-500/50 transition-colors cursor-pointer overflow-hidden bg-purple-500/5"
                                onClick={() => document.getElementById('pf-custom-avatar')?.click()}
                            >
                                {formData.customAvatarPreview ? (
                                    <div className="relative group">
                                        <img src={formData.customAvatarPreview} alt="Avatar" className="w-full h-48 object-cover" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-sm text-cream-900">Klik untuk ganti</span>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); clearAvatar(); }}
                                            className="absolute top-2 right-2 w-7 h-7 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center"
                                        >
                                            <X className="w-4 h-4 text-cream-900" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="h-40 flex flex-col items-center justify-center text-purple-300/50">
                                        <Camera className="w-10 h-10 mb-2" />
                                        <span className="text-sm font-medium">Upload foto wajahmu</span>
                                    </div>
                                )}
                            </div>
                            <input id="pf-custom-avatar" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                        </div>
                    )}
                </>
            )}

            {/* Price */}
            {f.price && (
                <div>
                    <label className="label-text flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-accent" />
                        Harga <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cream-400 text-sm font-medium">Rp</span>
                        <input
                            type="text" className="input-field !pl-12" placeholder="25.000"
                            value={formData.price} onChange={(e) => update('price', e.target.value)}
                        />
                    </div>
                </div>
            )}

            {/* Description / Prompt */}
            {f.description && (
                <div>
                    <label className="label-text flex items-center gap-2">
                        <Star className="w-4 h-4 text-accent" />
                        {descLabels.label} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        className="textarea-field" rows={4}
                        placeholder={descLabels.placeholder}
                        value={formData.description} onChange={(e) => update('description', e.target.value)}
                    />
                    <p className="text-xs text-cream-400 mt-1">{descLabels.hint}</p>
                </div>
            )}



            {/* Avatar Summary */}
            {f.avatar && formData.avatarStyle !== 'none' && (
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 flex items-center gap-3">
                    {formData.avatarStyle === 'custom' && formData.customAvatarPreview ? (
                        <img src={formData.customAvatarPreview} alt="Avatar" className="w-12 h-12 rounded-full object-cover border-2 border-purple-500/50" />
                    ) : (
                        <span className="text-2xl">{avatarStyles.find(a => a.id === formData.avatarStyle)?.emoji}</span>
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

            {/* Submit */}
            <button
                className="btn-primary w-full !py-4"
                disabled={!isValid || isLoading}
                onClick={handleSubmit}
            >
                {isLoading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</>
                ) : (
                    <><Sparkles className="w-5 h-5" /> Generate</>
                )}
            </button>
        </div>
    );
}

