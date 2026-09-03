import { 
  Component, 
  ChangeDetectionStrategy, 
  AfterViewInit, 
  OnDestroy, 
  input, 
  effect, 
  viewChild, 
  ElementRef 
} from '@angular/core';
import * as echarts from 'echarts';

/**
 * Bileşen: DynamicChartComponent
 * Amaç: Dışarıdan aldığı JSON (EChartsOption) formatındaki veriyi görselleştiren,
 * projenin her yerinde kullanılabilecek jenerik (joker) bir grafik bileşenidir.
 * Yalnızca veriye odaklanır, iş mantığı barındırmaz.
 */
@Component({
  selector: 'app-dynamic-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Grafiğin çizileceği native DOM elemanı. Yükseklik ve genişlik parent'tan (%100) miras alınır. -->
    <div #chartContainer style="width: 100%; height: 100%; min-height: 250px;"></div>
  `
})
export class DynamicChartComponent implements AfterViewInit, OnDestroy {
  
  // ECharts kütüphanesinin oluşturduğu grafik nesnesinin (instance) referansını tutarız.
  // Bu sayede grafik güncellenebilir veya silinebilir.
  private chartInstance: echarts.ECharts | null = null;
  
  // Tarayıcı penceresi yeniden boyutlandırıldığında grafiğin de responsive 
  // olarak kendini ayarlamasını sağlayan tarayıcı API'si.
  private resizeObserver: ResizeObserver | null = null;

  // Grafiğin çizileceği div elemanını Angular'ın modern viewChild sinyali ile yakalıyoruz.
  private chartContainer = viewChild.required<ElementRef<HTMLDivElement>>('chartContainer');

  // Dışarıdan gelecek olan grafik konfigürasyonu.
  // EChartsOption tipinde olması, autocomplete ve tip güvenliği sağlar.
  readonly options = input.required<echarts.EChartsOption>();

  // Temanın dışarıdan alınıp grafiğe yansıtılması için eklenebilir. 
  // 'dark' veya 'light' string değeri alabilir.
  readonly theme = input<'light' | 'dark'>('light');

  constructor() {
    // Angular'ın effect() reaktif yapısı sayesinde, 'options' inputunda
    // herhangi bir değişiklik olduğunda bu blok otomatik olarak tetiklenir.
    effect(() => {
      const currentOptions = this.options();

      // Eğer grafik instance'ı zaten yaratılmışsa, sadece yeni veriyi (options) içeri basıyoruz.
      // ECharts arka planda eski veri ile yeni veri arasındaki farkı bulup animasyonlu bir geçiş yapar.
      if (this.chartInstance) {
        this.chartInstance.setOption(currentOptions, true);
      }
    });
  }

  /**
   * View (HTML) render olduktan sonra çalışır.
   * DOM elemanına erişimimiz garanti olduğu için grafiği burada başlatıyoruz (init).
   */
  ngAfterViewInit(): void {
    this.initChart();
    this.setupResizeObserver();
  }

  /**
   * Bileşen ekrandan silindiğinde (örn: başka sayfaya geçildiğinde) çalışır.
   * Hafıza sızıntılarını (memory leak) önlemek için event listener'ları ve chart instance'ını temizliyoruz.
   */
  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.chartInstance) {
      this.chartInstance.dispose();
    }
  }

  /**
   * ECharts'ı belirtilen div üzerinde başlatır ve ilk ayarları yükler.
   */
  private initChart(): void {
    const el = this.chartContainer().nativeElement;
    
    // ECharts'ı ilgili DOM elemanı üzerinde başlatıyoruz.
    // İkinci parametre tema ('light' veya 'dark'), üçüncü parametre ise render motorudur (svg veya canvas).
    // Arka planın şeffaf olması için transparent ayarını da ekliyoruz ki projendeki renklere uysun.
    this.chartInstance = echarts.init(el, this.theme(), { renderer: 'svg' });
    
    // Grafiği dışarıdan gelen ilk sinyal verisiyle dolduruyoruz.
    // Arka planı şeffaf yapıyoruz ki senin CSS değişkenlerin devrede kalsın.
    const initialOptions = {
      ...this.options(),
      backgroundColor: 'transparent'
    };
    
    this.chartInstance.setOption(initialOptions);
  }

  /**
   * Tarayıcı penceresi veya bileşenin bulunduğu kutu boyut değiştirdiğinde
   * grafiğin taşmasını/küçülmesini engellemek için resize fonksiyonunu tetikler.
   */
  private setupResizeObserver(): void {
    const el = this.chartContainer().nativeElement;
    
    this.resizeObserver = new ResizeObserver(() => {
      if (this.chartInstance) {
        this.chartInstance.resize();
      }
    });
    
    this.resizeObserver.observe(el);
  }
}