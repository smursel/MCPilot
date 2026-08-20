# MCPilot

Angular tabanlı MCP (Model Context Protocol) istemci uygulaması. Bu repo **frontend chat**
katmanını içerir. MCP bağlantılarını, model çağrılarını ve API anahtarlarını **ayrı bir backend host**
yönetir; Angular ona HTTP + SSE üzerinden konuşur, tarayıcıda sır tutulmaz.

Angular **22.1** üzerine kurulu. İskelet ayakta ve derleniyor; feature dosyaları henüz boş
(`export {};` placeholder'ı taşıyorlar, tek nedeni `isolatedModules` altında derlenebilmeleri).

## Çalıştırma

```bash
npm install
npm start     # ng serve  -> http://localhost:4200
npm run build # ng build
npm test      # vitest
```

## Konvansiyonlar

- **Zoneless change detection** (`provideZonelessChangeDetection`) — state signal'larla yönetilir.
- Tüm bileşenler **standalone** ve **OnPush**; `angular.json` schematics ayarı bunu varsayılan yapar.
- Dosya adları `*.component.ts` / `*.service.ts` sonekini korur (Angular 22 varsayılanı soneksizdir;
  `angular.json` içindeki `type` ayarı `ng generate`'i bu konvansiyona uyduruyor).
- Path alias'ları: `@core/*`, `@shared/*`, `@features/*`, `@layout/*`, `@env/*`.
- SCSS partial'ları `src/styles` üzerinden çözülür: `@use 'variables';`

## Yapı

```
src/
├── main.ts                     # bootstrapApplication giriş noktası
├── index.html
├── styles.scss                 # global stil girişi
├── styles/                     # _variables, _mixins, _reset, themes/{light,dark}
├── environments/               # environment.ts / environment.development.ts
├── assets/
└── app/
    ├── app.component.*         # kök bileşen
    ├── app.config.ts           # provider'lar (router, http, interceptor'lar)
    ├── app.routes.ts           # üst seviye lazy route'lar
    │
    ├── core/                   # singleton katman — uygulama başına bir kez
    │   ├── config/             # app-config, mcp-defaults
    │   ├── guards/             # auth, unsaved-changes
    │   ├── interceptors/       # auth, error, loading
    │   ├── models/             # ChatMessage, ChatSession, McpServer, McpTool,
    │   │                       # McpResource, McpPrompt, ToolCall, JSON-RPC tipleri
    │   ├── services/
    │   │   ├── transport/      # McpTransport arayüzü + SSE / WebSocket / HTTP implementasyonları
    │   │   ├── mcp-client.service.ts      # MCP protokol katmanı (initialize, tools/call, ...)
    │   │   ├── mcp-connection.service.ts  # bağlantı yaşam döngüsü, reconnect
    │   │   ├── tool-registry.service.ts   # sunuculardan gelen tool/resource/prompt kaydı
    │   │   ├── chat.service.ts            # mesaj gönderimi, streaming
    │   │   ├── session.service.ts         # oturum CRUD + kalıcılık
    │   │   └── storage / logger / notification / theme
    │   ├── state/              # signal store'lar: chat, mcp, session, ui
    │   ├── tokens/             # InjectionToken tanımları
    │   └── utils/              # id, stream, json-rpc yardımcıları
    │
    ├── shared/                 # yeniden kullanılabilir, state'siz parçalar
    │   ├── components/         # ui-button, ui-icon, ui-spinner, ui-avatar, ui-modal,
    │   │                       # ui-tooltip, empty-state, markdown-view, code-block
    │   ├── directives/         # auto-scroll, autosize-textarea, click-outside
    │   ├── pipes/              # relative-time, safe-html, file-size, truncate
    │   └── validators/
    │
    ├── layout/                 # shell, sidebar, topbar
    │
    └── features/               # lazy-load edilen alanlar, her biri kendi routes dosyasıyla
        ├── chat/               # ana sohbet ekranı
        │   ├── pages/chat-page
        │   ├── components/     # chat-header, message-list, message-item, message-input,
        │   │                   # tool-call-card, streaming-indicator, attachment-preview
        │   ├── services/       # chat-facade, message-stream
        │   └── models/
        ├── servers/            # MCP sunucu yönetimi
        │   ├── pages/servers-page
        │   └── components/     # server-list, server-card, server-form-dialog,
        │                       # tools-panel, resources-panel, prompts-panel
        ├── sessions/           # sohbet geçmişi
        └── settings/           # genel / model / görünüm ayarları
```

## Katman kuralları

- `features/` → `shared/` ve `core/` kullanabilir.
- `shared/` → yalnızca `core/models` kullanır, feature'lara bağımlı olamaz.
- `core/` → hiçbir feature'a bağımlı olamaz; MCP protokolü yalnızca burada bilinir.
- Bileşenler standalone; route'lar `loadChildren` ile feature bazında lazy yüklenir.

## Dokümanlar

- [docs/architecture.md](docs/architecture.md) — katman ve veri akışı kararları
- [docs/mcp-integration.md](docs/mcp-integration.md) — transport seçimi, handshake, tool çağrı akışı
- [docs/chat-flow.md](docs/chat-flow.md) — mesaj gönderiminden streaming yanıta uçtan uca akış
