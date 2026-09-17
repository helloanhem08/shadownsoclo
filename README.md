# Sahdownsoclo

Proxy **studio UI** (node, rule, rewrite, theme). Không phải client VPN / không phải Shadowrocket.

IPA từ Codemagic là **WebView** bọc UI này. Không có Network Extension, không bắt HTTPS, không giả premium.

Repo: https://github.com/helloanhem08/sahdownsoclo

## Codemagic → IPA

1. [codemagic.io](https://codemagic.io) → add application → GitHub → chọn `helloanhem08/sahdownsoclo`.
2. Team settings → **code signing iOS**: Apple Developer, certificate, provisioning profile cho bundle `app.sahdownsoclo.studio`.
3. Workflow `ios-ipa` (file `codemagic.yaml`) → Start new build.
4. Tải artifact `.ipa` (Ad Hoc: cài qua thiết bị đã UDID; App Store cần đổi `distribution_type` + ASC).

Thiếu signing thì bước `xcode-project use-profiles` sẽ fail — đó là bình thường cho đến khi gắn cert.

## Local web

```bash
npm install
npm run dev
```

## Capacitor trên Mac (tuỳ chọn)

```bash
npm install
npm run build
npx cap add ios
npx cap sync ios
npx cap open ios
```
