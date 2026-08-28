# MCPilot — Frontend

Angular ile yazılmış sohbet arayüzü. Yalnızca frontend; iş mantığı ayrı bir
**.NET Core API**'de yaşıyor.

```
Kullanıcı → Angular → .NET API → AI/LLM → MCP → Veritabanı
```

Bu repo yukarıdaki zincirin ilk halkası: kullanıcı arayüzü ve istemci tarafı durum yönetimi.
Backend hazır olana kadar `ApiService` sahte veri döndürüyor.

## Çalıştırma

```bash
npm install
npm start      # http://localhost:4200
npm run build
npm test
```

## Yapı

```
src/app/
├── app.component.*        kök bileşen (router-outlet)
├── app.config.ts          provider'lar: router, http, zoneless CD
├── app.routes.ts          lazy route'lar
├── core/
│   ├── models.ts          ChatMessage, ChatSession, ChatRole, MessageStatus
│   ├── api.service.ts     backend çağrıları (şu an mock)
│   └── app.store.ts       signal tabanlı durum: oturumlar, mesajlar, UI
└── features/chat/
    ├── pages/chat-page/
    └── components/
        ├── message-list/
        ├── message-item/
        └── message-input/
```

## Konvansiyonlar

- **Zoneless change detection** — durum signal'larla yönetilir, Zone.js yok
- Tüm bileşenler **standalone**
- Model tipleri `readonly`; durum güncellemeleri immutable (`update` + spread)
- Tarihler ISO 8601 `string`, `Date` nesnesi değil
- Path alias'ları: `@core/*`, `@features/*`

## Backend entegrasyonu

`ApiService` şu an sahte cevap üretiyor. .NET API hazır olduğunda değişecek tek yer orası —
`getSessions`, `createSession`, `sendMessage` metotları `HttpClient` çağrılarına dönüşecek.
Store ve bileşenler etkilenmez.

## Dağıtım

Uygulama https://lintechtests.online/mcpilot/ adresinde yayında. Build ayarı `angular.json`
içindeki `production.baseHref` ile yapılmış durumda; sunucu bilgileri, yeni sürüm çıkma adımları
ve doğrulama komutları için [deploy/README.md](deploy/README.md).
