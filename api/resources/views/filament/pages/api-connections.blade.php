<x-filament-panels::page>
    @if ($newSecret)
        <x-filament::section icon="heroicon-o-key" icon-color="success">
            <x-slot name="heading">Chave criada: {{ $newSecretName }}</x-slot>
            <x-slot name="description">Copie agora: este segredo não aparece de novo.</x-slot>
            <div x-data="{ copied: false }" class="flex flex-wrap items-center gap-3">
                <code class="rounded bg-gray-100 px-3 py-2 text-sm break-all dark:bg-white/5">{{ $newSecret }}</code>
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
        <div x-data="{ copied: false, open: localStorage.getItem('fcc-api-guide') || 'claude' }" class="space-y-4">
            <div class="flex flex-wrap items-center gap-3">
                <span class="text-sm font-medium">Endereço do conector:</span>
                <code class="rounded bg-gray-100 px-3 py-2 text-sm dark:bg-white/5">{{ $this->mcpUrl() }}</code>
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
            <ol x-show="open === 'claude'" class="list-decimal space-y-1 ps-5 text-sm">
                <li>No claude.ai, abra <strong>Configurações › Conectores</strong> e clique em <strong>Adicionar conector personalizado</strong>.</li>
                <li>Nome: <strong>Franccino</strong>. URL: o endereço acima. Salve e clique em <strong>Conectar</strong>.</li>
                <li>Abre esta tela do painel: entre como administrador, confira as permissões (dá para diminuir) e clique em <strong>Aprovar a conexão</strong>.</li>
                <li>Na conversa, ative o conector Franccino e peça o que precisa. O Claude pede confirmação antes de mudar algo.</li>
            </ol>
            <ol x-show="open === 'chatgpt'" x-cloak class="list-decimal space-y-1 ps-5 text-sm">
                <li>No ChatGPT, abra <strong>Configurações › Aplicativos e conectores</strong> (com o modo desenvolvedor ligado, se o plano pedir) e clique em <strong>Criar</strong>.</li>
                <li>Nome: <strong>Franccino</strong>. URL do servidor MCP: o endereço acima. Autenticação: <strong>OAuth</strong>.</li>
                <li>Conecte: abre esta tela do painel. Entre como administrador, confira as permissões e clique em <strong>Aprovar a conexão</strong>.</li>
                <li>Na conversa, escolha o conector Franccino em <strong>+ › Mais</strong> e peça o que precisa.</li>
            </ol>
            <ul x-show="open === 'erro'" x-cloak class="list-disc space-y-1 ps-5 text-sm">
                <li>Confira se a URL termina em <code>/mcp</code>.</li>
                <li>Quem aprova precisa ser administrador do painel.</li>
                <li>Se a conexão aparece como desconectada na lista abaixo, conecte de novo. Para trocar as permissões, desconecte e conecte de novo.</li>
                <li>Documentação completa: <a class="underline" href="{{ $this->docsUrl() }}" target="_blank" rel="noopener">API de gestão</a>.</li>
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
                                <td class="py-1 pe-4"><code>{{ $call->operation }}</code></td>
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
