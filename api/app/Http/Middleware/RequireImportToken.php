<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Guards the bulk import routes (`/api/import/*`): the request must carry `Authorization: Bearer <CONTENT_IMPORT_TOKEN>`.
 * Without the variable the routes do not exist (404), so the import is off unless the environment turns it on.
 */
class RequireImportToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = (string) config('franccino.import.token');
        if ($token === '') {
            abort(404);
        }
        if (! hash_equals($token, (string) $request->bearerToken())) {
            abort(401);
        }

        return $next($request);
    }
}
