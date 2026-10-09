require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// APIステータス確認用エンドポイント
app.get('/api/status', (req, res) => {
    res.json({ status: "ok", version: "v14.26.8.1.01", message: "yuto-tube バックエンド稼働中" });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
