import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Grievance from '../models/Grievance.js';

export const INITIAL_USERS = [
  {
    id: "USR-ADMIN-01",
    name: "Dr. Anita Rao (Dean of Student Welfare)",
    email: "admin@campus.edu",
    passwordHash: bcrypt.hashSync("admin123", 10),
    role: "admin",
    department: "Student Affairs & Redressal Desk"
  },
  {
    id: "USR-STUDENT-01",
    name: "Rahul Sharma",
    email: "student@campus.edu",
    passwordHash: bcrypt.hashSync("student123", 10),
    role: "student",
    rollNumber: "CS-2023-45",
    department: "Computer Science & Engineering"
  }
];

export const INITIAL_GRIEVANCES = [];

export async function seedInitialDataIfEmpty() {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Seeding default login accounts into MongoDB...');
      await User.insertMany(INITIAL_USERS);
      console.log('✅ Default accounts created: admin@campus.edu & student@campus.edu');
    }

    const grievanceCount = await Grievance.countDocuments();
    if (grievanceCount === 0 && INITIAL_GRIEVANCES.length > 0) {
      console.log('🌱 Seeding initial demo grievances into MongoDB...');
      await Grievance.insertMany(INITIAL_GRIEVANCES);
      console.log('✅ Initial grievances seeded successfully.');
    }
  } catch (err) {
    console.error('⚠️ Warning: Data seeding encountered an issue:', err.message);
  }
}

export async function reseedDatabase() {
  await Grievance.deleteMany({});
  if (INITIAL_GRIEVANCES.length > 0) {
    await Grievance.insertMany(INITIAL_GRIEVANCES);
  }

  // Ensure default demo accounts exist
  for (const u of INITIAL_USERS) {
    const existing = await User.findOne({ email: u.email });
    if (!existing) {
      await User.create(u);
    }
  }

  return INITIAL_GRIEVANCES;
}
