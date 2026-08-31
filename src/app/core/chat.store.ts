import { Injectable, computed, signal } from '@angular/core';
import {
  ChatMessage,
  ConversationSummary,
  ModelInfo,
  ProgressStep,
  ToolCallTrace,
} from './models';

@Injectable({ providedIn: 'root' })
export class ChatStore {
  private readonly _conversations = signal<readonly ConversationSummary[]>([]);
  private readonly _conversationId = signal<string | null>(null);
  private readonly _messages = signal<readonly ChatMessage[]>([]);
  private readonly _model = signal<ModelInfo | null>(null);
  private readonly _error = signal<string | null>(null);
  private readonly _sending = signal(false);
  private readonly _loadingConversation = signal(false);
  private readonly _sidebarOpen = signal(false);

  readonly conversations = this._conversations.asReadonly();
  readonly conversationId = this._conversationId.asReadonly();
  readonly messages = this._messages.asReadonly();
  readonly model = this._model.asReadonly();
  readonly error = this._error.asReadonly();
  readonly sending = this._sending.asReadonly();
  readonly loadingConversation = this._loadingConversation.asReadonly();
  readonly sidebarOpen = this._sidebarOpen.asReadonly();

  readonly isEmpty = computed(() => this._messages().length === 0);
  readonly configured = computed(() => this._model()?.configured ?? true);
  readonly supportsTools = computed(() => this._model()?.supportsTools ?? true);
  readonly canSend = computed(() => this.configured() && !this._sending());

  setConversations(list: readonly ConversationSummary[]): void {
    this._conversations.set(list);
  }

  setModel(model: ModelInfo): void {
    this._model.set(model);
  }

  setError(message: string | null): void {
    this._error.set(message);
  }

  setSending(value: boolean): void {
    this._sending.set(value);
  }

  setLoadingConversation(value: boolean): void {
    this._loadingConversation.set(value);
  }

  toggleSidebar(): void {
    this._sidebarOpen.update((open) => !open);
  }

  closeSidebar(): void {
    this._sidebarOpen.set(false);
  }

  startNewConversation(): void {
    this._conversationId.set(null);
    this._messages.set([]);
    this._error.set(null);
  }

  openConversation(id: string, messages: readonly ChatMessage[]): void {
    this._conversationId.set(id);
    this._messages.set(messages);
    this._error.set(null);
  }

  setConversationId(id: string): void {
    this._conversationId.set(id);
  }

  addUserMessage(text: string): void {
    this._messages.update((messages) => [
      ...messages,
      {
        id: crypto.randomUUID(),
        role: 'user',
        text,
        status: 'complete',
        toolCalls: [],
        progress: [],
        truncated: false,
        createdAt: new Date().toISOString(),
      },
    ]);
  }

  beginAssistantMessage(): void {
    this._messages.update((messages) => [
      ...messages,
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        text: '',
        status: 'streaming',
        toolCalls: [],
        progress: [],
        truncated: false,
        createdAt: new Date().toISOString(),
      },
    ]);
  }

  appendText(chunk: string): void {
    this.updateLast((message) => ({ ...message, text: message.text + chunk }));
  }

  addProgressStep(step: ProgressStep): void {
    this.updateLast((message) => ({
      ...message,
      progress: [...message.progress, step],
    }));
  }

  completeProgressStep(trace: ToolCallTrace): void {
    this.updateLast((message) => ({
      ...message,
      toolCalls: [...message.toolCalls, trace],
      progress: message.progress.map((step) =>
        step.id === trace.id
          ? { ...step, done: true, success: trace.success, durationMs: trace.durationMs }
          : step,
      ),
    }));
  }

  completeAssistantMessage(text: string, toolCalls: readonly ToolCallTrace[], usage: ChatMessage['usage'], truncated: boolean): void {
    this.updateLast((message) => ({
      ...message,
      text: text || message.text,
      toolCalls: toolCalls.length > 0 ? toolCalls : message.toolCalls,
      usage,
      truncated,
      status: 'complete',
      progress: [],
    }));
  }

  failAssistantMessage(message: string): void {
    this._error.set(message);
    this.updateLast((current) => ({
      ...current,
      status: 'error',
      error: message,
      progress: [],
    }));
  }

  private updateLast(project: (message: ChatMessage) => ChatMessage): void {
    this._messages.update((messages) => {
      if (messages.length === 0) {
        return messages;
      }
      const last = messages[messages.length - 1]!;
      return [...messages.slice(0, -1), project(last)];
    });
  }
}
