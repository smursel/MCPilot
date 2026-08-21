export type ChatRole = 'user' | 'assistant';
export type MessageStatus = 'sent' | 'streaming' | 'error';

export interface ChatMessage {
  readonly id: string;
  readonly role: ChatRole;
  readonly content: string;
  readonly status: MessageStatus;
  readonly timestamp: string;
  readonly error?: string;
}

export interface ChatSession {
  readonly id: string;
  readonly title: string;
  readonly messages: readonly ChatMessage[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface UiState {
  readonly currentSessionId: string | null;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly theme: 'light' | 'dark';
}
