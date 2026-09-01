export const TRANSLATIONS = {
  tr: {
    // --- CHAT MODÜLÜ (Eskiler) ---
    SIDEBAR: {
      NEW_CHAT: 'Yeni sohbet',
      EMPTY_STATE: 'Henüz sohbet yok.',
      UNTITLED_CHAT: 'Adsız sohbet',
      MESSAGES: 'mesaj'
    },
    INPUT: {
      PLACEHOLDER: 'Verilerinizle ilgili bir soru sorun',
      PLACEHOLDER_DISABLED: 'Sohbet kullanılamıyor, API anahtarı eksik',
      HINT: 'Enter ile gönder, Shift+Enter ile alt satır',
      SEND: 'Gönder'
    },
    MESSAGE_LIST: {
      LOADING: 'Konuşma yükleniyor...',
      HERO_TITLE: 'Kurumsal veri asistanı',
      HERO_DESC: 'Verilerinizle ilgili sorunuzu doğal dilde yazın. Asistan gerekli sorguları kendisi üretir ve kaynakları gösterir.',
      SAMPLE_1: 'Hangi tablolar var?',
      SAMPLE_2: 'Son 30 günde en çok satan 10 ürün nedir?',
      SAMPLE_3: 'Aylık toplam ciroyu tablo olarak göster'
    },
    // --- DASHBOARD MODÜLÜ  ---
    DASHBOARD: {
      WORKSPACE: 'Workspace',
      ECOMMERCE: 'E-Ticaret',
      ECOMMERCE_ANALYTICS: 'E-Ticaret Analitikleri',
      UPDATED_AT: 'Filtrelenmiş performans metrikleri • Son güncelleme 27 Ağu 2026',
      MODES: {
        SALES: 'Satış Performansı',
        PRODUCT: 'Ürün Analitikleri',
        CUSTOMER: 'Müşteri İçgörüleri'
      }
    },
    HEADER: {
      AI: 'AI',
      ANALYZE: 'MCPilot ile Analiz Et'
    },
    FILTER: {
      TITLE: 'Kontrol Merkezi',
      MODE: 'Analiz Modu',
      BTN_SALES: 'Satış',
      BTN_PRODUCT: 'Ürün',
      BTN_CUSTOMER: 'Müşteri',
      DATE_RANGE: 'Tarih Aralığı',
      FROM: 'Başlangıç',
      TO: 'Bitiş',
      CUSTOM: 'Özel Aralık',
      THIS_MONTH: 'Bu ay',
      LAST_QUARTER: 'Geçen dönem',
      YTD: 'Yıldan bugüne',
      NOTE: 'Sadece alt metrikleri etkiler',
      APPLY: 'Filtreleri Uygula'
    },
    KPI: {
      REVENUE: 'Dönem Cirosu',
      PROFIT: 'Dönem Karı',
      ORDERS: 'Toplam Sipariş',
      AOV: 'Ort. Sipariş Tutarı',
      VS_LAST_YEAR: 'geçen yıla göre'
    },
    TABLES: {
      TOP_PRODUCTS: 'Adet Bazında En Çok Satan Ürünler',
      PRODUCT: 'Ürün',
      UNITS: 'Adet',
      REVENUE: 'Ciro',
      TOP_CUSTOMERS: 'Sadakat Puanına Göre En İyi Müşteriler',
      CUSTOMER: 'Müşteri',
      SCORE: 'Sadakat Puanı',
      LTV: 'Toplam Değer',
      ORDERS: 'Siparişler',
      LOYAL: 'Sadık',
      STANDARD: 'Standart',
      VIP: 'VIP'
    },

    TIME: {
      JUST_NOW: 'az önce',
      MINS_AGO: 'dk önce',
      HOURS_AGO: 'sa önce',
      DAYS_AGO: 'gün önce'
    },

    CHARTS: {
      SALES_TREND: 'Aylık Satış Trendi',
      SALES_TREND_SUB: 'Ciro ve kar • Oca-Ağu 2026',
      REVENUE: 'Ciro',
      PROFIT: 'Kar',
      CATEGORY_SALES: 'Kategori Satışı',
      CATEGORY_SALES_SUB: 'Ürün gruplarına göre ciro dağılımı',
      REGION_PERF: 'Şehir / Bölge Performansı',
      REGION_PERF_SUB: 'Ciroya göre en iyi pazarlar',
      SEGMENT_PERF: 'Müşteri Segment Performansı',
      SEGMENT_PERF_SUB: 'Segmentlere göre ciro payı',
      SEGMENTs: 'Segmentler',
      CATEGORIES: {
        'Electronics': 'Elektronik',
        'Apparel': 'Giyim',
        'Home & Garden': 'Ev & Bahçe',
        'Sports': 'Spor',
        'Beauty': 'Kozmetik'
      },
      SEGMENT: {
        'VIP': 'VIP',
        'Loyal': 'Sadık',
        'Standard': 'Standart'
      }
    },

    DRAWER: {
      TITLE: 'Veri Görselleştirme AI',
      SUBTITLE: 'Anında grafik oluşturma ve içgörüler'
    }
  },
  en: {
    SIDEBAR: {
      NEW_CHAT: 'New chat',
      EMPTY_STATE: 'No conversations yet.',
      UNTITLED_CHAT: 'Untitled chat',
      MESSAGES: 'messages'
    },
    INPUT: {
      PLACEHOLDER: 'Ask a question about your data',
      PLACEHOLDER_DISABLED: 'Chat unavailable, API key is missing',
      HINT: 'Press Enter to send, Shift+Enter for a new line',
      SEND: 'Send'
    },
    MESSAGE_LIST: {
      LOADING: 'Loading conversation...',
      HERO_TITLE: 'Enterprise Data Assistant',
      HERO_DESC: 'Ask about your data in natural language. The assistant generates queries and displays sources.',
      SAMPLE_1: 'What tables are available?',
      SAMPLE_2: 'What are the top 10 products in the last 30 days?',
      SAMPLE_3: 'Show total monthly revenue as a table'
    },
    DASHBOARD: {
      WORKSPACE: 'Workspace',
      ECOMMERCE: 'E-Commerce',
      ECOMMERCE_ANALYTICS: 'E-Commerce Analytics',
      UPDATED_AT: 'Filtered performance metrics • Last updated Aug 27, 2026',
      MODES: {
        SALES: 'Sales Performance',
        PRODUCT: 'Product Analytics',
        CUSTOMER: 'Customer Insights'
      }
    },
    HEADER: {
      AI: 'AI',
      ANALYZE: 'Ask MCPilot to Analyze'
    },
    FILTER: {
      TITLE: 'Command Center',
      MODE: 'Analysis Mode',
      BTN_SALES: 'Sales',
      BTN_PRODUCT: 'Product',
      BTN_CUSTOMER: 'Customer',
      DATE_RANGE: 'Date Range',
      FROM: 'From',
      TO: 'To',
      CUSTOM: 'Custom Range',
      THIS_MONTH: 'This month',
      LAST_QUARTER: 'Last quarter',
      YTD: 'Year to date',
      NOTE: 'Affects lower metrics only',
      APPLY: 'Apply Controls'
    },
    KPI: {
      REVENUE: 'Period Revenue',
      PROFIT: 'Period Profit',
      ORDERS: 'Total Orders',
      AOV: 'Avg. Order Value',
      VS_LAST_YEAR: 'vs. last year'
    },
    TABLES: {
      TOP_PRODUCTS: 'Top Products by Quantity',
      PRODUCT: 'Product',
      UNITS: 'Units',
      REVENUE: 'Revenue',
      TOP_CUSTOMERS: 'Top Customers by Loyalty Score',
      CUSTOMER: 'Customer',
      SCORE: 'Loyalty Score',
      LTV: 'Life Time Value',
      ORDERS: 'Orders',
      LOYAL: 'Loyal',
      STANDARD: 'Standard',
      VIP: 'VIP'
    },

    TIME: {
      JUST_NOW: 'just now',
      MINS_AGO: 'mins ago',
      HOURS_AGO: 'hours ago',
      DAYS_AGO: 'days ago'
    },

    CHARTS: {
      SALES_TREND: 'Monthly Sales Trends',
      SALES_TREND_SUB: 'Revenue vs. profit • Jan-Aug 2026',
      REVENUE: 'Revenue',
      PROFIT: 'Profit',
      CATEGORY_SALES: 'Sales by Category',
      CATEGORY_SALES_SUB: 'Revenue distribution across product lines',
      REGION_PERF: 'City / Region Performance',
      REGION_PERF_SUB: 'Top markets by revenue',
      SEGMENT_PERF: 'Customer Segment Performance',
      SEGMENT_PERF_SUB: 'Revenue share by customer segment',
      SEGMENTs: 'Segment',
      CATEGORIES: {
        'Electronics': 'Electronics',
        'Apparel': 'Apparel',
        'Home & Garden': 'Home & Garden',
        'Sports': 'Sports',
        'Beauty': 'Beauty'
      },
      SEGMENT: {
        'VIP': 'VIP',
        'Loyal': 'Loyal',
        'Standard': 'Standard'
      }
    },
    DRAWER: {
      TITLE: 'Data Visualization AI',
      SUBTITLE: 'On-the-fly chart generation & Insights'
    }
  }
};