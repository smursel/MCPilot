export type ChatRole = 'user' | 'assistant';

export type Provider = 'anthropic' | 'deepseek';

export interface ProblemDetails {
  readonly title: string;
  readonly status: number;
  readonly detail?: string;
}

export interface ToolCallTrace {
  readonly id: string;
  readonly tool: string;
  readonly server: string;
  readonly arguments: unknown;
  readonly success: boolean;
  readonly result: string;
  readonly structuredResult: unknown;
  readonly durationMs: number;
  readonly startedAt: string;
}

export interface TokenUsage {
  readonly model: string;
  readonly inputTokens: number;
  readonly outputTokens: number;
  readonly totalTokens: number;
}

export interface ChatResponse {
  readonly conversationId: string;
  readonly messageId: string;
  readonly answer: string;
  readonly toolCalls: readonly ToolCallTrace[];
  readonly usage: TokenUsage;
  readonly truncated: boolean;
  readonly createdAt: string;
}

export interface ChatRequest {
  readonly message: string;
  readonly conversationId?: string | null;
  readonly context?: unknown;
}

export interface ModelInfo {
  readonly provider: Provider;
  readonly model: string;
  readonly supportsTools: boolean;
  readonly supportsThinking: boolean;
  readonly configured: boolean;
  readonly availableModels: Readonly<Record<Provider, readonly string[]>>;
}

export interface ModelSelection {
  readonly provider: Provider;
  readonly model: string;
}

export interface ConversationSummary {
  readonly id: string;
  readonly title: string;
  readonly updatedAt: string;
  readonly messageCount: number;
}

export interface StoredMessage {
  readonly role: ChatRole;
  readonly text: string;
  readonly toolCalls: readonly string[];
}

export interface ConversationDetail {
  readonly id: string;
  readonly title: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly messages: readonly StoredMessage[];
}

export interface McpTool {
  readonly name: string;
  readonly serverName: string;
  readonly originalName: string;
  readonly description: string;
  readonly inputSchema: unknown;
  readonly readOnly: boolean;
}

export interface HealthInfo {
  readonly status: string;
  readonly toolCount: number;
  readonly servers: readonly string[];
  readonly timestamp: string;
}

export type StreamEvent =
  | { readonly type: 'started'; readonly conversationId: string }
  | { readonly type: 'assistant_text'; readonly text: string }
  | {
      readonly type: 'tool_call';
      readonly id: string;
      readonly tool: string;
      readonly server: string;
      readonly arguments: unknown;
    }
  | { readonly type: 'tool_result'; readonly trace: ToolCallTrace }
  | { readonly type: 'completed'; readonly response: ChatResponse }
  | { readonly type: 'failed'; readonly message: string };

export type MessageStatus = 'streaming' | 'complete' | 'error';

export interface ProgressStep {
  readonly id: string;
  readonly tool: string;
  readonly server: string;
  readonly arguments: unknown;
  readonly done: boolean;
  readonly success?: boolean;
  readonly durationMs?: number;
}

export interface ChatMessage {
  readonly id: string;
  readonly role: ChatRole;
  readonly text: string;
  readonly status: MessageStatus;
  readonly toolCalls: readonly ToolCallTrace[];
  readonly progress: readonly ProgressStep[];
  readonly usage?: TokenUsage;
  readonly truncated: boolean;
  readonly error?: string;
  readonly createdAt: string;
}
