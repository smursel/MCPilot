import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';
export type Language = 'tr' | 'en';

@Injectable({ providedIn: 'root' })
export class AppStore {
  private readonly _theme = signal<Theme>('light');
  private readonly _language = signal<Language>('tr');

  readonly theme = this._theme.asReadonly();
  readonly language = this._language.asReadonly();

  setTheme(theme: Theme): void {
    this._theme.set(theme);
  }

  toggleTheme(): void {
    this._theme.update((current) => (current === 'light' ? 'dark' : 'light'));
  }

  setLanguage(language: Language): void {
    this._language.set(language);
  }
}
