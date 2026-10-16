import { useState } from 'react';
import Filters from '../components/Filters';
import JobSearch from '../components/JobSearch';

import './JobPosting.scss';

export default function JobPosting({jobs}) {
   const [filters, setFilters] = useState({
    employmentTypes: [],
    minSalary: 0,
  });

  const filteredJobs = jobs.filter((job) => {
    // if no options are selected  or if the job matches at least 1 of the selected options
    const matchesType = filters.employmentTypes.length === 0 || 
          filters.employmentTypes.includes(job.employmentType);

    const matchesSalary = job.salary >= filters.minSalary;
    return matchesType && matchesSalary;
  });

  return (
    <div className="job-posting">
      <Filters filters={filters} setFilters={setFilters} />
      <JobSearch jobs={filteredJobs} />
    </div>
  );
}