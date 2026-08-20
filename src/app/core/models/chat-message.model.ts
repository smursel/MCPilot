import { ToolCall } from './tool-call.model';

/** Düz metin parçası. Streaming sırasında büyüyen blok budur. */
export interface TextBlock {
  readonly type: 'text';
  readonly text: string;
}

/**
 * Metnin akışı içinde geçen bir tool çağrısı. Çağrının sonucu ayrı bir blok
 * değil — `ToolCall` union'ı çıktıyı da hatayı da kendi içinde taşıyor.
 */
export interface ToolUseBlock {
  readonly type: 'tool_use';
  readonly toolCall: ToolCall;
}

/** Bloklar modelin ürettiği sırada tutulur; render sırası bu diziden okunur. */
export type ContentBlock = TextBlock | ToolUseBlock;

export type ContentBlockType = ContentBlock['type'];

export type ChatRole = 'user' | 'assistant' | 'system';

export type ChatMessageStatus = 'streaming' | 'complete' | 'error';

export interface ChatMessage {
  readonly id: string;
  readonly role: ChatRole;
  readonly content: readonly ContentBlock[];
  readonly status: ChatMessageStatus;
  /** Yalnızca `status === 'error'` iken dolu olur. */
  readonly error?: string;
  /** ISO 8601 */
  readonly createdAt: string;
}
