<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\DownloadLeadRequest;
use App\Models\DownloadLead;
use Illuminate\Http\JsonResponse;

class DownloadLeadController extends Controller
{
    /**
     * `POST /download-leads` (`docs/api.md`, "Escrita"): guarda o cadastro e devolve o `token` que o site manda em
     * cada pedido de link (`POST /downloads/{file}/link`). O banco guarda só o hash do token.
     */
    public function __invoke(DownloadLeadRequest $request): JsonResponse
    {
        $token = DownloadLead::newToken();
        $data = $request->safe()->except('consent');

        DownloadLead::create([...$data, 'token_hash' => DownloadLead::hashToken($token)]);

        return response()->json(['data' => ['token' => $token]], 201);
    }
}
