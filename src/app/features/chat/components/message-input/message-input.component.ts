import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppStore } from '@core/app.store';
import { ApiService } from '@core/api.service';
import { ChatMessage } from '@core/models';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './message-input.component.html',
  styleUrl: './message-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessageInputComponent {
  store = inject(AppStore);
  private api = inject(ApiService);

  text = '';

  send(): void {
    if (!this.text.trim()) return;
    if (!this.store.currentSessionId()) return;

    const sessionId = this.store.currentSessionId()!;
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: this.text,
      status: 'sent',
      timestamp: new Date().toISOString(),
    };

    this.store.addMessage(sessionId, userMsg);

    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      status: 'streaming',
      timestamp: new Date().toISOString(),
    };

    this.store.addMessage(sessionId, assistantMsg);
    this.store.setLoading(true);

    this.api.sendMessage(sessionId, this.text).subscribe({
      next: (response) => {
        this.store.updateMessage(sessionId, assistantMsg.id, {
          content: response,
          status: 'sent',
        });
        this.store.setLoading(false);
      },
      error: (err) => {
        this.store.updateMessage(sessionId, assistantMsg.id, {
          content: 'Hata oluştu',
          status: 'error',
          error: err.message,
        });
        this.store.setError(err.message);
        this.store.setLoading(false);
      },
    });

    this.text = '';
  }

  // enter tuşu yönetimi - shift basılıysa alt satıra geçer, değilse mesajı gönderir
  handleEnter(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    
    if (!keyboardEvent.shiftKey) {
      event.preventDefault(); 
      this.send();
    }
  }
}