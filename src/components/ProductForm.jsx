import { useState, useCallback, useMemo } from 'react';
import { Package, Tag, DollarSign, Star, Upload, UserCircle } from 'lucide-react';
import ImageUploader from './ui/ImageUploader';
import AvatarStylePicker from './ui/AvatarStylePicker';
import SubmitButton from './ui/SubmitButton';
import OptionButton from './ui/OptionButton';

const CATEGORIES = [
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

const DEFAULT_FIELDS = { image: true, name: true, category: true, avatar: false, price: false, description: true };

const DEFAULT_DESC_LABELS = {
    label: 'Keunggulan / Deskripsi Produk',
    placeholder: 'Contoh: Resep turun temurun, tanpa pengawet, cabai rawit pilihan',
    hint: 'Semakin detail, semakin bagus hasil AI-nya!',
};

/**
 * Reusable product form.
 *
 * @param {object} props
 * @param {function} props.onSubmit   - Called with merged form data on submit.
 * @param {boolean}  props.isLoading  - Disables form and shows spinner.
 * @param {object}   [props.fields]   - Which fields to show: { image, name, category, avatar, price, description }.
 * @param {object}   [props.labels]   - Custom labels/placeholders: { description: { label, placeholder, hint } }.
 */
export default function ProductForm({ onSubmit, isLoading, fields = {}, labels = {} }) {
    const f = useMemo(() => ({ ...DEFAULT_FIELDS, ...fields }), [fields]);
    const descLabels = useMemo(() => ({ ...DEFAULT_DESC_LABELS, ...labels.description }), [labels.description]);

    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: '',
        description: '',
        imagePreview: null,
        avatarStyle: 'none',
        customAvatarPreview: null,
    });

    const update = useCallback((key, val) => {
        setFormData((prev) => ({ ...prev, [key]: val }));
    }, []);

    const selectedAvatar = useMemo(
        () => avatarStyles.find((a) => a.id === formData.avatarStyle),
        [formData.avatarStyle],
    );

    const isValid =
        formData.name &&
        formData.category &&
        formData.description &&
        (f.price ? formData.price : true) &&
        (f.avatar && formData.avatarStyle === 'custom' ? formData.customAvatarPreview : true);

    const handleSubmit = useCallback(() => {
        if (!isValid) return;
        onSubmit({
            ...formData,
            avatarPrompt: selectedAvatar?.prompt || null,
            avatarLabel:
                formData.avatarStyle === 'custom'
                    ? 'Custom Avatar'
                    : selectedAvatar?.label || null,
        });
    }, [isValid, formData, selectedAvatar, onSubmit]);

    return (
        <div className="space-y-5">
            {/* Image Upload */}
            {f.image && (
                <ImageUploader
                    value={formData.imagePreview}
                    onChange={(val) => update('imagePreview', val)}
                    label="Foto Produk (opsional)"
                    labelIcon={Upload}
                />
            )}

            {/* Name */}
            {f.name && (
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
                        onChange={(e) => update('name', e.target.value)}
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" role="radiogroup" aria-label="Kategori produk">
                        {CATEGORIES.map((cat) => (
                            <OptionButton
                                key={cat}
                                isSelected={formData.category === cat}
                                onClick={() => update('category', cat)}
                            >
                                {cat}
                            </OptionButton>
                        ))}
                    </div>
                </div>
            )}

            {/* Avatar */}
            {f.avatar && (
                <AvatarStylePicker
                    styles={avatarStyles}
                    selectedStyle={formData.avatarStyle}
                    onStyleChange={(id) => update('avatarStyle', id)}
                    customImage={formData.customAvatarPreview}
                    onCustomImageChange={(val) => update('customAvatarPreview', val)}
                    labelIcon={UserCircle}
                />
            )}

            {/* Price */}
            {f.price && (
                <div>
                    <label className="label-text flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-accent" />
                        Harga <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cream-400 text-sm font-medium">
                            Rp
                        </span>
                        <input
                            type="text"
                            className="input-field !pl-12"
                            placeholder="25.000"
                            value={formData.price}
                            onChange={(e) => update('price', e.target.value)}
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
                        className="textarea-field"
                        rows={4}
                        placeholder={descLabels.placeholder}
                        value={formData.description}
                        onChange={(e) => update('description', e.target.value)}
                    />
                    <p className="text-xs text-cream-400 mt-1">{descLabels.hint}</p>
                </div>
            )}

            {/* Avatar Summary */}
            {f.avatar && formData.avatarStyle !== 'none' && (
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 flex items-center gap-3">
                    {formData.avatarStyle === 'custom' && formData.customAvatarPreview ? (
                        <img
                            src={formData.customAvatarPreview}
                            alt="Avatar"
                            className="w-12 h-12 rounded-full object-cover border-2 border-purple-500/50"
                        />
                    ) : (
                        <span className="text-2xl">{selectedAvatar?.emoji}</span>
                    )}
                    <div>
                        <p className="text-xs text-purple-300 font-semibold">Avatar AI aktif</p>
                        <p className="text-xs text-cream-400">
                            {formData.avatarStyle === 'custom'
                                ? 'Foto custom kamu akan mengiklankan produkmu'
                                : `${selectedAvatar?.label} akan mengiklankan produkmu`}
                        </p>
                    </div>
                </div>
            )}

            {/* Submit */}
            <SubmitButton
                isLoading={isLoading}
                disabled={!isValid}
                onClick={handleSubmit}
            />
        </div>
    );
}
