import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatFacade } from '@core/chat-facade.service';
import { ChatStore } from '@core/chat.store';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './message-input.component.html',
  styleUrl: './message-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessageInputComponent {
  private readonly facade = inject(ChatFacade);
  readonly store = inject(ChatStore);

  readonly text = signal('');

  send(): void {
    const value = this.text().trim();
    if (!value || !this.store.canSend()) {
      return;
    }

    this.facade.send(value);
    this.text.set('');
  }

  onEnter(event: Event): void {
    const keyboard = event as KeyboardEvent;
    if (!keyboard.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  placeholder(): string {
    if (!this.store.configured()) {
      return 'Sohbet kullanılamıyor — sunucuda API anahtarı tanımlı değil';
    }
    return 'Verilerinize dair bir soru sorun…';
  }
}
