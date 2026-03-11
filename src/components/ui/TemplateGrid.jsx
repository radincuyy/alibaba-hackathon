import { memo } from 'react';
import { cn } from '../../utils/cn';

/**
 * Reusable template prompt grid.
 * Replaces the duplicated template button grid in PosterToolPage, AvatarToolPage, VideoToolPage.
 *
 * @param {object} props
 * @param {Array<{label: string, prompt: string}>} props.templates - Template list.
 * @param {string}   props.currentValue - Currently selected prompt (for highlight).
 * @param {function} props.onSelect     - Called with the template's prompt string.
 * @param {string}   [props.heading]    - Optional heading text above the grid.
 * @param {string}   [props.className]  - Additional wrapper classes.
 */
function TemplateGrid({ templates, currentValue, onSelect, heading, className }) {
    if (!templates?.length) return null;

    return (
        <div className={className}>
            {heading && (
                <p className="text-xs text-cream-400 mb-2 flex items-center gap-1">
                    {heading}
                </p>
            )}
            <div className="grid grid-cols-2 gap-1.5" role="group" aria-label={heading || 'Template prompts'}>
                {templates.map((t, i) => (
                    <button
                        key={t.label || i}
                        type="button"
                        onClick={() => onSelect(t.prompt)}
                        aria-pressed={currentValue === t.prompt}
                        className={cn(
                            'text-xs px-3 py-2 rounded-xl text-left transition-all cursor-pointer border',
                            currentValue === t.prompt
                                ? 'bg-accent/10 border-accent/30 text-accent font-medium'
                                : 'bg-cream-100 text-cream-500 hover:bg-cream-200 hover:text-cream-700 border-cream-200',
                        )}
                    >
                        {t.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default memo(TemplateGrid);
