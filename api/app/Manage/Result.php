<?php

namespace App\Manage;

/** O resultado de uma operação: status HTTP, corpo e cabeçalhos (ETag, Location). */
final class Result
{
    /** @param  array<string, string>  $headers */
    public function __construct(
        public readonly int $status,
        public readonly mixed $body,
        public readonly array $headers = [],
    ) {}
}
