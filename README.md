# Shadownsoclo

Developer by concu

Proxy **studio UI** (node, rule, rewrite, theme). Không phải client VPN.

IPA là **WebView** bọc UI. Không Network Extension, không MITM, không cài CA.

Repo: https://github.com/helloanhem08/shadownsoclo

## Codemagic → IPA unsigned (không cần cert)

1. [codemagic.io](https://codemagic.io) → Add application → GitHub → `helloanhem08/shadownsoclo`
2. **Không** gắn iOS signing / certificate
3. Chạy workflow **Shadownsoclo IPA unsigned**
4. Tải artifact `Shadownsoclo-unsigned.zip` (bên trong là file `.ipa`)

IPA **chưa ký** — iPhone thường không cài trực tiếp. Ký sau bằng Apple ID của bạn (Sideloadly / AltStore / Xcode). TrollStore chỉ máy hỗ trợ.

## Local web

```bash
npm install
npm run dev
```
