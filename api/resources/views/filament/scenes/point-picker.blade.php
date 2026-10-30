{{--
    Marcar o ponto clicando na foto (banco de ideias, ideia 7). Mostra a foto do ambiente com os pontos já
    cadastrados, numerados na ordem da lista; o clique na foto mostra a posição em % e "Usar no último ponto"
    preenche "Da esquerda" e "Do topo" do último ponto da lista. Só aparece depois que o ambiente foi salvo com a foto.
--}}
<div
    x-data="{
        point: null,
        hotspots() {
            return Object.values($wire.data?.hotspots ?? {}).filter((item) => item.x !== null && item.x !== '' && item.y !== null && item.y !== '')
        },
        pick(event) {
            const box = event.currentTarget.getBoundingClientRect()
            const percent = (value) => Math.min(100, Math.max(0, Math.round(value * 1000) / 10))
            this.point = {
                x: percent((event.clientX - box.left) / box.width),
                y: percent((event.clientY - box.top) / box.height),
            }
        },
        apply() {
            const keys = Object.keys($wire.data?.hotspots ?? {})
            const key = keys[keys.length - 1]
            if (! this.point || key === undefined) {
                return
            }
            $wire.set(`data.hotspots.${key}.x`, this.point.x)
            $wire.set(`data.hotspots.${key}.y`, this.point.y)
        },
    }"
    style="display: grid; gap: 12px; max-width: 960px"
>
    <p style="margin: 0; font-size: 0.875rem; color: rgb(107 114 128)">
        {{ __('Click the photo where the piece is. Then click "Use on the last point" to fill the position of the last point in the list.') }}
    </p>

    <div
        x-on:click="pick($event)"
        style="position: relative; cursor: crosshair; user-select: none; line-height: 0"
    >
        <img src="{{ $imageUrl }}" alt="" style="display: block; width: 100%; height: auto" draggable="false">

        <template x-for="(item, index) in hotspots()" :key="index">
            <span
                x-text="index + 1"
                :style="`position: absolute; left: ${item.x}%; top: ${item.y}%; transform: translate(-50%, -50%); display: grid; place-items: center; width: 26px; height: 26px; border: 2px solid #fff; border-radius: 50%; background: rgba(23, 23, 23, 0.78); color: #fff; font: 600 12px/1 sans-serif; pointer-events: none`"
            ></span>
        </template>

        <template x-if="point">
            <span
                :style="`position: absolute; left: ${point.x}%; top: ${point.y}%; transform: translate(-50%, -50%); width: 18px; height: 18px; border: 2px solid #fff; border-radius: 50%; background: #7b4b2a; box-shadow: 0 0 0 3px rgba(123, 75, 42, 0.35); pointer-events: none`"
            ></span>
        </template>
    </div>

    <div x-show="point" x-cloak style="display: flex; flex-wrap: wrap; align-items: center; gap: 12px">
        <span
            style="font-size: 0.875rem"
            x-text="point ? `{{ __('Across (%)') }}: ${point.x} · {{ __('Down (%)') }}: ${point.y}` : ''"
        ></span>
        <x-filament::button size="sm" color="gray" x-on:click="apply()">
            {{ __('Use on the last point') }}
        </x-filament::button>
    </div>
</div>
