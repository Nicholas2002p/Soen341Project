import Filters from '../components/Filters';
import JobSearch from '../components/JobSearch';

export default function JobPosting() {
  return (
    <div className="job-posting">
      <Filters />
      <JobSearch />
    </div>
  );
}