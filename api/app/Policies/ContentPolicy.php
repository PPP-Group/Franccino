<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

/**
 * Reusable policy for content that admins and editors can fully manage: products, collections,
 * designers, finishes, launches, projects, clients, stores, banners... Customer service does not see it.
 */
class ContentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->canEditContent();
    }

    public function view(User $user, ?Model $record = null): bool
    {
        return $user->canEditContent();
    }

    public function create(User $user): bool
    {
        return $user->canEditContent();
    }

    public function update(User $user, ?Model $record = null): bool
    {
        return $user->canEditContent();
    }

    public function delete(User $user, ?Model $record = null): bool
    {
        return $user->canEditContent();
    }

    public function deleteAny(User $user): bool
    {
        return $user->canEditContent();
    }

    public function restore(User $user, ?Model $record = null): bool
    {
        return $user->canEditContent();
    }

    public function restoreAny(User $user): bool
    {
        return $user->canEditContent();
    }

    public function forceDelete(User $user, ?Model $record = null): bool
    {
        return $user->canEditContent();
    }

    public function forceDeleteAny(User $user): bool
    {
        return $user->canEditContent();
    }

    public function reorder(User $user): bool
    {
        return $user->canEditContent();
    }
}
