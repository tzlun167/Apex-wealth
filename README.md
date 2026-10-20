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
├── en/                 英文版（同構五頁，共用 assets）
│   ├── index.html
│   ├── about.html
│   ├── services.html
│   ├── security.html
│   └── contact.html
└── assets/
    ├── css/main.css    視覺系統（設計 token、版面、元件、動效、語言版型）
    └── js/main.js      導覽、捲動漸顯、表單處理
```

### 多語系

中文版在根目錄，英文版在 `en/`，兩者共用 `assets/`。

- 切換方式：各頁導覽列右上角的 `EN` / `中文` 連結
- 排版差異：英文版在 `<body>` 加上 `class="lang-en"`，由 `main.css` 第 13 節
  收斂拉丁文字的字距與行距（中文的寬字距套在英文上會顯得鬆散）
- SEO：各頁以 `hreflang` 標註中英對照
- 新增語言：複製 `en/` 為目標語系目錄，改 `<html lang>` 與 `body` class 即可

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

本專案已啟用 GitHub Pages：

- 中文版：https://tzlun167.github.io/Apex-wealth/
- 英文版：https://tzlun167.github.io/Apex-wealth/en/

## 掛自訂域名

### 情境一：掛在 GitHub Pages（建議）

**1. 在 repo 根目錄新增 `CNAME` 檔**（內容只有一行網域，不含 `https://`）

```
apex-wealth.com.tw
```

**2. 到網域商設定 DNS 記錄**

| 類型 | 名稱 | 值 |
| --- | --- | --- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `tzlun167.github.io` |

> 四筆 A 記錄指向 GitHub Pages 的固定 IP。`www` 用 CNAME 指向 `tzlun167.github.io`（結尾不加路徑）。

**3. 等待 DNS 生效**（通常 10 分鐘至數小時）

```bash
dig +short apex-wealth.com.tw
```

**4. 到 GitHub 設定頁填入網域**

Repo → Settings → Pages → Custom domain → 輸入網域 → Save

**5. 勾選 Enforce HTTPS**（憑證簽發約需數分鐘至一小時）

**6. 驗證**

```bash
curl -sI https://apex-wealth.com.tw | head -3
```

### 情境二：掛在自己的 nginx（VPS）

設定檔已備妥於 `/etc/nginx/sites-available/apex-wealth`，預設監聽 8080。
改用 80/443 與網域：

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name apex-wealth.com.tw www.apex-wealth.com.tw;

    root /var/www/Apex-wealth;
    index index.html;
    charset utf-8;

    location / {
        try_files $uri $uri/ $uri.html =404;
    }
}
```

```bash
sudo ln -sfn /etc/nginx/sites-available/apex-wealth /etc/nginx/sites-enabled/apex-wealth
sudo nginx -t && sudo systemctl reload nginx

# 免費 TLS 憑證
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d apex-wealth.com.tw -d www.apex-wealth.com.tw
```

> 注意：同機的 erp 站台目前是 `listen 80 default_server`。若兩者都要用 80，
> 需以 `server_name` 區分（本設定已含），並確認 erp 的設定仍能比對到自己的網域。

### 情境三：掛在 Cloudflare（免自架、附 CDN）

1. 網域 DNS 交給 Cloudflare 代管
2. Pages → Connect to Git → 選 `Apex-wealth` repo
3. 建置設定全部留空（純靜態，無需 build command）
4. Pages → Custom domains → 加入網域，Cloudflare 會自動建立記錄並簽發憑證

## 待辦

- [ ] 預約表單目前以 `mailto:` 開啟本機郵件軟體送出。若需實際收件，須串接表單服務（Formspree / Cloudflare Workers / 自建 API）。
- [ ] 依實際據點補齊地址與聯絡電話。
- [x] 多語系（繁中 / EN）——已建置 `en/` 五頁並接上切換。
- [ ] 如需日文或其他語系，複製 `en/` 為樣板。

## 聲明

本網站所載內容不構成任何投資建議、要約或招攬，亦不保證任何未來收益。
