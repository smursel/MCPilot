import { Component, EventEmitter, Output, ChangeDetectionStrategy, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppStore } from '@core/app.store';
import { TranslatePipe } from '../../../../shared/translate.pipe';

/**
 * Component: DashboardHeaderComponent
 * 
 * Acts as the global navigation and primary action bar.
 * Integrates with AppStore to reactively toggle theme and localization
 * without requiring page reloads.
 */
@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard-header.component.html',
  styleUrl: './dashboard-header.component.scss'
})
export class DashboardHeaderComponent {
  // Injects the centralized store to read and mutate global UI state
  store = inject(AppStore);

  // Emits actions to the parent layout to trigger the AI drawer or navigation
  @Output() openDataViz = new EventEmitter<void>();
  @Output() routeToChat = new EventEmitter<void>();

  constructor() {
    // Reactively binds the theme state to the document root for pure CSS theming
    effect(() => {
      const theme = this.store.theme();
      if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    });
  }

  onAskCopilot(): void {
    this.openDataViz.emit();
  }

  onAnalyzeData(): void {
    this.routeToChat.emit();
  }

  toggleTheme(): void {
    const currentTheme = this.store.theme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.store.setTheme(newTheme);
  }

  toggleLanguage(): void {
    const newLang = this.store.language() === 'tr' ? 'en' : 'tr';
    this.store.setLanguage(newLang);
  }
}