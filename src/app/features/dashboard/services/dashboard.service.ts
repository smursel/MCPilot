import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, of } from 'rxjs';

// SQL tablolarına ve fonksiyonlarına %100 uygun arayüzlerimiz (Interfaces)
export interface TopProduct { rank: number; name: string; category: string; units: number; revenue: number; trend: 'up' | 'down'; }
export interface TopCustomer { rank: number; name: string; segment: 'VIP' | 'Loyal' | 'Standard'; score: number; ltv: number; orders: number; }
export interface CategoryData { name: string; value: number; }
export interface RegionData { city: string; revenue: number; percentage: number; }
export interface SegmentData { name: 'VIP' | 'Loyal' | 'Standard'; value: number; }
export interface KpiSummary {
  revenue: number; revenueChange: number;
  profit: number; profitChange: number;
  orders: number; ordersChange: number;
  aov: number; aovChange: number;
}
export interface MonthlyData { month: string; revenue: number; profit: number; }

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  // HttpClient'ı dependency injection ile servise dahil ediyoruz
  private http = inject(HttpClient);
  
  // Backend API taban URL'si (.NET tarafındaki controller yoluna göre ayarlanacak)
  private readonly baseUrl = '/api/analytics';

  // Sinyallerimizi başlangıçta boş array olarak başlatıyoruz.
  // Arayüz (UI) API'dan veri gelene kadar temiz bir şekilde bekler.
  readonly topProducts = signal<TopProduct[]>([]);
  readonly topCustomers = signal<TopCustomer[]>([]);
  readonly categoryData = signal<CategoryData[]>([]);
  readonly regionData = signal<RegionData[]>([]);
  readonly segmentData = signal<SegmentData[]>([]);
  readonly kpiSummary = signal<KpiSummary | null>(null);
  readonly monthlyData = signal<MonthlyData[]>([]);
  readonly monthlySales = signal<MonthlyData[]>([]);

  // -------------------------------------------------------------------------
  // FALLBACK (DUMMY) DATA
  // Amaç: API ayakta değilken veya hata verdiğinde UI'ın kırılmasını önlemek.
  // -------------------------------------------------------------------------
  private readonly dummyTopProducts: TopProduct[] = [
    { rank: 1, name: "AirPods Pro 4", category: "Electronics", units: 3248, revenue: 324800, trend: "up" },
    { rank: 2, name: "Nike Air Max 95", category: "Apparel", units: 2841, revenue: 113640, trend: "up" },
    { rank: 3, name: "Instant Pot 7-in-1", category: "Home", units: 1924, revenue: 96200, trend: "down" },
    { rank: 4, name: "Dyson V15 Detect", category: "Home", units: 1642, revenue: 131360, trend: "up" }
  ];

  private readonly dummyTopCustomers: TopCustomer[] = [
    { rank: 1, name: "Sarah Chen", segment: "VIP", score: 98, ltv: 12480, orders: 47 },
    { rank: 2, name: "Marcus Williams", segment: "VIP", score: 94, ltv: 9840, orders: 38 },
    { rank: 3, name: "Elena Vasquez", segment: "Loyal", score: 91, ltv: 8320, orders: 31 },
    { rank: 4, name: "James Okonkwo", segment: "Standard", score: 87, ltv: 5640, orders: 24 }
  ];

  private readonly dummyCategoryData: CategoryData[] = [
    { name: "Electronics", value: 31 },
    { name: "Apparel", value: 24 },
    { name: "Home & Garden", value: 18 },
    { name: "Sports", value: 15 },
    { name: "Beauty", value: 12 },
  ];

  private readonly dummyRegionData: RegionData[] = [
    { city: "New York", revenue: 142800, percentage: 100 },
    { city: "Los Angeles", revenue: 128400, percentage: 90 },
    { city: "Chicago", revenue: 98200, percentage: 70 },
    { city: "Houston", revenue: 87600, percentage: 60 },
    { city: "Phoenix", revenue: 76400, percentage: 53 },
  ];

  private readonly dummySegmentData: SegmentData[] = [
    { name: "VIP", value: 45 },
    { name: "Loyal", value: 35 },
    { name: "Standard", value: 20 }
  ];

  private readonly dummyKpiSummary: KpiSummary = {
  revenue: 841240, revenueChange: 12.4,
  profit: 294400, profitChange: 8.7,
  orders: 14832, ordersChange: 5.3,
  aov: 56.72, aovChange: -2.1
};

private readonly dummyMonthlySales: MonthlyData[] = [
  { month: 'Oca', revenue: 65000, profit: 22000 },
  { month: 'Şub', revenue: 78000, profit: 26000 },
  { month: 'Mar', revenue: 95000, profit: 34000 },
  { month: 'Nis', revenue: 82000, profit: 29000 },
  { month: 'May', revenue: 110000, profit: 41000 },
  { month: 'Haz', revenue: 125000, profit: 46000 },
  { month: 'Tem', revenue: 140000, profit: 52000 },
  { month: 'Ağu', revenue: 146240, profit: 54400 }
];

  // -------------------------------------------------------------------------
  // VERİ YÜKLEME METODU
  // Amaç: API'den verileri çekmek, hata durumunda catchError ile dummy verileri basmak.
  // -------------------------------------------------------------------------
  loadDashboardData(startDate: string, endDate: string) {
    console.log(`Veri Yükleniyor: ${startDate} - ${endDate} arası...`);

    // Tarih filtrelerini HTTP sorgu parametresi (QueryString) haline getiriyoruz
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    // 1. Top Products
    this.http.get<TopProduct[]>(`${this.baseUrl}/top-products`, { params }).pipe(
      catchError((err) => {
        console.warn('API Hatası (Top Products), test verisi yükleniyor.', err.message);
        return of(this.dummyTopProducts); // Hata olursa Observable zincirini dummy data ile devam ettir
      })
    ).subscribe(data => this.topProducts.set(data));

    // 2. Category Data
    this.http.get<CategoryData[]>(`${this.baseUrl}/sales-by-category`, { params }).pipe(
      catchError((err) => {
        console.warn('API Hatası (Category Data), test verisi yükleniyor.', err.message);
        return of(this.dummyCategoryData);
      })
    ).subscribe(data => this.categoryData.set(data));

    // 3. Region Data
    this.http.get<RegionData[]>(`${this.baseUrl}/sales-by-city`, { params }).pipe(
      catchError((err) => {
        console.warn('API Hatası (Region Data), test verisi yükleniyor.', err.message);
        return of(this.dummyRegionData);
      })
    ).subscribe(data => this.regionData.set(data));

    // 4. Top Customers (Eğer bu global ise params göndermeyebiliriz, şimdilik filtersiz)
    this.http.get<TopCustomer[]>(`${this.baseUrl}/top-customers`).pipe(
      catchError((err) => {
        console.warn('API Hatası (Top Customers), test verisi yükleniyor.', err.message);
        return of(this.dummyTopCustomers);
      })
    ).subscribe(data => this.topCustomers.set(data));

    // 5. Segment Data
    this.http.get<SegmentData[]>(`${this.baseUrl}/customer-segments`).pipe(
      catchError((err) => {
        console.warn('API Hatası (Segment Data), test verisi yükleniyor.', err.message);
        return of(this.dummySegmentData);
      })
    ).subscribe(data => this.segmentData.set(data));

    // 6. KPI Cards Data
    this.http.get<KpiSummary>(`${this.baseUrl}/kpi-summary`, { params }).pipe(
      catchError((err) => {
        console.warn('API Hatası (KPI Summary), test verisi yükleniyor.', err.message);
        return of(this.dummyKpiSummary);
      })
    ).subscribe(data => this.kpiSummary.set(data));

    // 7. Monthly Sales Data
    this.http.get<MonthlyData[]>(`${this.baseUrl}/monthly-sales`, { params }).pipe(
      catchError((err) => {
        console.warn('API Hatası (Monthly Sales), test verisi yükleniyor.', err.message);
        return of(this.dummyMonthlySales);
      })
    ).subscribe(data => this.monthlySales.set(data));
  }
}