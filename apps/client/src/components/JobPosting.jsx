import Filters from '../utils/Filters';
import JobSearch from '../utils/JobSearch';

export default function JobPosting() {
  return (
    <div className="job-posting">
      <Filters />
      <JobSearch />
    </div>
  );
}