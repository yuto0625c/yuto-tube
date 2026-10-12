require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 認証キー定数
const ZERNIO_KEY = 'sk_8cdd9f1b464da95c5304265a5dfe5d763d15c8d11959a3d7f2bb61110dcfffb1';
const RAPID_KEY = '06f80e788fmsh4eefadddda0191dp186eb9jsn7a0f63c0eebb';

// リアルタイム多角化検索API (YouTube Auto/Piped/Invidious)
app.get('/api/search', async (req, res) => {
    const query = req.query.q || 'Roblox';
    
    // 1. Piped API 試行
    try {
        const response = await axios.get(`https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(query)}&filter=all`, { timeout: 4000 });
        const results = response.data.items.filter(item => item.type === 'stream').map(v => ({
            id: v.url.replace('/watch?v=', ''),
            title: v.title,
            author: v.uploaderName,
            views: v.views ? (v.views > 10000 ? (v.views / 10000).toFixed(1) + '万回視聴' : v.views + '回視聴') : '多数視聴',
            publishedText: v.uploadedDate || '最近',
            thumbnail: `https://wsrv.nl/?url=${encodeURIComponent(v.thumbnail)}`
        }));
        if (results.length > 0) return res.json({ success: true, videos: results });
    } catch (e) {
        console.log("Piped API search fallback...");
    }

    // 2. Invidious API 試行
    try {
        const response = await axios.get(`https://invidious.nerdvpn.de/api/v1/search?q=${encodeURIComponent(query)}`, { timeout: 4000 });
        const results = response.data.filter(item => item.type === 'video').map(v => ({
            id: v.videoId,
            title: v.title,
            author: v.author,
            views: v.viewCount ? (v.viewCount / 10000).toFixed(1) + '万回視聴' : '多数視聴',
            publishedText: v.publishedText || '最近',
            thumbnail: `https://wsrv.nl/?url=https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`
        }));
        if (results.length > 0) return res.json({ success: true, videos: results });
    } catch (e) {
        console.log("Invidious API search fallback...");
    }

    // 3. 自動バックアップ動画データ群 (取得制限時のフォールバック)
    res.json({
        success: true,
        videos: [
            { id: "dQw4w9WgXcQ", title: `${query} - ラッキーブロックを破るロブロックス (Roblox)`, author: "マエスケ", views: "179万回視聴", publishedText: "1 month ago", thumbnail: "https://wsrv.nl/?url=https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg" },
            { id: "3JZ_D3ELwOQ", title: `${query} - ASMRを開封しまくるロブロックス (Roblox)`, author: "マエスケ", views: "85万回視聴", publishedText: "2 weeks ago", thumbnail: "https://wsrv.nl/?url=https://i.ytimg.com/vi/3JZ_D3ELwOQ/hqdefault.jpg" },
            { id: "L_LUpnjgPso", title: `${query} - I raised too many animals... [ARK]`, author: "ロミくん", views: "42万回視聴", publishedText: "3 days ago", thumbnail: "https://wsrv.nl/?url=https://i.ytimg.com/vi/L_LUpnjgPso/hqdefault.jpg" },
            { id: "fJ9rUzIMcZQ", title: `${query} - サバイバル生活まとめ`, author: "公式チャンネル", views: "120万回視聴", publishedText: "5 days ago", thumbnail: "https://wsrv.nl/?url=https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg" }
        ]
    });
});

app.listen(PORT, () => {
    console.log(`yuto-tube Server running on port ${PORT}`);
});
