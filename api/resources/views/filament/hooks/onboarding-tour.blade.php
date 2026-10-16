{{--
    Tour de boas-vindas: abre sozinho no primeiro acesso de cada navegador e de novo pelo botão "Ver o tour"
    (evento franccino-open-tour). Guarda que foi visto no localStorage; sem localStorage, só abre pelo botão.
--}}
@php
    $steps = trans('guides.tour.steps');
@endphp
<div
    x-data="{
        open: false,
        step: 0,
        steps: @js($steps),
        storageKey: 'franccino-panel-tour-v1',
        init() {
            let seen = true;
            try { seen = window.localStorage.getItem(this.storageKey) === 'done'; } catch (e) {}
            if (! seen) setTimeout(() => this.show(), 700);
        },
        show() { this.step = 0; this.open = true; this.$nextTick(() => this.$refs.dialog?.focus()); },
        close() {
            this.open = false;
            try { window.localStorage.setItem(this.storageKey, 'done'); } catch (e) {}
        },
        next() { this.step < this.steps.length - 1 ? this.step++ : this.close(); },
        back() { if (this.step > 0) this.step--; },
    }"
    x-on:franccino-open-tour.window="show()"
    x-on:keydown.escape.window="if (open) close()"
>
    <template x-if="open">
        <div class="fr-tour" role="presentation">
            <div class="fr-tour__backdrop" x-on:click="close()"></div>
            <div
                class="fr-tour__dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="fr-tour-title"
                tabindex="-1"
                x-ref="dialog"
            >
                <p class="fr-tour__counter" x-text="@js(__('guides.tour.counter', ['current' => '__C__', 'total' => '__T__'])).replace('__C__', step + 1).replace('__T__', steps.length)"></p>
                <h2 id="fr-tour-title" class="fr-tour__title" x-text="steps[step].title"></h2>
                <p class="fr-tour__body" x-text="steps[step].body"></p>
                <div class="fr-tour__dots" aria-hidden="true">
                    <template x-for="(item, index) in steps" :key="index">
                        <span class="fr-tour__dot" :class="{ 'is-active': index === step }"></span>
                    </template>
                </div>
                <div class="fr-tour__actions">
                    <x-filament::button color="gray" x-on:click="close()">{{ __('guides.tour.skip') }}</x-filament::button>
                    <span class="fr-tour__spacer"></span>
                    <x-filament::button color="gray" x-show="step > 0" x-on:click="back()">{{ __('guides.tour.back') }}</x-filament::button>
                    <x-filament::button x-on:click="next()">
                        <span x-text="step < steps.length - 1 ? @js(__('guides.tour.next')) : @js(__('guides.tour.done'))"></span>
                    </x-filament::button>
                </div>
            </div>
        </div>
    </template>
</div>
