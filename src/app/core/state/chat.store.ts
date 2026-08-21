import { computed, Injectable, signal } from '@angular/core';
import { ChatMessage, ContentBlock, ToolUseBlock } from '@core/models/chat-message.model';
import { ChatSession } from '@core/models/chat-session.model';
import { ToolCall } from '@core/models/tool-call.model';

/**
 * Açık olan tek sohbetin durumu. Ağ isteği yapmaz, yalnızca state tutar;
 * oturum *listesi* burada değil, `SessionStore`'da yaşar.
 */
@Injectable({ providedIn: 'root' })
export class ChatStore {
  // ─── Gerçeğin tek kaynağı (yalnızca bu sınıf yazabilir) ───
  private readonly _messages = signal<readonly ChatMessage[]>([]);
  private readonly _sessionId = signal<string | null>(null);
  private readonly _error = signal<string | null>(null);

  // ─── Dışarıya açılan okunur görünümler ───
  readonly messages = this._messages.asReadonly();
  readonly sessionId = this._sessionId.asReadonly();
  readonly error = this._error.asReadonly();

  // ─── Türetilmiş değerler: ayrı signal olarak tutulmazlar ki state ile ayrı düşmesinler ───
  readonly lastMessage = computed(() => this._messages().at(-1) ?? null);
  readonly isStreaming = computed(() => this.lastMessage()?.status === 'streaming');
  readonly isEmpty = computed(() => this._messages().length === 0);

  /** Henüz sonuçlanmamış tool çağrıları — tüm mesajların blokları taranarak bulunur. */
  readonly pendingToolCalls = computed<readonly ToolCall[]>(() =>
    this._messages()
      .flatMap((message) => message.content)
      .filter((block): block is ToolUseBlock => block.type === 'tool_use')
      .map((block) => block.toolCall)
      .filter((call) => call.status === 'pending' || call.status === 'running'),
  );

  loadSession(session: ChatSession): void {
    this._sessionId.set(session.id);
    this._messages.set(session.messages);
    this._error.set(null);
  }

  clear(): void {
    this._sessionId.set(null);
    this._messages.set([]);
    this._error.set(null);
  }

  /** Mesajı store kurar — çağıran taraf yalnızca metni verir. */
  addUserMessage(text: string): void {
    this._messages.update((messages) => [
      ...messages,
      {
        id: crypto.randomUUID(),
        role: 'user',
        content: [{ type: 'text', text }],
        status: 'complete',
        createdAt: new Date().toISOString(),
      },
    ]);
  }

  /** Cevap gelmeye başlamadan önce boş bir asistan mesajı açar. */
  beginAssistantMessage(): void {
    this._messages.update((messages) => [
      ...messages,
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: [],
        status: 'streaming',
        createdAt: new Date().toISOString(),
      },
    ]);
  }

  /**
   * Gelen metin parçasını son mesajın son metin bloğunun sonuna ekle.
   *
   * Hiçbir şeyi yerinde değiştiremezsin — yeni `TextBlock`, yeni `content` dizisi,
   * yeni `ChatMessage` üretip `updateLastMessage`'a vermen gerekiyor.
   *
   * İki kenar durumu: `content` boşsa, ve son blok `tool_use` ise
   * (ikisinde de yeni bir `TextBlock` açmalısın).
   */
  appendTextChunk(chunk: string): void {
    this.updateLastMessage((message) => {
      const content = message.content;

      // Son blok text ise, onun sonuna ekle. Yoksa yeni text bloğu aç.
      const lastBlock = content[content.length - 1];
      const newContent =
        lastBlock && lastBlock.type === 'text'
          ? [
              ...content.slice(0, -1),
              { type: 'text' as const, text: lastBlock.text + chunk },
            ]
          : [...content, { type: 'text' as const, text: chunk }];

      return { ...message, content: newContent as readonly ContentBlock[] };
    });
  }

  /** Akışın içine yeni bir tool çağrısı bloğu iliştirir. */
  addToolCall(call: ToolCall): void {
    this.updateLastMessage((message) => ({
      ...message,
      content: [...message.content, { type: 'tool_use', toolCall: call }],
    }));
  }

  /** Var olan bir çağrıyı yeni durumuyla değiştirir (pending → running → completed/failed). */
  updateToolCall(callId: string, next: ToolCall): void {
    this._messages.update((messages) =>
      messages.map((message) => ({
        ...message,
        content: message.content.map((block) =>
          block.type === 'tool_use' && block.toolCall.id === callId
            ? { ...block, toolCall: next }
            : block,
        ),
      })),
    );
  }

  completeAssistantMessage(): void {
    this.updateLastMessage((message) => ({ ...message, status: 'complete' }));
  }

  failAssistantMessage(error: string): void {
    this._error.set(error);
    this.updateLastMessage((message) => ({ ...message, status: 'error', error }));
  }

  /**
   * Son mesajı verilen fonksiyonun döndürdüğü yenisiyle değiştirir.
   * Diziyi yeniden üretmek her metotta tekrarlanmasın diye burada toplandı.
   */
  private updateLastMessage(project: (message: ChatMessage) => ChatMessage): void {
    this._messages.update((messages) => {
      if (messages.length === 0) {
        return messages;
      }
      const last = messages[messages.length - 1]!;
      return [...messages.slice(0, -1), project(last)];
    });
  }
}
