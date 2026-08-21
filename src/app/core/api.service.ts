import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ChatSession } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  getSessions(): Observable<ChatSession[]> {
    const mockSessions: ChatSession[] = [
      {
        id: crypto.randomUUID(),
        title: 'İlk Sohbet',
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
    if (lower.includes('merhaba') || lower.includes('selam')) {
      return 'Size de merhaba! 👋 Size nasıl yardımcı olabilirim?';
    }
    if (lower.includes('kim') || lower.includes('kimsiz')) {
      return 'Ben MCPilot\'ın AI asistanıyım. Sizi tanımaktan mutluyum!';
    }
    return 'Anladım. Buna devam etmek için ihtiyaç duyduğunuz bilgileri paylaşabilir misiniz?';
  }
}
