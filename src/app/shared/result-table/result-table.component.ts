import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

interface TableModel {
  readonly columns: readonly string[];
  readonly rows: readonly Record<string, unknown>[];
}

@Component({
  selector: 'app-result-table',
  standalone: true,
  templateUrl: './result-table.component.html',
  styleUrl: './result-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultTableComponent {
  readonly data = input.required<unknown>();

  readonly table = computed<TableModel | null>(() => this.toTable(this.data()));

  readonly raw = computed(() => JSON.stringify(this.data(), null, 2));

  cell(row: Record<string, unknown>, column: string): string {
    const value = row[column];
    if (value === null || value === undefined) {
      return '—';
    }
    return typeof value === 'object' ? JSON.stringify(value) : String(value);
  }

  private toTable(value: unknown): TableModel | null {
    const rows = this.findRows(value);
    if (!rows || rows.length === 0) {
      return null;
    }

    const columns: string[] = [];
    for (const row of rows) {
      for (const key of Object.keys(row)) {
        if (!columns.includes(key)) {
          columns.push(key);
        }
      }
    }

    return columns.length > 0 ? { columns, rows } : null;
  }

  private findRows(value: unknown): Record<string, unknown>[] | null {
    if (this.isRowArray(value)) {
      return value;
    }

    if (value && typeof value === 'object') {
      for (const candidate of Object.values(value as Record<string, unknown>)) {
        if (this.isRowArray(candidate)) {
          return candidate;
        }
      }
    }

    return null;
  }

  private isRowArray(value: unknown): value is Record<string, unknown>[] {
    return (
      Array.isArray(value) &&
      value.length > 0 &&
      value.every((item) => item !== null && typeof item === 'object' && !Array.isArray(item))
    );
  }
}
