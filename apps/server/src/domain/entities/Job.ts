import type { Company } from './Company.js';

export type EmploymentType = 'on_site' | 'hybrid' | 'remote';

export interface JobSummary {
    jobId: number;
    title: string;
    category: string;
    location: string | null;
    salary: number;
    employmentType: EmploymentType;
    deadline: Date;
    createdAt: Date;
    company: Pick<Company, 'companyId' | 'name'>; // keeping only company
    skills: string[];
}

export interface JobDetails {
    jobId: number;
    recruiterId: number;
    title: string;
    category: string;
    location: string | null;
    description: string | null;
    salary: number;
    employmentType: EmploymentType;
    deadline: Date;
    createdAt: Date;
    updatedAt: Date | null;
    company: Company;
    skills: string[];
}