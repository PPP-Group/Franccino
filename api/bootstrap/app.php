<?php

use App\Http\Middleware\NoStoreCache;
use App\Http\Middleware\SetContentLocale;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Routing\Middleware\ThrottleRequests;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'content.locale' => SetContentLocale::class,
            'no-store' => NoStoreCache::class,
        ]);

        // Route middleware order in routes/api.php is NOT the actual execution
        // order: Laravel re-sorts route middleware using a fixed priority list
        // (Illuminate\Foundation\Http\Kernel::$middlewarePriority), and any
        // framework middleware present there — `ThrottleRequests` included —
        // is always moved ahead of custom middleware that isn't in that list,
        // regardless of how it's ordered in the route definition. `NoStoreCache`
        // must run outermost (see its docblock), so it has to be added to that
        // same priority list, ahead of `ThrottleRequests`, or `throttle:*`
        // would always execute first no matter what routes/api.php says.
        $middleware->prependToPriorityList(
            before: ThrottleRequests::class,
            prepend: NoStoreCache::class,
        );
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
