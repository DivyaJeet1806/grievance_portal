import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Grievance from '../models/Grievance.js';
import { readUsers } from '../models/userStore.js';
import { readGrievances } from '../models/grievanceStore.js';

async function viewDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/grievancehub';
  console.log('\n======================================================');
  console.log('🔍 GRIEVANCEHUB DATABASE VIEWER');
  console.log('======================================================');

  let dbConnected = false;
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2500 });
    dbConnected = true;
    console.log(`📡 MongoDB Status: CONNECTED (${mongoose.connection.name} @ ${mongoose.connection.host})`);
  } catch (err) {
    console.log(`📡 MongoDB Status: OFFLINE / DISCONNECTED (${err.message})`);
    console.log(`📁 Reading from fallback JSON files in server/data/`);
  }

  let users = [];
  let grievances = [];

  if (dbConnected) {
    users = await User.find().lean();
    grievances = await Grievance.find().lean();
  } else {
    users = await readUsers();
    grievances = await readGrievances();
  }

  console.log(`\n👥 USERS IN DATABASE (${users.length} total):`);
  console.table(
    users.map(u => ({
      ID: u.id,
      Name: u.name,
      Email: u.email,
      Role: u.role,
      Department: u.department || 'N/A'
    }))
  );

  console.log(`\n📋 GRIEVANCE TICKETS IN DATABASE (${grievances.length} total):`);
  console.table(
    grievances.slice(0, 10).map(g => ({
      TicketID: g.id,
      Title: g.title.length > 35 ? g.title.substring(0, 32) + '...' : g.title,
      Category: g.category,
      Urgency: g.urgency,
      Status: g.status,
      AssignedTo: g.assignedTo || 'Pending'
    }))
  );

  if (grievances.length > 10) {
    console.log(`... and ${grievances.length - 10} more tickets.`);
  }

  console.log('======================================================\n');

  if (dbConnected) {
    await mongoose.disconnect();
  }
  process.exit(0);
}

viewDatabase().catch(err => {
  console.error('Error viewing database:', err);
  process.exit(1);
});
