/**
 * Ensure an image (as base64 data URI) meets a minimum dimension requirement.
 * If either width or height is below `minSize`, the image is scaled up proportionally.
 * This is required by several DashScope APIs that reject images smaller than ~240-384px.
 *
 * @param {string} base64 - Base64 data URI of the image.
 * @param {number} [minSize=512] - Minimum width/height in pixels.
 * @returns {Promise<string>} Resolved base64 data URI (original or resized).
 */
export function ensureMinImageSize(base64, minSize = 512) {
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

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            resolve(canvas.toDataURL('image/jpeg', 0.95));
        };

        img.onerror = () => resolve(base64);
        img.src = base64;
    });
}

/**
 * Read a File object and return its base64 data URI, with optional minimum-size enforcement.
 *
 * @param {File} file - The file to read.
 * @param {object} [options]
 * @param {boolean} [options.enforceMinSize=true] - Whether to upscale small images.
 * @param {number}  [options.minSize=512] - Minimum dimension when enforcing.
 * @returns {Promise<string>} Base64 data URI.
 */
export function readFileAsBase64(file, { enforceMinSize = true, minSize = 512 } = {}) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (ev) => {
            const raw = ev.target?.result;
            if (!raw) {
                reject(new Error('FileReader returned empty result'));
                return;
            }

            if (enforceMinSize && file.type.startsWith('image/')) {
                resolve(await ensureMinImageSize(raw, minSize));
            } else {
                resolve(raw);
            }
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}
