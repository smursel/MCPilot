import { Component, ChangeDetectionStrategy, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppStore } from '@core/app.store';
import { DashboardService } from '../../services/dashboard.service';

/**
 * Component: DataTablesComponent
 * 
 * Renders high-density data tables. Uses OnPush change detection 
 * to ensure high performance even with large datasets. Relies on 
 * AppStore for reactive localization and DashboardService for data.
 */
@Component({
  selector: 'app-data-tables',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './data-tables.component.html',
  styleUrl: './data-tables.component.scss'
})
export class DataTablesComponent {
  // Injects centralized state to reactively update column headers upon language switch
  store = inject(AppStore);

  // Injects data layer to decouple business logic from UI presentation
  dashboardService = inject(DashboardService);

  // Dictates component visibility logic to ensure contextual relevance
  @Input() mode: 'sales' | 'product' | 'customer' = 'sales';
}