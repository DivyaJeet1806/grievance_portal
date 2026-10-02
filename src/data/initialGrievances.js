export const CATEGORIES = [
  "Campus Infrastructure & Lab",
  "Academic & Curriculum",
  "Hostel & Accommodation",
  "Finance & Fee Accounts",
  "Library & Digital Resources",
  "Transport & Logistics",
  "Discipline & Student Welfare",
  "Cafeteria & Hygiene",
  "Other General Matters"
];

export const URGENCY_LEVELS = [
  { value: "Low", label: "Standard general query (Within 72h)", sla: 72 },
  { value: "Medium", label: "Normal operational issue (Within 48h)", sla: 48 },
  { value: "High", label: "High academic/hostel priority (Within 24h)", sla: 24 },
  { value: "Critical", label: "Emergency safety/infra hazard (Within 12h)", sla: 12 }
];

export const STAGES = ["Submitted", "In Progress", "Resolved"];

export const INITIAL_GRIEVANCES = [];
