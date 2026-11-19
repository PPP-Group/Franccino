import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/*
  A regra única de cantos (web/DESIGN.md, "The Corner Rule"): só styles/radius.css declara `border-radius`, e só com os
  tokens. Raio solto em outro arquivo ou valor fora dos tokens reprova, para nenhum elemento sair do padrão.
*/
const dir = join(process.cwd(), 'src', 'styles');
const sheets = readdirSync(dir).filter((file) => file.endsWith('.css'));

describe('regra de cantos', () => {
  it('só o radius.css declara border-radius', () => {
    const offenders = sheets
      .filter((file) => file !== 'radius.css')
      .filter((file) => /border(-[a-z]+)*-radius\s*:/.test(readFileSync(join(dir, file), 'utf8')));
    expect(offenders).toEqual([]);
  });

  it('o radius.css só usa os tokens, 0 ou inherit', () => {
    const css = readFileSync(join(dir, 'radius.css'), 'utf8');
    const values = [...css.matchAll(/border-radius:\s*([^;]+);/g)].map((match) => match[1].trim());
    const allowed = /^(0|inherit|var\(--radius(-inner|-round)?\))( (0|var\(--radius(-inner|-round)?\)))*$/;
    expect(values.filter((value) => !allowed.test(value))).toEqual([]);
  });

  it('os tokens têm os dois raios da regra', () => {
    const tokens = readFileSync(join(dir, 'tokens.css'), 'utf8');
    expect(tokens).toMatch(/--radius:\s*6px;/);
    expect(tokens).toMatch(/--radius-inner:\s*2px;/);
  });

  it('nenhum componente arredonda por estilo em linha ou classe do Tailwind', () => {
    const files: string[] = [];
    const walk = (path: string) => {
      for (const entry of readdirSync(path)) {
        const full = join(path, entry);
        if (statSync(full).isDirectory()) walk(full);
        else if (/\.tsx?$/.test(entry) && !entry.includes('.test.')) files.push(full);
      }
    };
    walk(join(process.cwd(), 'src'));
    const offenders = files.filter((file) =>
      /borderRadius|\brounded(-[a-z0-9]+)?\b/.test(readFileSync(file, 'utf8')),
    );
    expect(offenders).toEqual([]);
  });
});
