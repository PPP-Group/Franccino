<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Redirect;
use Illuminate\Http\JsonResponse;

/**
 * `GET /redirects`: `{ from, to, status }[]` for every active redirect
 * (docs/api.md).
 */
class RedirectController extends Controller
{
    public function index(): JsonResponse
    {
        $redirects = Redirect::active()->get()->map(fn (Redirect $redirect) => [
            'from' => $redirect->from_path,
            'to' => $redirect->to_path,
            'status' => $redirect->status_code->value,
        ])->values();

        return response()->json(['data' => $redirects]);
    }
}
