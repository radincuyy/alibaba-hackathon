<p align="center">
  <img src="public/logo.png" alt="UMKM Kreator Logo" width="120" />
</p>

<h1 align="center">UMKM Kreator</h1>

<p align="center">
  <strong>🚀 AI-Powered Marketing Content Generator for Indonesian MSMEs</strong>
</p>

<p align="center">
  <a href="#features"><img src="https://img.shields.io/badge/AI%20Tools-6-blueviolet?style=for-the-badge" alt="AI Tools" /></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" /></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" /></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/Tailwind%20CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" /></a>
  <a href="#ai-models"><img src="https://img.shields.io/badge/Powered%20by-Qwen%20AI%20%C3%97%20Wan%20Model-FF6A13?style=for-the-badge" alt="Qwen AI" /></a>
</p>

<p align="center">
  Buat caption sosial media, poster produk, video promosi, avatar virtual, dan deskripsi marketplace — semuanya dalam hitungan detik dengan kekuatan AI.
</p>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [AI Models](#ai-models)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [License](#license)

---

## Overview

**UMKM Kreator** is a comprehensive AI marketing assistant built specifically for Indonesia's 64M+ Micro, Small, and Medium Enterprises (MSMEs/UMKM). It democratizes professional marketing by letting small business owners generate high-quality, platform-optimized content without any design or copywriting skills.

Users simply input their product details, and the AI generates ready-to-post content across multiple platforms in under 30 seconds.

---

## Features

UMKM Kreator provides **6 AI-powered tools** designed around real UMKM workflows:

| # | Tool | Description | AI Model |
|---|------|-------------|----------|
| 🖊️ | **Caption & Konten** | Generate captions for Instagram, Shopee, TikTok, WhatsApp, and Twitter/X — all at once | Qwen AI |
| 🖼️ | **Poster Produk** | Create professional promotional posters from product descriptions or photos | Wan 2.6 T2I |
| 👤 | **Avatar Produk** | Generate AI virtual promoters — use your own face or AI-preset characters | Qwen VL + Wan 2.6 |
| 🎬 | **Video Promosi** | Create short promotional videos from product images or avatars with custom resolution & audio | Wan 2.6 I2V |
| 🛒 | **Deskripsi Marketplace** | Generate SEO-optimized product descriptions for Shopee, Tokopedia, and Lazada | Qwen AI |
| 🎥 | **Avatar Video Studio (R2V)** | Upload your photo/video and generate videos where an AI avatar moves and talks to promote your product | Wan 2.6 R2V |

### Key Highlights

- ⚡ **Fast Generation** — Content generated in <30 seconds
- 🌐 **Multi-Platform** — One input, 5+ platform outputs (Instagram, TikTok, Shopee, WhatsApp, X)
- 🇮🇩 **Made for Indonesia** — All prompts and outputs in Bahasa Indonesia
- 🎨 **Premium UI/UX** — Beautiful, responsive design with smooth animations
- 📱 **Mobile Friendly** — Fully responsive across all devices

---

## AI Models

UMKM Kreator leverages **Alibaba Cloud's DashScope** AI platform:

| Model | Usage |
|-------|-------|
| **Qwen (通义千问)** | Text generation — captions, descriptions, copywriting |
| **Qwen VL** | Vision-Language — analyzing product photos for accurate prompts |
| **Qwen Image Edit Max** | Image editing — avatar integration with character consistency |
| **Wan 2.6 T2I** | Text-to-Image — poster generation |
| **Wan 2.6 I2V Flash** | Image-to-Video — promotional video creation |
| **Wan 2.6 T2V** | Text-to-Video — cinematic product videos |
| **Wan 2.6 R2V Flash** | Reference-to-Video — avatar video with appearance preservation |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 19 |
| **Build Tool** | Vite 7 |
| **Styling** | Tailwind CSS 3 |
| **Routing** | React Router DOM 7 |
| **HTTP Client** | Axios |
| **Icons** | Lucide React |
| **AI Backend** | Alibaba Cloud DashScope API |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/) v9 or higher
- [Alibaba Cloud DashScope API Key](https://dashscope.console.aliyun.com/)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/radincuyy/alibaba-hackathon.git
   cd alibaba-hackathon
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory:

   ```env
   # Alibaba Cloud DashScope API Key
   # Get your API key from: https://dashscope.console.aliyun.com/
   VITE_DASHSCOPE_API_KEY=your_api_key_here
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open in browser**

   Navigate to `http://localhost:5173` (or the port shown in terminal).

---

## Project Structure

```
umkm-kreator/
├── public/
│   └── logo.png                  # App logo & favicon
├── src/
│   ├── components/
│   │   ├── Features.jsx          # AI tools showcase section
│   │   ├── Footer.jsx            # Site footer
│   │   ├── Hero.jsx              # Landing page hero section
│   │   ├── HowItWorks.jsx        # Step-by-step guide section
│   │   ├── Navbar.jsx            # Navigation bar
│   │   ├── ProductForm.jsx       # Product input form
│   │   ├── ResultTabs.jsx        # Multi-platform result display
│   │   └── ToolLayout.jsx        # Shared layout for tool pages
│   ├── pages/
│   │   ├── GeneratorPage.jsx     # Tool selection dashboard
│   │   ├── LandingPage.jsx       # Marketing landing page
│   │   └── tools/
│   │       ├── AvatarToolPage.jsx      # Avatar AI generator
│   │       ├── CaptionToolPage.jsx     # Caption & content generator
│   │       ├── MarketplaceToolPage.jsx # Marketplace description generator
│   │       ├── PosterToolPage.jsx      # Poster AI generator
│   │       ├── R2VStudioPage.jsx       # Reference-to-Video studio
│   │       └── VideoToolPage.jsx       # Video AI generator
│   ├── services/
│   │   ├── qwenApi.js            # Qwen AI API integration
│   │   └── wanApi.js             # Wan Model API integration
│   ├── App.jsx                   # Root component with routing
│   ├── index.css                 # Global styles & design system
│   └── main.jsx                  # Application entry point
├── .env                          # Environment variables (not committed)
├── index.html                    # HTML entry point
├── package.json                  # Dependencies & scripts
├── tailwind.config.js            # Tailwind CSS configuration
├── vite.config.js                # Vite build configuration
└── README.md
```

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_DASHSCOPE_API_KEY` | Alibaba Cloud DashScope API key for Qwen & Wan model access | ✅ Yes |

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build optimized production bundle |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint code quality checks |

---

## License

This project was built for the **Alibaba Cloud Hackathon 2026**.

---

<p align="center">
  Built with ❤️ for Indonesian UMKM 🇮🇩
</p>
