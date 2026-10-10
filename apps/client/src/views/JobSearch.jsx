import JobPosting from "./JobPosting";
import Nav from '../components/Nav';
import SearchBar from "../components/Search";
import { useState, useEffect } from "react";
import GetJobsApi from "../utils/Api";

export default function JobSearch({ setView }) {
  const [jobs, setJobs] = useState();

  useEffect(() => {
      const getOptions = async () => {
        //check to see if token is needed
        const data = await GetJobsApi();
        if (!data) return;
        //change to propername later
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
