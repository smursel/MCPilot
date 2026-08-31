import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MarkdownViewComponent } from '../../../../shared/markdown-view/markdown-view.component';
import { ProgressStepsComponent } from '../progress-steps/progress-steps.component';
import { ToolTracePanelComponent } from '../tool-trace-panel/tool-trace-panel.component';
import { ChatMessage } from '@core/models';

@Component({
  selector: 'app-message-item',
  standalone: true,
  imports: [MarkdownViewComponent, ProgressStepsComponent, ToolTracePanelComponent],
  templateUrl: './message-item.component.html',
  styleUrl: './message-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessageItemComponent {
  readonly message = input.required<ChatMessage>();
}
