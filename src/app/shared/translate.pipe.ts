// src/app/shared/translate.pipe.ts
import { Pipe, PipeTransform, inject } from '@angular/core';
import { AppStore } from '@core/app.store';
import { translate } from '@core/translations';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false // Dil değiştiğinde tüm UI'ın anında reaktif olarak güncellenmesi için hayati ayar! ✨
})
export class TranslatePipe implements PipeTransform {
  private readonly store = inject(AppStore);

  transform(key: string): string {
    return translate(this.store.language(), key);
  }
}
