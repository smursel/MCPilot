import { Component, ChangeDetectionStrategy, Output, EventEmitter, signal, inject } from '@angular/core';
import { AppStore } from '@core/app.store';

export type DashboardView = 'sales' | 'product' | 'customer';

/**
 * Component: FilterSidebarComponent
 * 
 * Acts as the core analytical control center. On mobile viewports, 
 * it gracefully transforms into an expandable accordion to preserve 
 * vital screen real estate for data visualizations.
 */
@Component({
  selector: 'app-filter-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './filter-sidebar.component.html',
  styleUrl: './filter-sidebar.component.scss'
})
export class FilterSidebarComponent {
  // Binds to global state to instantly reflect localization changes
  store = inject(AppStore);

  // Reactive signals manage active filters without triggering deep change detection cycles
  activeView = signal<DashboardView>('sales');
  startDate = signal<string>('2026-08-01');
  endDate = signal<string>('2026-08-27');
  
  // Tracks the dropdown preset state to avoid disjointed UX during manual overrides
  datePreset = signal<string>('this-month'); 

  // Tracks the mobile accordion state to strictly toggle filter visibility
  isMobileOpen = signal<boolean>(false);

  @Output() viewChanged = new EventEmitter<DashboardView>();
  @Output() dateRangeChanged = new EventEmitter<{start: string, end: string}>();

  /**
   * Toggles the accordion state specifically for restricted mobile viewports.
   */
  toggleMobileMenu(): void {
    this.isMobileOpen.update(v => !v);
  }

  /**
   * Closes the mobile accordion after applying filters to immediately reveal dashboard updates.
   */
  applyFilters(): void {
    this.isMobileOpen.set(false);
  }

  onViewChange(view: DashboardView): void {
    this.activeView.set(view);
    this.viewChanged.emit(view);
  }

  /**
   * Intercepts manual date inputs and aligns the semantic preset to 'custom'.
   */
  onStartDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.startDate.set(input.value);
    this.datePreset.set('custom');
    this.emitDateChange();
  }

  onEndDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.endDate.set(input.value);
    this.datePreset.set('custom');
    this.emitDateChange();
  }

  /**
   * Translates high-level temporal selections into explicit, query-ready boundaries.
   */
  onPresetChange(event: Event): void {
    const preset = (event.target as HTMLSelectElement).value;
    this.datePreset.set(preset);
    
    const today = '2026-08-27';

    switch (preset) {
      case 'this-month':
        this.startDate.set('2026-08-01');
        this.endDate.set(today);
        break;
      case 'last-quarter':
        // Maps to Q2 boundaries reflecting the mocked analytical context
        this.startDate.set('2026-04-01');
        this.endDate.set('2026-06-30');
        break;
      case 'ytd':
        this.startDate.set('2026-01-01');
        this.endDate.set(today);
        break;
      case 'custom':
        // Aborts automated overrides to strictly respect manual user inputs
        return;
    }
    
    this.emitDateChange();
  }

  private emitDateChange(): void {
    this.dateRangeChanged.emit({
      start: this.startDate(),
      end: this.endDate()
    });
  }
}