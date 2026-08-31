import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ChatSession } from './models';
import { AppStore } from './app.store';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private store = inject(AppStore);
  getSessions(): Observable<ChatSession[]> {
    const lang = this.store.language();
    const mockSessions: ChatSession[] = [
      {
        id: crypto.randomUUID(),
        title: lang === 'tr' ? 'İlk Sohbet' : 'New Chat',
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    return of(mockSessions);
  }

  createSession(title: string): Observable<ChatSession> {
    const session: ChatSession = {
      id: crypto.randomUUID(),
      title,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return of(session);
  }

  sendMessage(_sessionId: string, text: string): Observable<string> {
    const mockResponse = this.getMockResponse(text);
    return of(mockResponse);
  }

  private getMockResponse(text: string): string {
    const lower = text.toLowerCase();
    const lang = this.store.language();

    if (lang === 'tr') {
    if (lower.includes('merhaba') || lower.includes('selam')) {
      return 'Size de merhaba! 👋 Size nasıl yardımcı olabilirim?';
    }
    if (lower.includes('kim') || lower.includes('kimsiz')) {
      return 'Ben MCPilot\'ın AI asistanıyım. Sizi tanımaktan mutluyum!';
    }
    return 'Anladım. Buna devam etmek için ihtiyaç duyduğunuz bilgileri paylaşabilir misiniz?';
    } else {
      if (lower.includes('hello') || lower.includes('hi') || lower.includes('merhaba')) {
        return 'Hello there! What question would you like to ask me to analyze the data today?';
      }
      if (lower.includes('who')) {
        return "I am the MCPilot AI assistant. I'm happy to help you dive into e-commerce metrics!";
      }
      return "I understand. Which date range or specific metrics would you like me to focus on for this analysis?";
    }
  }
}
