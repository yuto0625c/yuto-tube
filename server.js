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

// APIステータス確認
app.get('/api/status', (req, res) => {
    res.json({ status: "ok", version: "v14.26.8.1.01", message: "yuto-tube バックエンド完全稼働中" });
});

// 安定版 リアルタイムYouTube動画検索API
app.get('/api/search', async (req, res) => {
    const query = req.query.q || 'Roblox';
    
    // 複数の公開APIエンドポイントを順番に試す仕組み（安定化対策）
    const instances = [
        'https://inv.tux.stream',
        'https://invidious.nerdvpn.de',
        'https://vid.puffyan.us'
    ];

    let searchResults = [];

    for (const instance of instances) {
        try {
            const response = await axios.get(`${instance}/api/v1/search?q=${encodeURIComponent(query)}`, {
                timeout: 4000
            });
            
            if (response.data && response.data.length > 0) {
                searchResults = response.data
                    .filter(item => item.type === 'video' && item.videoId)
                    .map(v => ({
                        id: v.videoId,
                        title: v.title,
                        author: v.author,
                        views: v.viewCount ? (v.viewCount > 10000 ? (v.viewCount / 10000).toFixed(1) + '万回' : v.viewCount + '回') : '視聴数不明',
                        publishedText: v.publishedText || '最近',
                        // 本物のサムネイル画像URLを生成
                        thumbnail: `https://wsrv.nl/?url=https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`
                    }));
                break; // 取得成功したらループを抜ける
            }
        } catch (e) {
            // エラー時は次のインスタンスを試す
            continue;
        }
    }

    res.json({ success: true, videos: searchResults });
});

app.listen(PORT, () => {
    console.log(`yuto-tube Server running on port ${PORT}`);
});
