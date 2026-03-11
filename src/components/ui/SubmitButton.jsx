import { memo } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Reusable submit/generate button with loading state.
 * Replaces the duplicated generate button across all tool pages.
 *
 * @param {object} props
 * @param {boolean}  props.isLoading     - Show spinner + loading text.
 * @param {boolean}  [props.disabled]    - Disable the button.
 * @param {function} props.onClick       - Click handler.
 * @param {string}   [props.label]       - Button text (default: 'Generate').
 * @param {string}   [props.loadingLabel]- Loading text (default: 'Generating...').
 * @param {React.ComponentType} [props.icon] - Icon component (default: Sparkles).
 * @param {string}   [props.className]   - Additional classes.
 */
function SubmitButton({
    isLoading,
    disabled,
    onClick,
    label = 'Generate',
    loadingLabel = 'Generating...',
    icon: Icon = Sparkles,
    className,
}) {
    return (
        <button
            type="button"
            className={cn('btn-primary w-full !py-4', className)}
            disabled={disabled || isLoading}
            onClick={onClick}
            aria-busy={isLoading}
        >
            {isLoading ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                    {loadingLabel}
                </>
            ) : (
                <>
                    <Icon className="w-5 h-5" aria-hidden="true" />
                    {label}
                </>
            )}
        </button>
    );
}

export default memo(SubmitButton);
