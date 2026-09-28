<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\SubmitContactMessage;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\ContactRequest;
use Illuminate\Http\JsonResponse;

class ContactController extends Controller
{
    /**
     * `POST /contact` (`docs/api.md`, "Escrita"). Stores the message and
     * queues the notification e-mail.
     */
    public function __invoke(ContactRequest $request, SubmitContactMessage $action): JsonResponse
    {
        $action->handle($request->validated(), $request);

        return response()->json(['data' => ['received' => true]], 201);
    }
}
