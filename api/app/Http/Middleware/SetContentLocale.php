<?php

namespace App\Http\Middleware;

use App\Support\ContentLocale;
use App\Support\Locales;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

/**
 * Reads `locale` from the query string or, on the write routes, from the JSON
 * body (`docs/api.md`), validates it against the supported locales (missing
 * means the default locale, an unsupported value is a 422), and makes it
 * available for the rest of the request via `ContentLocale`.
 */
class SetContentLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        $request->validate([
            'locale' => ['sometimes', Rule::in(Locales::all())],
        ]);

        $locale = $request->input('locale', Locales::default());

        app(ContentLocale::class)->set($locale);
        App::setLocale($locale === 'pt' ? 'pt_BR' : 'en');

        return $next($request);
    }
}
