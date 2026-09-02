import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  viewChild,
  effect,
  AfterViewInit, 
  OnDestroy
} from '@angular/core';
import { MessageItemComponent } from '../message-item/message-item.component';
import { ChatStore } from '@core/chat.store';
import { TranslatePipe } from '../../../../shared/translate.pipe';

@Component({
  selector: 'app-message-list',
  standalone: true,
  imports: [MessageItemComponent, TranslatePipe],
  templateUrl: './message-list.component.html',
  styleUrl: './message-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessageListComponent implements AfterViewInit, OnDestroy {
  readonly store = inject(ChatStore);
  private readonly scroller = viewChild.required<ElementRef<HTMLElement>>('scroller');
  // State tracker for message array length
  private previousMessageCount = 0;
  private mutationObserver!: MutationObserver;
  private isAutoScrolling = false;
  // 'user-prompt' -> Senin atttığın mesaja kilitlenir
  // 'bottom'      -> Metin akarken en alta kilitlenir
  // 'none'        -> Kullanıcı kontrolü eline aldı, scroll'u bırakır
  private latchMode: 'user-prompt' | 'bottom' | 'none' = 'bottom';

  constructor() {
    // Force scroll to bottom whenever a completely new message is added to the store
    effect(() => {
      const currentMessages = this.store.messages();
      if (currentMessages.length > this.previousMessageCount) {
        this.latchMode = 'user-prompt';
        this.smartScroll(); 
      }
      this.previousMessageCount = currentMessages.length;
    });
  }

  ngAfterViewInit(): void {
    const el = this.scroller().nativeElement;
    
    this.mutationObserver = new MutationObserver(() => {
      if (this.latchMode !== 'none') {
        this.smartScroll();
      }
    });

    // Watch for any child elements or text nodes being added/modified (perfect for streaming)
    this.mutationObserver.observe(el, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  ngOnDestroy(): void {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
  }

  onScroll(): void {

    if (this.isAutoScrolling) {
      return;
    } 
    const el = this.scroller().nativeElement;
    const dist = el.scrollHeight - Math.ceil(el.scrollTop) - el.clientHeight ;

    if (dist < 250) {
      // Eğer en alta kadar kendin kaydırdıysan, artık bottom-latch moduna geç
      this.latchMode = 'bottom'; 
    } else {
      // Eğer ortalarda bir yerdeysen sistemi serbest bırak, metin akarken ekranı kaydırmasın
      this.latchMode = 'none'; 
    }
  }

  // Smart scrolling logic handling both user-prompt anchoring and bottom-latching
  private smartScroll(): void {
    const el = this.scroller().nativeElement;
    this.isAutoScrolling = true;

    requestAnimationFrame(() => {
      // Default: Her zaman en alta inme hedefi
      let targetScroll = el.scrollHeight - el.clientHeight;

      if (this.latchMode === 'user-prompt') {
        // Ekrandaki tüm kullanıcı (mavi) mesajlarını bul
        const userMessages = el.querySelectorAll('.message.user');
        const lastUserMsg = userMessages[userMessages.length - 1] as HTMLElement;

        if (lastUserMsg) {
          // Senin mesajının scroller içindeki pixel bazlı tam konumunu bul (20px ferahlık bırakarak)
          const relativeTop = lastUserMsg.getBoundingClientRect().top - el.getBoundingClientRect().top + el.scrollTop;
          const maxScrollTop = relativeTop - 20;
          
          // Kaydırma miktarını sınırla: Ekran asla senin mesajının üstüne çıkmasın!
          targetScroll = Math.min(targetScroll, maxScrollTop);
        }
      }

      // Scroll değerini uygula ve eksi değerleri (bounce efektini) önle
      el.scrollTop = Math.max(0, targetScroll);

      // Bir sonraki frame'de scroll kilidini güvenli bir şekilde kaldır
      requestAnimationFrame(() => {
        this.isAutoScrolling = false;
      });
    });
  }
}
