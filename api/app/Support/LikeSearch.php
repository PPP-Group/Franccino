<?php

namespace App\Support;

/**
 * Escapes a raw, user-provided search term so it is matched literally inside
 * a SQL `LIKE` pattern instead of `%`/`_` being interpreted as wildcards.
 *
 * Bind the escape character as its own parameter (`ESCAPE ?`) rather than
 * inlining it into the SQL text: MySQL and SQLite disagree on how a `\`
 * inside a *string literal* is parsed (MySQL treats it as an escape itself;
 * SQLite does not), so embedding `ESCAPE '\\'` directly produces a different
 * effective escape character on each driver. A bound parameter sidesteps
 * that entirely — the driver receives the single backslash byte as-is.
 */
final class LikeSearch
{
    public const ESCAPE_CHARACTER = '\\';

    /**
     * Escapes the escape character itself and the two `LIKE` wildcards.
     * The caller still wraps the result with the `%`/`_` it actually wants
     * as wildcards (typically `'%'.LikeSearch::escape($term).'%'`).
     */
    public static function escape(string $term): string
    {
        return str_replace(
            [self::ESCAPE_CHARACTER, '%', '_'],
            [self::ESCAPE_CHARACTER.self::ESCAPE_CHARACTER, self::ESCAPE_CHARACTER.'%', self::ESCAPE_CHARACTER.'_'],
            $term,
        );
    }

    /**
     * The literal `LIKE` pattern for a "contains" search: the term escaped
     * and wrapped with wildcards on both sides.
     */
    public static function contains(string $term): string
    {
        return '%'.self::escape($term).'%';
    }
}
