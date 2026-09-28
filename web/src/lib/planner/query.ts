export const PLANNER_QUERY_MIN = 2;
export const PLANNER_QUERY_MAX = 60;

/** Busca da biblioteca: a API exige 2+ caracteres; o teto evita abuso da Server Action. */
export function parsePlannerQuery(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const query = value.trim();
  return query.length >= PLANNER_QUERY_MIN && query.length <= PLANNER_QUERY_MAX ? query : null;
}
