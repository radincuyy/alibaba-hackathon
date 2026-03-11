import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Safely merge Tailwind CSS classes without conflicts.
 * Combines clsx (conditional classes) with tailwind-merge (dedup conflicting utilities).
 *
 * @param  {...(string|undefined|null|boolean|Record<string,boolean>)} inputs
 * @returns {string}
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
