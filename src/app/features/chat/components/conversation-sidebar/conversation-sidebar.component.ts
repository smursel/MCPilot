import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ChatFacade } from '@core/chat-facade.service';
import { ChatStore } from '@core/chat.store';

@Component({
  selector: 'app-conversation-sidebar',
  standalone: true,
  templateUrl: './conversation-sidebar.component.html',
  styleUrl: './conversation-sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConversationSidebarComponent {
  private readonly facade = inject(ChatFacade);
  readonly store = inject(ChatStore);

  newChat(): void {
    this.facade.newConversation();
  }

  open(id: string): void {
    if (id !== this.store.conversationId()) {
      this.facade.openConversation(id);
    }
  }

  remove(event: Event, id: string): void {
    event.stopPropagation();
    this.facade.deleteConversation(id);
  }

  when(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const diff = Date.now() - date.getTime();
    const minute = 60_000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diff < minute) return 'az önce';
    if (diff < hour) return `${Math.floor(diff / minute)} dk önce`;
    if (diff < day) return `${Math.floor(diff / hour)} sa önce`;
    if (diff < 7 * day) return `${Math.floor(diff / day)} gün önce`;

    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  }
}
