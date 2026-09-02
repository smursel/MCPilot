import { ChangeDetectionStrategy, Component, inject} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatFacade } from '@core/chat-facade.service';
import { ChatStore } from '@core/chat.store';
import { TranslatePipe } from '../../../../shared/translate.pipe';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  templateUrl: './message-input.component.html',
  styleUrl: './message-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessageInputComponent {
  private readonly facade = inject(ChatFacade);
  readonly store = inject(ChatStore);

  send(): void {
    const value = this.store.draft().trim();
    if (!value || !this.store.canSend()) {
      return;
    }
    this.facade.send(value);
    this.store.setDraft('');
  }

  onEnter(event: Event): void {
    const keyboard = event as KeyboardEvent;
    if (!keyboard.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

}
