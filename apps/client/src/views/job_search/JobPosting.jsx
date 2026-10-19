import { useState } from 'react';
import Filters from '../../components/job_search_views/Filters';
import JobSearch from '../../components/job_search_views/JobSearch';

import './JobPosting.scss';

export default function JobPosting({ jobs = [] }) {
  const [filters, setFilters] = useState({
    employmentTypes: [],
    minSalary: 0,
  });

  console.log('jobs prop:', jobs, typeof jobs); // temporary

  const list = Array.isArray(jobs) ? jobs : [];

  const filteredJobs = list.filter((job) => {
    const matchesType =
      filters.employmentTypes.length === 0 ||
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