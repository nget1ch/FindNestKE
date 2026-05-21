/**
 * Load backend/.env regardless of process.cwd() (fixes crashes when nodemon is started from repo root).
 */
import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(here, '..');
config({ path: path.join(backendRoot, '.env') });
