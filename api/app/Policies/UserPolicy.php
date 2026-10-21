<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

/**
 * Users are managed by administrators only. Nobody deletes their own account, and the last active administrator is
 * never deleted (PPP-95), so the panel can't be locked out.
 */
class UserPolicy extends AdminOnlyPolicy
{
    public function delete(User $user, ?Model $record = null): bool
    {
        return $user->isAdmin()
            && $record instanceof User
            && ! $record->is($user)
            && ! $record->isLastActiveAdmin();
    }
}
