import { Component, ChangeDetectionStrategy, Input, inject, computed } from '@angular/core';
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
  chartPalette = ["#1E40AF", "#10B981", "#0EA5E9", "#F59E0B", "#8B5CF6"];
  segmentPalette = ["#1E40AF", "#0EA5E9", "#F59E0B", "#10B981"];

  // --- DONUT GRAFİKLERİ İÇİN DİNAMİK CSS (Conic Gradient) ---
  categoryDonutStyle = computed(() => {
    const data = this.dashboardService.categoryData();
    if (!data || data.length === 0) return 'conic-gradient(#e2e8f0 0% 100%)';
    
    let gradient = 'conic-gradient(';
    let currentAngle = 0;
    data.forEach((item, index) => {
      const color = this.chartPalette[index % this.chartPalette.length];
      const angle = (item.value / 100) * 360;
      gradient += `${color} ${currentAngle}deg ${currentAngle + angle}deg, `;
      currentAngle += angle;
    });
    return gradient.slice(0, -2) + ')';
  });

  segmentDonutStyle = computed(() => {
    const data = this.dashboardService.segmentData();
    if (!data || data.length === 0) return 'conic-gradient(#e2e8f0 0% 100%)';
    
    let gradient = 'conic-gradient(';
    let currentAngle = 0;
    data.forEach((item, index) => {
      const color = this.segmentPalette[index % this.segmentPalette.length];
      const angle = (item.value / 100) * 360;
      gradient += `${color} ${currentAngle}deg ${currentAngle + angle}deg, `;
      currentAngle += angle;
    });
    return gradient.slice(0, -2) + ')';
  });

  // --- ÇİZGİ GRAFİĞİ İÇİN DİNAMİK SVG PATH HESAPLAMASI ---
  svgPaths = computed(() => {
    const data = this.dashboardService.monthlySales();
    if (!data || data.length === 0) return { revenue: '', profit: '' };

    const maxRev = Math.max(...data.map(d => d.revenue)) * 1.1; // %10 üst boşluk
    const width = 500;
    const height = 160;
    const stepX = width / (data.length > 1 ? data.length - 1 : 1);

    let revPath = '';
    let profPath = '';
    const points: any[] = [];

    data.forEach((d, i) => {
      const x = i * stepX;
      const yRev = height - (d.revenue / maxRev) * height; // Y ekseni terstir (SVG kuralı)
      const yProf = height - (d.profit / maxRev) * height;

      points.push({ x, yRev, yProf, month: d.month, rev: d.revenue, prof: d.profit });

      if (i === 0) {
        revPath += `M ${x},${yRev} `;
        profPath += `M ${x},${yProf} `;
      } else {
        const prevX = (i - 1) * stepX;
        const prevYRev = height - (data[i-1].revenue / maxRev) * height;
        const prevYProf = height - (data[i-1].profit / maxRev) * height;
        
        // Yumuşak eğri (Cubic Bezier) hesaplaması
        const cpX = prevX + (stepX / 2);
        revPath += `C ${cpX},${prevYRev} ${cpX},${yRev} ${x},${yRev} `;
        profPath += `C ${cpX},${prevYProf} ${cpX},${yProf} ${x},${yProf} `;
      }
    });

    return { revenue: revPath, profit: profPath, points };
  });
  
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