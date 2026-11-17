<x-filament-panels::page>
    @php $request = $this->pendingRequest(); @endphp

    @if ($request === null)
        <x-filament::section icon="heroicon-o-exclamation-triangle" icon-color="warning">
            <x-slot name="heading">Pedido vencido ou inexistente</x-slot>
            <p class="text-sm">O pedido de conexão vale 15 minutos. Volte ao Claude ou ao ChatGPT e clique em conectar de novo.</p>
        </x-filament::section>
    @else
        <x-filament::section icon="heroicon-o-link">
            <x-slot name="heading">{{ $this->appName() }} quer acessar o painel do site</x-slot>
            <x-slot name="description">Depois de aprovar, você volta para <strong>{{ $this->returnHost() }}</strong>. As mudanças feitas pelo aplicativo seguem as regras do painel, ficam no registro de atividade e pedem confirmação no aplicativo antes de mudar algo.</x-slot>

            <p class="mb-3 text-sm text-gray-600 dark:text-gray-300">Permissões pedidas (dá para diminuir):</p>
            <div class="grid gap-3 sm:grid-cols-2">
                @foreach (\App\Manage\Areas::LIST as $area => $info)
                    @php $options = $this->requestedLevels($area); @endphp
                    @if ($options !== [])
                        <label class="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-white/10">
                            <span>{{ $info['label'] }}</span>
                            <x-filament::input.wrapper class="w-40">
                                <x-filament::input.select wire:model="levels.{{ $area }}">
                                    <option value="none">Não</option>
                                    <option value="ler">Ler</option>
                                    @if (in_array('escrever', $options, true))
                                        <option value="escrever">Ler e mudar</option>
                                    @endif
                                </x-filament::input.select>
                            </x-filament::input.wrapper>
                        </label>
                    @endif
                @endforeach
            </div>

            <p class="mt-4 text-sm text-gray-500">Ficam de fora sempre: usuários e permissões do painel, registro de atividade, consentimentos, apagar peças em definitivo e as chaves da API. Dá para desconectar quando quiser em <a class="underline" href="{{ \App\Filament\Pages\ApiConnections::getUrl() }}">API e conectores</a>.</p>

            <div class="mt-6 flex flex-wrap gap-3">
                <x-filament::button wire:click="approve" icon="heroicon-o-check">Aprovar a conexão</x-filament::button>
                <x-filament::button wire:click="deny" color="gray">Não conectar</x-filament::button>
            </div>
        </x-filament::section>
    @endif
</x-filament-panels::page>
