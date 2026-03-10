import axios from 'axios';

const DASHSCOPE_API_KEY = import.meta.env.VITE_DASHSCOPE_API_KEY || '';

// Use Vite proxy to avoid CORS issues
const wanClient = axios.create({
    baseURL: '/api/dashscope',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
    },
});

const wanAsyncClient = axios.create({
    baseURL: '/api/dashscope',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
        'X-DashScope-Async': 'enable',
    },
});

/**
 * Generate image using Wan 2.6 SYNCHRONOUS API
 * Model: wan2.6-t2i
 */
export async function generateImage(prompt) {
    console.log('🎨 Generating image with wan2.6-t2i (sync mode)...');

    try {
        const response = await wanClient.post('/services/aigc/multimodal-generation/generation', {
            model: 'wan2.6-t2i',
            input: {
                messages: [
                    {
                        role: 'user',
                        content: [
                            { text: prompt }
                        ]
                    }
                ]
            },
            parameters: {
                size: '1280*1280',
                n: 1,
                prompt_extend: true,
                watermark: false,
            },
        });

        console.log('✅ Image response received');

        const choices = response.data?.output?.choices;
        if (choices && choices.length > 0) {
            const content = choices[0]?.message?.content;
            if (content && content.length > 0) {
                const imageUrl = content[0]?.image;
                if (imageUrl) {
                    console.log('🖼️ Image generated successfully!');
                    return { success: true, imageUrl };
                }
            }
        }

        return { success: false, error: 'Format response tidak sesuai' };
    } catch (error) {
        const errMsg = error.response?.data?.message || error.response?.data?.error?.message || error.message;
        console.error('❌ Wan 2.6 T2I Error:', errMsg);
        return { success: false, error: errMsg };
    }
}

/**
 * Edit image using Qwen Image Edit Max (SYNCHRONOUS, better character consistency)
 * Model: qwen-image-edit-max
 * Endpoint: /services/aigc/multimodal-generation/generation (sync)
 * Takes user's avatar photo and edits it to show them presenting a product
 * Supports base64 input, up to 3 images, character consistency preserved!
 */
export async function editImageWithAvatar(avatarBase64, productImageBase64, editPrompt) {
    console.log('✏️ Editing image with qwen-image-edit-max (sync, character-consistent)...');

    // Build content array: images first, then text prompt
    const content = [
        { image: avatarBase64 },
    ];

    // If product image provided, add it too (supports up to 3 images)
    if (productImageBase64) {
        content.push({ image: productImageBase64 });
    }

    // Text prompt goes last
    content.push({ text: editPrompt });

    try {
        const response = await wanClient.post('/services/aigc/multimodal-generation/generation', {
            model: 'qwen-image-edit-max',
            input: {
                messages: [
                    {
                        role: 'user',
                        content: content,
                    }
                ]
            },
            parameters: {
                size: '1280*1280',
                n: 1,
                prompt_extend: true,
                watermark: false,
            },
        });

        console.log('✅ Image edit response received');

        const choices = response.data?.output?.choices;
        if (choices && choices.length > 0) {
            const msgContent = choices[0]?.message?.content;
            if (msgContent && msgContent.length > 0) {
                const imageUrl = msgContent[0]?.image;
                if (imageUrl) {
                    console.log('🖼️ Image edited successfully!');
                    return { success: true, imageUrl };
                }
            }
        }

        console.error('Unexpected response format:', JSON.stringify(response.data));
        return { success: false, error: 'Format response tidak sesuai' };
    } catch (error) {
        const errMsg = error.response?.data?.message || error.response?.data?.error?.message || error.message;
        const fullError = error.response?.data ? JSON.stringify(error.response.data) : error.message;
        console.error('❌ Qwen Image Edit Error:', errMsg);
        console.error('❌ Full error data:', fullError);
        return { success: false, error: errMsg };
    }
}

/**
 * Generate video using Wan 2.6 T2V (text-to-video) — async with polling
 * Model: wan2.6-t2v
 */
export async function generateVideo(prompt) {
    console.log('🎬 Generating video with wan2.6-t2v...');

    try {
        const submitResponse = await wanAsyncClient.post('/services/aigc/video-generation/video-synthesis', {
            model: 'wan2.6-t2v',
            input: {
                prompt: prompt,
            },
            parameters: {
                size: '1280*720',
                duration: 5,
                prompt_extend: true,
            },
        });

        const taskId = submitResponse.data.output?.task_id;
        if (!taskId) {
            throw new Error('No task ID returned');
        }

        console.log('📋 Video Task ID:', taskId);
        return await pollTaskResult(taskId);
    } catch (error) {
        const errMsg = error.response?.data?.message || error.response?.data?.error?.message || error.message;
        console.error('❌ Wan 2.6 T2V Error:', errMsg);
        return { success: false, error: errMsg };
    }
}

/**
 * Generate video from an IMAGE using Wan 2.6 I2V (image-to-video)
 * Model: wan2.6-i2v-flash
 *
 * @param {string} imageUrl - Image URL or base64 data URI
 * @param {string} prompt - Video generation prompt
 * @param {Object} options - Optional settings
 * @param {string} options.resolution - '720P' or '1080P' (default: '1080P')
 * @param {number} options.duration - 2-15 seconds (default: 5)
 * @param {boolean} options.audio - Enable auto audio (default: true)
 */
export async function generateVideoFromImage(imageUrl, prompt, options = {}) {
    const {
        resolution = '1080P',
        duration = 5,
        audio = true,
    } = options;

    console.log(`🎬 I2V: res=${resolution}, dur=${duration}s, audio=${audio}`);
    console.log('Image URL:', imageUrl?.substring(0, 80));

    try {
        const input = {
            prompt: prompt || 'Smooth cinematic animation of this product, gentle camera movement, professional lighting',
            img_url: imageUrl,
        };

        const submitResponse = await wanAsyncClient.post('/services/aigc/video-generation/video-synthesis', {
            model: 'wan2.6-i2v-flash',
            input,
            parameters: {
                resolution,
                duration,
                prompt_extend: true,
                audio,
            },
        });

        const taskId = submitResponse.data.output?.task_id;
        if (!taskId) {
            throw new Error('No task ID returned');
        }

        console.log('📋 I2V Video Task ID:', taskId);
        return await pollTaskResult(taskId);
    } catch (error) {
        const errMsg = error.response?.data?.message || error.response?.data?.error?.message || error.message;
        console.error('❌ Wan 2.6 I2V Error:', errMsg);
        // Fallback to text-to-video
        console.log('Falling back to text-to-video...');
        return generateVideo(prompt);
    }
}

/**
 * Poll for async task completion
 */
async function pollTaskResult(taskId, maxAttempts = 120, intervalMs = 5000) {
    for (let i = 0; i < maxAttempts; i++) {
        try {
            const response = await wanClient.get(`/tasks/${taskId}`);
            const output = response.data.output;
            const status = output?.task_status;

            console.log(`⏳ Poll ${i + 1}/${maxAttempts}: ${status}`);

            if (status === 'SUCCEEDED') {
                const videoUrl = output?.video_url || output?.results?.[0]?.url;
                if (videoUrl) {
                    console.log('✅ Task succeeded!');
                    return { success: true, videoUrl, taskId };
                }
            } else if (status === 'FAILED') {
                return {
                    success: false,
                    error: output?.message || output?.code || 'Generation failed',
                    taskId,
                };
            }

            await new Promise(resolve => setTimeout(resolve, intervalMs));
        } catch (error) {
            console.error('Poll error:', error.response?.data || error.message);
        }
    }

    return { success: false, error: 'Generation timed out', taskId };
}

/**
 * Generate Reference-to-Video using Wan 2.6 R2V
 * Model: wan2.6-r2v-flash
 * Preserves appearance/voice from reference images/videos
 * reference_urls: array of public image/video URLs
 * shot_type: "single" (continuous) or "multi" (multiple shots)
 * size: "1280*720", "720*1280", "960*960", "1920*1080", etc.
 */
export async function generateR2V(prompt, referenceUrls = [], options = {}) {
    console.log('🎬 Generating R2V with wan2.6-r2v-flash...');
    console.log(`📎 ${referenceUrls.length} reference(s)`);

    try {
        const submitResponse = await wanAsyncClient.post('/services/aigc/video-generation/video-synthesis', {
            model: 'wan2.6-r2v-flash',
            input: {
                prompt: prompt,
                reference_urls: referenceUrls, // array of image/video URLs
            },
            parameters: {
                size: options.size || '1280*720',
                duration: options.duration || 5,
                shot_type: options.shotType || 'single',
                audio: options.audio !== false,
                watermark: options.watermark || false,
            },
        });

        const taskId = submitResponse.data.output?.task_id;
        if (!taskId) {
            console.error('❌ No R2V task ID:', JSON.stringify(submitResponse.data));
            throw new Error('No task ID returned');
        }

        console.log('📋 R2V Task ID:', taskId);
        return await pollTaskResult(taskId);
    } catch (error) {
        const errMsg = error.response?.data?.message || error.response?.data?.error?.message || error.message;
        console.error('❌ Wan R2V Error:', errMsg);
        return { success: false, error: errMsg };
    }
}

/**
 * Generate poster image using Qwen Image 2.0 Pro
 * Model: qwen-image-2.0-pro
 * Supports both text-to-image and image+prompt editing in one function
 *
 * @param {string} prompt - Text prompt describing the poster
 * @param {string|null} imageBase64
 */
export async function generatePosterImage(prompt, imageBase64 = null) {
    console.log(`🎨 Generating poster with qwen-image-2.0-pro (${imageBase64 ? 'image+text' : 'text-only'})...`);

    // Build content array
    const content = [];
    if (imageBase64) {
        content.push({ image: imageBase64 });
    }
    content.push({ text: prompt });

    try {
        const response = await wanClient.post('/services/aigc/multimodal-generation/generation', {
            model: 'qwen-image-2.0-pro',
            input: {
                messages: [
                    {
                        role: 'user',
                        content: content,
                    }
                ]
            },
            parameters: {
                size: '1280*1280',
                n: 1,
                watermark: false,
            },
        });

        console.log('✅ Poster response received');

        const choices = response.data?.output?.choices;
        if (choices && choices.length > 0) {
            const msgContent = choices[0]?.message?.content;
            if (msgContent && msgContent.length > 0) {
                const imageUrl = msgContent[0]?.image;
                if (imageUrl) {
                    console.log('🖼️ Poster generated successfully!');
                    return { success: true, imageUrl };
                }
            }
        }

        console.error('Unexpected response:', JSON.stringify(response.data));
        return { success: false, error: 'Format response tidak sesuai' };
    } catch (error) {
        const errMsg = error.response?.data?.message || error.response?.data?.error?.message || error.message;
        console.error('❌ Qwen Image 2.0 Pro Error:', errMsg);
        return { success: false, error: errMsg };
    }
}

export default {
    generateImage,
    editImageWithAvatar,
    generateVideo,
    generateVideoFromImage,
    generateR2V,
    generatePosterImage,
};
