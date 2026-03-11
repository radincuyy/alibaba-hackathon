import axios from 'axios';

const DASHSCOPE_API_KEY = import.meta.env.VITE_DASHSCOPE_API_KEY || '';

// Synchronous client
const wanClient = axios.create({
    baseURL: '/api/dashscope',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
    },
});

// Async client (for long-running tasks that need polling)
const wanAsyncClient = axios.create({
    baseURL: '/api/dashscope',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
        'X-DashScope-Async': 'enable',
    },
});

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Extract the first image URL from a multimodal generation response.
 * Shared by generateImage, editImageWithAvatar, and generatePosterImage.
 *
 * @param {object} data - Axios response.data
 * @returns {string|null}
 */
function extractImageUrl(data) {
    const content = data?.output?.choices?.[0]?.message?.content;
    return content?.[0]?.image ?? null;
}

/**
 * Extract a human-readable error message from an Axios error.
 * @param {Error} error
 * @returns {string}
 */
function extractErrorMessage(error) {
    return (
        error.response?.data?.message ||
        error.response?.data?.error?.message ||
        error.message
    );
}

/**
 * Check if the error is an AbortController cancellation.
 * @param {Error} error
 * @returns {boolean}
 */
function isAborted(error) {
    return axios.isCancel(error) || error.name === 'AbortError';
}

// ─── Synchronous APIs ───────────────────────────────────────────────────────

/**
 * Generate image using Wan 2.6 T2I (synchronous).
 *
 * @param {string} prompt
 * @param {object} [options]
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<{success: boolean, imageUrl?: string, error?: string}>}
 */
export async function generateImage(prompt, { signal } = {}) {
    try {
        const response = await wanClient.post(
            '/services/aigc/multimodal-generation/generation',
            {
                model: 'wan2.6-t2i',
                input: {
                    messages: [
                        { role: 'user', content: [{ text: prompt }] },
                    ],
                },
                parameters: {
                    size: '1280*1280',
                    n: 1,
                    prompt_extend: true,
                    watermark: false,
                },
            },
            { signal },
        );

        const imageUrl = extractImageUrl(response.data);
        if (imageUrl) {
            return { success: true, imageUrl };
        }
        return { success: false, error: 'Format response tidak sesuai' };
    } catch (error) {
        if (isAborted(error)) return { success: false, error: 'Request dibatalkan' };
        return { success: false, error: extractErrorMessage(error) };
    }
}

/**
 * Edit image using Qwen Image Edit Max (synchronous, character-consistent).
 *
 * @param {string} avatarBase64       - Base64 avatar/face image.
 * @param {string} productImageBase64 - Base64 product image.
 * @param {string} editPrompt         - Editing instructions.
 * @param {object} [options]
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<{success: boolean, imageUrl?: string, error?: string}>}
 */
export async function editImageWithAvatar(avatarBase64, productImageBase64, editPrompt, { signal } = {}) {
    const content = [{ image: avatarBase64 }];
    if (productImageBase64) {
        content.push({ image: productImageBase64 });
    }
    content.push({ text: editPrompt });

    try {
        const response = await wanClient.post(
            '/services/aigc/multimodal-generation/generation',
            {
                model: 'qwen-image-edit-max',
                input: {
                    messages: [{ role: 'user', content }],
                },
                parameters: {
                    size: '1280*1280',
                    n: 1,
                    prompt_extend: true,
                    watermark: false,
                },
            },
            { signal },
        );

        const imageUrl = extractImageUrl(response.data);
        if (imageUrl) {
            return { success: true, imageUrl };
        }
        return { success: false, error: 'Format response tidak sesuai' };
    } catch (error) {
        if (isAborted(error)) return { success: false, error: 'Request dibatalkan' };
        return { success: false, error: extractErrorMessage(error) };
    }
}

/**
 * Generate poster image using Qwen Image 2.0 Pro (synchronous).
 *
 * @param {string}      prompt      - Text prompt describing the poster.
 * @param {string|null} imageBase64 - Optional base64 product image.
 * @param {object} [options]
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<{success: boolean, imageUrl?: string, error?: string}>}
 */
export async function generatePosterImage(prompt, imageBase64 = null, { signal } = {}) {
    const content = [];
    if (imageBase64) {
        content.push({ image: imageBase64 });
    }
    content.push({ text: prompt });

    try {
        const response = await wanClient.post(
            '/services/aigc/multimodal-generation/generation',
            {
                model: 'qwen-image-2.0-pro',
                input: {
                    messages: [{ role: 'user', content }],
                },
                parameters: {
                    size: '1280*1280',
                    n: 1,
                    watermark: false,
                },
            },
            { signal },
        );

        const imageUrl = extractImageUrl(response.data);
        if (imageUrl) {
            return { success: true, imageUrl };
        }
        return { success: false, error: 'Format response tidak sesuai' };
    } catch (error) {
        if (isAborted(error)) return { success: false, error: 'Request dibatalkan' };
        return { success: false, error: extractErrorMessage(error) };
    }
}

// ─── Async APIs (polling-based) ─────────────────────────────────────────────

/**
 * Poll for async task completion.
 *
 * @param {string} taskId
 * @param {object} [options]
 * @param {AbortSignal} [options.signal]
 * @param {number} [options.maxAttempts=120]
 * @param {number} [options.intervalMs=5000]
 * @returns {Promise<{success: boolean, videoUrl?: string, error?: string, taskId: string}>}
 */
async function pollTaskResult(taskId, { signal, maxAttempts = 120, intervalMs = 5000 } = {}) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        // Check if aborted before each poll
        if (signal?.aborted) {
            return { success: false, error: 'Request dibatalkan', taskId };
        }

        try {
            const response = await wanClient.get(`/tasks/${taskId}`, { signal });
            const output = response.data?.output;
            const status = output?.task_status;

            if (status === 'SUCCEEDED') {
                const videoUrl = output?.video_url || output?.results?.[0]?.url;
                if (videoUrl) {
                    return { success: true, videoUrl, taskId };
                }
            } else if (status === 'FAILED') {
                return {
                    success: false,
                    error: output?.message || output?.code || 'Generation failed',
                    taskId,
                };
            }

            // Wait before next poll — abort-aware
            await new Promise((resolve, reject) => {
                const timer = setTimeout(resolve, intervalMs);
                if (signal) {
                    const onAbort = () => {
                        clearTimeout(timer);
                        reject(new DOMException('Aborted', 'AbortError'));
                    };
                    signal.addEventListener('abort', onAbort, { once: true });
                }
            });
        } catch (error) {
            if (isAborted(error)) {
                return { success: false, error: 'Request dibatalkan', taskId };
            }
            // Log poll errors but continue trying
            console.error('Poll error:', error.response?.data || error.message);
        }
    }

    return { success: false, error: 'Generation timed out', taskId };
}

/**
 * Generate video using Wan 2.6 T2V (text-to-video) — async with polling.
 *
 * @param {string} prompt
 * @param {object} [options]
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<{success: boolean, videoUrl?: string, error?: string}>}
 */
export async function generateVideo(prompt, { signal } = {}) {
    try {
        const submitResponse = await wanAsyncClient.post(
            '/services/aigc/video-generation/video-synthesis',
            {
                model: 'wan2.6-t2v',
                input: { prompt },
                parameters: {
                    size: '1280*720',
                    duration: 5,
                    prompt_extend: true,
                },
            },
            { signal },
        );

        const taskId = submitResponse.data?.output?.task_id;
        if (!taskId) {
            return { success: false, error: 'No task ID returned' };
        }

        return await pollTaskResult(taskId, { signal });
    } catch (error) {
        if (isAborted(error)) return { success: false, error: 'Request dibatalkan' };
        return { success: false, error: extractErrorMessage(error) };
    }
}

/**
 * Generate video from an image using Wan 2.6 I2V (image-to-video) — async with polling.
 * Falls back to text-to-video on error.
 *
 * @param {string} imageUrl  - Image URL or base64 data URI.
 * @param {string} prompt    - Video generation prompt.
 * @param {object} [options]
 * @param {string}  [options.resolution='1080P']
 * @param {number}  [options.duration=5]
 * @param {boolean} [options.audio=true]
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<{success: boolean, videoUrl?: string, error?: string}>}
 */
export async function generateVideoFromImage(imageUrl, prompt, options = {}) {
    const {
        resolution = '1080P',
        duration = 5,
        audio = true,
        signal,
    } = options;

    try {
        const submitResponse = await wanAsyncClient.post(
            '/services/aigc/video-generation/video-synthesis',
            {
                model: 'wan2.6-i2v-flash',
                input: {
                    prompt: prompt || 'Smooth cinematic animation of this product, gentle camera movement, professional lighting',
                    img_url: imageUrl,
                },
                parameters: {
                    resolution,
                    duration,
                    prompt_extend: true,
                    audio,
                },
            },
            { signal },
        );

        const taskId = submitResponse.data?.output?.task_id;
        if (!taskId) {
            return { success: false, error: 'No task ID returned' };
        }

        return await pollTaskResult(taskId, { signal });
    } catch (error) {
        if (isAborted(error)) return { success: false, error: 'Request dibatalkan' };
        // Fallback to text-to-video
        console.warn('I2V failed, falling back to T2V:', extractErrorMessage(error));
        return generateVideo(prompt, { signal });
    }
}

/**
 * Generate Reference-to-Video using Wan 2.6 R2V — async with polling.
 *
 * @param {string}   prompt         - Video description.
 * @param {string[]} referenceUrls  - Array of reference image/video URLs.
 * @param {object}   [options]
 * @param {string}   [options.size='1280*720']
 * @param {number}   [options.duration=5]
 * @param {string}   [options.shotType='single']
 * @param {boolean}  [options.audio=true]
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<{success: boolean, videoUrl?: string, error?: string}>}
 */
export async function generateR2V(prompt, referenceUrls = [], options = {}) {
    const { signal, ...params } = options;

    try {
        const submitResponse = await wanAsyncClient.post(
            '/services/aigc/video-generation/video-synthesis',
            {
                model: 'wan2.6-r2v-flash',
                input: {
                    prompt,
                    reference_urls: referenceUrls,
                },
                parameters: {
                    size: params.size || '1280*720',
                    duration: params.duration || 5,
                    shot_type: params.shotType || 'single',
                    audio: params.audio !== false,
                    watermark: params.watermark || false,
                },
            },
            { signal },
        );

        const taskId = submitResponse.data?.output?.task_id;
        if (!taskId) {
            return { success: false, error: 'No task ID returned' };
        }

        return await pollTaskResult(taskId, { signal });
    } catch (error) {
        if (isAborted(error)) return { success: false, error: 'Request dibatalkan' };
        return { success: false, error: extractErrorMessage(error) };
    }
}
