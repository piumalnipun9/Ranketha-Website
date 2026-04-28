import { access, copyFile, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(clientRoot, '..');
const serverSchemaPath = path.join(repoRoot, 'server', 'prisma', 'schema.prisma');
const tempDir = path.join(clientRoot, '.prisma-temp');
const tempSchemaPath = path.join(tempDir, 'schema.prisma');

async function ensureServerSchema() {
  try {
    await access(serverSchemaPath);
  } catch {
    throw new Error(`Cannot find Prisma schema at ${serverSchemaPath}`);
  }
}

async function copySchema() {
  await mkdir(tempDir, { recursive: true });
  await copyFile(serverSchemaPath, tempSchemaPath);
}

function runPrismaGenerate() {
  const command = 'npx prisma generate --schema "' + tempSchemaPath + '"';
  execSync(command, {
    cwd: clientRoot,
    stdio: 'inherit',
    env: process.env,
    shell: true
  });
}

async function cleanup() {
  await rm(tempDir, { recursive: true, force: true });
}

async function main() {
  try {
    await ensureServerSchema();
    await copySchema();
    runPrismaGenerate();
    console.log('Prisma Client generated for the Next.js app.');
  } catch (error) {
    console.error('Failed to generate Prisma Client for the Next.js app.');
    console.error(error);
    process.exitCode = 1;
  } finally {
    await cleanup();
  }
}

main();
