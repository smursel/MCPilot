import { Component, signal, ChangeDetectionStrategy, inject, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppStore } from '@core/app.store';
import { ChatStore } from '@core/chat.store';
import { DashboardHeaderComponent } from '../../components/dashboard-header/dashboard-header.component';
import { FilterSidebarComponent, DashboardView } from '../../components/filter-sidebar/filter-sidebar.component';
import { KpiCardsComponent } from '../../components/kpi-cards/kpi-cards.component';
import { ChartPlaceholdersComponent } from '../../components/chart-placeholders/chart-placeholders.component';
import { DataTablesComponent } from '../../components/data-tables/data-tables.component';
import { DataVizDrawerComponent } from '../../components/data-viz-drawer/data-viz-drawer.component';
import { DashboardService } from '../../services/dashboard.service'; // Import the service
import { TranslatePipe } from '../../../../shared/translate.pipe';

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
    ChartPlaceholdersComponent, 
    TranslatePipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss'
})

export class DashboardPageComponent implements OnInit{
  // Injects the centralized store to dynamically bind localized text across the layout
  store = inject(AppStore);
  chatStore = inject(ChatStore);
  private router = inject(Router);
  dashboardService = inject(DashboardService); // Inject the data service 

  // Governs the off-canvas drawer's visibility state without complex input/output chains
  isDrawerOpen = signal<boolean>(typeof window !== 'undefined' ? window.innerWidth > 900 : true);
  
  // Drives conditional component rendering to reflect the user's current analytical focus
  currentView = signal<DashboardView>('sales');

  // Lifecycle hook: Triggers immediately after component initialization
  ngOnInit(): void {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

    const formatDate = (d: Date) => {
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const day = d.getDate().toString().padStart(2, '0');
      return `${d.getFullYear()}-${month}-${day}`;
    };
    this.dashboardService.loadDashboardData(formatDate(firstDay), formatDate(today));
  }

// Listens for window resize to intelligently auto-close the drawer on smaller screens
@HostListener('window:resize')
  onResize(): void {
    if (typeof window !== 'undefined' && window.innerWidth <= 900) {
      if (this.chatStore.isEmpty()) {
        this.isDrawerOpen.set(false);
      }
    }
  }

 // Event handler for sidebar date range submissions
  onDateRangeChanged(range: {start: string, end: string}): void {
    this.dashboardService.loadDashboardData(range.start, range.end);
  }

  navigateToChat(): void {
    this.router.navigate(['/chat']);
  }
}