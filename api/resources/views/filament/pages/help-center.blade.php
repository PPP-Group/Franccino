<x-filament-panels::page>
    <div class="fr-help">
        <p class="fr-help__intro">{{ __('guides.center.intro') }}</p>

        <nav class="fr-help__toc" aria-label="{{ __('guides.center.contents') }}">
            @foreach ($this->getGuides() as $guide)
                <a href="#{{ $guide['key'] }}" class="fr-help__toc-item">
                    <strong>{{ $guide['title'] }}</strong>
                    <span>{{ $guide['summary'] }}</span>
                </a>
            @endforeach
        </nav>

        <x-filament::button
            color="gray"
            icon="heroicon-o-play-circle"
            x-data
            x-on:click="window.dispatchEvent(new CustomEvent('franccino-open-tour'))"
        >
            {{ __('guides.center.restart_tour') }}
        </x-filament::button>

        @foreach ($this->getGuides() as $guide)
            <x-filament::section :id="$guide['key']" class="fr-help__guide">
                <x-slot name="heading">{{ $guide['title'] }}</x-slot>
                <x-slot name="description">{{ $guide['summary'] }}</x-slot>

                @if ($guide['url'])
                    <x-slot name="afterHeader">
                        <x-filament::button tag="a" :href="$guide['url']" size="sm" icon="heroicon-o-arrow-top-right-on-square">
                            {{ __('guides.center.open_screen') }}
                        </x-filament::button>
                    </x-slot>
                @endif

                <div class="fr-help__body">
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

                    <div>
                        <h3 class="fr-help__label">{{ __('guides.center.steps') }}</h3>
                        <ol class="fr-help__steps">
                            @foreach ($guide['steps'] as $step)
                                <li>{{ $step }}</li>
                            @endforeach
                        </ol>

                        @if (count($guide['tips']))
                            <h3 class="fr-help__label">{{ __('guides.center.tips') }}</h3>
                            <ul class="fr-help__tips">
                                @foreach ($guide['tips'] as $tip)
                                    <li>{{ $tip }}</li>
                                @endforeach
                            </ul>
                        @endif
                    </div>
                </div>
            </x-filament::section>
        @endforeach
    </div>
</x-filament-panels::page>
