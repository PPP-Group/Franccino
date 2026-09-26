#!/usr/bin/env node
// Prepara o ambiente local do zero: .env dos dois apps, dependências do api/, chave, banco, seed e storage.
// Uso: pnpm bootstrap [--sqlite]   (--sqlite força SQLite mesmo com Docker instalado)

import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dirname, '..');
const api = join(root, 'api');
const web = join(root, 'web');
const forceSqlite = process.argv.includes('--sqlite');

function run(command, args, cwd = root, { allowFail = false } = {}) {
  console.log(`\n> ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.status !== 0 && !allowFail) {
    console.error(`\nFalhou: ${command} ${args.join(' ')}`);
    process.exit(result.status ?? 1);
  }
  return result.status === 0;
}

function has(command, args) {
  return spawnSync(command, args, { stdio: 'ignore', shell: process.platform === 'win32' }).status === 0;
}

function requireTool(command, args, hint) {
  if (!has(command, args)) {
    console.error(`\n${command} não encontrado no PATH. ${hint}`);
    process.exit(1);
  }
}

requireTool('php', ['-v'], 'Instale PHP 8.4 (Laravel Herd no Windows/macOS) e reabra o terminal.');
requireTool('composer', ['-V'], 'Instale o Composer 2 (https://getcomposer.org).');

const useDocker = !forceSqlite && has('docker', ['compose', 'version']);

// api/.env
const apiEnv = join(api, '.env');
let adminPassword = null;
if (!existsSync(apiEnv)) {
  let env = readFileSync(join(api, '.env.example'), 'utf8');
  if (!useDocker) {
    env = env
      .replace(/^DB_CONNECTION=.*$/m, 'DB_CONNECTION=sqlite')
      .replace(/^DB_(HOST|PORT|DATABASE|USERNAME|PASSWORD)=.*\n/gm, '');
  }
  adminPassword = randomBytes(12).toString('base64url');
  env = env.replace(/^ADMIN_PASSWORD=.*$/m, `ADMIN_PASSWORD=${adminPassword}`);
  writeFileSync(apiEnv, env);
  console.log(`Criado api/.env (${useDocker ? 'MySQL via Docker' : 'SQLite'}).`);
} else {
  console.log('api/.env já existe, mantido.');
}

// web/.env.local
const webEnv = join(web, '.env.local');
if (!existsSync(webEnv)) {
  copyFileSync(join(web, '.env.example'), webEnv);
  console.log('Criado web/.env.local.');
} else {
  console.log('web/.env.local já existe, mantido.');
}

const isSqlite = /^DB_CONNECTION=sqlite$/m.test(readFileSync(apiEnv, 'utf8'));
if (isSqlite) {
  const database = join(api, 'database', 'database.sqlite');
  if (!existsSync(database)) {
    writeFileSync(database, '');
  }
} else if (useDocker) {
  run('docker', ['compose', 'up', '-d', '--wait']);
}

run('composer', ['install', '--no-interaction'], api);

if (/^APP_KEY=$/m.test(readFileSync(apiEnv, 'utf8'))) {
  run('php', ['artisan', 'key:generate', '--no-interaction'], api);
}

run('php', ['artisan', 'migrate', '--seed', '--no-interaction'], api);
run('php', ['artisan', 'storage:link', '--no-interaction'], api, { allowFail: true });

console.log(`
Pronto.
  pnpm dev                       sobe API (http://localhost:8000), fila e site (http://localhost:3000)
  http://localhost:8000/admin    painel (usuário em ADMIN_EMAIL / ADMIN_PASSWORD no api/.env)`);
if (adminPassword) {
  console.log(`  senha do admin local gerada agora: ${adminPassword}`);
}
