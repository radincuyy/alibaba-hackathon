import { memo } from 'react';
import { cn } from '../../utils/cn';

/**
 * Reusable selectable option button (used for categories, resolution, aspect ratio, etc.).
 * Replaces the duplicated "selected vs unselected" button pattern across many pages.
 *
 * @param {object} props
 * @param {boolean}  props.isSelected    - Whether this option is currently active.
 * @param {function} props.onClick       - Click handler.
 * @param {string}   [props.activeClass] - Tailwind classes when selected.
 * @param {string}   [props.className]   - Additional wrapper classes.
 * @param {React.ReactNode} props.children - Button content.
 */
function OptionButton({
    isSelected,
    onClick,
    activeClass = 'bg-gradient-to-r from-brand-500/20 to-coral-500/20 border border-accent/30 text-cream-900',
    inactiveClass = 'bg-cream-100 border border-cream-300 text-cream-500 hover:bg-cream-200',
    className,
    children,
    ...rest
}) {
    return (
        <button
            type="button"
            className={cn(
                'px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left',
                isSelected ? activeClass : inactiveClass,
                className,
            )}
            onClick={onClick}
            aria-pressed={isSelected}
            {...rest}
        >
            {children}
        </button>
    );
}

export default memo(OptionButton);
