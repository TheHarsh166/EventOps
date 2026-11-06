import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.ts';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'node:dns';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Backup resolver using reliable public DNS (Google & Cloudflare)
const backupResolver = new dns.promises.Resolver();
backupResolver.setServers(['8.8.8.8', '1.1.1.1']);

// Resilient DNS lookup: Works seamlessly across both local development & production deployments
const customLookup = (hostname, options, callback) => {
  const cb = typeof options === 'function' ? options : callback;

  // 1. Try standard system DNS first (default behavior in deployment)
  dns.lookup(hostname, (err, address, family) => {
    if (!err && address) {
      return cb(null, address, family);
    }

    // 2. Fallback to public DNS if local ISP DNS fails or times out
    backupResolver.resolve4(hostname)
      .then((addresses) => {
        if (addresses && addresses.length > 0) {
          cb(null, addresses[0], 4);
        } else {
          cb(err || new Error(`Failed to resolve ${hostname}`));
        }
      })
      .catch((fallbackErr) => cb(fallbackErr || err));
  });
};

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  lookup: customLookup,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

export default prisma;
