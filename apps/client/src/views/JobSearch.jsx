import JobPosting from "./JobPosting";
import Nav from '../components/Nav';
import SearchBar from "../components/Search";
import { useState, useEffect } from "react";
import {GetJobsApi} from "../utils/Api";
import './JobSearch.scss';
export default function JobSearch({ setView }) {
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
      <Nav setView={setView} />      
 
      <main className="search-job">
        <SearchBar setJobs={setJobs}/>
        <JobPosting jobs={jobs} />
      </main>
    </section>
  );
}
