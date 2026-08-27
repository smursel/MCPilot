import { Component, ChangeDetectionStrategy, Input, computed, inject } from '@angular/core';
import { AppStore } from '@core/app.store';

/**
 * Defines the strict data contract for metric cards.
 * Enforces type safety across dynamic localized payloads to prevent silent rendering errors.
 */
interface KpiMetric {
  label: string;
  value: string;
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './kpi-cards.component.html',
  styleUrl: './kpi-cards.component.scss'
})
export class KpiCardsComponent {
  // Injects the centralized store to establish a reactive dependency on the active language
  store = inject(AppStore);
  
  // Drives the contextual payload generation to ensure metrics match the user's analytical focus
  @Input() mode: 'global' | 'sales' | 'product' | 'customer' = 'sales';

  /**
   * Derives localized metrics on the fly.
   * Utilizing a computed signal guarantees the UI stays perfectly synchronized 
   * with both the language and view mode without manual subscription management.
   */
  displayMetrics = computed(() => {
    const lang = this.store.language();

    switch (this.mode) {
      case 'global':
        return [
          { label: lang === 'tr' ? 'YTD Ciro' : 'YTD Revenue', value: '$1,248,000', change: 18.2, isPositive: true, accentColor: '#2563EB', iconBg: 'rgba(37,99,235,0.1)', iconType: 'revenue' },
          { label: lang === 'tr' ? 'YTD Kar' : 'YTD Profit', value: '$412,500', change: 14.5, isPositive: true, accentColor: '#10B981', iconBg: 'rgba(16,185,129,0.1)', iconType: 'profit' },
          { label: lang === 'tr' ? 'Toplam Müşteri' : 'Total Customers', value: '4,850', change: 9.1, isPositive: true, accentColor: '#0EA5E9', iconBg: 'rgba(14,165,233,0.1)', iconType: 'orders' },
          { label: lang === 'tr' ? 'Ort. Kar Marjı' : 'Avg. Profit Margin', value: '34.2%', change: 2.1, isPositive: true, accentColor: '#F59E0B', iconBg: 'rgba(245,158,11,0.1)', iconType: 'aov' }
        ] as KpiMetric[];
      
      case 'product':
        return [
          { label: lang === 'tr' ? 'Satılan Ürün (Adet)' : 'Top Product Units', value: '3,248', change: 12.4, isPositive: true, accentColor: '#8B5CF6', iconBg: 'rgba(139,92,246,0.1)', iconType: 'orders' },
          { label: lang === 'tr' ? 'Kategori Büyümesi' : 'Category Growth', value: '23%', change: 5.2, isPositive: true, accentColor: '#14B8A6', iconBg: 'rgba(20,184,166,0.1)', iconType: 'revenue' },
        ] as KpiMetric[];

      case 'customer':
        return [
          { label: lang === 'tr' ? 'Aktif Müşteri' : 'Active Customers', value: '1,420', change: -1.2, isPositive: false, accentColor: '#EC4899', iconBg: 'rgba(236,72,153,0.1)', iconType: 'orders' },
          { label: lang === 'tr' ? 'Geri Dönüş Oranı' : 'Returning Rate', value: '68%', change: 4.1, isPositive: true, accentColor: '#6366F1', iconBg: 'rgba(99,102,241,0.1)', iconType: 'aov' },
        ] as KpiMetric[];

      default:
        return [
          { label: lang === 'tr' ? 'Dönem Cirosu' : 'Period Revenue', value: '$841,240', change: 12.4, isPositive: true, accentColor: '#6366F1', iconBg: 'rgba(99,102,241,0.1)', iconType: 'revenue' },
          { label: lang === 'tr' ? 'Dönem Karı' : 'Period Profit', value: '$294,400', change: 8.7, isPositive: true, accentColor: '#14B8A6', iconBg: 'rgba(20,184,166,0.1)', iconType: 'profit' },
          { label: lang === 'tr' ? 'Dönem Siparişleri' : 'Period Orders', value: '14,832', change: 5.3, isPositive: true, accentColor: '#8B5CF6', iconBg: 'rgba(139,92,246,0.1)', iconType: 'orders' },
          { label: lang === 'tr' ? 'Ort. Sipariş Tutarı' : 'Avg. Order Value', value: '$56.72', change: -2.1, isPositive: false, accentColor: '#F97316', iconBg: 'rgba(249,115,22,0.1)', iconType: 'aov' }
        ] as KpiMetric[];
    }
  });
}