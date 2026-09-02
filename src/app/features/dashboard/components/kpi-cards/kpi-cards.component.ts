import { Component, ChangeDetectionStrategy, input, computed, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { AppStore } from '@core/app.store';
import { DashboardService } from '../../services/dashboard.service';
import { TRANSLATIONS } from '@core/translations';
import { TranslatePipe } from "../../../../shared/translate.pipe";

/**
 * Defines the strict data contract for metric cards.
 * Enforces type safety across dynamic localized payloads to prevent silent rendering errors.
 */
interface KpiMetric {
  label: string;
  value: string | null;
  change: number;
  isPositive: boolean;
  accentColor: string;
  iconBg: string;
  iconType: 'revenue' | 'profit' | 'orders' | 'aov';
}

/**
 * Component: KpiCardsComponent
 * 
 * Renders high-level performance metrics. Relies on OnPush change detection 
 * and Signals to ensure minimal DOM recalculations during view or language shifts.
 */
@Component({
  selector: 'app-kpi-cards',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  providers: [CurrencyPipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './kpi-cards.component.html',
  styleUrl: './kpi-cards.component.scss'
})
export class KpiCardsComponent {
  // Injects the centralized store to establish a reactive dependency on the active language
  store = inject(AppStore);
  // Injects the DashboardService to access KPI summary data
  dashboardService = inject(DashboardService);
  
  // Rakamları USD veya standart sayı olarak formatlamak için Angular araçları
  private currencyPipe = inject(CurrencyPipe);
  private decimalPipe = inject(DecimalPipe);

  // Drives the contextual payload generation to ensure metrics match the user's analytical focus
  readonly mode = input<'global' | 'sales' | 'product' | 'customer'>('sales');

  /**
   * Derives localized metrics on the fly.
   * Utilizing a computed signal guarantees the UI stays perfectly synchronized 
   * with both the language and view mode without manual subscription management.
   */
  displayMetrics = computed(() => {
    const lang = this.store.language();
    const currentMode = this.mode(); // 'global', 'sales', 'product' veya 'customer'
    const t = TRANSLATIONS[lang].KPI;

    // 1. DURUM: GLOBAL (ÜST ŞERİT)
    if (currentMode === 'global') {
      const kpiData = this.dashboardService.kpiSummary();
      if (!kpiData) return [] as KpiMetric[];

      return [
        { 
          label: lang === 'tr' ? 'Toplam Ciro' : t.REVENUE, 
          value: this.currencyPipe.transform(kpiData.revenue, 'USD', 'symbol', '1.0-0'), 
          change: Math.abs(kpiData.revenueChange), 
          isPositive: kpiData.revenueChange >= 0, 
          accentColor: '#2563EB', iconBg: 'rgba(37,99,235,0.1)', iconType: 'revenue' // Klasik Mavi
        },
        { 
          label: lang === 'tr' ? 'Toplam Kar' : t.PROFIT,
          value: this.currencyPipe.transform(kpiData.profit, 'USD', 'symbol', '1.0-0'), 
          change: Math.abs(kpiData.profitChange), 
          isPositive: kpiData.profitChange >= 0, 
          accentColor: '#10B981', iconBg: 'rgba(16,185,129,0.1)', iconType: 'profit' // Canlı Yeşil
        },
        { 
          label: lang === 'tr' ? 'Toplam Sipariş' : t.ORDERS, 
          value: this.decimalPipe.transform(kpiData.orders, '1.0-0'), 
          change: Math.abs(kpiData.ordersChange), 
          isPositive: kpiData.ordersChange >= 0, 
          accentColor: '#0EA5E9', iconBg: 'rgba(14,165,233,0.1)', iconType: 'orders' // Açık Mavi
        },
        { 
          label: lang === 'tr' ? 'Ortalama Sipariş Tutarı' : t.AOV,
          value: this.currencyPipe.transform(kpiData.aov, 'USD', 'symbol', '1.2-2'), 
          change: Math.abs(kpiData.aovChange), 
          isPositive: kpiData.aovChange >= 0, 
          accentColor: '#F59E0B', iconBg: 'rgba(245,158,11,0.1)', iconType: 'aov' // Kehribar
        }
      ] as KpiMetric[];
    }

    // 2. DURUM: SATIŞ (ALT ŞERİT)
    if (currentMode === 'sales') {
      const kpiData = this.dashboardService.kpiSummary();
      const regions = this.dashboardService.regionData();
      const categories = this.dashboardService.categoryData();
      
      if (!kpiData) return [] as KpiMetric[];

      // En çok satış yapılan şehir ve kategoriyi veriden dinamik olarak seçiyoruz
      const topRegionName = regions.length > 0 ? regions[0].city : '-';
      const topCategoryName = categories.length > 0 ? categories[0].name : '-';

      return [
        { 
          label: lang === 'tr' ? 'Aylık Büyüme Oranı' : 'Growth Rate', 
          value: `%${Math.abs(kpiData.revenueChange)}`, 
          change: Math.abs(kpiData.revenueChange), 
          isPositive: kpiData.revenueChange >= 0, 
          accentColor: '#6366F1', iconBg: 'rgba(99,102,241,0.1)', iconType: 'revenue' 
        },
        { 
          label: lang === 'tr' ? 'En Çok Satış Yapılan Şehir' : 'Top City',
          value: topRegionName, 
          change: regions.length > 0 ? regions[0].percentage : 0, 
          isPositive: true, 
          accentColor: '#14B8A6', iconBg: 'rgba(20,184,166,0.1)', iconType: 'orders' 
        },
        { 
          label: lang === 'tr' ? 'En Çok Satış Yapılan Kategori' : 'Top Category', 
          value: topCategoryName, 
          change: categories.length > 0 ? categories[0].value : 0, 
          isPositive: true, 
          accentColor: '#8B5CF6', iconBg: 'rgba(139,92,246,0.1)', iconType: 'profit' 
        },
        { 
          label: lang === 'tr' ? 'Ortalama Sipariş Tutarı' : t.AOV,
          value: this.currencyPipe.transform(kpiData.aov, 'USD', 'symbol', '1.2-2') || '', 
          change: Math.abs(kpiData.aovChange), 
          isPositive: kpiData.aovChange >= 0, 
          accentColor: '#F97316', iconBg: 'rgba(249,115,22,0.1)', iconType: 'aov' 
        }
      ] as KpiMetric[];
    }

    // 3. DURUM: ÜRÜN KPI -> Dokümantasyondaki Ürün KPI Başlıkları Birebir Uygulandı
    if (currentMode === 'product') {
      const prodKpi = this.dashboardService.productKpiSummary();
      if (!prodKpi) return [] as KpiMetric[];

      return [
        { 
          label: lang === 'tr' ? 'En Çok Satan Ürünler' : 'Top Products', 
          value: this.decimalPipe.transform(prodKpi.activeProducts, '1.0-0'), 
          change: Math.abs(prodKpi.productsChange), 
          isPositive: prodKpi.productsChange >= 0, 
          accentColor: '#8B5CF6', iconBg: 'rgba(139,92,246,0.1)', iconType: 'orders' // Mor
        },
        { 
          label: lang === 'tr' ? 'Mevcut Ürün Kar Marjı' : 'Current Profit Margin', 
          value: `%${prodKpi.avgMargin}`, 
          change: Math.abs(prodKpi.marginChange), 
          isPositive: prodKpi.marginChange >= 0, 
          accentColor: '#14B8A6', iconBg: 'rgba(20,184,166,0.1)', iconType: 'profit' // Turkuaz
        },
        { 
          label: lang === 'tr' ? 'Kategori Büyüme Oranı' : 'Category Growth', 
          value: `%${prodKpi.categoryShareChange}`, 
          change: Math.abs(prodKpi.categoryShareChange), 
          isPositive: prodKpi.categoryShareChange >= 0, 
          accentColor: '#F59E0B', iconBg: 'rgba(245,158,11,0.1)', iconType: 'revenue' // Kehribar
        },
        { 
          label: lang === 'tr' ? 'En Çok Satış Yapılan Kategori' : 'Best Category', 
          value: `%${prodKpi.topCategoryShare}`, 
          change: Math.abs(prodKpi.categoryShareChange), 
          isPositive: prodKpi.categoryShareChange >= 0, 
          accentColor: '#6366F1', iconBg: 'rgba(99,102,241,0.1)', iconType: 'aov' // İndigo
        }
      ] as KpiMetric[];
    }

    // 4. DURUM: MÜŞTERİ KPI -> Dokümantasyondaki Müşteri KPI Başlıkları Birebir Uygulandı
    if (currentMode === 'customer') {
      const custKpi = this.dashboardService.customerKpiSummary();
      if (!custKpi) return [] as KpiMetric[];

      return [
        { 
          label: lang === 'tr' ? 'Müşteri Sayısı' : 'Customer Count', 
          value: this.decimalPipe.transform(custKpi.customerCount, '1.0-0'), 
          change: Math.abs(custKpi.customerCountChange), 
          isPositive: custKpi.customerCountChange >= 0, 
          accentColor: '#EC4899', iconBg: 'rgba(236,72,153,0.1)', iconType: 'orders' // Senin Pembe tasarımın
        },
        { 
          label: lang === 'tr' ? 'Müşteri Cirosu' : 'Customer Revenue', 
          value: this.currencyPipe.transform(custKpi.avgLtv, 'USD', 'symbol', '1.0-0'), 
          change: Math.abs(custKpi.ltvChange), 
          isPositive: custKpi.ltvChange >= 0, 
          accentColor: '#6366F1', iconBg: 'rgba(99,102,241,0.1)', iconType: 'revenue' 
        },
        { 
          label: lang === 'tr' ? 'En Değerli Müşteriler' : 'Top Customers', 
          value: `%${custKpi.vipRevenueShare}`, 
          change: Math.abs(custKpi.vipShareChange), 
          isPositive: custKpi.vipShareChange >= 0, 
          accentColor: '#14B8A6', iconBg: 'rgba(20,184,166,0.1)', iconType: 'profit' 
        },
        { 
          label: lang === 'tr' ? 'Müşteri Segment Performansı' : 'Segment Performance', 
          value: `%${custKpi.repeatOrderRate}`, 
          change: Math.abs(custKpi.repeatRateChange), 
          isPositive: custKpi.repeatRateChange >= 0, 
          accentColor: '#F97316', iconBg: 'rgba(249,115,22,0.1)', iconType: 'aov' 
        }
      ] as KpiMetric[];
    }

    return [] as KpiMetric[];
  });
}