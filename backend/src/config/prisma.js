import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.ts';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const dbUrl = process.env.DATABASE_URL;

let poolConfig = { connectionString: dbUrl };

if (dbUrl) {
  try {
    const parsed = new URL(dbUrl);
    // If running against Neon and ISP blocks hostname DNS locally,
    // connect via Neon's AWS direct IP with TLS Server Name Indication (SNI).
    // This works both locally (bypassing ISP DNS block) and in production!
    if (parsed.hostname.includes('neon.tech')) {
      poolConfig = {
        host: '18.226.144.228',
        port: Number(parsed.port) || 5432,
        user: decodeURIComponent(parsed.username),
        password: decodeURIComponent(parsed.password),
        database: parsed.pathname.slice(1),
        ssl: {
          rejectUnauthorized: false,
          servername: parsed.hostname, // Preserves the exact Neon endpoint routing
        },
      };
    }
  } catch (err) {
    console.error('Failed to parse DATABASE_URL, falling back to connectionString', err);
  }
}

const pool = new Pool(poolConfig);
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;
