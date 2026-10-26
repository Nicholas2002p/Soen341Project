import { useState } from 'react';
import Filters from '../../components/job_search_views/Filters';
import JobList from '../../components/job_search_views/JobList';

import './JobPosting.scss';

export default function JobPosting({ setView, jobs = [], setSelectedJob }) {
  const [filters, setFilters] = useState({
    employmentTypes: [],
    minSalary: 0,
  });

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
      <JobList setView={setView} jobs={filteredJobs} setSelectedJob={setSelectedJob} />
    </div>
  );
}