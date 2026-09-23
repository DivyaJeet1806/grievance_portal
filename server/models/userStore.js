import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import User from './User.js';
import { isDBConnected } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const USERS_FILE = path.join(__dirname, '../data/users.json');

const INITIAL_USERS = [
  {
    id: "USR-ADMIN-01",
    name: "Dr. Anita Rao (Dean of Student Welfare)",
    email: "admin@campus.edu",
    passwordHash: bcrypt.hashSync("admin123", 10),
    role: "admin",
    department: "Student Affairs & Redressal Desk",
    createdAt: "2026-09-01T00:00:00.000Z"
  },
  {
    id: "USR-STUDENT-01",
    name: "Rahul Sharma",
    email: "student@campus.edu",
    passwordHash: bcrypt.hashSync("student123", 10),
    role: "student",
    rollNumber: "CS-2023-45",
    department: "Computer Science & Engineering",
    createdAt: "2026-09-01T00:00:00.000Z"
  }
];

async function ensureUsersFile() {
  try {
    await fs.mkdir(path.dirname(USERS_FILE), { recursive: true });
    await fs.access(USERS_FILE);
  } catch (err) {
    await fs.writeFile(USERS_FILE, JSON.stringify(INITIAL_USERS, null, 2), 'utf-8');
  }
}

export async function readUsers() {
  if (isDBConnected()) {
    try {
      const users = await User.find().lean();
      if (users && users.length > 0) return users;
    } catch (e) {
      console.warn('⚠️ [userStore] DB read failed, falling back to local file storage:', e.message);
    }
  }

  await ensureUsersFile();
  const raw = await fs.readFile(USERS_FILE, 'utf-8');
  try {
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_USERS;
  }
}

export async function writeUsers(data) {
  await ensureUsersFile();
  await fs.writeFile(USERS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function findUserByEmail(email) {
  const cleanEmail = email ? email.trim().toLowerCase() : '';
  if (isDBConnected()) {
    try {
      const user = await User.findOne({ email: cleanEmail }).lean();
      if (user) return user;
    } catch (e) {
      console.warn('⚠️ [userStore] DB findUserByEmail error:', e.message);
    }
  }

  const users = await readUsers();
  return users.find(u => u.email.toLowerCase() === cleanEmail);
}

export async function findUserById(id) {
  if (isDBConnected()) {
    try {
      const user = await User.findOne({ id }).lean();
      if (user) return user;
    } catch (e) {
      console.warn('⚠️ [userStore] DB findUserById error:', e.message);
    }
  }

  const users = await readUsers();
  return users.find(u => u.id === id);
}

export async function createUser({ name, email, password, role = 'student', rollNumber, department }) {
  const cleanEmail = email.trim().toLowerCase();

  // If MongoDB is connected, save directly via Mongoose
  if (isDBConnected()) {
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const newId = `USR-${role.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newUser = await User.create({
      id: newId,
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      role: role === 'admin' ? 'admin' : 'student',
      rollNumber: rollNumber ? rollNumber.trim() : undefined,
      department: department ? department.trim() : 'General'
    });

    return newUser.toSafeObject();
  }

  // Fallback to file storage if MongoDB is not connected
  const users = await readUsers();
  const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    throw new Error('An account with this email address already exists.');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  const newId = `USR-${role.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newUser = {
    id: newId,
    name: name.trim(),
    email: cleanEmail,
    passwordHash,
    role: role === 'admin' ? 'admin' : 'student',
    rollNumber: rollNumber ? rollNumber.trim() : undefined,
    department: department ? department.trim() : 'General',
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  await writeUsers(users);

  const { passwordHash: _, ...safeUser } = newUser;
  return safeUser;
}
