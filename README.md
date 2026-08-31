# MCPilot — Frontend

Angular ile yazılmış sohbet ve analiz arayüzü. Yalnızca frontend; iş mantığı ayrı bir
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
└── features/
    ├── chat/               # Ana Sohbet Arayüzü
    │   ├── pages/chat-page/
    │   └── components/
    │       ├── message-list/
    │       ├── message-item/
    │       └── message-input/
    └── dashboard/          # E-Ticaret Analiz Dashboard'u
        ├── pages/dashboard-page/
        ├── services/dashboard.service.ts
        └── components/
            ├── dashboard-header/    # Global navigasyon ve tema/dil ayarları
            ├── filter-sidebar/      # Fluid & responsive filtreleme merkezi
            ├── kpi-cards/           # auto-fit grid metrik kartları
            ├── chart-placeholders/  # CSS/SVG tabanlı grafik mockup'ları
            ├── data-tables/         # Detaylı veri tabloları
            └── data-viz-drawer/     # Slide-out AI analiz asistanı
```
##Dashboard & UX Mimarisi
- **100% Fluid & Responsive Tasarım:** CSS Grid, clamp() ve minmax() kullanılarak ekran boyutundan bağımsız (mobil, tablet, desktop) kırılmayan akışkan mizanpaj tasarlandı. Hardcode edilmiş, ekranı bozan breakpoint'ler yerine içeriğe göre esneyen bir yapı kuruldu.
- **Data-Viz Drawer (AI Asistan):** Chat modülleri DRY prensibiyle Dashboard içine entegre edildi. Kullanıcılar bağlamdan kopmadan, ekranı işgal etmeyen sağdan açılır bir panel (overlay) üzerinden doğal dil ile veri analizi yapabilir.
- **Tema ve Çoklu Dil:** Angular Signals kullanılarak anlık çalışan, sayfa yenileme veya ekstra yükleme gerektirmeyen Karanlık/Aydınlık mod ve EN/TR dil desteği eklendi.
- **Mobil Optimizasyonu (Floating UI):** Dar ekranlarda asıl içeriği (grafikleri) aşağı iten filtreler yerine, ekranda yer kaplamayan "Floating Accordion" ve "Overlay" (Yüzen Açılır Menü) tarzı filtreleme panelleri kurgulandı.

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
