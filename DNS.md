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

## ✅ DKIM 簽章已啟用（2026-10-26）

DNS 公鑰與伺服器簽章已接通，實測驗證通過。

### 伺服器設定

| 項目 | 值 |
| --- | --- |
| 服務 | `opendkim` 2.11.0（active / enabled） |
| 設定檔 | `/etc/opendkim.conf` |
| Domain / Selector | `apex-wealth.com.tw` / `default` |
| 私鑰 | `/etc/dkimkeys/default.private`（600, root:root） |
| Socket | `local:/var/spool/postfix/run/opendkim/opendkim.sock` |
| Canonicalization | `relaxed/simple`（OversignHeaders: From） |
| InternalHosts | `127.0.0.1, ::1, 192.168.1.0/24` |
| LogWhy | `yes` |

### postfix 接線

```
smtpd_milters     = unix:run/opendkim/opendkim.sock
non_smtpd_milters = unix:run/opendkim/opendkim.sock
milter_default_action = accept
milter_protocol   = 6
```

> **路徑是相對的，不是絕對路徑。** 因為 postfix `smtpd` 跑在 chroot
> （`master.cf` 的 chroot 欄為 `y`），`unix:run/...` 會被解析成
> `/var/spool/postfix/run/...`。寫成絕對路徑會連不上 milter。

### 必要的周邊設定

- socket 目錄：`/var/spool/postfix/run/opendkim`（`opendkim:opendkim 0750`）
- 開機後自動重建：`/etc/tmpfiles.d/opendkim.conf`
- `postfix` 使用者已加入 `opendkim` 群組（才能存取 socket）
- 改完須 `systemctl restart postfix`（讓新群組成員資格生效）

### 驗證結果

實測寄信（`office@apex-wealth.com.tw` → `apex@localhost`）：

```
opendkim 日誌: DKIM-Signature field added (s=default, d=apex-wealth.com.tw)
信件標頭:     DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/simple;
                              d=apex-wealth.com.tw; s=default; ...
```

以 DNS 公鑰做密碼學驗證（dkimpy）：

```
dkim.verify() → ✅ PASS
```

---


---

## ✅ POP3 / IMAP 收信服務已啟用（2026-10-28）

使用者在 Outlook 設定 POP3 收信失敗（原無此服務），已裝 Dovecot 補齊。

### 套件與服務

| 項目 | 值 |
| --- | --- |
| 套件 | `dovecot-core` / `dovecot-pop3d` / `dovecot-imapd` 2.3.21 |
| 服務 | `dovecot`（active / enabled） |
| 協定 | `imap pop3` |
| 郵件格式 | `mbox:~/mail:INBOX=/var/mail/%u`（與 postfix 一致） |
| 認証 | PAM（系統帳號）+ passwd userdb |

### 監聽埠

| 埠 | 協定 | 用途 |
| --- | --- | --- |
| 110 | POP3 | 明文（區網） |
| 995 | POP3S | TLS 加密 |
| 143 | IMAP | 明文 / STARTTLS |
| 993 | IMAPS | TLS 加密 |

均綁 `0.0.0.0`（含 IPv6）。

### `office@apex-wealth.com.tw` 帳號

- 系統帳號 `office`（uid 1002，shell 設為 `nologin`）
- 信箱：`/var/mail/office`（mbox 格式）
- 密碼：存於伺服器 `/root/office-mail-password.txt`（600, root only），**未入版控**

### postfix 收件網域修正（關鍵）

原 `mydestination` 不含本網域，寄給 `office@apex-wealth.com.tw` 會被拒收。已改為：

```
mydestination = $myhostname, apex-wealth.com.tw, mail.apex-wealth.com.tw, localhost.localdomain, localhost
```

---

## Outlook 連線設定

| 欄位 | 值 |
| --- | --- |
| 內送伺服器 | `mail.apex-wealth.com.tw` |
| 內送埠（POP3） | `995`（SSL）或 `110`（明文） |
| 外寄伺服器 | `mail.apex-wealth.com.tw` |
| 外寄埠（SMTP） | `587`（STARTTLS）⚠️ 見下方限制 |
| 帳號 | `office` |
| 密碼 | 見伺服器 `/root/office-mail-password.txt` |

> 若從區網連，可把伺服器改為 `192.168.1.34`。

---

## ⛔ 仍卡住：對外 SMTP 25 埠不通

這是目前**唯一**阻止郵件真正可用的問題。

實測 `61.216.74.25` 對外埠狀態：

| 埠 | 狀態 |
| --- | --- |
| **25（SMTP 收信）** | **不通** ⛔ |
| 587（SMTP 寄信） | 不通 ⛔ |
| 110（POP3） | 開放 ✅ |
| 143（IMAP） | 開放 ✅ |
| 993（IMAPS） | 開放 ✅ |
| 995（POP3S） | 開放 ✅ |

### 這代表什麼

- ✅ **POP3/IMAP 可以從外網連**：Outlook 能連上、能登入、能讀信
- ⛔ **但外網寄來的信進不了**：25 埠不通 → 沒人能把信投遞到這台

**形成一個閉迴路：信箱可以讀，但沒人能把信送進去。**

外部寄信方（如 Gmail）會嘗試連 `mail.apex-wealth.com.tw:25` → 連不上 → 退信或延遲重試。

### 要打通需要

1. **路由器 port forwarding**：把 25 埠轉到 `192.168.1.34`（POP3 那四個埠已開，比照辦理）
2. **確認 ISP 未封 25**：多數家用線路預設封鎖，需致電 ISP 申請解除
3. **本機 postfix 改綁對外**：`inet_interfaces = all`（目前為 `loopback-only`）

> 前三項完成後，還需處理**垃圾郵件防護與 IP 信譽**——家用 IP 寄出的信常被 Gmail/Outlook 歸於垃圾信。

---

## 回溯備份

```
/etc/postfix/main.cf.bak-20261028-015838
/etc/dovecot/conf.d/10-auth.conf.bak-20261028-015838
/etc/opendkim.conf.bak-20261026-072804
/etc/default/opendkim.bak-20261026-072804
/etc/postfix/main.cf.bak-20261026-072804
/etc/postfix/master.cf.bak-20261026-072804
```

還原範例：

```bash
sudo cp /etc/postfix/main.cf.bak-20261028-015838 /etc/postfix/main.cf
sudo systemctl restart postfix
```
