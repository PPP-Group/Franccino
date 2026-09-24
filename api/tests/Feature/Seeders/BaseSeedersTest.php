<?php

use App\Models\Area;
use App\Models\FinishGroup;
use Database\Seeders\AreaSeeder;
use Database\Seeders\FinishGroupSeeder;

it('seeds areas idempotently', function () {
    (new AreaSeeder)->run();
    (new AreaSeeder)->run();

    expect(Area::count())->toBe(2)
        ->and(Area::where('key', 'indoor')->value('brand_name'))->toBe('Franccino Casa')
        ->and(Area::where('key', 'outdoor')->value('brand_name'))->toBe('Franccino Giardini');
});

it('seeds finish groups idempotently', function () {
    (new FinishGroupSeeder)->run();
    (new FinishGroupSeeder)->run();

    expect(FinishGroup::count())->toBe(7);
});
