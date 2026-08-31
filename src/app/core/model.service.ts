import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { apiUrl } from './api.config';
import { ModelInfo, ModelSelection } from './models';

@Injectable({ providedIn: 'root' })
export class ModelService {
  private readonly http = inject(HttpClient);

  current(): Observable<ModelInfo> {
    return this.http.get<ModelInfo>(apiUrl('/api/model'));
  }

  select(selection: ModelSelection): Observable<ModelInfo> {
    return this.http.post<ModelInfo>(apiUrl('/api/model'), selection);
  }
}
