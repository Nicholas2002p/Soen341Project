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