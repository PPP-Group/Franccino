<div class="fr-photo-points">
    @foreach ($photos as $photo)
        <a href="{{ $photo['url'] }}" class="fr-photo-points__item">
            <img src="{{ $photo['thumb'] }}" alt="" loading="lazy">
            <span class="fr-photo-points__label">{{ $photo['label'] }}</span>
            <span class="fr-photo-points__count">
                {{ $photo['points'] === 0 ? __('No points yet') : trans_choice(':count point|:count points', $photo['points'], ['count' => $photo['points']]) }}
            </span>
        </a>
    @endforeach
</div>
