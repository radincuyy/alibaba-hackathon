import { memo, useId, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { readFileAsBase64 } from '../../utils/imageUtils';

/**
 * Reusable image upload component with preview, overlay, and delete button.
 * Replaces duplicated upload UI across ProductForm, PosterToolPage, AvatarToolPage, VideoToolPage.
 *
 * @param {object} props
 * @param {string|null}  props.value        - Current base64 preview (or null).
 * @param {function}     props.onChange      - Called with new base64 string or null.
 * @param {string}       [props.label]      - Label text above the uploader.
 * @param {string}       [props.hint]       - Small helper text below label.
 * @param {boolean}      [props.required]   - Show red asterisk.
 * @param {string}       [props.emptyText]  - Placeholder text when no image.
 * @param {string}       [props.emptySubtext] - Secondary placeholder text.
 * @param {React.ComponentType} [props.emptyIcon] - Icon shown when empty.
 * @param {React.ComponentType} [props.labelIcon] - Icon next to label.
 * @param {string}       [props.accept]     - File input accept attribute.
 * @param {number}       [props.previewHeight] - Tailwind h-* value as class.
 * @param {string}       [props.borderColor] - Custom border color classes.
 * @param {string}       [props.className]  - Additional wrapper classes.
 */
function ImageUploader({
    value,
    onChange,
    label,
    hint,
    required = false,
    emptyText = 'Klik untuk upload foto',
    emptySubtext,
    emptyIcon: EmptyIcon = Upload,
    labelIcon: LabelIcon,
    accept = 'image/*',
    previewHeight = 'h-48',
    borderColor = 'border-cream-300',
    className,
}) {
    const inputId = useId();
    const fileInputRef = useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const base64 = await readFileAsBase64(file);
            onChange?.(base64);
        } catch (err) {
            console.error('ImageUploader: failed to read file', err);
        }

        // Reset so the same file can be re-selected
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange?.(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
        }
    };

    return (
        <div className={className}>
            {label && (
                <label htmlFor={inputId} className="label-text flex items-center gap-2">
                    {LabelIcon && <LabelIcon className="w-4 h-4 text-accent" />}
                    {label}
                    {required && <span className="text-red-500">*</span>}
                </label>
            )}
            {hint && <p className="text-xs text-cream-400 mb-2">{hint}</p>}

            <div
                role="button"
                tabIndex={0}
                aria-label={label || 'Upload gambar'}
                className={cn(
                    'border-2 border-dashed rounded-xl transition-colors cursor-pointer overflow-hidden',
                    borderColor,
                    `hover:border-accent/30`,
                )}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={handleKeyDown}
            >
                {value ? (
                    <div className="relative group">
                        <img
                            src={value}
                            alt="Preview"
                            className={cn('w-full object-cover', previewHeight)}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-sm text-white font-medium">Klik untuk ganti</span>
                        </div>
                        <button
                            type="button"
                            onClick={handleClear}
                            className="absolute top-2 right-2 w-7 h-7 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center transition-colors"
                            aria-label="Hapus gambar"
                        >
                            <X className="w-4 h-4 text-white" />
                        </button>
                    </div>
                ) : (
                    <div className={cn('flex flex-col items-center justify-center text-cream-400', previewHeight === 'h-48' ? 'h-32' : previewHeight)}>
                        <EmptyIcon className="w-8 h-8 mb-2" />
                        <span className="text-sm">{emptyText}</span>
                        {emptySubtext && (
                            <span className="text-xs text-cream-300 mt-0.5">{emptySubtext}</span>
                        )}
                    </div>
                )}
            </div>

            <input
                ref={fileInputRef}
                id={inputId}
                type="file"
                accept={accept}
                className="hidden"
                onChange={handleFileChange}
                tabIndex={-1}
            />
        </div>
    );
}

export default memo(ImageUploader);
