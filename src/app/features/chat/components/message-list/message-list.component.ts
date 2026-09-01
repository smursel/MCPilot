import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  viewChild,
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
export class MessageListComponent implements AfterViewChecked {
  readonly store = inject(ChatStore);
  private readonly scroller = viewChild.required<ElementRef<HTMLElement>>('scroller');
  private pinned = true;

  onScroll(): void {
    const el = this.scroller().nativeElement;
    this.pinned = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }

  ngAfterViewChecked(): void {
    if (this.pinned) {
      const el = this.scroller().nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }
}
