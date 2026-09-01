import { Component, ChangeDetectionStrategy, Input, computed, inject } from '@angular/core';
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
  @Input() mode: 'global' | 'sales' | 'product' | 'customer' = 'sales';

  /**
   * Derives localized metrics on the fly.
   * Utilizing a computed signal guarantees the UI stays perfectly synchronized 
   * with both the language and view mode without manual subscription management.
   */
  displayMetrics = computed(() => {
    const lang = this.store.language();
    const kpiData = this.dashboardService.kpiSummary();
// Veri henüz gelmediyse veya boşsa boş dizi dön (UI kırılmasın)
    if (!kpiData) return [] as KpiMetric[];

    const t = TRANSLATIONS[lang].KPI;

    // Gelen veriyi formatlayarak UI kartlarına map'liyoruz
    return [
      { 
        label: t.REVENUE, 
        value: this.currencyPipe.transform(kpiData.revenue, 'USD', 'symbol', '1.0-0'), 
        change: Math.abs(kpiData.revenueChange), 
        isPositive: kpiData.revenueChange >= 0, 
        accentColor: '#6366F1', iconBg: 'rgba(99,102,241,0.1)', iconType: 'revenue' 
      },
      { 
        label: t.PROFIT,
        value: this.currencyPipe.transform(kpiData.profit, 'USD', 'symbol', '1.0-0'), 
        change: Math.abs(kpiData.profitChange), 
        isPositive: kpiData.profitChange >= 0, 
        accentColor: '#14B8A6', iconBg: 'rgba(20,184,166,0.1)', iconType: 'profit' 
      },
      { 
        label: t.ORDERS, 
        value: this.decimalPipe.transform(kpiData.orders, '1.0-0'), 
        change: Math.abs(kpiData.ordersChange), 
        isPositive: kpiData.ordersChange >= 0, 
        accentColor: '#8B5CF6', iconBg: 'rgba(139,92,246,0.1)', iconType: 'orders' 
      },
      { 
        label: t.AOV,
        value: this.currencyPipe.transform(kpiData.aov, 'USD', 'symbol', '1.2-2'), 
        change: Math.abs(kpiData.aovChange), 
        isPositive: kpiData.aovChange >= 0, 
        accentColor: '#F97316', iconBg: 'rgba(249,115,22,0.1)', iconType: 'aov' 
      }
    ] as KpiMetric[];
  });
}