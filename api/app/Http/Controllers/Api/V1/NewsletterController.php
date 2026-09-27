<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\SubscribeToNewsletter;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\NewsletterRequest;
use Illuminate\Http\JsonResponse;

class NewsletterController extends Controller
{
    /**
     * `POST /newsletter` (`docs/api.md`, "Escrita"). `201` for a brand new
     * subscription, `200` when the e-mail was reactivated — same body either
     * way (Ruling R4), so the front never learns whether the address already
     * existed.
     */
    public function __invoke(NewsletterRequest $request, SubscribeToNewsletter $action): JsonResponse
    {
        $created = $action->handle($request->validated(), $request);

        return response()->json(['data' => ['subscribed' => true]], $created ? 201 : 200);
    }
}
