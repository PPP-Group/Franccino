<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\V1\ClientResource;
use App\Models\Client;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ClientController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $clients = Client::published()
            ->with('media')
            ->ordered()
            ->get();

        return ClientResource::collection($clients);
    }
}
