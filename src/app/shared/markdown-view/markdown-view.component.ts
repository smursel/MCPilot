import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { marked } from 'marked';

@Component({
  selector: 'app-markdown-view',
  standalone: true,
  template: `<div class="md" [innerHTML]="html()"></div>`,
  styleUrl: './markdown-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarkdownViewComponent {
  readonly source = input.required<string>();

  readonly html = computed(() =>
    marked.parse(this.source() ?? '', { async: false, gfm: true, breaks: true }) as string,
  );
}
