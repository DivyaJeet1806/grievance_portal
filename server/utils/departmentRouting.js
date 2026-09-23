// Backend Institutional Department Directory & Auto-Assignment Engine

export const DEPARTMENT_DIRECTORY = {
  "Campus Infrastructure & Lab": {
    department: "Estate & Works Directorate",
    officer: "Er. Vikram Mehta (Executive Engineer, Works)",
    email: "estate.works@campus.edu",
    scope: "Civil works, electrical, lab equipment, HVAC & campus facilities",
    keywords: ["water", "ac", "cooling", "leak", "pipe", "wire", "switch", "light", "fan", "bench", "projector", "lab", "door", "window", "power", "generator", "infrastructure"]
  },
  "Academic & Curriculum": {
    department: "Academic Affairs & Examination Branch",
    officer: "Prof. R. Narayanan (Dean of Academic Affairs)",
    email: "academics@campus.edu",
    scope: "Courses, examination discrepancies, syllabus, attendance & faculty coordination",
    keywords: ["exam", "marks", "grade", "syllabus", "attendance", "faculty", "professor", "class", "lecture", "credit", "result", "hall ticket", "curriculum", "assignment"]
  },
  "Hostel & Accommodation": {
    department: "Hostel Administration & Residence Cell",
    officer: "Dr. K. S. Murthy (Chief Hostel Warden)",
    email: "hostel.warden@campus.edu",
    scope: "Room allotments, warden approvals, geysers, water coolers, mess & hostel security",
    keywords: ["hostel", "room", "warden", "geyser", "bed", "mess", "curfew", "cooler", "washroom", "bathroom", "dorm", "corridor"]
  },
  "Finance & Fee Accounts": {
    department: "Finance & Accounts Division",
    officer: "Mr. S. K. Raman (Finance & Accounts Officer)",
    email: "finance.accounts@campus.edu",
    scope: "Fee receipts, online gateway reconciliation, fine refunds & scholarships",
    keywords: ["fee", "payment", "fine", "refund", "utr", "receipt", "challan", "dues", "scholarship", "transaction", "bank", "portal payment"]
  },
  "Library & Digital Resources": {
    department: "Central Library & IT Resource Wing",
    officer: "Dr. Meenakshi Sundaram (Chief Librarian & IT Head)",
    email: "library.it@campus.edu",
    scope: "Wi-Fi access, campus ERP, books issue, journal databases & computer labs",
    keywords: ["library", "book", "journal", "wifi", "wi-fi", "internet", "portal", "lms", "login", "password", "server", "bandwidth", "digital"]
  },
  "Transport & Logistics": {
    department: "Campus Transport & Fleet Management",
    officer: "Mr. Gurpreet Singh (Transport Superintendent)",
    email: "transport@campus.edu",
    scope: "Bus schedules, campus shuttle frequency, parking & student transit passes",
    keywords: ["bus", "shuttle", "transport", "route", "driver", "parking", "vehicle", "transit", "stop", "pickup"]
  },
  "Discipline & Student Welfare": {
    department: "Proctorial Board & Internal Complaints Committee (ICC)",
    officer: "Dr. Anita Rao (Dean Student Welfare & ICC Presiding Officer)",
    email: "student.welfare@campus.edu",
    scope: "Anti-ragging, code of conduct, safety, dispute resolution & student counseling",
    keywords: ["ragging", "harassment", "bully", "threat", "fight", "abuse", "safety", "conduct", "discipline", "misbehavior", "security"]
  },
  "Cafeteria & Hygiene": {
    department: "Food Safety & Campus Sanitation Committee",
    officer: "Mrs. Savitri Devi (Sanitary & Food Inspector)",
    email: "sanitation.food@campus.edu",
    scope: "Food hygiene, cafeteria pricing, RO drinking water inspection & pest control",
    keywords: ["food", "canteen", "cafeteria", "hygiene", "ro water", "mess food", "sanitation", "cleanliness", "dirty", "taste", "insect", "purifier"]
  },
  "Other General Matters": {
    department: "Central Administrative Redressal Secretariat",
    officer: "Registrar Redressal Officer",
    email: "redressal.admin@campus.edu",
    scope: "Inter-departmental issues, institutional suggestions & general grievances",
    keywords: []
  }
};

export function getDepartmentForCategory(category) {
  if (DEPARTMENT_DIRECTORY[category]) {
    return DEPARTMENT_DIRECTORY[category];
  }
  return DEPARTMENT_DIRECTORY["Other General Matters"];
}
