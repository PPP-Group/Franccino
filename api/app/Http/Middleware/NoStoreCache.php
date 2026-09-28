<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Contracts\Debug\ExceptionHandler;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

/**
 * Marks every public API read response as non-cacheable by intermediaries:
 * caching lives in the Next.js front (tags + revalidation), not on the wire.
 *
 * Must run outermost on the `v1` routes — see `bootstrap/app.php`'s
 * `prependToPriorityList()` call, which is what actually guarantees that,
 * not the order middleware is listed in `routes/api.php`. A plain "set
 * the header after $next()" middleware only runs its own code when the rest
 * of the pipeline returns normally. An exception thrown deeper in the
 * pipeline (`content.locale`'s 422 on a bad `locale`, `throttle`'s 429, a
 * controller's 404) unwinds straight past that line, all the way up to the
 * HTTP kernel's own try/catch — which sits *above* every middleware, so no
 * middleware ever gets a chance to react to it. To guarantee the header on
 * every response, including those, this middleware catches the exception
 * itself, renders it exactly like the kernel would, and returns that
 * response instead of letting it propagate.
 */
class NoStoreCache
{
    public function __construct(private readonly ExceptionHandler $exceptions) {}

    public function handle(Request $request, Closure $next): Response
    {
        try {
            $response = $next($request);
        } catch (Throwable $e) {
            $this->exceptions->report($e);
            $response = $this->exceptions->render($request, $e);
        }

        $response->headers->set('Cache-Control', 'no-store');

        return $response;
    }
}
