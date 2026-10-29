# apex-wealth.com.tw — DNS 記錄設定

供 TISNet 代管面板使用。狀態標記：✅ 已設定 · ⬜ 待設定

---

> **安全狀態速覽（2026-10-28）**
>
> - **POP3/IMAP 收信必須認證** — 需帳號 + 密碼，無法匿名讀信（`auth_mechanisms = plain`，無 anonymous）
> - **SMTP 外寄必須認證** — 需 SASL 認證（同日修正）
> - **收信（外部投遞進本站）也需認證** ⚠️ → 依 2026-10-28 要求改為全部需認證，
>   **後果是外網（Gmail 等）完全寄不進來**，詳見文末
> - **傳輸未加密**（依需求不使用憑證）— 帳密以明文傳輸，是目前的已知風險
> - **fail2ban 已保護** sshd / postfix-sasl / dovecot（POP3/IMAP 暴力破解）

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
| 外寄埠 | **25** |
| 帳號 | `kane` / `office` / `apex`（系統帳號） |
| 密碼 | 各自帳號的系統密碼 |
| 外寄需認証 | **是**（SASL） |

> ⚠️ **安全權衡**：110 與 25 皆為明文。帳密以明文傳輸（已要求 SASL 認証）。
> 若環境允許，建議改用 995（收）+ 587（寄）；反之若要恢復嚴格模式，
> 設 `disable_plaintext_auth = yes` 並將客戶端改用 995。

---

## 🔓 停用郵件 TLS／憑證（2026-10-28，依需求）

客戶端要求**不使用憑證**。原因：SMTP/POP3 使用的憑證 SAN 僅含
`apex-wealth.com.tw, www.apex-wealth.com.tw`，**不含 `mail.apex-wealth.com.tw`**，
客戶端連 `mail.` 時 STARTTLS 會撞上名稱不符 → Outlook 跳憑證警告。

### 變更內容

**postfix**

```
smtpd_tls_security_level = none      # 25 埠不再宣告 STARTTLS
smtpd_use_tls            = no
smtp_tls_security_level  = none      # 對外投遞亦不啟用 TLS
smtp_use_tls             = no
smtpd_tls_cert_file      =           # 清空
smtpd_tls_key_file       =
```

`master.cf` 移除 `submission`(587) 與 `smtps`(465) 服務——這兩個定義上需要 TLS，
無憑證即無意義。因此 **587 / 465 已不再監聽**。

**dovecot**

```
ssl                    = no
disable_plaintext_auth = no
```

因 `ssl = no`，**993 / 995 已不再監聽**。

### 現行監聽埠

| 埠 | 服務 | 加密 |
| --- | --- | --- |
| 25 | SMTP | 無 |
| 110 | POP3 | 無 |
| 143 | IMAP | 無 |

### 客戶端設定（最終）

| 欄位 | 值 |
| --- | --- |
| 內送伺服器 | `mail.apex-wealth.com.tw` |
| 內送埠 | **110** |
| 外寄伺服器 | `mail.apex-wealth.com.tw` |
| 外寄埠 | **25** |
| 加密 | **無**（不要選 SSL/TLS/STARTTLS） |
| 帳號 | `kane` / `office` / `apex` |
| 密碼 | 各帳號的系統密碼 |
| 外寄需認証 | **是**（詳見本文末「外寄改為需要認証」節） |

> ⚠️ 客戶端若強制要求加密，這些埠會連不上。務必把加密選項設為「無」。

### 安全影響（必讀）

1. **帳密以明文在網路上傳輸**（110 POP3 登入、SMTP 內容）
2. ~~25 埠寄信不需認証~~ → **已修正為需 SASL 認証**（見文末）。原設定使區網內任何人可寄外信。
3. **對外投遞也不再加密**（`smtp_tls_security_level = none`）——
   部分收信端（Gmail 等）可能因未加密而降低評分或直接拒收
4. **DKIM 簽章不受影響**，仍正常運作

### 若日後要恢復加密

```bash
# postfix
sudo postconf -e 'smtpd_tls_security_level = may'
sudo postconf -e 'smtpd_tls_cert_file = /etc/postfix/tls/mail.crt'
sudo postconf -e 'smtpd_tls_key_file  = /etc/postfix/tls/mail.key'
sudo postconf -e 'smtp_tls_security_level = may'

# dovecot
sudo sed -i 's/^ssl = no/ssl = yes/' /etc/dovecot/conf.d/10-ssl.conf
sudo sed -i 's/^disable_plaintext_auth = no/disable_plaintext_auth = yes/' /etc/dovecot/conf.d/10-auth.conf

sudo systemctl restart postfix dovecot
```

另需重新簽發含 `mail.` 子域的憑證（目前 SAN 不含），否則警告依舊。

### 回溯備份

```
/etc/postfix/main.cf.bak-notls-20261028-051602
/etc/postfix/master.cf.bak-notls-20261028-051602
/etc/dovecot/conf.d/10-ssl.conf.bak-notls-20261028-051602
```

---

## 🔒 外寄改為需要認証（2026-10-28，依要求）

原設定 `smtpd_relay_restrictions = permit_mynetworks ...` + `mynetworks` 含
`192.168.1.0/24`，導致**區網內任何人免認証即可寄外部信**（詢問者指出此風險）。

### 變更

```
smtpd_relay_restrictions = permit_sasl_authenticated, defer_unauth_destination
mynetworks               = 127.0.0.0/8 [::ffff:127.0.0.0]/104 [::1]/128
smtpd_tls_auth_only      = no
```

關鍵是**移除 `permit_mynetworks`**，並把 `mynetworks` 收回 loopback。

### 行為驗證（實測）

| 情境 | 結果 |
| --- | --- |
| 區網來源 + 未認証 + 寄外部 | ❌ `454 4.7.1 Relay access denied` |
| 區網來源 + 已認証 + 寄外部 | ✅ `250`，實際投遞 `status=sent (250 Ok)` |
| 任來源 + 未認証 + 寄本地 | ✅ `250`（正常：投遞進本站不需認証） |

> `defer_unauth_destination` 只擋「轉寄到非本地網域」，不影響外部寄來的收件。

### 客戶端設定（更新）

| 欄位 | 值 |
| --- | --- |
| 外寄伺服器 | `mail.apex-wealth.com.tw` |
| 外寄埠 | **25** |
| **外寄需認証** | **是**（SASL，與內送同帳密） |
| 帳號／密碼 | 同內送（系統帳號） |
| 加密 | 無 |

> 25 埠無 TLS，客戶端須允許「未加密傳送密碼」（AUTH PLAIN）。
> 若客戶端強制要求加密才肯送帳密，則無法用 25 埠認証，需改用 587（但目前已因停用 TLS 而移除）。

### ⚠️ 已知的未解風險

**25 埠無加密 → 認証帳密以明文傳輸**（AUTH PLAIN）。
客戶端與伺服器之間的網路上若有竊聽者，帳密會曝光。

理想做法是恢復 TLS 並使用 587/993/995，但使用者明確要求不使用憑證，故維持現狀。

### 回溯備份

```
/etc/postfix/main.cf.bak-requireauth-20261028-080432
```

要改回免認証（不建議）：

```bash
sudo postconf -e 'smtpd_relay_restrictions = permit_mynetworks permit_sasl_authenticated defer_unauth_destination'
sudo postconf -e 'mynetworks = 127.0.0.0/8 [::ffff:127.0.0.0]/104 [::1]/128 192.168.1.0/24'
sudo systemctl restart postfix
```

---

## 🔐 所有收發信均需認証，僅 127.0.0.1 例外（2026-10-28，依要求）

### 設定內容

```
smtpd_recipient_restrictions = permit_mynetworks, permit_sasl_authenticated, reject
smtpd_relay_restrictions     = permit_mynetworks, permit_sasl_authenticated, reject
mynetworks                   = 127.0.0.0/8 [::ffff:127.0.0.0]/104 [::1]/128
smtpd_delay_reject           = yes
smtpd_helo_required          = yes
```

`mynetworks` 僅含 loopback，故 `permit_mynetworks` 實際等同「**只有 127.0.0.1 免認証**」。
其餘一律須 SASL 認証，否則 `reject`。

### 驗証結果

| 來源 | 認証 | 收件人 | 結果 |
| --- | --- | --- | --- |
| `127.0.0.1` | 免 | 本地 | ✅ `250` |
| `127.0.0.1` | 免 | 外部 | ✅ `250` |
| 區網 `192.168.1.34` | 無 | 本地 | ✅ `554` 拒絕 |
| 區網 `192.168.1.34` | 無 | 外部 | ✅ `554` 拒絕 |
| 區網 `192.168.1.34` | 有 | 本地／外部 | ✅ `250` |
| 外部 `61.216.74.25` | 無 | 本地 | ⛔ `554 Access denied` |
| 本機系統信（cron 等） | — | 本地 | ✅ 正常投遞 |

拒絕日誌：

```
NOQUEUE: reject: RCPT from _gateway[192.168.1.1]: 554 5.7.1
<office@apex-wealth.com.tw>: Recipient address rejected: Access denied;
from=<friend@gmail.com> proto=ESMTP helo=<mail.gmail.com>
```

### ⚠️⚠️ 重大後果：外部郵件完全無法送達

**這是此設定的直接結果，必須理解：**

SMTP 的運作前提是「寄件方的伺服器無法通過你伺服器的認證」——
Gmail、Outlook、任何外部寄件者都**沒有你伺服器的帳號密碼**，
因此它們投遞到 `office@apex-wealth.com.tw` 時一律被 `554` 拒絕。

| 情境 | 結果 |
| --- | --- |
| 客戶端（有帳密）寄信出去 | ✅ 可以 |
| 客戶端（有帳密）收自己信箱的信 | ✅ 可以（POP3/IMAP 需認証） |
| **外部（Gmail 等）寄信給你** | ⛔ **全部被拒，永遠收不到** |

**實務上這等於：這個信箱只能「內部互通」與「對外寄出」，無法接收任何外來郵件。**

若日後需要接收外部郵件（例如客戶、銀行、任何人的來信），必須至少放行
`permit_sasl_authenticated` 之外的合法投遞路徑，例如：

```
# 允許投遞到本地網域（收信），但仍禁止未認証轉寄（寄外）
smtpd_relay_restrictions     = permit_mynetworks, permit_sasl_authenticated, defer_unauth_destination
smtpd_recipient_restrictions = permit_mynetworks, permit_sasl_authenticated, permit
```

前者的 `defer_unauth_destination` 會放行「投遞到本地網域」、擋掉「未認証轉寄」——
這是標準郵件伺服器的做法（先前即為此設定）。

### 回溯備份

```
/etc/postfix/main.cf.bak-allauth-20261028-095111
```

要恢復「可接收外部郵件」：

```bash
sudo postconf -e 'smtpd_relay_restrictions = permit_mynetworks, permit_sasl_authenticated, defer_unauth_destination'
sudo postconf -X smtpd_recipient_restrictions
sudo systemctl restart postfix
```

---

## ✅ 重新簽發憑證（含 mail. 子域）+ 恢復郵件 TLS（2026-10-28）

### 起因

憑證 SAN 原本只含 `@` 與 `www`，**不含 `mail.apex-wealth.com.tw`**，
客戶端連 `mail.` 時名稱不符而跳警告。

### 關鍵事實修正

先前記載「80 埠不通」是**錯的**。實測（外部代理 + 多節點）確認
**80 埠對外可達**，因此可走 HTTP-01 自動驗証，**不需手動更新 DNS**。

### 做法

建立僅供 ACME 使用的 nginx 站台（網站本體仍未上線）：

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name apex-wealth.com.tw www.apex-wealth.com.tw mail.apex-wealth.com.tw;
    location /.well-known/acme-challenge/ { root /var/www/acme; default_type text/plain; }
    location / { return 404; }
}
```

簽發：

```bash
sudo certbot certonly --webroot -w /var/www/acme \
  -d apex-wealth.com.tw -d www.apex-wealth.com.tw -d mail.apex-wealth.com.tw \
  --expand --non-interactive --agree-tos --email office@apex-wealth.com.tw
```

### 結果

```
Domains: apex-wealth.com.tw mail.apex-wealth.com.tw www.apex-wealth.com.tw
Expiry:  2027-01-26（89 天）
authenticator = webroot      ← 已從 nginx 改為 webroot，續期不再依賴站台設定
certbot.timer = active/enabled
```

逐主機名驗証：三個名稱皆 `does match certificate`。

### 重要：續期全自動，不需人工

`certbot.timer` 每天檢查兩次，到期前 30 天自動續。
驗証走 `/var/www/acme`（webroot），與 nginx 站台設定解耦。
續期後由 `/etc/letsencrypt/renewal-hooks/deploy/postfix-tls.sh`
自動同步給 postfix 與 dovecot 並重載服務。

> `--dry-run` 實測通過，確認整條續期鏈路有效。

### 郵件 TLS 恢復

| 服務 | 設定 |
| --- | --- |
| postfix | `smtpd_tls_security_level = may`、憑證指向 `/etc/postfix/tls/mail.*` |
| postfix | `smtp_tls_security_level = may`（對外投遞也加密） |
| dovecot | `ssl = yes`、憑證指向 `/etc/dovecot/private/mail.*` |
| master.cf | 補回 `submission`(587) 與 `smtps`(465) |

### 現行監聽埠（全部對外可達）

| 埠 | 服務 | 加密 | 認証 |
| --- | --- | --- | --- |
| 25 | SMTP | STARTTLS（可選） | 需（轉寄） |
| **587** | submission | **必須 STARTTLS** | 需 |
| **465** | smtps | **直接 TLS** | 需 |
| 110 | POP3 | 無（相容保留） | 需 |
| **995** | POP3S | **TLS** | 需 |
| 143 | IMAP | STARTTLS | 需 |
| **993** | IMAPS | **TLS** | 需 |

### 對外實測（真實連線，非繞過）

```
995 POP3S:      subject=CN=apex-wealth.com.tw
                issuer=Let's Encrypt
                Verify return code: 0 (ok)
587 STARTTLS:   同上，verify ok
465 smtps:      ✅ 登入成功
```

**客戶端不再會有憑證警告。**

### 建議的客戶端設定（改用加密）

| 欄位 | 值 |
| --- | --- |
| 內送伺服器 | `mail.apex-wealth.com.tw` |
| 內送埠 | **995**（SSL/TLS） |
| 外寄伺服器 | `mail.apex-wealth.com.tw` |
| 外寄埠 | **587**（STARTTLS）或 **465**（SSL） |
| 加密 | **啟用** |
| 外寄需認証 | 是（同內送帳密） |

舊的 110 / 25 仍保留可用（客戶端相容），但**建議改用 995 / 587**：
帳密不再明文傳輸。

### 回溯備份

```
/etc/postfix/main.cf.bak-tls2-20261028-152924
/etc/postfix/master.cf.bak-tls2-20261028-152924
/etc/dovecot/conf.d/10-ssl.conf.bak-tls2-20261028-152924
```

> ACME 站台（`/etc/nginx/sites-available/acme`）僅服務 `.well-known/acme-challenge/`，
> 其餘路徑回 404——網站本體仍維持不上線（依先前的決策）。

---

## 📌 重要釐清：「收信」有兩個完全不同的意思（2026-10-29）

先前文件與對話中「收信」一詞被用於兩個不同層次，造成誤解。明確區分：

### 三個獨立層次

| # | 層次 | 誰在用 | 需要認證？ |
| --- | --- | --- | --- |
| **A** | **客戶端收信**（POP3/IMAP） | 你的 Outlook / 郵件軟體 | ✅ **必須登入**（帳號+密碼） |
| **B** | **客戶端寄信**（SMTP relay） | 你的 Outlook / 郵件軟體 | ✅ **必須認證**（SASL） |
| **C** | **外部投遞給你**（SMTP inbound） | Gmail、客戶、DMARC 報告 | ❌ **不需**（供件方無你的帳密） |

### 為什麼 C 不能要求認證

SMTP 的認證是用來控制「**誰能用我的伺服器寄信出去**」（防止開放轉寄）。
寄信給你的人（Gmail 等）**根本沒有你伺服器的帳號密碼**，要求認證等於拒收所有外來信。

### 實測證據

**A. 客戶端收信（必須登入）**

```
POP3 不送帳密        → -ERR [AUTH] Authentication failed.
POP3 亂猜 office/wrong1 → 拒絕
POP3 亂猜 admin/admin   → 拒絕
POP3 正確帳密         → ✅ 登入成功
IMAP 不送帳密         → [AUTHENTICATIONFAILED]
```

**B. 客戶端寄外信（必須認證）**

```
未認證寄 gmail  → 454 Relay access denied
已認證寄 gmail  → 250 ✅
```

**C. 外部寄給你（不需認證）**

```
Google DMARC 報告 → office@  → 250 ✅ 收得到
外部朋友 → kane@           → 250 ✅
外部嘗試轉寄 → gmail        → 454 ✅ 拒絕（非開放轉寄）
```

### 修正紀錄

先前依「所有收發信都要認證」字面設定，導致 C 也被擋（外部一律 `554`）。
已修正為：

```
smtpd_relay_restrictions = permit_mynetworks, permit_sasl_authenticated, defer_unauth_destination
smtpd_recipient_restrictions = （移除，不設 reject）
```

`defer_unauth_destination` 只擋「轉寄到非本地網域」，本地收件人放行。

**結果：A、B 需認證；C 可收信。三者皆正確，且非開放轉寄站。**

### 客戶端設定（不變）

| 欄位 | 值 |
| --- | --- |
| 內送伺服器 | `mail.apex-wealth.com.tw` |
| 內送埠 | 110（或 995 加密） |
| 內送需登入 | **是** |
| 外寄伺服器 | `mail.apex-wealth.com.tw` |
| 外寄埠 | 25（或 587/465 加密） |
| 外寄需認證 | **是** |
| 帳號／密碼 | 系統帳號（`kane` / `office` / `apex`） |

---

## 🔧 mail-tester 評分修正 + 黑名單機制（2026-10-29）

### 修正的三個扣分項

原先 mail-tester / SpamAssassin 扣分：

| 項目 | 扣分 | 原因 |
| --- | --- | --- |
| `HELO_NO_DOMAIN` | **-1.093** | HELO 公告 `apex-wealth`（非 FQDN） |
| `FSL_HELO_NON_FQDN_1` | -0.001 | 同上 |
| 反向 DNS 不符 | **-3** | PTR 為 `mail.apex-wealth.com.tw`，但 HELO 是 `apex-wealth` |

### 修改

```
myhostname = mail.apex-wealth.com.tw      # 原：apex-wealth
```

配套：

- `/etc/hosts` 加入 `192.168.1.34  mail.apex-wealth.com.tw  apex-wealth`
- `/etc/mailname` 同步為 `mail.apex-wealth.com.tw`
- **同步 chroot 內的 hosts**：`cp /etc/hosts /var/spool/postfix/etc/hosts`
  （postfix 會警告 `/var/spool/postfix/etc/hosts and /etc/hosts differ`）

### 結果

```
HELO banner: 220 mail.apex-wealth.com.tw ESMTP Postfix
```

**HELO 名 與 PTR 一致** → `HELO_NO_DOMAIN` 與反解不符兩個扣分項皆消除。

---

## 🚫 外部投遞黑名單機制

### 檔案

| 檔案 | 用途 |
| --- | --- |
| `/etc/postfix/blacklist` | 拒絕連線（IP / CIDR / 網域） |
| `/etc/postfix/whitelist` | 白名單，優先於黑名單 |

兩者都需 `postmap` 編譯，修改後執行 `postmap /etc/postfix/blacklist && postfix reload`。

### 黑名單格式

```
# 單一 IP
203.0.113.99    REJECT Known spam source
# 網段
203.0.113.0/24  REJECT Blacklisted network
# 整個網域（含子網域）
.badzone.example REJECT Blacklisted domain
```

### 白名單格式

```
127.0.0.0/8      OK
[::1]/128        OK
192.168.1.0/24   OK
.google.com      OK     # 避免誤擋 DMARC 報告
.outlook.com     OK
```

### postfix 設定

```
smtpd_client_restrictions = check_client_access hash:/etc/postfix/whitelist,
                            check_client_access hash:/etc/postfix/blacklist,
                            permit
smtpd_helo_required = yes
```

查表順序：**先白名單（OK 即放行）→ 再黑名單（REJECT 即拒）→ 最後 permit**。

### 驗証

加入測試項 `203.0.113.99 REJECT Test` → `postmap -q` 回 `REJECT Test blacklist entry` ✅
（驗証後已還原）

### 未啟用 RBL（刻意的）

**未啟用 Spamhaus 等外部 RBL**，原因：

1. 若本機 DNS 查詢被攔或 RBL 服務不可達，可能導致**所有外部郵件被誤擋**
2. 家用 IP 環境查 RBL 常被限流（Spamhaus 對公開 resolver 有限制）
3. 目前黑名單是**手動維護**，可視情況加入實際來源

要啟用 RBL（熟悉風險後）：

```
sudo postconf -e 'smtpd_client_restrictions = check_client_access hash:/etc/postfix/whitelist, check_client_access hash:/etc/postfix/blacklist, reject_rbl_client zen.spamhaus.org, permit'
sudo systemctl restart postfix
```

---

## 🔑 密碼同步問題（同日發現）

驗証時發現 `office` 帳號 POP3 登入失敗。根因：

- `passwd -S office` 顯示密碼變更日為 **2026-10-29**（當天被改過）
- 但 `/root/office-mail-password.txt` 時間戳為 **2026-10-28**（未更新）
- 兩者不同步 → 用檔案裡的舊密碼登入失敗

**處置**：已將密碼重設為與密碼檔一致，POP3 / POP3S 登入驗証通過。

> 教訓：`passwd -S <user>` 的第 3 欄是密碼最後變更日，可用來判斷是否有人改過密碼。
> 密碼驗証繞過 dovecot 直接比對：`crypt.crypt(密碼, spwd.getspnam(user).sp_pwdp)`。

---

## ✅ 完整功能驗証（最後一輪）

| 情境 | 結果 |
| --- | --- |
| 用戶端收信（正確密碼） | ✅ 登入成功 |
| 用戶端收信（錯密碼） | ✅ 拒絕 |
| 外部投遞（不需認證） | ✅ 接受 |
| 未認證轉寄 | ✅ 拒絕 |
| 已認證寄外信 | ✅ 放行 |
| HELO / myhostname | ✅ `mail.apex-wealth.com.tw`（與 PTR 一致） |

### 回溯備份

```
/etc/postfix/main.cf.bak-helo-20261029-023848
/etc/hosts.bak-20261029-023848
/etc/postfix/main.cf.bak-rbl-20261029-024346
```

---

## 尚待補強（非必要）

| 項目 | 狀態 | 影響 |
| --- | --- | --- |
| **CAA 記錄** | ❌ 未設 | 任何 CA 都能用此網域簽憑證 |
| **DNSSEC** | ❌ 未啟用 | DNS 可被偽造 |
| **MTA-STS** | ❌ 未設 | 無法強制外部用 TLS 投遞 |
| **DMARC 收緊** | `p=none` | 偽造防護未生效，建议觀察後改 `quarantine` |
| **SpamAssassin** | ❌ 未裝 | 內容層垃圾信過濾（目前僅黑名單 + RBL 選項） |

