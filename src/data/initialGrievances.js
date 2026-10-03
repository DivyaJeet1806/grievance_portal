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

export const INITIAL_GRIEVANCES = [
  {
    id: "GRV-2026-1082",
    title: "Faulty AC & Water Leakage in Central Lab Room 302",
    category: "Campus Infrastructure & Lab",
    department: "Estate & Works Directorate",
    description: "The primary AC unit in Lab 302 has been leaking water directly onto workstation desks 14-16. This poses an electrical risk and prevents our AI/ML lab batches from conducting practical sessions.",
    location: "Academic Block B, 3rd Floor, Lab 302",
    urgency: "High",
    status: "In Progress",
    submittedBy: "Rahul Sharma (Roll: CS-2023-45)",
    contactEmail: "student@campus.edu",
    isAnonymous: false,
    createdAt: "2026-09-28T09:15:00.000Z",
    updatedAt: "2026-09-29T14:20:00.000Z",
    assignedTo: "Er. Vikram Mehta (Executive Engineer, Works)",
    assignedDepartment: "Estate & Works Directorate",
    slaHours: 48,
    timeline: [
      {
        stage: "Submitted",
        timestamp: "2026-09-28T09:15:00.000Z",
        message: "Grievance lodged online with supporting lab photographs.",
        actor: "Rahul Sharma"
      },
      {
        stage: "In Progress",
        timestamp: "2026-09-29T14:20:00.000Z",
        message: "HVAC contractor inspected unit. Drain pan replaced, final sealing underway before noon tomorrow.",
        actor: "Er. Vikram Mehta"
      }
    ],
    resolutionNotes: "Drain pan replacement ordered; temporary water shielding installed. Expected completion within 12 hours.",
    rating: null,
    feedback: null,
    attachment: "lab_cooling_leak.jpg",
    departmentConfirmed: false,
    complainantConfirmed: false
  },
  {
    id: "GRV-2026-1049",
    title: "Discrepancy in Semester V Fee Receipt & Late Fine Refund",
    category: "Finance & Fee Accounts",
    department: "Finance & Accounts Division",
    description: "I paid the semester fees via net banking on September 10th (UTR: SBIN0092837192). However, my student portal was reflecting a late fine charge of ₹2,500 that was deducted erroneously.",
    location: "Administrative Finance Cell",
    urgency: "Medium",
    status: "Resolved",
    submittedBy: "Ananya Iyer (Roll: EC-2022-19)",
    contactEmail: "ananya.iyer@campus.edu",
    isAnonymous: false,
    createdAt: "2026-09-22T11:00:00.000Z",
    updatedAt: "2026-09-24T16:45:00.000Z",
    assignedTo: "Mr. S. K. Raman (Finance & Accounts Officer)",
    assignedDepartment: "Finance & Accounts Division",
    slaHours: 72,
    timeline: [
      {
        stage: "Submitted",
        timestamp: "2026-09-22T11:00:00.000Z",
        message: "Grievance lodged with attached bank payment receipt.",
        actor: "Ananya Iyer"
      },
      {
        stage: "In Progress",
        timestamp: "2026-09-23T15:00:00.000Z",
        message: "Reversal credit memo generated in ERP student ledger.",
        actor: "Mr. S. K. Raman"
      },
      {
        stage: "Resolved",
        timestamp: "2026-09-24T16:45:00.000Z",
        message: "Late fee charge of ₹2,500 successfully adjusted against examination dues. Ledger balance cleared.",
        actor: "Mr. S. K. Raman"
      }
    ],
    resolutionNotes: "Bank payment received within deadline. System sync glitch identified and corrected in ERP ledger. Late fee fully waived.",
    rating: 5,
    feedback: "Extremely fast resolution and ledger statement was sent directly to my registered email. Thank you!",
    attachment: "fee_receipt_bank_utr.pdf",
    departmentConfirmed: true,
    departmentConfirmedAt: "2026-09-24T16:45:00.000Z",
    departmentConfirmedBy: "Mr. S. K. Raman",
    complainantConfirmed: true,
    complainantConfirmedAt: "2026-09-25T10:15:00.000Z",
    complainantConfirmedBy: "Ananya Iyer"
  },
  {
    id: "GRV-2026-1077",
    title: "Hostel Block-D High-Speed Wi-Fi Disruption on Floors 3 & 4",
    category: "Hostel & Accommodation",
    department: "Hostel Administration & Residence Cell",
    description: "Access points in corridors 3A and 4B have experienced intermittent DNS dropouts and extreme latency (>600ms) for consecutive nights, interfering with online project submissions.",
    location: "Boys Hostel Block D, Floors 3 & 4",
    urgency: "High",
    status: "In Progress",
    submittedBy: "Karan Grover (Roll: IT-2023-88)",
    contactEmail: "karan.grover@campus.edu",
    isAnonymous: false,
    createdAt: "2026-09-27T08:10:00.000Z",
    updatedAt: "2026-09-28T10:00:00.000Z",
    assignedTo: "Dr. K. S. Murthy (Chief Hostel Warden)",
    assignedDepartment: "Hostel Administration & Residence Cell",
    slaHours: 24,
    timeline: [
      {
        stage: "Submitted",
        timestamp: "2026-09-27T08:10:00.000Z",
        message: "Formal grievance lodged regarding network dropouts.",
        actor: "Karan Grover"
      },
      {
        stage: "In Progress",
        timestamp: "2026-09-28T10:00:00.000Z",
        message: "Assigned to Campus NOC. Fiber switch cable replacement scheduled.",
        actor: "Dr. K. S. Murthy"
      }
    ],
    resolutionNotes: "NOC technician dispatched with replacement gigabit switch. Hardware changeover in progress.",
    rating: null,
    feedback: null,
    attachment: null,
    departmentConfirmed: false,
    complainantConfirmed: false
  },
  {
    id: "GRV-2026-1031",
    title: "Need for Extended Library Quiet Study Hours during Mid-Terms",
    category: "Library & Digital Resources",
    department: "Central Library & IT Resource Wing",
    description: "Requesting Central Library reading halls to stay operational until 1:00 AM instead of 9:30 PM during the upcoming mid-semester examinations.",
    location: "Dr. APJ Abdul Kalam Central Library",
    urgency: "Medium",
    status: "Resolved",
    submittedBy: "Pooja Deshmukh (Student Council Rep)",
    contactEmail: "pooja.d@campus.edu",
    isAnonymous: false,
    createdAt: "2026-09-20T14:30:00.000Z",
    updatedAt: "2026-09-22T17:00:00.000Z",
    assignedTo: "Dr. Meenakshi Sundaram (Chief Librarian & IT Head)",
    assignedDepartment: "Central Library & IT Resource Wing",
    slaHours: 48,
    timeline: [
      {
        stage: "Submitted",
        timestamp: "2026-09-20T14:30:00.000Z",
        message: "Petition submitted with signatures of 120 hostellers.",
        actor: "Pooja Deshmukh"
      },
      {
        stage: "In Progress",
        timestamp: "2026-09-21T16:30:00.000Z",
        message: "Security roster updated to support midnight shifts.",
        actor: "Dr. Meenakshi Sundaram"
      },
      {
        stage: "Resolved",
        timestamp: "2026-09-22T17:00:00.000Z",
        message: "Official circular issued: Library Ground & 1st Floor Study halls will stay open until 1:30 AM with security guard coverage.",
        actor: "Dr. Meenakshi Sundaram"
      }
    ],
    resolutionNotes: "Approved and implemented. Circular No. LIB/2026/08 published on university portal.",
    rating: 5,
    feedback: "Huge relief for all day scholars and hostellers preparing for examinations!",
    attachment: "petition_letter_signed.pdf",
    departmentConfirmed: true,
    departmentConfirmedAt: "2026-09-22T17:00:00.000Z",
    departmentConfirmedBy: "Dr. Meenakshi Sundaram",
    complainantConfirmed: true,
    complainantConfirmedAt: "2026-09-23T09:30:00.000Z",
    complainantConfirmedBy: "Pooja Deshmukh"
  },
  {
    id: "GRV-2026-1094",
    title: "Dangerous Pothole & Lack of Street Light near Gate 3 Bus Stop",
    category: "Transport & Logistics",
    department: "Campus Transport & Fleet Management",
    description: "A deep trench has formed near the Gate 3 internal bus shelter after recent monsoon showers. Multiple two-wheelers have skidded after sunset due to broken sodium lamps.",
    location: "Campus Gate 3, Perimeter Road",
    urgency: "Critical",
    status: "Submitted",
    submittedBy: "Prof. Amit Verma (Faculty Member)",
    contactEmail: "amit.verma@campus.edu",
    isAnonymous: false,
    createdAt: "2026-10-01T19:30:00.000Z",
    updatedAt: "2026-10-01T19:30:00.000Z",
    assignedTo: "Mr. Gurpreet Singh (Transport Superintendent)",
    assignedDepartment: "Campus Transport & Fleet Management",
    slaHours: 12,
    timeline: [
      {
        stage: "Submitted",
        timestamp: "2026-10-01T19:30:00.000Z",
        message: "Critical priority grievance registered with geo-tag location.",
        actor: "Prof. Amit Verma"
      }
    ],
    resolutionNotes: "",
    rating: null,
    feedback: null,
    attachment: "perimeter_road_pothole.jpg",
    departmentConfirmed: false,
    complainantConfirmed: false
  },
  {
    id: "GRV-2026-1105",
    title: "Unhygienic Food Serving Conditions & Insect in Canteen Salad Bar",
    category: "Cafeteria & Hygiene",
    department: "Food Safety & Campus Sanitation Committee",
    description: "Contaminated food container observed at counter 2 in central cafeteria during lunch hour. Immediate hygiene inspection and pest control requested.",
    location: "Central Cafeteria Block Ground Floor",
    urgency: "Critical",
    status: "Submitted",
    submittedBy: "Meera Nair (Roll: ME-2024-12)",
    contactEmail: "meera.nair@campus.edu",
    isAnonymous: false,
    createdAt: "2026-10-02T12:45:00.000Z",
    updatedAt: "2026-10-02T12:45:00.000Z",
    assignedTo: "Mrs. Savitri Devi (Sanitary & Food Inspector)",
    assignedDepartment: "Food Safety & Campus Sanitation Committee",
    slaHours: 12,
    timeline: [
      {
        stage: "Submitted",
        timestamp: "2026-10-02T12:45:00.000Z",
        message: "Emergency hygiene grievance logged with photographic evidence.",
        actor: "Meera Nair"
      }
    ],
    resolutionNotes: "",
    rating: null,
    feedback: null,
    attachment: "salad_bar_issue.jpg",
    departmentConfirmed: false,
    complainantConfirmed: false
  },
  {
    id: "GRV-2026-1063",
    title: "Noise Disturbance & Intimidation in Hostel Corridor Post-Curfew",
    category: "Discipline & Student Welfare",
    department: "Proctorial Board & Internal Complaints Committee (ICC)",
    description: "Repeated late night loud music and verbal altercation near Room 214 past midnight, affecting study atmosphere of neighboring first-year students.",
    location: "Tagore Residence Hall 2nd Floor",
    urgency: "High",
    status: "In Progress",
    submittedBy: "Student Complainant (Confidential)",
    contactEmail: "student.welfare@campus.edu",
    isAnonymous: true,
    createdAt: "2026-09-30T23:15:00.000Z",
    updatedAt: "2026-10-01T11:00:00.000Z",
    assignedTo: "Dr. Anita Rao (Dean Student Welfare & ICC Presiding Officer)",
    assignedDepartment: "Proctorial Board & Internal Complaints Committee (ICC)",
    slaHours: 24,
    timeline: [
      {
        stage: "Submitted",
        timestamp: "2026-09-30T23:15:00.000Z",
        message: "Confidential welfare grievance filed through portal.",
        actor: "Anonymous Student"
      },
      {
        stage: "In Progress",
        timestamp: "2026-10-01T11:00:00.000Z",
        message: "Assistant Proctor conducted surprise inspection. Floor advisory issued to residents.",
        actor: "Dr. Anita Rao"
      }
    ],
    resolutionNotes: "Proctorial counseling initiated with block representatives. Additional night warden patrol deployed.",
    rating: null,
    feedback: null,
    attachment: null,
    departmentConfirmed: false,
    complainantConfirmed: false
  },
  {
    id: "GRV-2026-1015",
    title: "Elective Subject Portal Registration Error for Cloud Computing Elective",
    category: "Academic & Curriculum",
    department: "Academic Affairs & Examination Branch",
    description: "The course registration portal displayed capacity reached error even though seats were announced available for CSE 7th semester batch.",
    location: "Department of Computer Science & Engineering",
    urgency: "Medium",
    status: "Resolved",
    submittedBy: "Devendra Patel (Roll: CS-2023-92)",
    contactEmail: "devendra.p@campus.edu",
    isAnonymous: false,
    createdAt: "2026-09-18T10:00:00.000Z",
    updatedAt: "2026-09-19T14:30:00.000Z",
    assignedTo: "Prof. R. Narayanan (Dean of Academic Affairs)",
    assignedDepartment: "Academic Affairs & Examination Branch",
    slaHours: 48,
    timeline: [
      {
        stage: "Submitted",
        timestamp: "2026-09-18T10:00:00.000Z",
        message: "Academic registration grievance submitted.",
        actor: "Devendra Patel"
      },
      {
        stage: "In Progress",
        timestamp: "2026-09-18T16:00:00.000Z",
        message: "ERP seat cap reconfigured to include section C students.",
        actor: "Prof. R. Narayanan"
      },
      {
        stage: "Resolved",
        timestamp: "2026-09-19T14:30:00.000Z",
        message: "Seat allocation confirmed and course visible in student dashboard.",
        actor: "Prof. R. Narayanan"
      }
    ],
    resolutionNotes: "Server-side cap synchronized. Student successfully registered in Cloud Computing elective.",
    rating: 4,
    feedback: "Resolved within 24 hours, slot allocated as requested.",
    attachment: null,
    departmentConfirmed: true,
    departmentConfirmedAt: "2026-09-19T14:30:00.000Z",
    departmentConfirmedBy: "Prof. R. Narayanan",
    complainantConfirmed: true,
    complainantConfirmedAt: "2026-09-20T11:00:00.000Z",
    complainantConfirmedBy: "Devendra Patel"
  }
];
