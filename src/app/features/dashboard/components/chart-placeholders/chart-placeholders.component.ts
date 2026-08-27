import { Component, ChangeDetectionStrategy, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppStore } from '@core/app.store';
import { DashboardService } from '../../services/dashboard.service';

/**
 * Component: ChartPlaceholdersComponent
 * 
 * Delivers lightweight, CSS-only visualizations to avoid heavy charting libraries 
 * during the prototyping phase. Binds directly to the central data service to 
 * maintain a single source of truth for dashboard metrics.
 */
@Component({
  selector: 'app-chart-placeholders',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chart-placeholders.component.html',
  styleUrl: './chart-placeholders.component.scss'
})
export class ChartPlaceholdersComponent {
  // Injected to trigger reactive re-renders automatically when global language shifts
  store = inject(AppStore);
  
  // Injected to decouple data access logic from the presentation layer
  dashboardService = inject(DashboardService);

  // Dictates which visualizations render to keep the UI contextually relevant
  @Input() mode: 'sales' | 'product' | 'customer' = 'sales';

  // Fixed palettes ensuring consistent brand integration across all visual elements
  chartPalette = ["var(--primary-blue)", "#10B981", "#0EA5E9", "#F59E0B", "#8B5CF6"];
  segmentPalette = ["var(--primary-blue)", "#0EA5E9", "#F59E0B", "#10B981"];
  
  /**
   * Abstracts localization logic from the HTML template.
   * Prevents template bloat and keeps translation mapping centralized.
   */
  translateCategory(cat: string): string {
    if (this.store.language() !== 'tr') return cat;
    const dict: Record<string, string> = {
      'Electronics': 'Elektronik',
      'Apparel': 'Giyim',
      'Home & Garden': 'Ev & Bahçe',
      'Sports': 'Spor',
      'Beauty': 'Kozmetik'
    };
    return dict[cat] || cat;
  }

  /**
   * Translates backend-aligned SQL segment values into user-friendly localized strings.
   */
  translateSegment(seg: string): string {
    if (this.store.language() !== 'tr') return seg;
    const dict: Record<string, string> = {
      'VIP': 'VIP',
      'Loyal': 'Sadık',
      'Standard': 'Standart'
    };
    return dict[seg] || seg;
  }
}