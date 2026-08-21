import { Component, inject } from '@angular/core';
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
}
