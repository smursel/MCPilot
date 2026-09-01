// src/app/shared/translate.pipe.ts
import { Pipe, PipeTransform, inject } from '@angular/core';
import { AppStore } from '@core/app.store';
import { TRANSLATIONS } from '@core/translations';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false // Dil değiştiğinde tüm UI'ın anında reaktif olarak güncellenmesi için hayati ayar! ✨
})
export class TranslatePipe implements PipeTransform {
  private readonly store = inject(AppStore);

  transform(key: string): string {
    // 1. O an store'da seçili olan dili alıyoruz ('tr' veya 'en')
    const lang = this.store.language();
    
    // 2. Sözlüğümüzden o dile ait olan bölümü çekiyoruz
    const dictionary = TRANSLATIONS[lang] as any;
    
    if (!key) return '';

    // 3. 'SIDEBAR.NEW_CHAT' gibi noktayla birleştirilmiş anahtarları array'e bölüyoruz ['SIDEBAR', 'NEW_CHAT']
    const keys = key.split('.');
    let value = dictionary;
    
    // 4. Objenin içinde derinlemesine inip tam çeviriyi arıyoruz
    for (const k of keys) {
      if (value && value[k] !== undefined) {
        value = value[k];
      } else {
        // Eğer o kelimeyi sözlükte bulamazsa, sayfa boş görünmesin diye anahtarın kendisini gösteriyoruz
        return key; 
      }
    }
    
    return value;
  }
}