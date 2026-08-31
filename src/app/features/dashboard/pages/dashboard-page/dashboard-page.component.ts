import { Component, signal, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppStore } from '@core/app.store';
import { DashboardHeaderComponent } from '../../components/dashboard-header/dashboard-header.component';
import { FilterSidebarComponent, DashboardView } from '../../components/filter-sidebar/filter-sidebar.component';
import { KpiCardsComponent } from '../../components/kpi-cards/kpi-cards.component';
import { ChartPlaceholdersComponent } from '../../components/chart-placeholders/chart-placeholders.component';
import { DataTablesComponent } from '../../components/data-tables/data-tables.component';
import { DataVizDrawerComponent } from '../../components/data-viz-drawer/data-viz-drawer.component';
import { DashboardService } from '../../services/dashboard.service'; // Import the service

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
export class DashboardPageComponent implements OnInit{
  // Injects the centralized store to dynamically bind localized text across the layout
  store = inject(AppStore);
  private router = inject(Router);
  private dashboardService = inject(DashboardService); // Inject the data service 

  // Governs the off-canvas drawer's visibility state without complex input/output chains
  isDrawerOpen = signal<boolean>(false);
  
  // Drives conditional component rendering to reflect the user's current analytical focus
  currentView = signal<DashboardView>('sales');

  // Lifecycle hook: Triggers immediately after component initialization
  ngOnInit(): void {
    // Initial fetch to populate the dashboard with default date range
    this.dashboardService.loadDashboardData('2026-08-01', '2026-08-27');
  }

 // Event handler for sidebar date range submissions
  onDateRangeChanged(range: {start: string, end: string}): void {
    this.dashboardService.loadDashboardData(range.start, range.end);
  }

  navigateToChat(): void {
    this.router.navigate(['/chat']);
  }
}