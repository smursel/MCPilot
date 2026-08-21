import { Component, OnInit, inject } from '@angular/core';
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
  private store = inject(AppStore);
  private api = inject(ApiService);

  currentSession = this.store.currentSession;

  ngOnInit(): void {
    if (!this.store.currentSessionId()) {
      this.api.getSessions().subscribe((sessions) => {
        if (sessions.length > 0) {
          this.store.selectSession(sessions[0].id);
        }
      });
    }
  }
}
