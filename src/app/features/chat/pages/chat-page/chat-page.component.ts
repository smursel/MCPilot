import { ChangeDetectionStrategy, Component, OnInit, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ConversationSidebarComponent } from '../../components/conversation-sidebar/conversation-sidebar.component';
import { MessageInputComponent } from '../../components/message-input/message-input.component';
import { MessageListComponent } from '../../components/message-list/message-list.component';
import { ModelSelectorComponent } from '../../components/model-selector/model-selector.component';
import { ChatFacade } from '@core/chat-facade.service';
import { ChatStore } from '@core/chat.store';
import { AppStore } from '@core/app.store';

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [
    ConversationSidebarComponent,
    MessageListComponent,
    MessageInputComponent,
    ModelSelectorComponent,
  ],
  templateUrl: './chat-page.component.html',
  styleUrl: './chat-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatPageComponent implements OnInit {
  private readonly facade = inject(ChatFacade);
  readonly store = inject(ChatStore);
  readonly ui = inject(AppStore);
  private readonly router = inject(Router);

  constructor() {
    effect(() => {
      const theme = this.ui.theme();
      if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    });
  }

  ngOnInit(): void {
this.facade.init();
  }

  // tema değiştirme buton tetikleyicisi - ui üzerindeki temayı tersine çevirir
  toggleTheme(): void {
    const currentTheme = this.ui.theme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.ui.setTheme(newTheme); 
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  toggleLanguage(): void {
    const newLang = this.ui.language() === 'tr' ? 'en' : 'tr';
    this.ui.setLanguage(newLang);
  }
}