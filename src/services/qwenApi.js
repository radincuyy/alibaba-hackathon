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
        facebook: `Buatkan postingan Facebook yang menarik untuk mempromosikan produk berikut. Buat caption yang engaging dengan storytelling, emoji yang relevan, dan call-to-action (link di komentar, WA, dll). Cocok untuk Facebook Page atau grup jual beli. Gunakan bahasa Indonesia yang sopan, friendly, dan persuasif.`,
    };

    const systemPrompt = `Kamu adalah expert copywriter dan digital marketing specialist Indonesia yang berpengalaman membantu UMKM. Kamu sangat paham tren social media Indonesia dan cara membuat konten yang viral. Selalu gunakan Bahasa Indonesia yang natural.

ATURAN PENTING:
- Nama produk, harga, dan detail spesifik HARUS ditulis PERSIS sesuai data yang diberikan. JANGAN ubah ejaan, huruf besar/kecil, atau angka.
- Periksa ulang setiap kata dan angka sebelum memberikan output.
- Jangan menambahkan informasi yang tidak ada di data produk.`;

    const userPrompt = `${platformPrompts[platform] || platformPrompts.instagram}

Detail Produk:
- Nama Produk: ${productData.name}
- Kategori: ${productData.category}
- Harga: Rp ${productData.price}
- Keunggulan/Deskripsi: ${productData.description}

PENTING: Tulis nama produk "${productData.name}" dan harga "Rp ${productData.price}" PERSIS seperti tertulis di atas, tanpa mengubah ejaan.

Berikan output yang langsung bisa di-copy paste, tanpa penjelasan tambahan.`;

    try {
        const response = await qwenClient.post('/chat/completions', {
            model: 'qwen-plus',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            temperature: 0.65,
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
    const platforms = ['instagram', 'shopee', 'tiktok', 'whatsapp', 'twitter', 'facebook'];

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

export default {
    generateMarketingContent,
    generateAllContent,
};
