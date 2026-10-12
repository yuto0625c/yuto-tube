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

// APIキー設定
const ZERNIO_KEY = 'sk_8cdd9f1b464da95c5304265a5dfe5d763d15c8d11959a3d7f2bb61110dcfffb1';
const RAPID_KEY = '06f80e788fmsh4eefadddda0191dp186eb9jsn7a0f63c0eebb';

// 1. 通常長尺動画検索 (ショート排除 & 動的検索)
app.get('/api/search', async (req, res) => {
    const query = req.query.q || 'YouTube 日本 急上昇';
    
    try {
        const response = await axios.get(`https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(query)}&filter=videos`, { timeout: 5000 });
        const results = response.data.items
            .filter(item => item.type === 'stream' && item.url && (!item.duration || item.duration > 60))
            .map(v => {
                const videoId = v.url.replace('/watch?v=', '');
                return {
                    id: videoId,
                    title: v.title,
                    author: v.uploaderName || 'YouTube チャンネル',
                    views: v.views ? (v.views > 10000 ? (v.views / 10000).toFixed(1) + '万回' : v.views + '回') : '多数視聴',
                    publishedText: v.uploadedDate || '最近',
                    thumbnail: `https://wsrv.nl/?url=https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
                };
            });
        
        if (results.length > 0) return res.json({ success: true, videos: results });
    } catch (e) {}

    res.json({
        success: true,
        videos: [
            { id: "L_LUpnjgPso", title: `${query} - トレンド動画 #1`, author: "公式チャンネル", views: "120万回", publishedText: "最近", thumbnail: "https://wsrv.nl/?url=https://i.ytimg.com/vi/L_LUpnjgPso/hqdefault.jpg" },
            { id: "3JZ_D3ELwOQ", title: `${query} - おすすめ動画 #2`, author: "マエスケ", views: "85万回", publishedText: "最近", thumbnail: "https://wsrv.nl/?url=https://i.ytimg.com/vi/3JZ_D3ELwOQ/hqdefault.jpg" }
        ]
    });
});

// 2. ショート専用API (60秒以下縦動画のみ)
app.get('/api/shorts', async (req, res) => {
    try {
        const response = await axios.get(`https://pipedapi.kavin.rocks/search?q=shorts&filter=videos`, { timeout: 5000 });
        const results = response.data.items
            .filter(item => item.type === 'stream' && item.url && item.duration && item.duration <= 60)
            .map(v => ({
                id: v.url.replace('/watch?v=', ''),
                title: v.title,
                author: v.uploaderName || 'Shorts Creator'
            }));
        if (results.length > 0) return res.json({ success: true, shorts: results });
    } catch (e) {}

    res.json({
        success: true,
        shorts: [
            { id: "dQw4w9WgXcQ", title: "バズりショート動画 #1", author: "Shorts Creator" }
        ]
    });
});

app.listen(PORT, () => {
    console.log(`yuto-tube Server running on port ${PORT}`);
});
