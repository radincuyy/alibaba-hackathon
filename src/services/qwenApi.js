import axios from 'axios';

const DASHSCOPE_API_KEY = import.meta.env.VITE_DASHSCOPE_API_KEY || '';

// Use Vite proxy to avoid CORS issues
const qwenClient = axios.create({
    baseURL: '/api/dashscope-compatible',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
    },
});

/**
 * Generate marketing content for a product using Qwen
 */
export async function generateMarketingContent(productData, platform) {
    const platformPrompts = {
        instagram: `Buatkan caption Instagram yang menarik, engaging, dan viral untuk produk berikut. Gunakan emoji yang relevan, hashtag populer (minimal 10 hashtag), dan call-to-action yang kuat. Gunakan bahasa Indonesia yang casual dan friendly.`,
        shopee: `Buatkan deskripsi produk untuk marketplace Shopee/Tokopedia yang SEO-friendly dan menarik pembeli. Sertakan: judul produk yang menarik, deskripsi detail dengan bullet points, spesifikasi, dan keunggulan. Gunakan bahasa Indonesia yang profesional namun mudah dipahami.`,
        tiktok: `Buatkan script video TikTok 15-30 detik untuk mempromosikan produk berikut. Format: [Detik ke-X: Aksi/Dialog]. Buat yang catchy, fun, dan trending. Sertakan hook di 3 detik pertama. Gunakan bahasa Indonesia yang gaul dan relatable.`,
        whatsapp: `Buatkan pesan broadcast WhatsApp promosi untuk produk berikut. Buat singkat, padat, menarik dengan emoji. Sertakan info produk, harga, dan cara order. Gunakan bahasa Indonesia yang sopan tapi friendly.`,
        twitter: `Buatkan thread Twitter/X (3-5 tweet) untuk mempromosikan produk berikut. Setiap tweet maksimal 280 karakter. Buat yang engaging, informatif, dan ada call-to-action. Gunakan bahasa Indonesia yang witty.`,
    };

    const systemPrompt = `Kamu adalah expert copywriter dan digital marketing specialist Indonesia yang berpengalaman membantu UMKM. Kamu sangat paham tren social media Indonesia dan cara membuat konten yang viral. Selalu gunakan Bahasa Indonesia yang natural.`;

    const userPrompt = `${platformPrompts[platform] || platformPrompts.instagram}

Detail Produk:
- Nama Produk: ${productData.name}
- Kategori: ${productData.category}
- Harga: Rp ${productData.price}
- Keunggulan/Deskripsi: ${productData.description}
- Target Audience: ${productData.target || 'Semua kalangan'}

Berikan output yang langsung bisa di-copy paste, tanpa penjelasan tambahan.`;

    try {
        const response = await qwenClient.post('/chat/completions', {
            model: 'qwen-plus',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            temperature: 0.8,
            max_tokens: 1500,
        });

        return {
            success: true,
            content: response.data.choices[0].message.content,
            platform,
        };
    } catch (error) {
        console.error('Qwen API Error:', error);
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message,
            platform,
        };
    }
}

/**
 * Generate all platform content at once
 */
export async function generateAllContent(productData) {
    const platforms = ['instagram', 'shopee', 'tiktok', 'whatsapp', 'twitter'];

    const results = await Promise.allSettled(
        platforms.map(platform => generateMarketingContent(productData, platform))
    );

    return results.reduce((acc, result, index) => {
        acc[platforms[index]] = result.status === 'fulfilled'
            ? result.value
            : { success: false, error: 'Generation failed', platform: platforms[index] };
        return acc;
    }, {});
}

/**
 * Generate image prompt — uses Qwen VL if product image is available for
 * more accurate results, otherwise uses text-only Qwen
 */
export async function generateImagePrompt(productData) {
    const hasImage = productData.imagePreview && productData.imagePreview.startsWith('data:');

    if (hasImage) {
        // Use Qwen VL to analyze the product image and create a better prompt
        console.log('📸 Using Qwen VL to analyze product image...');
        return generateImagePromptWithVision(productData);
    }

    // Fallback: text-only prompt generation
    return generateImagePromptTextOnly(productData);
}

/**
 * Generate image prompt using Qwen VL (Vision-Language) model
 * Analyzes the uploaded product image for more accurate poster generation
 */
async function generateImagePromptWithVision(productData) {
    const systemPrompt = `You are a professional product photographer and graphic designer. You will be shown a product image. Analyze it carefully, then generate a detailed English prompt for an AI image generator to create a stunning promotional poster for this product. The poster should showcase the product prominently.`;

    const userPrompt = `Look at this product image carefully. This is "${productData.name}" (${productData.category}).
Description: ${productData.description}

Based on what you see in the image, create a detailed prompt for generating a professional promotional poster. Include:
- Accurate description of the product's appearance (colors, shape, packaging)
- Modern, eye-catching layout and composition
- Professional lighting and background
- Marketing-style presentation

Output ONLY the image generation prompt, nothing else. Keep it under 200 words.`;

    try {
        const response = await qwenClient.post('/chat/completions', {
            model: 'qwen-vl-plus',
            messages: [
                { role: 'system', content: systemPrompt },
                {
                    role: 'user',
                    content: [
                        { type: 'image_url', image_url: { url: productData.imagePreview } },
                        { type: 'text', text: userPrompt },
                    ],
                },
            ],
            temperature: 0.7,
            max_tokens: 500,
        });

        return {
            success: true,
            prompt: response.data.choices[0].message.content,
        };
    } catch (error) {
        console.error('Qwen VL Error:', error);
        // Fallback to text-only if VL fails
        console.log('Falling back to text-only prompt generation...');
        return generateImagePromptTextOnly(productData);
    }
}

/**
 * Generate image prompt using text-only Qwen (fallback)
 */
async function generateImagePromptTextOnly(productData) {
    const systemPrompt = `You are a professional product photographer and graphic designer. Generate a detailed English prompt for an AI image generator to create a stunning product promotional poster.`;

    const userPrompt = `Create a detailed image generation prompt for a promotional poster of this product:
- Product: ${productData.name}
- Category: ${productData.category}
- Description: ${productData.description}

The poster should be modern, professional, eye-catching, suitable for social media marketing. Include details about lighting, composition, colors, and style. Output ONLY the image prompt, nothing else.`;

    try {
        const response = await qwenClient.post('/chat/completions', {
            model: 'qwen-plus',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            temperature: 0.7,
            max_tokens: 500,
        });

        return {
            success: true,
            prompt: response.data.choices[0].message.content,
        };
    } catch (error) {
        console.error('Image prompt generation error:', error);
        return {
            success: false,
            error: error.message,
        };
    }
}

/**
 * Generate video prompt — avatar-aware for I2V
 * When avatar is selected: prompt focuses on the PERSON moving, talking, presenting
 * When no avatar: prompt focuses on the PRODUCT in a cinematic way
 */
export async function generateVideoPrompt(productData) {
    const hasAvatar = productData.avatarStyle && productData.avatarStyle !== 'none';
    const avatarDesc = productData.avatarPrompt || '';

    if (hasAvatar) {
        // AVATAR VIDEO: Focus on the person moving and speaking IN INDONESIAN
        const prompt = `Orang dalam gambar ini mulai bergerak secara alami. Dia menoleh sedikit ke arah kamera dengan senyuman hangat dan tulus. Dia mengangkat produk "${productData.name}" lebih dekat ke kamera untuk menunjukkannya, mengangguk antusias sambil terlihat berbicara dan merekomendasikan produk dalam Bahasa Indonesia. Bibirnya bergerak seolah sedang berbicara kepada penonton. Latar belakang memiliki pencahayaan bokeh yang lembut. Kamera perlahan zoom in sedikit. Gerakan alami dan realistis, gaya iklan media sosial.`;

        return {
            success: true,
            prompt: prompt,
        };
    }

    // NON-AVATAR VIDEO: Focus on the product
    const hasImage = productData.imagePreview && productData.imagePreview.startsWith('data:');

    const systemPrompt = `You are a professional video director. Generate a concise English prompt for an AI video generator to create a short promotional video clip (5 seconds). Focus on smooth camera movement and cinematic product presentation.`;

    let messages;

    if (hasImage) {
        messages = [
            { role: 'system', content: systemPrompt },
            {
                role: 'user',
                content: [
                    { type: 'image_url', image_url: { url: productData.imagePreview } },
                    {
                        type: 'text', text: `Look at this product image. This is "${productData.name}" (${productData.category}): ${productData.description}

Create a cinematic video prompt: slow camera orbit around the product, dramatic lighting, particles or steam effects if appropriate, luxurious feel. Keep it under 100 words. Output ONLY the video prompt.`
                    },
                ],
            },
        ];
    } else {
        messages = [
            { role: 'system', content: systemPrompt },
            {
                role: 'user', content: `Create a video prompt for: ${productData.name} (${productData.category}): ${productData.description}

The video should show the product with cinematic camera movement, dramatic lighting, and premium feel. Keep it under 100 words. Output ONLY the prompt.`
            },
        ];
    }

    try {
        const response = await qwenClient.post('/chat/completions', {
            model: hasImage ? 'qwen-vl-plus' : 'qwen-plus',
            messages,
            temperature: 0.7,
            max_tokens: 200,
        });

        return {
            success: true,
            prompt: response.data.choices[0].message.content,
        };
    } catch (error) {
        console.error('Video prompt generation error:', error);
        return {
            success: false,
            error: error.message,
        };
    }
}

/**
 * Generate avatar prompt — creates a prompt for an AI avatar presenting the product
 * Supports custom avatar: sends the user's uploaded photo to Qwen VL for analysis
 */
export async function generateAvatarPrompt(productData) {
    const isCustomAvatar = productData.avatarStyle === 'custom';
    const hasCustomPhoto = isCustomAvatar && productData.customAvatarPreview?.startsWith('data:');
    const hasProductImage = productData.imagePreview?.startsWith('data:');
    const avatarDesc = productData.avatarPrompt || 'A friendly professional person';

    const systemPrompt = `You are a professional advertising creative director. Generate a detailed English prompt for an AI image generator. The image should show a person presenting/advertising a product, like a social media endorsement photo.`;

    let messages;

    if (hasCustomPhoto && hasProductImage) {
        // Custom avatar + product image: send BOTH images to Qwen VL
        console.log('📸 Custom avatar + product image → Qwen VL analyzing both');
        messages = [
            { role: 'system', content: systemPrompt },
            {
                role: 'user',
                content: [
                    { type: 'image_url', image_url: { url: productData.customAvatarPreview } },
                    { type: 'image_url', image_url: { url: productData.imagePreview } },
                    {
                        type: 'text',
                        text: `The FIRST image shows a person. The SECOND image shows a product called "${productData.name}" (${productData.category}): ${productData.description}

Create a detailed prompt to generate an advertisement photo where:
- A person who looks EXACTLY like the person in the first image (same face, same features, same skin tone, same hairstyle)
- Is holding or presenting the product from the second image
- Professional studio or lifestyle setting
- Looking at camera with warm, confident expression
- Social media advertisement composition
- Photorealistic, high quality

Describe the person's appearance in detail (face, hair, body type, clothing). Output ONLY the prompt, under 200 words.`
                    },
                ],
            },
        ];
    } else if (hasCustomPhoto) {
        // Custom avatar only (no product image)
        console.log('📸 Custom avatar (no product image) → Qwen VL analyzing person');
        messages = [
            { role: 'system', content: systemPrompt },
            {
                role: 'user',
                content: [
                    { type: 'image_url', image_url: { url: productData.customAvatarPreview } },
                    {
                        type: 'text',
                        text: `This image shows a person. Create a prompt for an advertisement photo where:
- A person who looks EXACTLY like this person (same face, features, skin tone, hairstyle)
- Is holding or presenting a product called "${productData.name}" (${productData.category}): ${productData.description}
- Professional studio or lifestyle setting
- Looking at camera, confident smile
- Social media ad composition, photorealistic

Describe the person's detailed appearance. Output ONLY the prompt, under 200 words.`
                    },
                ],
            },
        ];
    } else if (hasProductImage) {
        // Preset avatar + product image
        messages = [
            { role: 'system', content: systemPrompt },
            {
                role: 'user',
                content: [
                    { type: 'image_url', image_url: { url: productData.imagePreview } },
                    {
                        type: 'text',
                        text: `This is the product "${productData.name}" (${productData.category}): ${productData.description}

Create a prompt showing this person: ${avatarDesc}
Holding or presenting this exact product (describe its appearance from the image).
Professional studio setting, warm expression, social media ad style, photorealistic.
Output ONLY the prompt, under 200 words.`
                    },
                ],
            },
        ];
    } else {
        // Preset avatar, no product image (text only)
        messages = [
            { role: 'system', content: systemPrompt },
            {
                role: 'user',
                content: `Create an advertisement photo prompt:
Person: ${avatarDesc}
Product: ${productData.name} (${productData.category}): ${productData.description}
Setting: professional studio, warm expression, holding product, social media ad, photorealistic.
Output ONLY the prompt, under 200 words.`
            },
        ];
    }

    const useVL = hasCustomPhoto || hasProductImage;

    try {
        const response = await qwenClient.post('/chat/completions', {
            model: useVL ? 'qwen-vl-plus' : 'qwen-plus',
            messages,
            temperature: 0.7,
            max_tokens: 400,
        });

        return {
            success: true,
            prompt: response.data.choices[0].message.content,
        };
    } catch (error) {
        console.error('Avatar prompt generation error:', error);
        return {
            success: false,
            error: error.message,
        };
    }
}

export default {
    generateMarketingContent,
    generateAllContent,
    generateImagePrompt,
    generateVideoPrompt,
    generateAvatarPrompt,
};

