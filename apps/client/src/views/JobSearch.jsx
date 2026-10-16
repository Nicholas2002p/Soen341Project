import JobPosting from "./JobPosting";
import Nav from '../components/Nav';
import SearchBar from "../components/Search";
import { useState, useEffect } from "react";
import {GetJobsApi} from "../utils/Api";
//temp
import {sampleRequirements} from '../utils/jobData';
export default function JobSearch({ setView }) {
  const [jobs, setJobs] = useState(sampleRequirements);

  useEffect(() => {
      const getOptions = async () => {
        const data = await GetJobsApi();
        if (!data) return;
        setJobs(data);
      };
      getOptions();

  }, []);

  return (
    <section className="homepage">
      <Nav setView={setView} />      
 
      <main className="home">
        <SearchBar setJobs={setJobs}/>
        <JobPosting jobs={jobs} />
      </main>
    </section>
  );
}
