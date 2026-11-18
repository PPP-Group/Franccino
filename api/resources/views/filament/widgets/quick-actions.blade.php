{{-- Atalhos numa grade sem buraco no fim (GridFill): o número de colunas divide o total, ou o último ocupa o resto. --}}
<x-filament-widgets::widget>
    <x-filament::section :heading="__('guides.dashboard.shortcuts')">
        <div class="fr-shortcuts" style="--fr-cols: {{ $grid['columns'] }}">
            @foreach ($shortcuts as $shortcut)
                <a href="{{ $shortcut['url'] }}" class="fr-shortcut"
                    @if ($loop->last && $grid['last_span'] > 1) style="grid-column: span {{ $grid['last_span'] }}" @endif>
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
