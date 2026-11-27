import { useState, useEffect } from "react";
import { GetJobsApi } from "../../utils/Api";

import JobPosting from "./JobPosting";
import Nav from '../../components/Navigation/Nav';
import SearchBar from "../../components/job_search_views/Search";

import './JobSearch.scss';

export default function JobSearch({ setSelectedJob }) {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const getOptions = async () => {
      const data = await GetJobsApi();
      if (!data) return;
      setJobs(data);
    };
    getOptions();
  }, []);

  return (
    <section>
      <Nav />      
 
      <main className="search-job">
        <SearchBar setJobs={setJobs} />
        <JobPosting jobs={jobs} setSelectedJob={setSelectedJob} />
      </main>
    </section>
  );
}
