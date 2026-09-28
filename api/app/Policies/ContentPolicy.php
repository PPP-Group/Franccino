<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

/**
 * Reusable policy for content that any active user (admin or editor) can fully manage:
 * products, collections, designers, finishes, launches, projects, clients, stores, banners...
 */
class ContentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->is_active;
    }

    public function view(User $user, ?Model $record = null): bool
    {
        return $user->is_active;
    }

    public function create(User $user): bool
    {
        return $user->is_active;
    }

    public function update(User $user, ?Model $record = null): bool
    {
        return $user->is_active;
    }

    public function delete(User $user, ?Model $record = null): bool
    {
        return $user->is_active;
    }

    public function deleteAny(User $user): bool
    {
        return $user->is_active;
    }

    public function restore(User $user, ?Model $record = null): bool
    {
        return $user->is_active;
    }

    public function restoreAny(User $user): bool
    {
        return $user->is_active;
    }

    public function forceDelete(User $user, ?Model $record = null): bool
    {
        return $user->is_active;
    }

    public function forceDeleteAny(User $user): bool
    {
        return $user->is_active;
    }

    public function reorder(User $user): bool
    {
        return $user->is_active;
    }
}
