/** Tipos de projeto do `docs/data-model.md` (a API manda texto livre; o filtro só usa estes). */
export const PROJECT_TYPES = ['residential', 'corporate'] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

export function parseProjectType(value: string | undefined): ProjectType | undefined {
  return PROJECT_TYPES.find((type) => type === value);
}
