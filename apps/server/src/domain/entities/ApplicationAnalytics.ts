import type { ApplicationStatus } from './Application.js';

// This file defines the numbers shown on a job seeker's application dashboard.

// Number of applications submitted during one week
export interface WeeklyApplicationCount {
    weekStart: string; // Monday of the week (UTC), as YYYY-MM-DD
    count: number;
}

export interface ApplicationAnalytics {
    total: number; // Number of applications the job seeker has
    pending: number; // Applications still waiting for an answer (Applied or Under_Review)
    byStatus: Record<ApplicationStatus, number>; // Number of applications currently in each status
    interviewRate: number; // Share of applications that reached Interview or Offered, from 0 to 1
    submittedOverTime: WeeklyApplicationCount[]; // Applications submitted per week, oldest first, weeks with none included
}
