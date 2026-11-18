<?php

use App\Filament\Widgets\ContentHealthWidget;
use App\Listeners\NotifyAdminsOfFailedJob;
use App\Models\User;
use App\Settings\GeneralSettings;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Contracts\Queue\Job;
use Illuminate\Queue\Events\JobFailed;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;

use function Pest\Livewire\livewire;

function failedJobEvent(string $class): JobFailed
{
    $job = Mockery::mock(Job::class);
    $job->allows('resolveName')->andReturn($class);

    return new JobFailed('database', $job, new RuntimeException('O site respondeu 401'));
}

it('warns the active administrators once an hour when a background task fails', function () {
    $admin = User::factory()->admin()->create();
    $inactive = User::factory()->admin()->create(['is_active' => false]);
    $editor = User::factory()->editor()->create();

    app(NotifyAdminsOfFailedJob::class)->handle(failedJobEvent('App\Jobs\RevalidateFrontend'));
    app(NotifyAdminsOfFailedJob::class)->handle(failedJobEvent('App\Jobs\RevalidateFrontend'));

    expect($admin->notifications()->count())->toBe(1)
        ->and($admin->notifications()->first()->data['body'])->toContain('RevalidateFrontend')->toContain('401')
        ->and($inactive->notifications()->count())->toBe(0)
        ->and($editor->notifications()->count())->toBe(0);
});

it('shows on the dashboard that site messages have nobody to receive them', function () {
    $this->actingAs(User::factory()->admin()->create());
    $settings = app(GeneralSettings::class);
    $settings->contact_recipients = [];
    $settings->save();

    livewire(ContentHealthWidget::class)->assertSee('Mensagens do site sem destinatário');

    $settings->contact_recipients = ['contato@franccino.com.br'];
    $settings->save();

    livewire(ContentHealthWidget::class)->assertDontSee('Mensagens do site sem destinatário');
});

it('fails the health check when the database is down', function () {
    $this->get('/up')->assertOk();

    DB::shouldReceive('select')->andThrow(new RuntimeException('database is locked'));
    $this->get('/up')->assertServerError();
});

it('puts a server error of the api in the bell of the administrators, once an hour', function () {
    $admin = User::factory()->admin()->create();
    Route::get('/api/teste-erro', fn () => throw new RuntimeException('falhou de propósito'));

    $this->getJson('/api/teste-erro')->assertStatus(500);
    $this->getJson('/api/teste-erro')->assertStatus(500);

    expect($admin->notifications()->count())->toBe(1)
        ->and($admin->notifications()->first()->data['title'])->toBe('Erro no servidor do site')
        ->and($admin->notifications()->first()->data['body'])->toContain('/api/teste-erro')->toContain('falhou de propósito');
});

it('does not warn about a page that does not exist', function () {
    $admin = User::factory()->admin()->create();

    $this->getJson('/api/v1/nao-existe')->assertNotFound();

    expect($admin->notifications()->count())->toBe(0);
});

it('warns when the site does not answer twice in a row', function () {
    $admin = User::factory()->admin()->create();
    Http::fake(['*' => Http::response('', 503)]);
    $check = collect(app(Schedule::class)->events())
        ->first(fn ($event) => $event->description === 'site-no-ar');

    $check->run(app());
    expect($admin->notifications()->count())->toBe(0);
    $check->run(app());
    expect($admin->notifications()->count())->toBe(1)
        ->and($admin->notifications()->first()->data['title'])->toBe('O site está fora do ar');
});
