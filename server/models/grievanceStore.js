import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import Grievance from './Grievance.js';
import { isDBConnected } from '../config/db.js';
import { INITIAL_GRIEVANCES, reseedDatabase } from '../utils/seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../data/grievances.json');

// Helper to ensure local data folder and file exist for fallback
async function ensureDataFile() {
  try {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.access(DATA_FILE);
  } catch (err) {
    await fs.writeFile(DATA_FILE, JSON.stringify(INITIAL_GRIEVANCES, null, 2), 'utf-8');
  }
}

// Read grievances from MongoDB if connected, else fallback to file
export async function readGrievances() {
  if (isDBConnected()) {
    try {
      const dbList = await Grievance.find().sort({ createdAt: -1 }).lean();
      if (dbList && dbList.length > 0) {
        return dbList;
      }
    } catch (e) {
      console.warn('⚠️ [grievanceStore] MongoDB read error, falling back to JSON file:', e.message);
    }
  }

  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, 'utf-8');
  try {
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_GRIEVANCES;
  }
}

// Write grievances to local file
export async function writeGrievances(data) {
  await ensureDataFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function resetGrievancesStore() {
  if (isDBConnected()) {
    try {
      return await reseedDatabase();
    } catch (e) {
      console.warn('⚠️ [grievanceStore] Reseed error:', e.message);
    }
  }

  await ensureDataFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(INITIAL_GRIEVANCES, null, 2), 'utf-8');
  return INITIAL_GRIEVANCES;
}
