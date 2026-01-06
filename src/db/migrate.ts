import { sql } from './client.ts';

const migrationsDir = new URL('../../migrations', import.meta.url);

const readMigrations = async () => {
  const entries: string[] = [];
  for await (const entry of Deno.readDir(migrationsDir)) {
    if (!entry.isFile) continue;
    if (!entry.name.endsWith('.sql')) continue;
    entries.push(entry.name);
  }
  entries.sort();
  return entries;
};

const run = async () => {
  const files = await readMigrations();
  if (!files.length) {
    console.info('No migrations found.');
    return;
  }

  for (const name of files) {
    const fileUrl = new URL(`../../migrations/${name}`, import.meta.url);
    const sqlText = await Deno.readTextFile(fileUrl);
    if (!sqlText.trim()) continue;
    console.info(`Applying ${name}...`);
    await sql.unsafe(sqlText);
  }

  await sql.end();
  console.info('Migrations complete.');
};

await run();
