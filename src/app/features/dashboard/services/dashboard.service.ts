import { Injectable, signal } from '@angular/core';

// SQL tablolarına ve fonksiyon çıktılarına %100 uygun arayüzlerimiz (Interfaces)
export interface TopProduct { rank: number; name: string; category: string; units: number; revenue: number; trend: 'up' | 'down'; }
export interface TopCustomer { rank: number; name: string; segment: 'VIP' | 'Loyal' | 'Standard'; score: number; ltv: number; orders: number; }
export interface CategoryData { name: string; value: number; }
export interface RegionData { city: string; revenue: number; percentage: number; }
export interface SegmentData { name: 'VIP' | 'Loyal' | 'Standard'; value: number; }

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  
  // 1. Data Tables İçin Veriler (GetTopProducts & GetTopCustomers fonksiyonlarına uygun)
  readonly topProducts = signal<TopProduct[]>([
    { rank: 1, name: "AirPods Pro 4", category: "Electronics", units: 3248, revenue: 324800, trend: "up" },
    { rank: 2, name: "Nike Air Max 95", category: "Apparel", units: 2841, revenue: 113640, trend: "up" },
    { rank: 3, name: "Instant Pot 7-in-1", category: "Home", units: 1924, revenue: 96200, trend: "down" },
    { rank: 4, name: "Dyson V15 Detect", category: "Home", units: 1642, revenue: 131360, trend: "up" }
  ]);

  readonly topCustomers = signal<TopCustomer[]>([
    { rank: 1, name: "Sarah Chen", segment: "VIP", score: 98, ltv: 12480, orders: 47 },
    { rank: 2, name: "Marcus Williams", segment: "VIP", score: 94, ltv: 9840, orders: 38 },
    { rank: 3, name: "Elena Vasquez", segment: "Loyal", score: 91, ltv: 8320, orders: 31 },
    { rank: 4, name: "James Okonkwo", segment: "Standard", score: 87, ltv: 5640, orders: 24 }
  ]);

  // 2. Charts İçin Veriler (SQL'e tam uyumlu gruplamalar)
  readonly categoryData = signal<CategoryData[]>([
    { name: "Electronics", value: 31 },
    { name: "Apparel", value: 24 },
    { name: "Home & Garden", value: 18 },
    { name: "Sports", value: 15 },
    { name: "Beauty", value: 12 },
  ]);

  readonly regionData = signal<RegionData[]>([
    { city: "New York", revenue: 142800, percentage: 100 },
    { city: "Los Angeles", revenue: 128400, percentage: 90 },
    { city: "Chicago", revenue: 98200, percentage: 70 },
    { city: "Houston", revenue: 87600, percentage: 60 },
    { city: "Phoenix", revenue: 76400, percentage: 53 },
  ]);

  readonly segmentData = signal<SegmentData[]>([
    { name: "VIP", value: 45 },
    { name: "Loyal", value: 35 },
    { name: "Standard", value: 20 }
  ]);

  // İleride Command Center'dan tetiklenecek metodumuz
  loadDashboardData(startDate: string, endDate: string) {
    console.log(`API Çağrısı Yapılıyor: ${startDate} - ${endDate} arası veriler çekiliyor...`);
    // HTTP İstekleri burada çalışacak!
  }
}