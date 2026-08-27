import { Injectable, computed, signal } from '@angular/core';
import { ChatMessage, ChatSession } from './models';

@Injectable({ providedIn: 'root' })
export class AppStore {
  private readonly _sessions = signal<readonly ChatSession[]>([]);
  private readonly _currentSessionId = signal<string | null>(null);
  private readonly _isLoading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _theme = signal<'light' | 'dark'>('light');
  private readonly _language = signal<'tr' | 'en'>('tr');

  readonly sessions = this._sessions.asReadonly();
  readonly currentSessionId = this._currentSessionId.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly theme = this._theme.asReadonly();
  readonly language = this._language.asReadonly();

  readonly currentSession = computed(() => {
    const id = this._currentSessionId();
    return this._sessions().find((s) => s.id === id) ?? null;
  });

  loadSessions(sessions: ChatSession[]): void {
    this._sessions.set(sessions);
  }

  selectSession(sessionId: string): void {
    this._currentSessionId.set(sessionId);
  }

  createSession(session: ChatSession): void {
    this._sessions.update((s) => [...s, session]);
    this._currentSessionId.set(session.id);
  }

  addMessage(sessionId: string, message: ChatMessage): void {
    this._sessions.update((sessions) =>
      sessions.map((s) =>
        s.id === sessionId ? { ...s, messages: [...s.messages, message], updatedAt: new Date().toISOString() } : s,
      ),
    );
  }

  updateMessage(sessionId: string, messageId: string, updates: Partial<ChatMessage>): void {
    this._sessions.update((sessions) =>
      sessions.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              messages: s.messages.map((m) => (m.id === messageId ? { ...m, ...updates } : m)),
              updatedAt: new Date().toISOString(),
            }
          : s,
      ),
    );
  }

  setLoading(isLoading: boolean): void {
    this._isLoading.set(isLoading);
  }

  setError(error: string | null): void {
    this._error.set(error);
  }

  setTheme(theme: 'light' | 'dark'): void {
    this._theme.set(theme);
  }

  setLanguage(lang: 'tr' | 'en'): void { // YENİ ✨
    this._language.set(lang);
  }

  clearError(): void {
    this._error.set(null);
  }
}
