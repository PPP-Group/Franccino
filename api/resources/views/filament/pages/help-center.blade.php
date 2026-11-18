{{--
    Central de ajuda (revisão de 17/11/2026: "um monte de cardzinho um em cima do outro, não está bem descrito"): os
    assuntos em grupos, um cartão por assunto com ícone, título e resumo; clicar abre só aquele guia, com os passos
    numerados, as dicas, o vídeo e o atalho para a tela. O endereço guarda o assunto aberto (#produtos), e o botão
    "Como preencher" de cada tela cai direto no guia dela.
--}}
<x-filament-panels::page>
    <div
        class="fr-help"
        x-data="{
            open: window.location.hash.slice(1) || null,
            show(key) { this.open = key; history.replaceState(null, '', key ? '#' + key : location.pathname); window.scrollTo({ top: 0 }); },
        }"
        x-on:hashchange.window="open = window.location.hash.slice(1) || null"
    >
        <div x-show="! open" class="fr-help__index">
            <div class="fr-help__top">
                <p class="fr-help__intro">{{ __('guides.center.intro') }}</p>
                <x-filament::button
                    color="gray"
                    icon="heroicon-o-play-circle"
                    x-on:click="window.dispatchEvent(new CustomEvent('franccino-open-tour'))"
                >
                    {{ __('guides.center.restart_tour') }}
                </x-filament::button>
            </div>

            @foreach ($this->getGroups() as $group)
                <section class="fr-help__group" aria-labelledby="grupo-{{ $group['key'] }}">
                    <h2 id="grupo-{{ $group['key'] }}" class="fr-help__group-title">{{ $group['title'] }}</h2>
                    <div class="fr-help__cards">
                        @foreach ($group['guides'] as $guide)
                            <button type="button" class="fr-help__card" x-on:click="show('{{ $guide['key'] }}')">
                                <x-filament::icon :icon="$guide['icon']" class="fr-help__card-icon" />
                                <span class="fr-help__card-text">
                                    <strong>{{ $guide['title'] }}</strong>
                                    <span>{{ $guide['summary'] }}</span>
                                </span>
                                @if ($guide['video'])
                                    <x-filament::badge color="gray" icon="heroicon-o-play">{{ __('guides.center.video') }}</x-filament::badge>
                                @endif
                            </button>
                        @endforeach
                    </div>
                </section>
            @endforeach
        </div>

        @foreach ($this->getGuides() as $guide)
            <article x-show="open === '{{ $guide['key'] }}'" x-cloak class="fr-help__guide">
                <button type="button" class="fr-help__back" x-on:click="show(null)">
                    <x-filament::icon icon="heroicon-o-arrow-left" class="fr-help__back-icon" />
                    {{ __('guides.center.back') }}
                </button>

                <header class="fr-help__guide-head">
                    <x-filament::icon :icon="$guide['icon']" class="fr-help__guide-icon" />
                    <div>
                        <h2 class="fr-help__guide-title">{{ $guide['title'] }}</h2>
                        <p class="fr-help__guide-summary">{{ $guide['summary'] }}</p>
                    </div>
                    @if ($guide['url'])
                        <x-filament::button tag="a" :href="$guide['url']" icon="heroicon-o-arrow-top-right-on-square" class="fr-help__open">
                            {{ __('guides.center.open_screen') }}
                        </x-filament::button>
                    @endif
                </header>

                <div class="fr-help__body">
                    <div>
                        <h3 class="fr-help__label">{{ __('guides.center.steps') }}</h3>
                        <ol class="fr-help__steps">
                            @foreach ($guide['steps'] as $step)
                                <li><span class="fr-help__step-number">{{ $loop->iteration }}</span><span>{{ $step }}</span></li>
                            @endforeach
                        </ol>
                    </div>

                    <aside class="fr-help__side">
                        @if ($guide['video'])
                            <div class="fr-help__video">
                                <iframe
                                    src="{{ $guide['video'] }}"
                                    title="{{ __('guides.center.video') }}: {{ $guide['title'] }}"
                                    loading="lazy"
                                    allow="fullscreen; picture-in-picture"
                                    allowfullscreen
                                ></iframe>
                            </div>
                        @endif
                        @if (count($guide['tips']))
                            <div class="fr-help__tips-box">
                                <h3 class="fr-help__label">{{ __('guides.center.tips') }}</h3>
                                <ul class="fr-help__tips">
                                    @foreach ($guide['tips'] as $tip)
                                        <li>{{ $tip }}</li>
                                    @endforeach
                                </ul>
                            </div>
                        @endif
                    </aside>
                </div>
            </article>
        @endforeach
    </div>
</x-filament-panels::page>
