import mongoose from 'mongoose';
import { seedInitialDataIfEmpty } from '../utils/seedData.js';

let isConnected = false;

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/grievancehub';

  // Handle connection events
  mongoose.connection.on('connected', async () => {
    isConnected = true;
    console.log('📦 [MongoDB] Successfully connected to Database');
    try {
      await seedInitialDataIfEmpty();
    } catch (e) {
      console.warn('⚠️ [MongoDB] Seed warning:', e.message);
    }
  });

  mongoose.connection.on('error', (err) => {
    isConnected = false;
    console.error('❌ [MongoDB] Connection Error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    console.warn('⚠️ [MongoDB] Disconnected from database');
  });

  try {
    console.log(`🔌 [MongoDB] Connecting to: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')} ...`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of hanging
    });
    isConnected = true;
    return true;
  } catch (error) {
    isConnected = false;
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
