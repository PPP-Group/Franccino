<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\RecordConsent;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\ConsentRequest;
use Illuminate\Http\JsonResponse;

class ConsentController extends Controller
{
    /** `POST /consents` (`docs/api.md`, "Escrita"): records the cookie banner choice. */
    public function __invoke(ConsentRequest $request, RecordConsent $action): JsonResponse
    {
        $action->handle($request->validated(), $request);

        return response()->json(['data' => ['recorded' => true]], 201);
    }
}
