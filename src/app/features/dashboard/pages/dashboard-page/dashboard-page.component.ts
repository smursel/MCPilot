import { Component, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppStore } from '@core/app.store';

import { DashboardHeaderComponent } from '../../components/dashboard-header/dashboard-header.component';
import { FilterSidebarComponent, DashboardView } from '../../components/filter-sidebar/filter-sidebar.component';
import { KpiCardsComponent } from '../../components/kpi-cards/kpi-cards.component';
import { ChartPlaceholdersComponent } from '../../components/chart-placeholders/chart-placeholders.component';
import { DataTablesComponent } from '../../components/data-tables/data-tables.component';
import { DataVizDrawerComponent } from '../../components/data-viz-drawer/data-viz-drawer.component';

/**
 * Component: DashboardPageComponent
 * 
 * Orchestrates the primary layout and view state of the analytics workspace.
 * Employs OnPush change detection and reactive signals to eliminate redundant 
 * DOM checks during heavy data visualization rendering.
 */
@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    DashboardHeaderComponent, 
    DataVizDrawerComponent, 
    FilterSidebarComponent, 
    KpiCardsComponent, 
    DataTablesComponent,
    ChartPlaceholdersComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss'
})
export class DashboardPageComponent {
  // Injects the centralized store to dynamically bind localized text across the layout
  store = inject(AppStore); 

  // Governs the off-canvas drawer's visibility state without complex input/output chains
  isDrawerOpen = signal<boolean>(false);
  
  // Drives conditional component rendering to reflect the user's current analytical focus
  currentView = signal<DashboardView>('sales');
  
  private router = inject(Router);

  /**
   * Delegates navigation responsibility to the Angular Router to ensure 
   * browser history and deep-linking remain intact.
   */
  navigateToChat(): void {
    this.router.navigate(['/chat']);
  }
}