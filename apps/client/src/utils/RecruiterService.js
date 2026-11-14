import {
    GetMyJobsApi,
    CreateJobApi,
    UpdateJobApi,
    DeleteJobApi,
    GetJobApplicationsApi,
    GetApplicationApi,
    UpdateApplicationStatusApi,
    GetCompaniesApi,
} from "./Api";
import { useAuth } from "../../utils/Auth";
const { token} = useAuth();


/**
 * loads all the job postings of the recruiter
 * @param {string} token
 * @returns {Promise<Array>} list of jobs
 */
export async function getMyJobs() {
    return await GetMyJobsApi(token);
}

/**
 * creates a new job posting
 * @param {object} job (title, category, salary, employmentType, deadline, location, description, companyId)
 * @param {string} token
 * @returns {Promise<object|null>} the created job, or null if it failed
 */
export async function createJob(job) {
    return await CreateJobApi(job, token);
}

/**
 * updates an existing job posting
 * @param {number} jobId
 * @param {object} job object with all fields
 * @param {string} token
 * @returns {Promise<object|null>} the updated job, or null if it failed
 */
export async function updateJob(jobId, job) {
    return await UpdateJobApi(jobId, job, token);
}

/**
 * deletes a job posting
 * @param {number} jobId
 * @param {string} token
 * @returns {Promise<boolean>} true if deleted
 */
export async function deleteJob(jobId) {
    return await DeleteJobApi(jobId, token);
}

/**
 * loads all the applications submitted to a job
 * @param {number} jobId
 * @param {string} token
 * @returns {Promise<Array>} list of applications
 */
export async function getJobApplications(jobId) {
    return await GetJobApplicationsApi(jobId, token);
}

/**
 * loads one application with its status history
 * @param {number} applicationId
 * @param {string} token
 * @returns {Promise<object|null>} the application, or null if it failed
 */
export async function getApplication(applicationId) {
    return await GetApplicationApi(applicationId, token);
}

/**
 * changes the status of an application
 * @param {number} applicationId
 * @param {string} status the new status
 * @param {string} token
 * @returns {Promise<object|null>} the updated application, or null if it failed
 */
export async function updateApplicationStatus(applicationId, status) {
    return await UpdateApplicationStatusApi(applicationId, status, token);
}

/**
 * loads all the companies
 * @returns {Promise<Array>} list of companies
 */
export async function getCompanies() {
    return await GetCompaniesApi();
}