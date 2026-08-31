import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ChatFacade } from '@core/chat-facade.service';
import { ChatStore } from '@core/chat.store';
import { Provider } from '@core/models';

interface ProviderGroup {
  readonly provider: Provider;
  readonly label: string;
  readonly models: readonly string[];
}

@Component({
  selector: 'app-model-selector',
  standalone: true,
  templateUrl: './model-selector.component.html',
  styleUrl: './model-selector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModelSelectorComponent {
  private readonly facade = inject(ChatFacade);
  readonly store = inject(ChatStore);

  private readonly labels: Record<Provider, string> = {
    anthropic: 'Anthropic',
    deepseek: 'DeepSeek',
  };

  readonly groups = computed<readonly ProviderGroup[]>(() => {
    const available = this.store.model()?.availableModels;
    if (!available) {
      return [];
    }

    return (Object.keys(available) as Provider[])
      .filter((provider) => available[provider]?.length)
      .map((provider) => ({
        provider,
        label: this.labels[provider] ?? provider,
        models: available[provider],
      }));
  });

  readonly selectedValue = computed(() => {
    const model = this.store.model();
    return model ? `${model.provider}|${model.model}` : '';
  });

  onChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const [provider, model] = value.split('|');
    if (provider && model) {
      this.facade.selectModel({ provider: provider as Provider, model });
    }
  }
}
