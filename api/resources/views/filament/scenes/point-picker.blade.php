{{--
    Marcar os pontos direto na foto (banco de ideias, ideia 7): o clique na foto abre ali mesmo a busca da peça; ao
    escolher, o ponto entra na lista "Pontos" com a posição em %. O clique num ponto já marcado permite trocar a peça,
    mover o ponto ou remover. Nada é gravado até "Salvar". Só aparece depois que o ambiente foi salvo com a foto.
--}}
<div
    x-data="{
        products: @js($products),
        draft: null,
        selected: null,
        moving: null,
        query: '',
        normalize(value) {
            return (value ?? '').toString().normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
        },
        entries() {
            return Object.entries($wire.data?.hotspots ?? {}).filter(([, item]) => item && item.x !== null && item.x !== '' && item.y !== null && item.y !== '')
        },
        productName(id) {
            return this.products.find((product) => String(product.id) === String(id))?.name ?? '{{ __('Choose the piece') }}'
        },
        results() {
            const words = this.normalize(this.query).split(/\s+/).filter(Boolean)
            return this.products
                .filter((product) => words.every((word) => product.search.includes(word)))
                .slice(0, 8)
        },
        position(event) {
            const box = this.$refs.photo.getBoundingClientRect()
            const percent = (value) => Math.min(100, Math.max(0, Math.round(value * 1000) / 10))
            return { x: percent((event.clientX - box.left) / box.width), y: percent((event.clientY - box.top) / box.height) }
        },
        clickPhoto(event) {
            const point = this.position(event)
            if (this.moving !== null) {
                $wire.set(`data.hotspots.${this.moving}.x`, point.x)
                $wire.set(`data.hotspots.${this.moving}.y`, point.y)
                this.moving = null
                return
            }
            this.selected = null
            this.draft = { ...point, key: null }
            this.query = ''
            this.$nextTick(() => this.$refs.search?.focus())
        },
        openPoint(key, item) {
            this.draft = null
            this.moving = null
            this.selected = { key, x: Number(item.x), y: Number(item.y), product_id: item.product_id }
        },
        changePiece() {
            this.draft = { x: this.selected.x, y: this.selected.y, key: this.selected.key }
            this.selected = null
            this.query = ''
            this.$nextTick(() => this.$refs.search?.focus())
        },
        choose(product) {
            if (this.draft.key) {
                $wire.set(`data.hotspots.${this.draft.key}.product_id`, product.id)
            } else {
                const hotspots = { ...($wire.data?.hotspots ?? {}) }
                hotspots[(window.crypto?.randomUUID?.() ?? `novo-${Date.now()}`)] = { product_id: product.id, x: this.draft.x, y: this.draft.y }
                $wire.set('data.hotspots', hotspots)
            }
            this.draft = null
        },
        startMove() {
            this.moving = this.selected.key
            this.selected = null
        },
        remove() {
            const hotspots = { ...($wire.data?.hotspots ?? {}) }
            delete hotspots[this.selected.key]
            $wire.set('data.hotspots', hotspots)
            this.selected = null
        },
        close() {
            this.draft = null
            this.selected = null
            this.moving = null
        },
        // Opens the card to the side of the point that has room, so it never leaves the photo.
        cardStyle(point) {
            const horizontal = point.x > 55 ? `right: ${100 - point.x}%; margin-right: 18px` : `left: ${point.x}%; margin-left: 18px`
            const vertical = point.y > 55 ? `bottom: ${100 - point.y}%` : `top: ${point.y}%`
            return `${horizontal}; ${vertical}`
        },
    }"
    x-on:keydown.escape.window="close()"
    style="display: grid; gap: 12px; max-width: 1100px"
>
    <p style="margin: 0; font-size: 0.875rem; color: rgb(107 114 128)">
        {{ __('Click the photo on top of a piece and choose the piece. Click a point to change the piece, move or remove it. Then save.') }}
    </p>

    <p x-show="moving !== null" x-cloak style="margin: 0; font-size: 0.875rem; font-weight: 600">
        {{ __('Click the new place of the point on the photo.') }}
    </p>

    <div style="position: relative; line-height: 0">
        <img
            x-ref="photo"
            src="{{ $imageUrl }}"
            alt=""
            draggable="false"
            x-on:click="clickPhoto($event)"
            style="display: block; width: 100%; height: auto; cursor: crosshair; user-select: none"
        >

        <template x-for="([key, item], index) in entries()" :key="key">
            <button
                type="button"
                x-on:click.stop="openPoint(key, item)"
                x-text="index + 1"
                :title="productName(item.product_id)"
                :aria-label="`${index + 1}: ${productName(item.product_id)}`"
                :style="`position: absolute; left: ${item.x}%; top: ${item.y}%; transform: translate(-50%, -50%); display: grid; place-items: center; width: 30px; height: 30px; border: 2px solid #fff; border-radius: 50%; background: ${moving === key ? '#7b4b2a' : 'rgba(23, 23, 23, 0.82)'}; color: #fff; font: 600 13px/1 sans-serif; cursor: pointer; line-height: 1`"
            ></button>
        </template>

        {{-- New point: search the piece right where the photo was clicked. --}}
        <template x-if="draft">
            <div>
                <span
                    :style="`position: absolute; left: ${draft.x}%; top: ${draft.y}%; transform: translate(-50%, -50%); width: 20px; height: 20px; border: 2px solid #fff; border-radius: 50%; background: #7b4b2a; box-shadow: 0 0 0 4px rgba(123, 75, 42, 0.35); pointer-events: none`"
                ></span>
                <div
                    x-on:click.stop
                    :style="`position: absolute; ${cardStyle(draft)}; z-index: 10; width: 300px; max-width: 80%; padding: 12px; background: #fff; border: 1px solid rgb(229 231 235); line-height: 1.4; display: grid; gap: 8px`"
                >
                    <label style="font-size: 0.75rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: rgb(75 85 99)" for="scene-piece-search">
                        {{ __('Which piece is here?') }}
                    </label>
                    <input
                        id="scene-piece-search"
                        x-ref="search"
                        x-model="query"
                        type="search"
                        autocomplete="off"
                        placeholder="{{ __('Type the name of the piece') }}"
                        x-on:keydown.enter.prevent="results()[0] && choose(results()[0])"
                        style="width: 100%; padding: 8px 10px; border: 1px solid rgb(209 213 219); font-size: 0.875rem"
                    >
                    <ul style="margin: 0; padding: 0; list-style: none; display: grid; gap: 2px; max-height: 280px; overflow: auto">
                        <template x-for="product in results()" :key="product.id">
                            <li>
                                <button
                                    type="button"
                                    x-on:click="choose(product)"
                                    style="display: flex; align-items: center; gap: 10px; width: 100%; padding: 6px; border: 0; background: transparent; text-align: left; cursor: pointer; font-size: 0.875rem"
                                    x-on:mouseenter="$el.style.background = 'rgb(243 244 246)'"
                                    x-on:mouseleave="$el.style.background = 'transparent'"
                                >
                                    <img :src="product.thumb" alt="" style="width: 40px; height: 40px; object-fit: contain; background: #fff; flex: none">
                                    <span x-text="product.name"></span>
                                </button>
                            </li>
                        </template>
                    </ul>
                    <p x-show="results().length === 0" style="margin: 0; font-size: 0.875rem; color: rgb(107 114 128)">
                        {{ __('No piece found.') }}
                    </p>
                    <div>
                        <x-filament::button size="sm" color="gray" x-on:click="close()">
                            {{ __('Cancel') }}
                        </x-filament::button>
                    </div>
                </div>
            </div>
        </template>

        {{-- Existing point: change the piece, move it or remove it. --}}
        <template x-if="selected">
            <div
                x-on:click.stop
                :style="`position: absolute; ${cardStyle(selected)}; z-index: 10; width: 280px; max-width: 80%; padding: 12px; background: #fff; border: 1px solid rgb(229 231 235); line-height: 1.4; display: grid; gap: 10px`"
            >
                <strong style="font-size: 0.9375rem" x-text="productName(selected.product_id)"></strong>
                <div style="display: flex; flex-wrap: wrap; gap: 8px">
                    <x-filament::button size="sm" color="gray" x-on:click="changePiece()">
                        {{ __('Change piece') }}
                    </x-filament::button>
                    <x-filament::button size="sm" color="gray" x-on:click="startMove()">
                        {{ __('Move') }}
                    </x-filament::button>
                    <x-filament::button size="sm" color="danger" x-on:click="remove()">
                        {{ __('Remove') }}
                    </x-filament::button>
                </div>
            </div>
        </template>
    </div>
</div>
