import { memo } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Multi-step progress indicator for multi-stage AI generation pipelines.
 * Replaces the duplicated progress UI in AvatarToolPage and VideoToolPage.
 *
 * @param {object} props
 * @param {Array<{id: string, label: string, color?: string}>} props.steps - Step definitions.
 * @param {string|null}  props.currentStep  - The id of the currently active step.
 * @param {object}       props.completedMap - Map of step id -> boolean (whether step is complete).
 * @param {string}       [props.className]  - Additional wrapper classes.
 */
function ProgressSteps({ steps, currentStep, completedMap = {}, className }) {
    if (!steps?.length) return null;

    return (
        <div className={cn('card p-4', className)}>
            <h4 className="text-sm font-bold text-cream-900 mb-3">Progress</h4>
            <div className="space-y-2" role="list" aria-label="Progress langkah-langkah">
                {steps.map((step) => {
                    const isActive = currentStep === step.id;
                    const isCompleted = completedMap[step.id];
                    const colorClass = isActive
                        ? (step.color || 'text-violet-500')
                        : isCompleted
                            ? 'text-green-500'
                            : 'text-cream-300';

                    return (
                        <div
                            key={step.id}
                            className={cn('flex items-center gap-2 text-sm', colorClass)}
                            role="listitem"
                            aria-current={isActive ? 'step' : undefined}
                        >
                            {isActive ? (
                                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                            ) : isCompleted ? (
                                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                            ) : (
                                <div className="w-4 h-4 rounded-full border border-cream-300" aria-hidden="true" />
                            )}
                            {step.label}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default memo(ProgressSteps);
