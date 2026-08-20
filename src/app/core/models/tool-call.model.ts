/** Her tool çağrısında, durumdan bağımsız olarak bulunan alanlar. */
interface ToolCallBase {
  readonly id: string;
  /** Çağrılan tool'un adı — `serverId` ile birlikte tool'u tekil olarak belirler. */
  readonly toolName: string;
  readonly serverId: string;
  /** Modelin ürettiği argümanlar; şeması tool'a göre değiştiği için `unknown` değerler. */
  readonly input: Record<string, unknown>;
  /** ISO 8601 */
  readonly createdAt: string;
}

/** Model çağrıyı istedi, henüz çalıştırılmadı. */
export interface PendingToolCall extends ToolCallBase {
  readonly status: 'pending';
}

/** Backend'e gönderildi, sonuç bekleniyor. */
export interface RunningToolCall extends ToolCallBase {
  readonly status: 'running';
  /** ISO 8601 */
  readonly startedAt: string;
}

/** Başarıyla tamamlandı — `output` garanti. */
export interface CompletedToolCall extends ToolCallBase {
  readonly status: 'completed';
  /** ISO 8601 */
  readonly startedAt: string;
  /** ISO 8601 */
  readonly finishedAt: string;
  readonly output: unknown;
}

/** Hata ile bitti — `error` garanti. */
export interface FailedToolCall extends ToolCallBase {
  readonly status: 'failed';
  /** ISO 8601 */
  readonly startedAt: string;
  /** ISO 8601 */
  readonly finishedAt: string;
  readonly error: string;
}

export type ToolCall = PendingToolCall | RunningToolCall | CompletedToolCall | FailedToolCall;

export type ToolCallStatus = ToolCall['status'];
