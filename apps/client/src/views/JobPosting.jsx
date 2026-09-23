import Filters from '../components/Filters';
import JobSearch from '../components/JobSearch';

import './JobPosting.scss';

export default function JobPosting() {
  return (
    <div className="job-posting">
      <Filters />
      <JobSearch />
    </div>
  );
}