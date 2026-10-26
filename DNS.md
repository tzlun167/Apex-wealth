# apex-wealth.com.tw — DNS 記錄設定

供 TISNet 代管面板使用。狀態標記：✅ 已設定 · ⬜ 待設定

---

## 1. 網站

| 類型 | 名稱 | 值 | 狀態 |
| --- | --- | --- | --- |
| A | `@` | `61.216.74.25` | ✅ |
| A | `www` | `61.216.74.25` | ✅ |

> 站台目前**已下線**（nginx 站台停用），DNS 保留以便定稿後直接上線。

---

## 2. 郵件

| 類型 | 名稱 | 值 | 狀態 |
| --- | --- | --- | --- |
| MX | `@` | `10 mail.apex-wealth.com.tw.` | ✅ |
| A | `mail` | `61.216.74.25` | ✅ |
| PTR | `61.216.74.25` | `mail.apex-wealth.com.tw` | ✅ |

---

## 3. SPF

| 類型 | 名稱 | 值 | 狀態 |
| --- | --- | --- | --- |
| TXT | `@` | `v=spf1 ip4:61.216.74.25 -all` | ✅ |

說明：僅授權 `61.216.74.25` 寄信，其餘一律拒絕（`-all` 為嚴格模式）。

---

## 4. DKIM

**名稱**：`default._domainkey`
**類型**：TXT

**值**（單行，直接貼上）：

```
v=DKIM1; h=sha256; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1dn/oGW1u5OLfpMpvr9eN1GjyyrdGCyfXm9oZ14sAshoxC6AF07MhrzOFF2193RyyVJfBTH0yIJHGmUjsQ6mpPgivRD+p4EIG6OblW5vDjNyXrv5ojhlTFg7iZdVD7SOglIelFaqRZ3evvro6pQlK9zr3qquVpGR0xKHY+m6DVgjMksmPbtqQxlxTaT4RCN3Ibf7h6JnLyL8R6zsncPxL5BgBb93pRRsTk0ybYO49Y5MOVA1Hxy4MQcAk3ciYdOP5lU0ajkgcbXj6xyOo/7uanSSsCNTqtJGdlFpqvHmQwgwENPVwPs3t76jQXmC7lh+FwOy8+LyUGErI1l9qjxRgwIDAQAB
```

- 金鑰強度：RSA 2048-bit
- 公鑰長度：392 字元（base64 解碼 294 bytes，結構驗證通過）
- 私鑰位置：`192.168.1.34:/etc/dkimkeys/default.private`（權限 600，僅 root 可讀）
- 對應私鑰已驗證匹配（由私鑰導出之公鑰與此值完全一致）

**若面板限制單一 TXT 值長度**（部分舊式面板上限 255 字元），拆成兩段填入：

```
v=DKIM1; h=sha256; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1dn/oGW1u5OLfpMpvr9eN1GjyyrdGCyfXm9oZ14sAshoxC6AF07MhrzOFF2193RyyVJfBTH0yIJHGmUjsQ6mpPgivRD+p4EIG6OblW5vDjNyXrv5ojhlTFg7iZdVD7SOglIelFaqRZ3evvro6pQlK9zr3qquVpGR0xKHY+m6DVgjMksmPbtqQxlx
```

```
TaT4RCN3Ibf7h6JnLyL8R6zsncPxL5BgBb93pRRsTk0ybYO49Y5MOVA1Hxy4MQcAk3ciYdOP5lU0ajkgcbXj6xyOo/7uanSSsCNTqtJGdlFpqvHmQwgwENPVwPs3t76jQXmC7lh+FwOy8+LyUGErI1l9qjxRgwIDAQAB
```

> 分段時**不要在兩段間加空格或分號**，DNS 面板會自動串接。

---

## 5. DMARC

**名稱**：`_dmarc`
**類型**：TXT

### 建議值（先觀察，不擋信）

```
v=DMARC1; p=none; rua=mailto:office@apex-wealth.com.tw; ruf=mailto:office@apex-wealth.com.tw; fo=1; adkim=r; aspf=r; pct=100
```

政策說明：

| 標籤 | 值 | 意義 |
| --- | --- | --- |
| `p` | `none` | 只監控不處置，先收集報告 |
| `rua` | `mailto:...` | 彙總報告收件匣 |
| `ruf` | `mailto:...` | 失敗報告收件匣 |
| `fo` | `1` | 任一驗證失敗即產生報告 |
| `adkim` / `aspf` | `r` | 寬鬆對齊（子網域寄信仍算通過） |
| `pct` | `100` | 政策適用百分比 |

### 收緊步驟（確認郵件運作正常後）

```
v=DMARC1; p=quarantine; rua=mailto:office@apex-wealth.com.tw; adkim=s; aspf=s; pct=100
```

最終可改為 `p=reject`（完全拒絕未通過驗證的信）。

> ⚠️ **`rua` / `ruf` 的收件信箱目前不存在**——`office@apex-wealth.com.tw` 尚無法收信（見下方限制）。報告會寄失敗。可先改成你現有的外部信箱，或等信箱開通後再填。

---

## ⚠️ 目前無法運作的項目（重要）

DNS 記錄齊備**不等於**郵件系統可用。以下為實際障礙：

1. **DKIM 簽章未啟用**
   DNS 上的公鑰只是「宣告」，實際寄信時需要郵件伺服器用私鑰簽章。目前：
   - `opendkim` 服務**未安裝**（只裝了 `opendkim-tools` 產金鑰）
   - postfix **未接上 milter**
   → 即使 TXT 設好，寄出的信仍不會帶 DKIM 簽章

2. **對外 25 / 587 埠不通**
   實測 `61.216.74.25:25` 與 `:587` 從外部皆無回應，代表：
   - **無法接收外網寄來的信**（MX 指向本機也沒用）
   - 多數收信端會拒收從動態／未開放埠寄出的信

3. **`office@apex-wealth.com.tw` 信箱尚未建立**
   postfix 目前是 loopback-only，只在本機投遞，且沒有該帳號。

**要讓郵件真正能用，需先處理 25 埠對外開放（路由器 port forwarding + ISP 是否封鎖 25），再設定 opendkim 簽章與信箱。**
