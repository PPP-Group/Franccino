<?php

use App\Support\VideoEmbed;

it('turns YouTube addresses into the no-cookie embed', function (string $url) {
    expect(VideoEmbed::url($url))->toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
})->with([
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ',
    'https://m.youtube.com/watch?v=dQw4w9WgXcQ&t=10',
    'https://www.youtube.com/shorts/dQw4w9WgXcQ',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
]);

it('turns Vimeo addresses into the player embed', function () {
    expect(VideoEmbed::url('https://vimeo.com/76979871'))->toBe('https://player.vimeo.com/video/76979871')
        ->and(VideoEmbed::url('https://player.vimeo.com/video/76979871'))->toBe('https://player.vimeo.com/video/76979871');
});

it('returns null for any other address', function () {
    expect(VideoEmbed::url('https://franccino.com.br/video.mp4'))->toBeNull()
        ->and(VideoEmbed::url('https://www.youtube.com/channel/abc'))->toBeNull()
        ->and(VideoEmbed::url('not a url'))->toBeNull();
});
