import type { Company } from './Company.js';
import type { EmploymentType } from './EmploymentType.js';

export interface JobSummary {
    jobId: number;
    title: string;
    category: string;
    location: string | null;
    salary: number;
    employmentType: EmploymentType;
    description: string | null;
    deadline: Date;
    createdAt: Date;
    archive: boolean; // archived jobs are hidden from job seekers and cannot be applied to
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
    archive: boolean; // archived jobs are hidden from job seekers and cannot be applied to
    company: Company;
    skills: string[];
}