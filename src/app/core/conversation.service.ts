import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { apiUrl } from './api.config';
import { ConversationDetail, ConversationSummary } from './models';

@Injectable({ providedIn: 'root' })
export class ConversationService {
  private readonly http = inject(HttpClient);

  list(): Observable<ConversationSummary[]> {
    return this.http.get<ConversationSummary[]>(apiUrl('/api/conversations'));
  }

  detail(id: string): Observable<ConversationDetail> {
    return this.http.get<ConversationDetail>(apiUrl(`/api/conversations/${id}`));
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(apiUrl(`/api/conversations/${id}`));
  }
}
