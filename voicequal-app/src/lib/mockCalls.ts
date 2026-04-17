export interface BANTScore {
  total: number;
  budget: number;
  authority: number;
  need: number;
  timeline: number;
  label: "HOT" | "WARM" | "COLD";
  summary: string;
}

export interface MockCall {
  id: string;
  lead: string;
  duration: string;
  time: string;
  status: string;
  outcome: string;
  score: BANTScore | null;
  scoring: boolean;
}

export const MOCK_CALLS: MockCall[] = [
  { id: "mock-001", lead: "Rajesh Kumar — TechSoft Solutions",     duration: "4:32", time: "09:15 AM", status: "COMPLETED", outcome: "HOT",  scoring: false, score: { total: 8.5, budget: 9, authority: 8, need: 9, timeline: 8, label: "HOT",  summary: "Strong budget with urgent Q2 need" } },
  { id: "mock-002", lead: "Priya Sharma — FinEdge Capital",        duration: "3:18", time: "09:48 AM", status: "COMPLETED", outcome: "HOT",  scoring: false, score: { total: 7.8, budget: 8, authority: 9, need: 7, timeline: 7, label: "HOT",  summary: "CFO confirmed annual budget approval" } },
  { id: "mock-003", lead: "Aarav Mehta — LogiTrack India",         duration: "2:55", time: "10:22 AM", status: "COMPLETED", outcome: "WARM", scoring: false, score: { total: 5.5, budget: 5, authority: 6, need: 6, timeline: 5, label: "WARM", summary: "Interested but awaiting board sign-off" } },
  { id: "mock-004", lead: "Sunita Verma — HealthBridge Pvt Ltd",   duration: "5:10", time: "10:55 AM", status: "COMPLETED", outcome: "HOT",  scoring: false, score: { total: 9.0, budget: 9, authority: 9, need: 9, timeline: 9, label: "HOT",  summary: "Immediate need, budget ready to deploy" } },
  { id: "mock-005", lead: "Karan Nair — RetailMax Group",          duration: "1:45", time: "11:30 AM", status: "FAILED",    outcome: "COLD", scoring: false, score: null },
  { id: "mock-006", lead: "Deepika Joshi — EduPrime Network",      duration: "3:40", time: "12:05 PM", status: "COMPLETED", outcome: "WARM", scoring: false, score: { total: 6.2, budget: 6, authority: 7, need: 7, timeline: 5, label: "WARM", summary: "Evaluating two other vendors in parallel" } },
  { id: "mock-007", lead: "Vikram Singh — AutoParts Direct",       duration: "4:15", time: "12:40 PM", status: "COMPLETED", outcome: "HOT",  scoring: false, score: { total: 8.0, budget: 8, authority: 8, need: 8, timeline: 8, label: "HOT",  summary: "Fleet expansion driving urgent timeline" } },
  { id: "mock-008", lead: "Ananya Bose — CloudServe Technologies", duration: "2:08", time: "01:15 PM", status: "COMPLETED", outcome: "COLD", scoring: false, score: { total: 3.2, budget: 3, authority: 4, need: 3, timeline: 3, label: "COLD", summary: "No current budget, review in 6 months" } },
  { id: "mock-009", lead: "Manish Patel — GreenEnergy Corp",       duration: "6:02", time: "02:00 PM", status: "COMPLETED", outcome: "HOT",  scoring: false, score: { total: 9.2, budget: 10, authority: 9, need: 9, timeline: 9, label: "HOT", summary: "Decision maker with approved capex budget" } },
  { id: "mock-010", lead: "Ritu Agarwal — MediScan Diagnostics",  duration: "3:55", time: "02:45 PM", status: "COMPLETED", outcome: "WARM", scoring: false, score: { total: 6.8, budget: 7, authority: 6, need: 8, timeline: 6, label: "WARM", summary: "High need but procurement process slow" } },
  { id: "mock-011", lead: "Siddharth Roy — NeoFinance Ltd",        duration: "4:48", time: "03:20 PM", status: "COMPLETED", outcome: "HOT",  scoring: false, score: { total: 8.8, budget: 9, authority: 9, need: 8, timeline: 9, label: "HOT",  summary: "Series B funded, CTO directly engaged" } },
  { id: "mock-012", lead: "Kavita Reddy — AgriTech Ventures",      duration: "1:22", time: "04:05 PM", status: "FAILED",    outcome: "COLD", scoring: false, score: null },
  { id: "mock-013", lead: "Arjun Kapoor — SmartCity Infra",        duration: "5:30", time: "04:40 PM", status: "COMPLETED", outcome: "WARM", scoring: false, score: { total: 5.8, budget: 6, authority: 5, need: 7, timeline: 5, label: "WARM", summary: "Government tender process adds delay" } },
  { id: "mock-014", lead: "Neha Gupta — InsureMax Digital",        duration: "3:12", time: "05:15 PM", status: "COMPLETED", outcome: "HOT",  scoring: false, score: { total: 7.5, budget: 8, authority: 7, need: 8, timeline: 7, label: "HOT",  summary: "Renewal deadline creating urgency" } },
  { id: "mock-015", lead: "Rohit Desai — ManuTech Systems",        duration: "2:50", time: "05:50 PM", status: "COMPLETED", outcome: "WARM", scoring: false, score: { total: 5.0, budget: 5, authority: 5, need: 5, timeline: 5, label: "WARM", summary: "Mid-cycle evaluation, no urgency noted" } },
  { id: "mock-016", lead: "Amina Khan — Vector Logistics",        duration: "4:05", time: "06:12 PM", status: "COMPLETED", outcome: "HOT",  scoring: false, score: { total: 8.5, budget: 9, authority: 8, need: 9, timeline: 8, label: "HOT", summary: "Expanding operations Q3, confirmed budget allocated" } },
  { id: "mock-017", lead: "Suresh Pillai — OceanBlue Maritime",   duration: "5:20", time: "06:45 PM", status: "COMPLETED", outcome: "HOT",  scoring: false, score: { total: 9.1, budget: 9, authority: 10, need: 9, timeline: 8, label: "HOT", summary: "CEO direct approval, ready to move forward next week" } },
  { id: "mock-018", lead: "Tanya Kapoor — Vogue Innovations",     duration: "1:15", time: "07:05 PM", status: "FAILED",    outcome: "COLD", scoring: false, score: null },
  { id: "mock-019", lead: "Mukul Sharma — Apex Constructions",    duration: "6:10", time: "07:30 PM", status: "COMPLETED", outcome: "WARM", scoring: false, score: { total: 6.8, budget: 6, authority: 7, need: 8, timeline: 6, label: "WARM", summary: "Requires multiple proposals for compliance check" } },
  { id: "mock-020", lead: "Farah Sheikh — Horizon Travels",       duration: "3:45", time: "08:15 PM", status: "COMPLETED", outcome: "HOT",  scoring: false, score: { total: 7.9, budget: 8, authority: 8, need: 8, timeline: 7, label: "HOT", summary: "New season approaching, urgent procurement required" } },
  { id: "mock-021", lead: "Nitin Bhasin — Urban Dwelling",        duration: "2:58", time: "08:42 PM", status: "COMPLETED", outcome: "COLD", scoring: false, score: { total: 3.5, budget: 3, authority: 3, need: 5, timeline: 3, label: "COLD", summary: "Just browsing options, budget frozen until next year" } },
  { id: "mock-022", lead: "Pradeep Rao — TechNova Solutions",     duration: "4:22", time: "09:05 PM", status: "COMPLETED", outcome: "HOT",  scoring: false, score: { total: 8.2, budget: 8, authority: 9, need: 8, timeline: 8, label: "HOT", summary: "Infrastructure upgrade mandated by board, high priority" } },
  { id: "mock-023", lead: "Meera Das — Elemental Designs",        duration: "2:10", time: "09:30 PM", status: "COMPLETED", outcome: "WARM", scoring: false, score: { total: 5.5, budget: 5, authority: 6, need: 6, timeline: 5, label: "WARM", summary: "Needs CEO buy-in, follow up early next month" } },
  { id: "mock-024", lead: "Anil Kapoor — Global Logistics Pvt",   duration: "5:45", time: "10:15 PM", status: "COMPLETED", outcome: "HOT",  scoring: false, score: { total: 9.5, budget: 10, authority: 9, need: 10, timeline: 9, label: "HOT", summary: "Immediate deployment required across 5 warehouse branches" } },
  { id: "mock-025", lead: "Sanya Malhotra — PureFoods Ltd",       duration: "3:30", time: "10:48 PM", status: "COMPLETED", outcome: "WARM", scoring: false, score: { total: 6.5, budget: 7, authority: 6, need: 7, timeline: 6, label: "WARM", summary: "Interested in pilot program before full commitment" } },
];
