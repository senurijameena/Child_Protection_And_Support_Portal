export const API_BASE_URL = 'http://localhost:8085';
export const STATS_REFRESH_INTERVAL = 30000; // 30 seconds
export const CASES_REFRESH_INTERVAL = 60000; // 1 minute
export const FEEDBACK_REFRESH_INTERVAL = 30000; // 30 seconds

export const HOW_IT_WORKS_STEPS = [
  {
    id: 1,
    icon: '📱',
    title: 'Report Case',
    description: 'Submit case details through our secure platform',
    time: '2 min'
  },
  {
    id: 2,
    icon: '👁️',
    title: 'Review & Verify',
    description: 'Our team reviews and verifies the case',
    time: '15 min'
  },
  {
    id: 3,
    icon: '👮',
    title: 'Assign Officer',
    description: 'Best available officer is assigned',
    time: '5 min'
  },
  {
    id: 4,
    icon: '📊',
    title: 'Track Progress',
    description: 'Real-time updates on case progress',
    time: 'Real-time'
  },
  {
    id: 5,
    icon: '✅',
    title: 'Resolve & Close',
    description: 'Final resolution and case closure',
    time: 'Final Step'
  }
] as const;

export const FEEDBACK_CATEGORIES = {
  GENERAL: 'GENERAL',
  CASE: 'CASE',
  SERVICE: 'SERVICE',
  SYSTEM: 'SYSTEM',
  HELP_REQUEST: 'HELP_REQUEST'
} as const;

export const FEEDBACK_STATUSES = {
  SUBMITTED: 'SUBMITTED',
  REVIEWED: 'REVIEWED',
  RESPONDED: 'RESPONDED',
  RESOLVED: 'RESOLVED'
} as const;

export const POLICE_DEPARTMENTS = [
  'Local Police',
  'Child Welfare Unit',
  'Special Task Force',
  'Cyber Crime Cell',
  'Anti-Human Trafficking Unit'
];

export const POLICE_RANKS = [
  'Constable',
  'Head Constable',
  'Sub-Inspector',
  'Inspector',
  'Deputy Superintendent',
  'Superintendent',
  'Additional Commissioner',
  'Commissioner'
];

export const CASE_TYPES = {
  MISSING_CHILD: 'Missing Child',
  CHILD_ABUSE: 'Child Abuse',
  TRAFFICKING: 'Trafficking',
  CYBER_CRIME: 'Cyber Crime',
  OTHER: 'Other'
} as const;

export const PRIORITY_LEVELS = {
  LOW: { label: 'Low', color: 'success', emoji: '🟢' },
  MEDIUM: { label: 'Medium', color: 'warning', emoji: '🟡' },
  HIGH: { label: 'High', color: 'danger', emoji: '🟠' },
  URGENT: { label: 'Urgent', color: 'danger', emoji: '🔴' }
} as const;