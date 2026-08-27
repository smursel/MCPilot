import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MessageListComponent } from '@features/chat/components/message-list/message-list.component';
import { MessageInputComponent } from '@features/chat/components/message-input/message-input.component';

/**
 * Component: DataVizDrawerComponent
 * 
 * Encapsulates the conversational AI interface within a transient overlay.
 * Decouples the AI layer from the core dashboard layout to preserve primary analytical context.
 */
@Component({
  selector: 'app-data-viz-drawer',
  standalone: true,
  imports: [CommonModule, MessageListComponent, MessageInputComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './data-viz-drawer.component.html',
  styleUrl: './data-viz-drawer.component.scss'
})
export class DataVizDrawerComponent {
  // Controls the visibility state of the drawer to trigger hardware-accelerated CSS transitions
  @Input() isOpen = false;
  
  // Emits closure events to allow the parent container to manage its own layout state
  @Output() closeDrawer = new EventEmitter<void>();

  onClose(): void {
    this.closeDrawer.emit();
  }
}