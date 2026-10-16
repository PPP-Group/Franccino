<x-filament-widgets::widget>
    <x-filament::section :heading="__('guides.dashboard.shortcuts')">
        <div class="fr-shortcuts">
            @foreach ($shortcuts as $shortcut)
                <a href="{{ $shortcut['url'] }}" class="fr-shortcut">
                    <x-filament::icon :icon="$shortcut['icon']" class="fr-shortcut__icon" />
                    <span class="fr-shortcut__label">{{ $shortcut['label'] }}</span>
                    @if ($shortcut['badge'])
                        <x-filament::badge color="danger">{{ $shortcut['badge'] }}</x-filament::badge>
                    @endif
                </a>
            @endforeach
        </div>
    </x-filament::section>
</x-filament-widgets::widget>
