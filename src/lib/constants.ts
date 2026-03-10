export const APP_NAME = "ProjectNova";
export const APP_DESCRIPTION = "Defense-Ready Software Projects";

// Pagination
export const ITEMS_PER_PAGE = 20;
export const PROJECTS_PER_PAGE = 12;

// Pricing Tiers
export const TIER_NAMES = {
  1: "Code Only",
  2: "Code + Videos",
  3: "Premium Support"
};

export const TIER_DESCRIPTIONS = {
  1: "Source code with basic documentation",
  2: "Everything in Tier 1 + video tutorials",
  3: "Everything in Tier 2 + 24-hour expert support"
};

// Categories
export const CATEGORIES = [
  { value: "AI", label: "Artificial Intelligence" },
  { value: "WEB", label: "Web Development" },
  { value: "ML", label: "Machine Learning" },
  { value: "IOT", label: "Internet of Things" },
  { value: "DBMS", label: "Database Management" },
  { value: "MOBILE", label: "Mobile Development" },
  { value: "BLOCKCHAIN", label: "Blockchain" },
  { value: "CYBERSECURITY", label: "Cybersecurity" }
];

// Tech Stacks
export const TECH_STACKS = [
  "MERN",
  "MEAN",
  "Python",
  "Java",
  "Django",
  "Flask",
  "React",
  "Next.js",
  "Node.js",
  "TensorFlow",
  "PyTorch",
  "Arduino",
  "Raspberry Pi",
  "Flutter",
  "React Native"
];

// Order Status
export const ORDER_STATUS = {
  PENDING: "Pending",
  PAID: "Paid",
  FAILED: "Failed",
  REFUNDED: "Refunded"
};

// Ticket Status
export const TICKET_STATUS = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  CLOSED: "Closed"
};

export const TICKET_PRIORITY = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent"
};

// File Download
export const DOWNLOAD_EXPIRY_HOURS = 24;
export const MAX_DOWNLOAD_ATTEMPTS = 5;

// Support SLA
export const SUPPORT_SLA_HOURS = 24;

//Refund Policy
export const REFUND_DAYS = 7;

// Rate Limiting
export const RATE_LIMIT = {
  AUTH: 10, // requests per minute
  GENERAL: 100 // requests per minute
};
