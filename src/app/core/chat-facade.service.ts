import { Injectable, inject } from '@angular/core';
import { ChatService } from './chat.service';
import { ChatStore } from './chat.store';
import { ConversationService } from './conversation.service';
import { ModelService } from './model.service';
import { ChatMessage, ModelSelection, ProblemDetails } from './models';
import { DashboardService } from '@features/dashboard/services/dashboard.service';

@Injectable({ providedIn: 'root' })
export class ChatFacade {
  private readonly chat = inject(ChatService);
  private readonly conversations = inject(ConversationService);
  private readonly models = inject(ModelService);
  private readonly store = inject(ChatStore);
  private readonly dashboard = inject(DashboardService);

  init(): void {
    this.loadModel();
    this.loadConversations();
  }

  loadModel(): void {
    this.models.current().subscribe({
      next: (model) => this.store.setModel(model),
      error: (err) => this.store.setError(this.describe(err, 'Model bilgisi alınamadı')),
    });
  }

  selectModel(selection: ModelSelection): void {
    this.models.select(selection).subscribe({
      next: (model) => {
        this.store.setModel(model);
        this.store.setError(null);
      },
      error: (err) => this.store.setError(this.describe(err, 'Model değiştirilemedi')),
    });
  }

  loadConversations(): void {
    this.conversations.list().subscribe({
      next: (list) => this.store.setConversations(list),
      error: (err) => this.store.setError(this.describe(err, 'Konuşmalar yüklenemedi')),
    });
  }

  openConversation(id: string): void {
    this.store.setLoadingConversation(true);
    this.store.closeSidebar();

    this.conversations.detail(id).subscribe({
      next: (detail) => {
        const messages: ChatMessage[] = detail.messages.map((message) => ({
          id: crypto.randomUUID(),
          role: message.role,
          text: message.text,
          status: 'complete',
          toolCalls: [],
          progress: [],
          truncated: false,
          createdAt: detail.updatedAt,
        }));

        this.store.openConversation(detail.id, messages);
        this.store.setLoadingConversation(false);
      },
      error: (err) => {
        this.store.setError(this.describe(err, 'Konuşma açılamadı'));
        this.store.setLoadingConversation(false);
      },
    });
  }

  deleteConversation(id: string): void {
    this.conversations.remove(id).subscribe({
      next: () => {
        if (this.store.conversationId() === id) {
          this.store.startNewConversation();
        }
        this.loadConversations();
      },
      error: (err) => this.store.setError(this.describe(err, 'Konuşma silinemedi')),
    });
  }

  newConversation(): void {
    this.store.startNewConversation();
    this.store.closeSidebar();
  }

  send(text: string): void {
    const trimmed = text.trim();
    if (!trimmed || !this.store.canSend()) {
      return;
    }

    this.store.setError(null);
    this.store.setSending(true);
    this.store.addUserMessage(trimmed);
    this.store.beginAssistantMessage();

    let createdConversation = false;

    this.chat
      .stream({ message: trimmed, conversationId: this.store.conversationId() })
      .subscribe({
        next: (event) => {
          switch (event.type) {
            case 'started':
              if (this.store.conversationId() !== event.conversationId) {
                createdConversation = true;
                this.store.setConversationId(event.conversationId);
              }
              break;

            case 'assistant_text':
              this.store.appendText(event.text);
              break;

            case 'tool_call':
              this.store.addProgressStep({
                id: event.id,
                tool: event.tool,
                server: event.server,
                arguments: event.arguments,
                done: false,
              });
              
              // Eğer AI'ın çalıştırdığı araçta tarih parametreleri varsa Dashboard'u senkronize et
              const args = event.arguments as { from?: string; to?: string };
              if (args && typeof args.from === 'string' && typeof args.to === 'string') {
                // Sadece YYYY-MM-DD formatında (uzunluğu 10) olan geçerli tarihleri kabul et
                if (args.from.length === 10 && args.to.length === 10) {
                  this.dashboard.loadDashboardData(args.from, args.to);
                }
              }

              break;

            case 'tool_result':
              this.store.completeProgressStep(event.trace);
              break;

            case 'completed':
              this.store.completeAssistantMessage(
                event.response.answer,
                event.response.toolCalls,
                event.response.usage,
                event.response.truncated,
              );
              this.store.setConversationId(event.response.conversationId);
              break;

            case 'failed':
              this.store.failAssistantMessage(event.message);
              break;
          }
        },
        error: (err) => {
          this.store.failAssistantMessage(this.describe(err, 'Yanıt alınamadı'));
          this.store.setSending(false);
        },
        complete: () => {
          this.store.setSending(false);
          if (createdConversation) {
            this.loadConversations();
          }
        },
      });
  }

  private describe(err: unknown, fallback: string): string {
    const problem = this.asProblem(err);
    if (problem) {
      return problem.detail ?? problem.title ?? fallback;
    }
    return err instanceof Error ? err.message : fallback;
  }

  private asProblem(err: unknown): ProblemDetails | null {
    const candidate =
      err && typeof err === 'object' && 'error' in err
        ? (err as { error: unknown }).error
        : err;

    if (candidate && typeof candidate === 'object' && 'title' in candidate) {
      return candidate as ProblemDetails;
    }
    return null;
  }
}
