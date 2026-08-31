import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_KEY, API_KEY_HEADER, apiUrl } from './api.config';
import { ChatRequest, ChatResponse, HealthInfo, McpTool, StreamEvent } from './models';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly http = inject(HttpClient);

  send(request: ChatRequest): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(apiUrl('/api/chat'), request);
  }

  tools(): Observable<McpTool[]> {
    return this.http.get<McpTool[]>(apiUrl('/api/tools'));
  }

  health(): Observable<HealthInfo> {
    return this.http.get<HealthInfo>(apiUrl('/api/health'));
  }

  stream(request: ChatRequest): Observable<StreamEvent> {
    return new Observable<StreamEvent>((subscriber) => {
      const controller = new AbortController();

      void this.readStream(request, controller.signal, subscriber);

      return () => controller.abort();
    });
  }

  private async readStream(
    request: ChatRequest,
    signal: AbortSignal,
    subscriber: {
      next: (event: StreamEvent) => void;
      error: (err: unknown) => void;
      complete: () => void;
    },
  ): Promise<void> {
    try {
      const response = await fetch(apiUrl('/api/chat/stream'), {
        method: 'POST',
        credentials: 'include',
        signal,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
          [API_KEY_HEADER]: API_KEY,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok || !response.body) {
        subscriber.error(await this.toProblem(response));
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      for (;;) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        buffer = buffer.replace(/\r\n/g, '\n');

        let boundary = buffer.indexOf('\n\n');
        while (boundary !== -1) {
          const frame = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);

          const event = this.parseFrame(frame);
          if (event) {
            subscriber.next(event);
          }

          boundary = buffer.indexOf('\n\n');
        }
      }

      subscriber.complete();
    } catch (err) {
      if (signal.aborted) {
        subscriber.complete();
        return;
      }
      subscriber.error(err);
    }
  }

  private parseFrame(frame: string): StreamEvent | null {
    const dataLines = frame
      .split('\n')
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trimStart());

    if (dataLines.length === 0) {
      return null;
    }

    try {
      return JSON.parse(dataLines.join('\n')) as StreamEvent;
    } catch {
      return null;
    }
  }

  private async toProblem(response: Response): Promise<unknown> {
    try {
      return await response.json();
    } catch {
      return { title: 'Sunucuya ulaşılamadı', status: response.status };
    }
  }
}
