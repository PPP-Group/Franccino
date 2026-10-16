<x-filament-widgets::widget>
    <div class="fr-welcome">
        <div>
            <h2 class="fr-welcome__title">{{ __('guides.dashboard.greeting', ['name' => $name]) }}</h2>
            <p class="fr-welcome__text">{{ __('guides.dashboard.welcome') }}</p>
        </div>
        <div class="fr-welcome__actions">
            <x-filament::button
                icon="heroicon-o-play-circle"
                x-data
                x-on:click="window.dispatchEvent(new CustomEvent('franccino-open-tour'))"
            >
                {{ __('guides.dashboard.tour') }}
            </x-filament::button>
            <x-filament::button tag="a" :href="$helpUrl" color="gray" icon="heroicon-o-lifebuoy">
                {{ __('guides.dashboard.help') }}
            </x-filament::button>
            <x-filament::button tag="a" :href="$siteUrl" target="_blank" color="gray" icon="heroicon-o-arrow-top-right-on-square">
                {{ __('guides.dashboard.site') }}
            </x-filament::button>
        </div>
    </div>
</x-filament-widgets::widget>
