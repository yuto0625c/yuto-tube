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

// 動画検索API (マルチフォールバック)
app.get('/api/search', async (req, res) => {
    const query = req.query.q || 'Roblox';
    try {
        const response = await axios.get(`https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(query)}&filter=all`, { timeout: 4000 });
        const results = response.data.items.filter(item => item.type === 'stream').map(v => ({
            id: v.url.replace('/watch?v=', ''),
            title: v.title,
            author: v.uploaderName,
            views: v.views ? (v.views / 10000).toFixed(1) + '万回' : '多数視聴',
            thumbnail: `https://wsrv.nl/?url=${encodeURIComponent(v.thumbnail)}`
        }));
        return res.json({ success: true, videos: results });
    } catch (e) {
        // バックアップ自動生成データ
        res.json({
            success: true,
            videos: [
                { id: "dQw4w9WgXcQ", title: `${query} おすすめ動画 1`, author: "公式チャンネル", views: "100万回", thumbnail: "https://wsrv.nl/?url=https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg" },
                { id: "3JZ_D3ELwOQ", title: `${query} おすすめ動画 2`, author: "公式チャンネル", views: "85万回", thumbnail: "https://wsrv.nl/?url=https://i.ytimg.com/vi/3JZ_D3ELwOQ/hqdefault.jpg" }
            ]
        });
    }
});

app.listen(PORT, () => {
    console.log(`yuto-tube Server running on port ${PORT}`);
});
