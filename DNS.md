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


---

## ✅ SMTP 寄信服務已啟用（2026-10-28）

客戶端需 POP3 收 + SMTP 寄，原 postfix 只綁 loopback，已補齊。

### 新增服務埠

| 埠 | 協定 | 認証 | 用途 |
| --- | --- | --- | --- |
| 25 | SMTP | 無（僅收信） | 外部投遞進來的信 |
| **587** | submission | 需 SASL | 客戶端寄信（STARTTLS） |
| **465** | smtps | 需 SASL | 客戶端寄信（直接 TLS） |

### 關鍵設定

```
inet_interfaces    = all          # 原為 loopback-only，這是最關鍵的一行
smtpd_sasl_type    = dovecot
smtpd_sasl_path    = /var/spool/postfix/private/auth
smtpd_sasl_auth_enable = yes
smtpd_tls_cert_file = /etc/postfix/tls/mail.crt
smtpd_tls_key_file  = /etc/postfix/tls/mail.key
smtpd_tls_security_level = may
smtpd_tls_protocols = >=TLSv1.2
```

`master.cf` 新增 `submission`（587）與 `smtps`（465）兩個服務，並把 `smtp`/`cleanup` 的 chroot 關掉（`y` → `n`）。

### SASL 認証接線（Dovecot → postfix）

`/etc/dovecot/conf.d/10-master.conf`：

```
service auth {
  unix_listener /var/spool/postfix/private/auth {
    mode = 0660
    user = postfix
    group = postfix
  }
}
```

### TLS 憑證

postfix 無法直接讀 `/etc/letsencrypt/`（權限太緊），故複製一份到 `/etc/postfix/tls/`（`mail.key` 權限 640 root:postfix）。

續期時自動同步：已安裝 `/etc/letsencrypt/renewal-hooks/deploy/postfix-tls.sh`。

---

## ✅ 對外埠全部開通（2026-10-28 後續）

使用者完成路由器 port forwarding 後實測：

| 埠 | 服務 | 狀態 |
| --- | --- | --- |
| 25 | SMTP 收信 | ✅ 開放（banner: `220 apex-wealth ESMTP Postfix`） |
| 110 | POP3 | ✅ 開放 |
| 143 | IMAP | ✅ 開放 |
| 465 | SMTPS | ✅ 開放 |
| 587 | submission | ✅ 開放 |
| 993 | IMAPS | ✅ 開放 |
| 995 | POP3S | ✅ 開放 |

### 端到端驗証（全部通過）

1. **外部投遞**：模擬外部 SMTP（25 埠）寄至 `office@apex-wealth.com.tw` → `250 Ok`，DATA 接受 ✅
2. **非 open relay**：外部嘗試轉寄至 `gmail.com` → `454` 被拒 ✅
3. **客戶端寄信**：經 587（STARTTLS + SASL）與 465（TLS + SASL）登入並寄出 ✅
4. **DKIM 簽章**：日誌 `DKIM-Signature field added`，信件確實带簽章 ✅
5. **POP3 收信**：贖 995 登入，信確實收得到（3 封測試信）✅

**郵件系統現已完整可用：外部寄入 + 客戶端收發都通。**

---

## Outlook / 客戶端設定（最終版）

| 欄位 | 值 |
| --- | --- |
| 內送伺服器 | `mail.apex-wealth.com.tw` |
| 內送埠 | **995**（SSL） |
| 外寄伺服器 | `mail.apex-wealth.com.tw` |
| 外寄埠 | **587**（STARTTLS）或 **465**（SSL） |
| 帳號 | `office` |
| 密碼 | 伺服器 `/root/office-mail-password.txt` |
| 需驗証 | 是（與內送相同帳密） |

### 110 埠與 25 埠（客戶端採用）

客戶端使用明文 110 收信 + 25 寄信，因此 `disable_plaintext_auth` 設為 `no`。

- **110**：明文 POP3，可用（已實測區網與對外皆登入成功）
- **995**：POP3S，亦可用（建議優先）
- **25**：SMTP 無認証寄信，可用於內網／已知來源
- **587 / 465**：需 SASL 認証，供外網客戶端使用

> ⚠️ 安全權衡：110 與 25 皆為**明文傳輸**，帳密會以明文送出（25 埠寄信不需認証）。
> 若客戶端環境允許，建議改用 995（收）+ 587（寄）以加密連線。
> 要關閉明文認証：`disable_plaintext_auth = yes` 並重啟 dovecot（但客戶端需同步改用 995）。

### 憑證警告

SMTP/POP3 使用的憑證 SAN 為 `apex-wealth.com.tw, www.apex-wealth.com.tw`，**不含 `mail.apex-wealth.com.tw`**。客戶端可能跳出名稱不符警告。

若要消除，需重新簽發含 mail 子域的憑證（需 80 埠對外可達做 ACME 驗証，但目前 80 未開）。目前的替代方案：客戶端手動信任憑證。

---

## 仍建議改善的項目

1. **垃圾郵件防護**：目前無 SpamAssassin / Rspamd，收到垃圾信只能自己刪
2. **IP 信譽**：家用 IP 寄出的信仍可能被 Gmail/Outlook 歸於垃圾信（SPF/DKIM/DMARC 已備，但 IP 信譽需時間累積）
3. **fail2ban 未納入郵件 jail**：可加 `postfix-sasl` jail 擋暴力破解
4. **憑證 SAN 缺 mail 子域**（見上）

---

## 回溯備份

```
/etc/postfix/main.cf.bak-20261028-023706
/etc/postfix/master.cf.bak-20261028-023706
/etc/dovecot/conf.d/10-master.conf.bak-20261028-023706
/etc/postfix/main.cf.bak-20261028-015838
/etc/dovecot/conf.d/10-auth.conf.bak-20261028-015838
/etc/opendkim.conf.bak-20261026-072804
/etc/default/opendkim.bak-20261026-072804
/etc/postfix/main.cf.bak-20261026-072804
/etc/postfix/master.cf.bak-20261026-072804
```

---

## 🔧 修正紀錄：客戶端採 110/25（2026-10-28）

客戶端實際使用 **POP3 110 + SMTP 25**（皆明文），需三處配合修正。

### 1. Dovecot 放寬明文認証

```
disable_plaintext_auth = no
```

原本為 `yes`（安全考量），導致 110 埠回 `Plaintext authentication disallowed on non-secure connection`。
改為 `no` 後，110 可用；995 亦照常運作。

### 2. postfix 允許 LAN 客戶端經 25 埠寄信

```
mynetworks = 127.0.0.0/8 [::ffff:127.0.0.0]/104 [::1]/128 192.168.1.0/24
```

原僅 loopback，區網客戶端經 25 埠寄外部信會遭 `454` 拒絕。加入 `192.168.1.0/24` 後放行。

> ⚠️ 這是**必要且刻意**的設定：LAN 客戶端用 25 埠（明文、無認証）寄信，必須靠來源網段放行。
> 外部來源不在 `mynetworks`，仍會被 `defer_unauth_destination` 拒絕轉寄——已驗證非開放轉寄站。

### 3. postfix 傳輸設定（最關鍵，容易漏）

```
default_transport = smtp
relay_transport   = smtp
```

原為 `error`——這是安裝 postfix 時選「Local only」留下的殘留值，
**會讓所有需要離開本機的郵件直接被拒**（`550 Recipient address rejected`）。
郵件可本地投遞、也能通過 RCPT 檢查，但一寄外網就失敗，症狀極具誤導性。

### 4. 其他

- `myorigin = apex-wealth.com.tw`：原為 `$myhostname`（`apex-wealth`），
  導致本機系統信寄件者為 `root@apex-wealth`，DKIM 因網域不符而**不簽章**
- `root` 別名改指向 `office`（系統通知信收件人）

### 端到端驗證（全部通過）

| 項目 | 結果 |
| --- | --- |
| 區網 110 登入 | ✅ |
| 對外 110 登入 | ✅ |
| 對外 25 寄信（LAN 來源） | ✅ 外部收件人 `250` |
| 對外投遞實測 | ✅ `relay=mail2.mailinator.com ... status=sent (250 Ok)` |
| DKIM 簽章 | ✅ `dkim.verify()` PASS |
| 開放轉寄防護 | ✅ 外部來源遭 `defer_unauth_destination` 拒絕 |

### 客戶端最終設定

| 欄位 | 值 |
| --- | --- |
| 內送伺服器 | `mail.apex-wealth.com.tw` |
| 內送埠 | **110**（或 995 SSL） |
| 外寄伺服器 | `mail.apex-wealth.com.tw` |
| 外寄埠 | **25**（或 587/465 需認証） |
| 帳號 | `kane` / `office` / `apex`（系統帳號） |
| 密碼 | 各自帳號的系統密碼 |
| 外寄需認証 | 否（25 埠，限內網來源） |

> ⚠️ **安全權衡**：110 與 25 皆為明文。帳密以明文傳輸、寄信不需認証。
> 若環境允許，建議改用 995（收）+ 587（寄）；反之若要恢復嚴格模式，
> 設 `disable_plaintext_auth = yes` 並將客戶端改用 995。

