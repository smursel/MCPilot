import { Component, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
  private router = inject(Router);

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
    if (this.store.currentSessionId()) {
      return;
    }

    this.store.setLoading(true);
    this.api.getSessions().subscribe({
      next: (sessions) => {
        this.store.loadSessions(sessions);

        if (sessions.length > 0) {
          this.store.selectSession(sessions[0].id);
          this.store.setLoading(false);
        } else {
          // hiç oturum yoksa kullanıcıyı boş ekranda bırakmamak için ilkini biz açarız
          this.createFirstSession();
        }
      },
      error: (err) => this.failStartup(err, 'Oturumlar yüklenemedi'),
    });
  }

  private createFirstSession(): void {
    this.api.createSession('Yeni Sohbet').subscribe({
      next: (session) => {
        this.store.createSession(session);
        this.store.setLoading(false);
      },
      error: (err) => this.failStartup(err, 'Yeni oturum oluşturulamadı'),
    });
  }

  private failStartup(err: unknown, fallback: string): void {
    this.store.setError(err instanceof Error ? err.message : fallback);
    this.store.setLoading(false);
  }

  // tema değiştirme buton tetikleyicisi - store üzerindeki temayı tersine çevirir
  toggleTheme(): void {
    const currentTheme = this.store.theme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.store.setTheme(newTheme); 
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  toggleLanguage(): void {
    const newLang = this.store.language() === 'tr' ? 'en' : 'tr';
    this.store.setLanguage(newLang);
  }
}