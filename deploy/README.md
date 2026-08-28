# Dağıtım — lintechtests.online/mcpilot

**Durum:** yayında → https://lintechtests.online/mcpilot/

Uygulama alan adının kökünde değil `/mcpilot/` alt yolunda yayınlanıyor. Kök,
`/opt/crm/frontend/build` altındaki CRM uygulamasına ait; bu dağıtım ona dokunmuyor.

Alt yolda yayın iki şey gerektiriyor:

1. **Build zamanı** — `<base href="/mcpilot/">`. `angular.json` içindeki `production`
   yapılandırmasında `baseHref` olarak ayarlı, ek bir şey yapmaya gerek yok.
   `development` yapılandırması `/` olarak kaldı, `npm start` kökte çalışmaya devam ediyor.
2. **Sunucu tarafı** — SPA fallback. Dosyaya karşılık gelmeyen istekler `index.html`'e
   düşmeli, yoksa `/mcpilot/chat` adresi tarayıcıda yenilendiğinde 404 döner.

## Sunucu

| | |
|---|---|
| Host | `185.196.21.109` (Ubuntu 20.04) |
| Web sunucusu | nginx, Certbot ile SSL |
| Dosya yolu | `/opt/mcpilot/dist/` |
| Nginx config | `/etc/nginx/sites-available/lintechtests.online` |

Yol seçimi sunucudaki mevcut konvansiyonu izliyor: aynı alan adı altındaki `/kaylin/` SPA'si de
`/opt/kayhos-portal/dist/` altında ve aynı `alias` + `try_files` desenini kullanıyor.

## Yeni sürüm çıkma

```bash
npm ci
npm run build

rsync -avz --delete \
  dist/mcpilot/browser/ \
  root@185.196.21.109:/opt/mcpilot/dist/
```

`--delete` eski hash'li asset dosyalarını temizler. Sondaki slash'lar önemli: `browser/`
klasörün **içeriğini** kopyalar, `browser` klasörün kendisini kopyalardı.

Nginx yapılandırması değişmediği sürece reload gerekmez — dosyalar statik.

## Nginx yapılandırması (ilk kurulumda yapıldı)

[nginx.conf](nginx.conf) içindeki bloklar `lintechtests.online` config'inin 443 server bloğuna,
`# SPA fallback (CRM)` satırından önce eklendi.

Bu dosyayı bir daha değiştirmen gerekirse: sunucuda **birçok canlı site var**
(lintechdev.com, crm, auth, api, mastermindpl, portfolio). Nginx'i bozmak hepsini birden
düşürür. Sırayla:

```bash
cp -a /etc/nginx/sites-available/lintechtests.online{,.bak.$(date +%F-%H%M%S)}
# düzenle
nginx -t                  # önce test
systemctl reload nginx    # restart değil, reload
```

İlk kurulumdaki yedek sunucuda duruyor:
`/etc/nginx/sites-available/lintechtests.online.bak.20260828-104551`

## Doğrulama

```bash
curl -o /dev/null -w '%{http_code}\n' https://lintechtests.online/mcpilot/       # 200
curl -o /dev/null -w '%{http_code}\n' https://lintechtests.online/mcpilot        # 301
curl -o /dev/null -w '%{http_code}\n' -L https://lintechtests.online/mcpilot/chat # 200

# asset gerçekten dosya olarak mı dönüyor (fallback HTML değil)
curl -o /dev/null -w '%{content_type}\n' https://lintechtests.online/mcpilot/main-*.js
# application/javascript olmalı; text/html ise try_files yanlış kurulmuş
```

Kökün ve diğer SPA'nin bozulmadığını da kontrol et:

```bash
curl -o /dev/null -w '%{http_code}\n' https://lintechtests.online/         # CRM
curl -o /dev/null -w '%{http_code}\n' https://lintechtests.online/kaylin/  # Kayhos
```

## Bilinen davranış

`/mcpilot/` altında **var olmayan bir asset** istendiğinde 404 yerine 200 + `index.html`
dönüyor. Bu `try_files` fallback'inin doğal sonucu ve sunucudaki `/kaylin/` SPA'siyle aynı
davranış. Sorun çıkarmıyor ama eksik dosya hatalarını gizleyebilir; istenirse asset uzantıları
için ayrı bir `location` bloğuyla `=404` verdirilebilir.

## Backend bağlanınca

`.NET API` devreye girdiğinde dikkat: `ApiService` içinde **göreli** yol kullanılırsa
(`api/chat` gibi) `baseHref` yüzünden istek `/mcpilot/api/chat` adresine gider. API farklı bir
kök altındaysa (`/api/...`) tam yol verilmeli.

Not: bu alan adında `/api/` yolu **zaten CRM'in FastAPI backend'ine** proxy'leniyor
(`127.0.0.1:8000`). MCPilot'ın backend'i için çakışmayan bir yol seçilmeli —
`/mcpilot-api/` gibi.
