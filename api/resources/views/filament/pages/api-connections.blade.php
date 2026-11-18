<x-filament-panels::page>
    {{-- Revisão de 17/11/2026: a documentação completa não se achava; agora é o primeiro bloco da tela. --}}
    <x-filament::section icon="heroicon-o-book-open">
        <x-slot name="heading">Documentação da API e do conector</x-slot>
        <x-slot name="description">Tudo o que a API e o conector fazem, com exemplos: cada tela do painel, os campos, as fotos e as permissões.</x-slot>
        <div class="fr-api__docs">
            <x-filament::button tag="a" :href="$this->docsUrl()" target="_blank" icon="heroicon-o-arrow-top-right-on-square">Abrir a documentação</x-filament::button>
            <span class="fr-api__url">{{ $this->docsUrl() }}</span>
        </div>
    </x-filament::section>

    @if ($newSecret)
        <x-filament::section icon="heroicon-o-key" icon-color="success">
            <x-slot name="heading">Chave criada: {{ $newSecretName }}</x-slot>
            <x-slot name="description">Copie agora: este segredo não aparece de novo.</x-slot>
            <div x-data="{ copied: false }" class="flex flex-wrap items-center gap-3">
                <span class="fr-api__url">{{ $newSecret }}</span>
                <x-filament::button size="sm" icon="heroicon-o-clipboard-document"
                    x-on:click="navigator.clipboard.writeText(@js($newSecret)); copied = true">
                    <span x-text="copied ? 'Copiada' : 'Copiar a chave'"></span>
                </x-filament::button>
                <x-filament::button size="sm" color="gray" wire:click="dismissSecret">Já copiei</x-filament::button>
            </div>
            <p class="mt-3 text-sm text-gray-500">Primeira chamada: <a class="underline" href="{{ $this->docsUrl() }}#comecar" target="_blank" rel="noopener">documentação da API</a>.</p>
        </x-filament::section>
    @endif

    <x-filament::section icon="heroicon-o-sparkles">
        <x-slot name="heading">Conectar ao Claude ou ao ChatGPT</x-slot>
        <x-slot name="description">Com o conector, dá para pedir mudanças no site conversando ("troque a capa da Cadeira Derby pela foto 3 da galeria"). Tudo passa pelas mesmas regras do painel e fica no registro de atividade como "API · nome".</x-slot>
        <div x-data="{ copied: false, open: (() => { try { return localStorage.getItem('fcc-api-guide') || 'claude' } catch (e) { return 'claude' } })() }" class="fr-api">
            <div class="fr-api__address">
                <span class="fr-api__label">Endereço do conector</span>
                <span class="fr-api__url">{{ $this->mcpUrl() }}</span>
                <x-filament::button size="sm" color="gray" icon="heroicon-o-clipboard-document"
                    x-on:click="navigator.clipboard.writeText(@js($this->mcpUrl())); copied = true">
                    <span x-text="copied ? 'Copiado' : 'Copiar'"></span>
                </x-filament::button>
            </div>
            <x-filament::tabs>
                @foreach (['claude' => 'Claude', 'chatgpt' => 'ChatGPT', 'erro' => 'Se der errado'] as $key => $label)
                    <x-filament::tabs.item
                        alpine-active="open === '{{ $key }}'"
                        x-on:click="open = '{{ $key }}'; try { localStorage.setItem('fcc-api-guide', '{{ $key }}') } catch (e) {}">
                        {{ $label }}
                    </x-filament::tabs.item>
                @endforeach
            </x-filament::tabs>
            <ol x-show="open === 'claude'" class="fr-api__steps">
                <li>No claude.ai, abra <strong>Configurações › Conectores</strong> e clique em <strong>Adicionar conector personalizado</strong>.</li>
                <li>Nome: <strong>Franccino</strong>. URL: o endereço acima. Salve e clique em <strong>Conectar</strong>.</li>
                <li>Abre esta tela do painel: entre como administrador, confira as permissões (dá para diminuir) e clique em <strong>Aprovar a conexão</strong>.</li>
                <li>Na conversa, ative o conector Franccino e peça o que precisa. O Claude pede confirmação antes de mudar algo.</li>
            </ol>
            <ol x-show="open === 'chatgpt'" x-cloak class="fr-api__steps">
                <li>No ChatGPT, abra <strong>Configurações › Aplicativos e conectores</strong> (com o modo desenvolvedor ligado, se o plano pedir) e clique em <strong>Criar</strong>.</li>
                <li>Nome: <strong>Franccino</strong>. URL do servidor MCP: o endereço acima. Autenticação: <strong>OAuth</strong>.</li>
                <li>Conecte: abre esta tela do painel. Entre como administrador, confira as permissões e clique em <strong>Aprovar a conexão</strong>.</li>
                <li>Na conversa, escolha o conector Franccino em <strong>+ › Mais</strong> e peça o que precisa.</li>
            </ol>
            <ul x-show="open === 'erro'" x-cloak class="fr-api__tips">
                <li>Confira se a URL termina em <strong>/mcp</strong>.</li>
                <li>Quem aprova precisa ser administrador do painel.</li>
                <li>Se a conexão aparece como desconectada na lista abaixo, conecte de novo. Para trocar as permissões, desconecte e conecte de novo.</li>
            </ul>
        </div>
    </x-filament::section>

    {{ $this->table }}

    <x-filament::section icon="heroicon-o-clock" collapsible>
        <x-slot name="heading">Últimas chamadas</x-slot>
        <x-slot name="description">O que a API e os conectores fizeram (sem os valores), guardado por 30 dias.</x-slot>
        @php $calls = $this->recentCalls(); @endphp
        @if ($calls->isEmpty())
            <p class="text-sm text-gray-500">Nenhuma chamada ainda.</p>
        @else
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="text-left text-gray-500">
                            <th class="py-1 pe-4">Quando</th><th class="py-1 pe-4">Quem</th><th class="py-1 pe-4">Ação</th><th class="py-1 pe-4">Por</th><th class="py-1">Resultado</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($calls as $call)
                            <tr class="border-t border-gray-100 dark:border-white/5">
                                <td class="py-1 pe-4 whitespace-nowrap">{{ $call->created_at?->timezone(config('app.timezone'))->format('d/m H:i') }}</td>
                                <td class="py-1 pe-4">{{ $call->credential?->name ?? '—' }}</td>
                                <td class="py-1 pe-4">{{ $call->operation }}</td>
                                <td class="py-1 pe-4">{{ $call->channel === 'mcp' ? 'Conector' : 'API' }}</td>
                                <td class="py-1 {{ $call->status < 400 ? 'text-success-600' : 'text-danger-600' }}">{{ $call->status }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        @endif
    </x-filament::section>
</x-filament-panels::page>
