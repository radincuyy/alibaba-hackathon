import { memo } from 'react';
import { Camera } from 'lucide-react';
import { cn } from '../../utils/cn';
import ImageUploader from './ImageUploader';

/**
 * Avatar style picker grid with optional custom photo upload.
 * Replaces the duplicated avatar selection UI in ProductForm, AvatarToolPage, VideoToolPage.
 *
 * @param {object} props
 * @param {Array}    props.styles            - Array of avatar style objects ({ id, label, emoji, description }).
 * @param {string}   props.selectedStyle     - Currently selected style id.
 * @param {function} props.onStyleChange     - Called with new style id.
 * @param {string|null} [props.customImage]  - Base64 preview for custom avatar.
 * @param {function} [props.onCustomImageChange] - Called with base64 or null.
 * @param {boolean}  [props.excludeNone]     - Whether to filter out 'none' option.
 * @param {string}   [props.label]           - Section label.
 * @param {string}   [props.hint]            - Hint text below label.
 * @param {boolean}  [props.required]        - Show asterisk.
 * @param {React.ComponentType} [props.labelIcon] - Icon next to label.
 * @param {string}   [props.className]       - Additional classes.
 */
function AvatarStylePicker({
    styles,
    selectedStyle,
    onStyleChange,
    customImage = null,
    onCustomImageChange,
    excludeNone = false,
    label = 'AI Avatar Promotor (opsional)',
    hint = 'Pilih gaya avatar untuk mengiklankan produkmu',
    required = false,
    labelIcon: LabelIcon,
    className,
}) {
    const displayStyles = excludeNone
        ? styles.filter((a) => a.id !== 'none')
        : styles;

    const isCustom = selectedStyle === 'custom';

    return (
        <div className={className}>
            <div>
                {label && (
                    <label className="label-text flex items-center gap-2">
                        {LabelIcon && <LabelIcon className="w-4 h-4 text-accent" />}
                        {label}
                        {required && <span className="text-red-500">*</span>}
                    </label>
                )}
                {hint && <p className="text-xs text-cream-400 mb-3">{hint}</p>}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" role="radiogroup" aria-label={label}>
                    {displayStyles.map((av) => (
                        <button
                            key={av.id}
                            type="button"
                            role="radio"
                            aria-checked={selectedStyle === av.id}
                            className={cn(
                                'px-3 py-3 rounded-xl text-left transition-all',
                                selectedStyle === av.id
                                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 text-cream-900 ring-1 ring-purple-500/30'
                                    : 'bg-cream-100 border border-cream-300 text-cream-500 hover:bg-cream-200',
                            )}
                            onClick={() => onStyleChange(av.id)}
                        >
                            <span className="text-lg" aria-hidden="true">{av.emoji}</span>
                            <p className="text-xs font-semibold mt-1">{av.label}</p>
                            <p className="text-[10px] text-cream-400 mt-0.5">{av.description}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Custom Avatar Upload */}
            {isCustom && onCustomImageChange && (
                <div className="animate-fade-in mt-4">
                    <ImageUploader
                        value={customImage}
                        onChange={onCustomImageChange}
                        label="Upload Foto Avatar"
                        hint="Upload foto wajah/selfie yang jelas."
                        required
                        labelIcon={Camera}
                        emptyText="Upload foto wajahmu"
                        emptyIcon={Camera}
                        previewHeight="h-48"
                        borderColor="border-purple-500/30 hover:border-purple-500/50 bg-purple-500/5"
                    />
                </div>
            )}
        </div>
    );
}

export default memo(AvatarStylePicker);
