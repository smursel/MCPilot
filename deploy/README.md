# Dağıtım — lintechtests.online/mcpilot

Uygulama alan adının kökünde değil, `/mcpilot/` alt yolunda yayınlanıyor. Bu iki şey gerektiriyor:

1. **Build zamanı**: `<base href="/mcpilot/">` — `angular.json` içindeki `production` yapılandırmasında
   `baseHref` olarak ayarlı, ayrıca bir şey yapmana gerek yok.
2. **Sunucu tarafı**: SPA fallback — dosyaya karşılık gelmeyen her istek `index.html`'e düşmeli.
   Bu olmadan `/mcpilot/chat` adresini tarayıcıda yenilediğinde sunucu 404 döner.

## Build

```bash
npm ci
npm run build            # production varsayılan yapılandırma
```

Çıktı: `dist/mcpilot/browser/` — sunucuya kopyalanacak olan bu klasörün **içeriği**.

Doğrulama:

```bash
grep 'base href' dist/mcpilot/browser/index.html
# <base href="/mcpilot/">
```

## Kopyalama

```bash
rsync -avz --delete \
  dist/mcpilot/browser/ \
  root@185.196.21.109:/var/www/mcpilot/
```

`--delete` eski hash'li asset dosyalarını temizler. Sondaki slash'lar önemli:
`browser/` klasörün içeriğini kopyalar, `browser` klasörün kendisini kopyalardı.

## Sunucu yapılandırması

Web sunucusuna göre birini kullan:

- **Nginx** → [nginx.conf](nginx.conf) içindeki blokları mevcut `server { }` bloğunun içine ekle,
  sonra `nginx -t && systemctl reload nginx`
- **Apache** → [htaccess](htaccess) dosyasını sunucuda `/var/www/mcpilot/.htaccess` olarak kaydet

## Doğrulama

```bash
curl -I https://lintechtests.online/mcpilot/          # 200
curl -I https://lintechtests.online/mcpilot           # 301 -> /mcpilot/
curl -I https://lintechtests.online/mcpilot/chat      # 200 (404 ise fallback çalışmıyor)
```

Tarayıcıda `/mcpilot/chat` adresine git, sayfayı yenile — hâlâ açılıyorsa fallback doğru kurulmuş.

## Backend bağlanınca

`.NET API` devreye girdiğinde `ApiService` mutlak yol yerine göreli yol kullanmamalı; API farklı bir
kök altında (`/api/...`) yayınlanacaksa `baseHref` ile karışmaması için tam yol verilmeli.
Aksi halde istek `/mcpilot/api/...` adresine gider.
