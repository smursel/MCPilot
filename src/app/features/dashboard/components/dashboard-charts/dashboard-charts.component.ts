import { Component, ChangeDetectionStrategy, Input, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppStore } from '@core/app.store';
import { DashboardService } from '../../services/dashboard.service';
import { TranslatePipe } from '../../../../shared/translate.pipe';
import { TRANSLATIONS } from '@core/translations';
import { DynamicChartComponent } from '../../../../shared/dynamic-chart/dynamic-chart.component';
import * as echarts from 'echarts';

/**
 * Bileşen: ChartPlaceholdersComponent
 * Amaç: API'den (veya servislerden) gelen ham verileri alıp, 
 * DynamicChartComponent'in (ECharts) anlayacağı formata (JSON konfigürasyonuna) dönüştürmek 
 * ve doğru görünüm moduna (sales, product, customer) göre ekrana basmaktır.
 */
@Component({
  selector: 'app-dashboard-charts',
  standalone: true,
  imports: [CommonModule, TranslatePipe, DynamicChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard-charts.component.html',
  styleUrl: './dashboard-charts.component.scss'
})
export class DashboardChartsComponent {
  // Injected to trigger reactive re-renders automatically when global language shifts
  store = inject(AppStore);
  
  // Injected to decouple data access logic from the presentation layer
  dashboardService = inject(DashboardService);

  // Dictates which visualizations render to keep the UI contextually relevant
  @Input() mode: 'sales' | 'product' | 'customer' = 'sales';

  // Fixed palettes ensuring consistent brand integration across all visual elements
  chartPalette = ["#1E40AF", "#10B981", "#0EA5E9", "#F59E0B", "#8B5CF6"];
  segmentPalette = ["#1E40AF", "#0EA5E9", "#F59E0B", "#10B981"];

  /**
   * 1. ÇİZGİ GRAFİK: Aylık Satış Trendi (Ciro vs Kar)
   * dashboardService.monthlySales() verisini dinler ve ECharts Line Chart formatına çevirir.
   */
  salesTrendChartOption = computed<echarts.EChartsOption>(() => {
    const data = this.dashboardService.monthlySales();
    if (!data || data.length === 0) return {};

    const lang = this.store.language() as 'tr' | 'en';
    const tCharts = TRANSLATIONS[lang].CHARTS;

    return {
      tooltip: { 
        trigger: 'axis',
        confine: true
       }, // Üzerine gelince her iki çizgiyi (Ciro, Kar) aynı anda gösterir
      legend: {
        data: [tCharts.REVENUE, tCharts.PROFIT],
        bottom: 0,
        icon: 'circle',
        textStyle: { color: '#64748b' } // --text-muted
      },
      grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data.map(d => d.month),
        axisLine: { lineStyle: { color: '#e2e8f0' } }, // --border-color
        axisLabel: { color: '#64748b', fontFamily: 'monospace' }
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#e2e8f0', type: 'dashed' } },
        axisLabel: { color: '#64748b' }
      },
      series: [
        {
          name: tCharts.REVENUE,
          type: 'line',
          smooth: true, // Çizgileri yumuşatır (Kıvrımlı yapar)
          data: data.map(d => d.revenue),
          itemStyle: { color: '#1E40AF' },
          lineStyle: { width: 3 },
          symbolSize: 8,
          symbol: 'circle' // Sadece hover durumunda noktaları göster
        },
        {
          name: tCharts.PROFIT,
          type: 'line',
          smooth: true,
          data: data.map(d => d.profit),
          itemStyle: { color: '#10B981' },
          lineStyle: { width: 3, type: 'dashed' },
          symbolSize: 8,
          symbol: 'circle'
        }
      ]
    };
  });

  /**
   * 2. PASTA GRAFİK: Kategori Satışları
   * dashboardService.categoryData() verisini dinler ve ECharts Donut Chart formatına çevirir.
   */
  categorySalesChartOption = computed<echarts.EChartsOption>(() => {
    const data = this.dashboardService.categoryData();
    if (!data || data.length === 0) return {};

    const chartData = data.map(d => ({
      name: this.translateCategory(d.name),
      value: d.value
    }));

    return this.buildDonutOption(chartData, this.chartPalette);
  });

  /**
   * 3. ÇUBUK GRAFİK: Şehir / Bölge Performansı
   * dashboardService.regionData() verisini dinler ve yatay (Horizontal Bar) formata çevirir.
   */
  regionPerformanceChartOption = computed<echarts.EChartsOption>(() => {
    const data = this.dashboardService.regionData();
    if (!data || data.length === 0) return {};

    // ECharts yatay grafiklerde en yüksek değeri üste koymak için veriyi ters çevirmeyi sever
    const reversedData = [...data].reverse();

    return {
      tooltip: { 
        trigger: 'axis',
        confine: true,
        axisPointer: { type: 'shadow' } 
      },
      grid: { left: '3%', right: '18%', bottom: '3%', top: '3%', containLabel: true },
      xAxis: { type: 'value', show: false }, // Alt eksendeki rakamları gizledik
      yAxis: {
        type: 'category',
        data: reversedData.map(d => d.city),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#333', fontWeight: 500 } // --text-primary
      },
      series: [
        {
          type: 'bar',
          data: reversedData.map(d => d.revenue),
          itemStyle: { color: '#1E40AF', borderRadius: [0, 4, 4, 0] },
          barWidth: '40%',
          label: {
            show: true,
            position: 'right',
            formatter: (params: any) => {
              const val = params.value;
              return val >= 1000 ? '$' + (val / 1000).toFixed(1) + 'K' : '$' + val;
            },
            color: '#1E40AF',
            fontFamily: 'monospace',
            fontWeight: 600
          }
        }
      ]
    };
  });

  /**
   * 4. PASTA GRAFİK: Müşteri Segmentleri
   */
  segmentPerformanceChartOption = computed<echarts.EChartsOption>(() => {
    const data = this.dashboardService.segmentData();
    if (!data || data.length === 0) return {};

    const chartData = data.map(d => ({
      name: this.translateSegment(d.name),
      value: d.value
    }));

    return this.buildDonutOption(chartData, this.segmentPalette);
  });

  /**
   * 5. ŞELALE (+/- ÇUBUK) GRAFİK: Aylık Büyüme Oranı
   * Frontend tarafında hesaplama: ((Bu Ay - Geçen Ay) / Geçen Ay) * 100
   */

  /**
   * Büyüme oranını hesaplamak için en az 2 aylık veriye ihtiyacımız var.
   * Bu sinyal, HTML tarafında kartı gizleyip/göstermek için kullanılacak.
   */
  hasMonthlyGrowthData = computed(() => {
    const data = this.dashboardService.monthlySales();
    return data && data.length >= 2;
  });

  monthlyGrowthChartOption = computed<echarts.EChartsOption>(() => {
    const data = this.dashboardService.monthlySales();
    // Büyüme hesabı için en az 2 aylık veriye ihtiyacımız var
    if (!data || data.length < 2) return {};

    const months: string[] = [];
    const growthRates: number[] = [];

    // İkinci aydan başlayarak değişimi hesaplıyoruz
    for (let i = 1; i < data.length; i++) {
      months.push(data[i].month);
      const prevRevenue = data[i - 1].revenue;
      const currentRevenue = data[i].revenue;
      
      const growth = prevRevenue === 0 ? 0 : ((currentRevenue - prevRevenue) / prevRevenue) * 100;
      growthRates.push(parseFloat(growth.toFixed(1)));
    }

    return {
      tooltip: {
        trigger: 'axis',
        confine: true,
        axisPointer: { type: 'shadow' },
        formatter: '{b} <br/> Büyüme: <b>{c}%</b>'
      },
      grid: { left: '3%', right: '4%', bottom: '15%', top: '15%', containLabel: true },
      xAxis: {
        type: 'category',
        data: months,
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisLabel: { color: '#64748b', fontFamily: 'monospace' }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#64748b', formatter: '{value}%' },
        splitLine: { lineStyle: { color: '#e2e8f0', type: 'dashed' } }
      },
      series: [
        {
          type: 'bar',
          data: growthRates.map(val => ({
            value: val,
            // Colors based on positive/negative growth
            itemStyle: { color: val >= 0 ? '#10B981' : '#FF6B6B', borderRadius: [4, 4, 0, 0] }
          })),
          label: {
            show: true,
            position: 'top',
            formatter: '{c}%',
            color: '#333',
            fontFamily: 'monospace',
            fontWeight: 600,
            // Automatically hides labels when they collide during container resize
            hideOverlap: true
          }
        }
      ]
    };
  });

  /**
   * 6. DAĞILIM (SCATTER) GRAFİĞİ: Müşteri Sadakat Analizi
   * X ekseni: Sadakat Puanı, Y Eksen: Ciro, Balon Büyüklüğü: Sipariş Sayısı, Renk: Segment
   */
  customerLoyaltyScatterOption = computed<echarts.EChartsOption>(() => {
    const data = this.dashboardService.topCustomers();
    if (!data || data.length === 0) return {};

    const lang = this.store.language() as 'tr' | 'en';

    return {
      tooltip: {
        trigger: 'item',
        confine: true,
        formatter: (params: any) => {
          // data.map içinde oluşturduğumuz value dizisini parçalıyoruz
          const val = params.value;
          return `
            <div style="font-family: sans-serif;">
              <b style="font-size: 13px; color: #1E40AF;">${val[3]}</b><br/>
              <span style="color: #64748b;">Segment:</span> <b>${val[4]}</b><br/>
              <span style="color: #64748b;">Sadakat Puanı:</span> <b>${val[0]}</b><br/>
              <span style="color: #64748b;">Ciro:</span> <b>$${val[1].toLocaleString()}</b><br/>
              <span style="color: #64748b;">Sipariş Sayısı:</span> <b>${val[2]}</b>
            </div>
          `;
        }
      },
      grid: { left: '5%', right: '8%', bottom: '15%', top: '15%', containLabel: true },
      xAxis: {
        type: 'value',
        name: lang === 'tr' ? 'Sadakat Puanı' : 'Loyalty Score',
        nameLocation: 'middle',
        nameGap: 30,
        scale: true,
        axisLabel: { color: '#64748b', fontFamily: 'monospace' },
        splitLine: { show: false }
      },
      yAxis: {
        type: 'value',
        name: lang === 'tr' ? 'Toplam Ciro ($)' : 'Total Revenue ($)',
        axisLabel: { color: '#64748b', fontFamily: 'monospace' },
        splitLine: { lineStyle: { color: '#e2e8f0', type: 'dashed' } }
      },
      series: [
        {
          type: 'scatter',
          // Data formatı: [X(Puan), Y(Ciro), Boyut(Sipariş), İsim, Segment]
          data: data.map(c => ({
            value: [c.score, c.ltv, c.orders, c.name, c.segment],
            itemStyle: {
              // Segment renkleri: VIP -> Mor, Loyal -> Yeşil, Standard -> Mavi
              color: c.segment === 'VIP' ? '#8B5CF6' : (c.segment === 'Loyal' ? '#10B981' : '#0EA5E9'),
              opacity: 0.7
            }
          })),
          // Balonun büyüklüğünü Sipariş sayısına göre dinamik ayarlıyoruz
          symbolSize: (dataItem: any[]) => {
            const orders = dataItem[2];
            // Balon ne çok küçük görünsün ne de devasa olsun diye sınırlandırdık
            return Math.max(12, Math.min(45, orders * 1.5));
          }
        }
      ]
    };
  });

  /**
   * Ortak Pasta (Donut) Grafik Oluşturucu
   * Kod tekrarını (DRY prensibi) önlemek için her iki pasta grafiğin ortak ayarlarını burada birleştirdik.
   */
  private buildDonutOption(data: any[], palette: string[]): echarts.EChartsOption {
    return {
      tooltip: { trigger: 'item', formatter: '{b}: %{c}', confine: true },
      legend: {
        type: 'scroll',
        orient: 'vertical',
        right: '0.1%',
        top: 'center',
        icon: 'circle',
        itemGap: 10,
        textStyle: { 
          color: '#64748b', 
          fontSize: 11,
          // Rich text ayarları ile isim ve yüzdeyi sütunlar halinde hizalıyoruz
          rich: {
            name: { width: 85, color: '#64748b', fontSize: 11.5 },
            value: { width: 35, align: 'right', color: '#333', fontWeight: 600, fontFamily: 'monospace', fontSize: 12 }
          }
        },
        // Dinamik formatter: data dizisinden ilgili elemanı bulup değerini yazdırır
        formatter: (name: string) => {
          const item = data.find(d => d.name === name);
          const value = item ? item.value : 0;
          // Rich text etiketlerini kullanarak çıktıyı oluşturuyoruz
          return `{name|${name}} {value|%${value}}`;
        }
      },
      color: palette,
      series: [
        {
          type: 'pie',
          radius: ['45%', '70%'], // İç içe 2 yarıçap verilmesi onu 'Donut' yapar
          center: ['28%', '50%'], // Legend'a yer açmak için grafiği biraz sola kaydırdık
          avoidLabelOverlap: false,
          label: { show: false, position: 'center' },
          emphasis: { label: { show: true, fontSize: 13, fontWeight: 'bold' } },
          labelLine: { show: false },
          data: data
        }
      ]
    };
  }
  
  translateCategory(cat: string): string {
    const lang = this.store.language() as 'tr' | 'en';
    const t = TRANSLATIONS[lang].CHARTS.CATEGORIES as Record<string, string>;
    return t[cat] || cat; // Bulursa çeviriyi, bulamazsa orijinalini dönsün
  }

  translateSegment(seg: string): string {
    const lang = this.store.language() as 'tr' | 'en';
    const t = TRANSLATIONS[lang].CHARTS.SEGMENT as Record<string, string>; // Çakışmayı çözdüğün SEGMENT adını kullandık ✨
    return t[seg] || seg;
  }
  
}