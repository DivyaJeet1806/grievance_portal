import dns from 'dns';
import mongoose from 'mongoose';
import { seedInitialDataIfEmpty } from '../utils/seedData.js';

// Configure reliable DNS servers to ensure MongoDB Atlas SRV (_mongodb._tcp) resolves cleanly on Windows
try {
  const defaultServers = ['8.8.8.8', '1.1.1.1'];
  if (process.platform === 'win32') {
    import('child_process').then(({ execSync }) => {
      try {
        const out = execSync('powershell -NoProfile -Command "(Get-DnsClientServerAddress -AddressFamily IPv4 | Where-Object { $_.ServerAddresses.Count -gt 0 }).ServerAddresses"', { encoding: 'utf-8', timeout: 2000 });
        const sysDns = out.split(/\r?\n/).map(s => s.trim()).filter(s => s && !s.startsWith('127.'));
        if (sysDns.length > 0) {
          dns.setServers([...new Set([...sysDns, ...defaultServers])]);
        } else {
          dns.setServers(defaultServers);
        }
      } catch {
        dns.setServers(defaultServers);
      }
    }).catch(() => {
      dns.setServers(defaultServers);
    });
  } else {
    dns.setServers(defaultServers);
  }
} catch {
  // Ignore if unsupported in environment
}

export async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return true;
  }
  if (mongoose.connection.readyState === 2) {
    return false;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/grievancehub';

  // Handle connection events if not already registered
  if (mongoose.connection.listenerCount('connected') === 0) {
    mongoose.connection.on('connected', async () => {
      console.log('📦 [MongoDB] Successfully connected to Database');
      try {
        await seedInitialDataIfEmpty();
      } catch (e) {
        console.warn('⚠️ [MongoDB] Seed warning:', e.message);
      }
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ [MongoDB] Connection Error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ [MongoDB] Disconnected from database');
    });
  }

  try {
    console.log(`🔌 [MongoDB] Connecting to: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')} ...`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of hanging
    });
    return true;
  } catch (error) {
    console.error('===============================================================');
    console.error('⚠️ [MongoDB] COULD NOT CONNECT TO MONGODB');
    console.error(`Reason: ${error.message}`);
    console.error('---------------------------------------------------------------');
    console.error('💡 To connect GrievanceHub to MongoDB:');
    console.error('1) OPTION A (MongoDB Atlas - Cloud):');
    console.error('   Create a free cluster on https://cloud.mongodb.com and set');
    console.error('   MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.../grievancehub in your .env file');
    console.error('2) OPTION B (Local MongoDB):');
    console.error('   Install & start MongoDB Community Server locally on port 27017:');
    console.error('   net start MongoDB  (or run mongod.exe)');
    console.error('===============================================================');
    return false;
  }
}

export function isDBConnected() {
  return mongoose.connection.readyState === 1;
}

export function getDBStatus() {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  return {
    state: states[mongoose.connection.readyState] || 'unknown',
    readyState: mongoose.connection.readyState,
    databaseName: mongoose.connection.name || 'grievancehub',
    host: mongoose.connection.host || 'unknown'
  };
}
