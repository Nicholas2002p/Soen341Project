/**
 * sorts jobs on the frontend
 * @param {*} jobs list of jobs
 * @param {*} sortBy 
 * @returns a new sorted list
 */
export function SortJobs(jobs, sortBy) {
    const sorted = [...jobs];

    switch (sortBy) {
        case "salaryDesc":
            return sorted.sort((a, b) => b.salary - a.salary);
        case "salaryAsc":
            return sorted.sort((a, b) => a.salary - b.salary);
        case "titleAsc":
            return sorted.sort((a, b) => a.title.localeCompare(b.title));
        case "recent":
        default:
            return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
}

export const APPLICATION_STATUS = [
  "Applied",
  "Under_Review",
  "Interview",
  "Offered",
  "Rejected",
];

export function filterApplications(applications, status, dateFrom) {
  return applications.filter((a) => {
    if (status && a.status !== status) return false;
    if (dateFrom && new Date(a.appliedAt) < new Date(`${dateFrom}T00:00:00`)) return false;
    return true;
  })
}