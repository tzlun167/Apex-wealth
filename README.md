# 鼎富資本 APEX WEALTH

> 鼎立巔峰，世代長青。
> Empowering Your Apex, Securing Your Wealth.

頂級家族辦公室形象網站。純靜態（HTML / CSS / Vanilla JS），無建置流程、無相依套件。

## 專案結構

```
.
├── index.html          首頁：劇院式主視覺、核心理念、服務總覽、隱私預告
├── about.html          關於鼎富：家族精神的延續、三個不變的原則
├── services.html       核心服務：三項託付、協作四步
├── security.html       私密與安全：六道防線、資料處理原則、必要聲明
├── contact.html        尊榮預約：諮詢表單、辦公室資訊
└── assets/
    ├── css/main.css    視覺系統（設計 token、版面、元件、動效）
    └── js/main.js      導覽、捲動漸顯、表單處理
```

## 設計規範

**配色**——沉穩誠信為基調，點綴僅用低飽和金屬色：

| 用途 | 色票 | 值 |
| --- | --- | --- |
| 主背景 | 深大不列顛綠 | `#071C16` |
| 深底／過渡 | 墨綠 → 深夜藍 | `#04120E` / `#0B1A33` |
| 點綴 | 古銅金 | `#B08D57` |
| 點綴（亮） | 香檳金 | `#D9C08B` |
| 正文 | 暖白 | `#EDE9E1` |

**字體**——內斂襯線，避免現代無襯線的輕浮感：

- 中文：`Noto Serif TC`（遞補 `Source Han Serif TC` / `Songti TC`）
- 英文：`EB Garamond`（遞補 `Garamond` / `Baskerville`）

**排版**——極簡留白，畫面呼吸：

- 字級 `clamp(17px, 0.35vw + 16px, 19.5px)`，行距 `2.05`
- 區塊垂直間距 `clamp(6rem, 13vw, 13rem)`
- 標題字距 `0.06em` ～ `0.16em`

**主視覺**——原創 SVG 東方山水與百年古樹，**不使用圖庫罐頭照**（無西裝握手、無高樓大廈群）。

**動效**——僅緩慢漸顯與優雅位移：

- 過場 `1.4s` ～ `2.2s`，`cubic-bezier(0.22, 0.61, 0.36, 1)`
- 位移上限 `26px`，交錯間隔 `0.16s`
- 嚴禁閃爍、快速飛入、刺眼動畫
- 尊重 `prefers-reduced-motion`

## 本機預覽

無需建置，任一靜態伺服器即可：

```bash
python3 -m http.server 8080
# 或
npx serve .
```

瀏覽 `http://localhost:8080/`。

## 部署

### nginx（本機 / VPS）

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/Apex-wealth;
    index index.html;

    charset utf-8;

    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    location ~* \.(css|js|svg|png|jpg|jpeg|webp|woff2?)$ {
        expires 7d;
        add_header Cache-Control "public";
        try_files $uri =404;
    }

    location / {
        try_files $uri $uri/ $uri.html =404;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/apex-wealth /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 靜態託管

亦適用 GitHub Pages、Cloudflare Pages、Netlify、Vercel 等——直接指向專案根目錄即可。

## 待辦

- [ ] 預約表單目前以 `mailto:` 開啟本機郵件軟體送出。若需實際收件，須串接表單服務（Formspree / Cloudflare Workers / 自建 API）。
- [ ] 依實際據點補齊地址與聯絡電話。
- [ ] 若需多語系（EN / 繁中），建議加語言切換。

## 聲明

本網站所載內容不構成任何投資建議、要約或招攬，亦不保證任何未來收益。
