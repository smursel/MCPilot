import { Component, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppStore } from '@core/app.store';
import { ApiService } from '@core/api.service';
import { MessageListComponent } from '../../components/message-list/message-list.component';
import { MessageInputComponent } from '../../components/message-input/message-input.component';

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [CommonModule, MessageListComponent, MessageInputComponent],
  templateUrl: './chat-page.component.html',
  styleUrl: './chat-page.component.scss',
})
export class ChatPageComponent implements OnInit {
  // html şablonundan erişim için store public tutulur
  store = inject(AppStore); 
  private api = inject(ApiService);

  currentSession = this.store.currentSession;

  constructor() {
    // tema değişimlerini izleyerek root etiketine data-theme özniteliği işleme
    effect(() => {
      const theme = this.store.theme(); 
      if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    });
  }

  ngOnInit(): void {
    // aktif oturum yoksa başlangıç oturumlarını API üzerinden yükleme
    if (!this.store.currentSessionId()) {
      this.api.getSessions().subscribe((sessions) => {
        if (sessions.length > 0) {
          this.store.loadSessions(sessions);
          this.store.selectSession(sessions[0].id);
        }
      });
    }
  }

  // tema değiştirme buton tetikleyicisi - store üzerindeki temayı tersine çevirir
  toggleTheme(): void {
    const currentTheme = this.store.theme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.store.setTheme(newTheme); 
  }
}