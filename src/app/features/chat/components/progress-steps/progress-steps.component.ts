import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ProgressStep } from '@core/models';

@Component({
  selector: 'app-progress-steps',
  standalone: true,
  templateUrl: './progress-steps.component.html',
  styleUrl: './progress-steps.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressStepsComponent {
  readonly steps = input.required<readonly ProgressStep[]>();

  duration(ms: number | undefined): string {
    if (ms === undefined) {
      return '';
    }
    return ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(1)} sn`;
  }
}
