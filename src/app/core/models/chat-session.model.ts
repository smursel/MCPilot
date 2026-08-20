import { ChatMessage } from './chat-message.model';

/**
 * Sidebar listesi için yeterli olan özet — mesajları taşımaz.
 * 50 oturumu listelerken hiçbirinin içeriğini taşımak istemiyoruz.
 */
export interface ChatSessionSummary {
  readonly id: string;
  readonly title: string;
  readonly messageCount: number;
  /** ISO 8601 */
  readonly createdAt: string;
  /** ISO 8601 */
  readonly updatedAt: string;
}

/** Açık oturum: özete ek olarak mesajları ve bu oturumda aktif sunucuları taşır. */
export interface ChatSession extends ChatSessionSummary {
  readonly messages: readonly ChatMessage[];
  readonly activeServerIds: readonly string[];
}
