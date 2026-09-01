import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ChatFacade } from '@core/chat-facade.service';
import { ChatStore } from '@core/chat.store';
import { TranslatePipe } from '../../../../shared/translate.pipe';
import { TRANSLATIONS } from '@core/translations';
import { AppStore } from '@core/app.store';

@Component({
  selector: 'app-conversation-sidebar',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './conversation-sidebar.component.html',
  styleUrl: './conversation-sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConversationSidebarComponent {
  private readonly facade = inject(ChatFacade);
  readonly store = inject(ChatStore);
  readonly ui = inject(AppStore);

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

    const lang = this.ui.language() as 'tr' | 'en'; 
    const t = TRANSLATIONS[lang].TIME;

    if (diff < minute) return t.JUST_NOW;
    if (diff < hour) return `${Math.floor(diff / minute)} ${t.MINS_AGO}`;
    if (diff < day) return `${Math.floor(diff / hour)} ${t.HOURS_AGO}`;
    if (diff < 7 * day) return `${Math.floor(diff / day)} ${t.DAYS_AGO}`;

    const locale = lang === 'tr' ? 'tr-TR' : 'en-US';
    return date.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
  }
}
