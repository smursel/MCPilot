import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { ResultTableComponent } from '../../../../shared/result-table/result-table.component';
import { ToolCallTrace } from '@core/models';

@Component({
  selector: 'app-tool-trace-panel',
  standalone: true,
  imports: [ResultTableComponent],
  templateUrl: './tool-trace-panel.component.html',
  styleUrl: './tool-trace-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolTracePanelComponent {
  readonly traces = input.required<readonly ToolCallTrace[]>();

  readonly open = signal(false);
  readonly expanded = signal<ReadonlySet<string>>(new Set());

  toggle(): void {
    this.open.update((value) => !value);
  }

  toggleTrace(id: string): void {
    this.expanded.update((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  isExpanded(id: string): boolean {
    return this.expanded().has(id);
  }

  formatArguments(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }
    return typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  }

  sql(trace: ToolCallTrace): string | null {
    const args = trace.arguments;
    if (args && typeof args === 'object' && 'sql' in args) {
      const value = (args as { sql: unknown }).sql;
      return typeof value === 'string' ? value : null;
    }
    return null;
  }

  duration(ms: number): string {
    return ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(1)} sn`;
  }
}
