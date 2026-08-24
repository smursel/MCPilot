import { Component, inject, ViewChild, ElementRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppStore } from '@core/app.store';
import { MessageItemComponent } from '../message-item/message-item.component';

@Component({
  selector: 'app-message-list',
  standalone: true,
  imports: [CommonModule, MessageItemComponent],
  templateUrl: './message-list.component.html',
  styleUrl: './message-list.component.scss',
})
export class MessageListComponent {
  store = inject(AppStore);
  
  // scroll konteyner DOM referansını yakalama
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  constructor() {
    // mesajlar değiştikçe otomatik tetiklenen signal takibi
    effect(() => {
      const currentMessages = this.store.currentSession()?.messages;
      
      if (currentMessages) {
        // DOM güncellenmesi sonrasında pürüzsüz kaydırma için gecikme
        setTimeout(() => {
          this.scrollToBottom();
        }, 50);
      }
    });
  }

  // en alta pürüzsüz (smooth) kaydırma fonksiyonu
  private scrollToBottom(): void {
    if (this.scrollContainer) {
      const el = this.scrollContainer.nativeElement;
      el.scrollTo({
        top: el.scrollHeight,
        behavior: 'smooth'
      });
    }
  }
}