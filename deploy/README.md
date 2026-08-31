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
`index.html` `no-cache` ile servis edildiği için tarayıcı yeni sürümü kendiliğinden
alır; kullanıcıdan sert yenileme istemene gerek yok.

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

## Önbellek

`index.html` hash'siz olduğu için `no-cache, must-revalidate` ile servis edilir.
Aksi halde tarayıcı eski HTML'i saklar ve yeni deploy'dan sonra artık silinmiş
asset dosyalarını istemeye devam eder — kullanıcı eski siteyi görür.

Asset adları içerik hash'i taşıdığı için (`outputHashing: all`) onlar
`public, max-age=31536000, immutable` ile servis edilir. `expires` yönergesiyle
`add_header` birlikte kullanılırsa iki ayrı `Cache-Control` başlığı döner,
bu yüzden yalnızca `add_header` kullanılıyor.

## Bilinen davranış

`/mcpilot/` altında **var olmayan bir asset** istendiğinde 404 yerine 200 + `index.html`
dönüyor. Bu `try_files` fallback'inin doğal sonucu ve sunucudaki `/kaylin/` SPA'siyle aynı
davranış. Sorun çıkarmıyor ama eksik dosya hatalarını gizleyebilir; istenirse asset uzantıları
için ayrı bir `location` bloğuyla `=404` verdirilebilir.

## Backend bağlanınca

.NET API `lintechtests.online/mcpilot/api` altında yayınlanacak.

### Nginx'e eklenmesi gereken blok

Şu an `/mcpilot/api/...` adresine giden istekler `location /mcpilot/` bloğunun `try_files`
fallback'ine takılıp **200 + index.html** dönüyor. Hata 404 değil 200 olduğu için frontend
isteği başarılı sanıp HTML'i JSON diye parse etmeye çalışır — hata ayıklaması yanıltıcıdır.

Çözüm daha spesifik bir location; nginx'te en uzun önek kazanır:

```nginx
location /mcpilot/api/ {
    proxy_pass http://127.0.0.1:PORT/;
    proxy_http_version 1.1;
    proxy_set_header Connection "";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

`proxy_pass` sonundaki slash `/mcpilot/api/` önekini kırpar: `/mcpilot/api/chat` isteği
backend'e `/chat` olarak ulaşır. .NET controller yolları `/api/chat` biçimindeyse
`proxy_pass http://127.0.0.1:PORT/api/;` yazılmalı.

Bu sunucuda **5210** ve **8000** portları dolu (Kayhos API ve CRM'in FastAPI'si).

### Frontend tarafı

`<base href="/mcpilot/">` sayesinde göreli yollar kendiliğinden doğru çözülüyor:

```ts
this.http.get('api/chat')    // -> /mcpilot/api/chat   doğru
this.http.get('/api/chat')   // -> /api/chat           YANLIŞ: CRM'in FastAPI'sine gider
```

Baştaki slash kritik. Slash'lı yazarsan istek alan adının kökünden başlar ve bu alan adında
`/api/` zaten CRM backend'ine (`127.0.0.1:8000`) proxy'lenmiş durumdadır.

### Dev ortamı

`npm start` sırasında base href `/` olduğu için `api/chat` isteği `localhost:4200/api/chat`
adresine gider ve karşılığı yoktur. Local'de .NET çalıştırırken `proxy.conf.json` ile
yönlendirme kurulmalı.
