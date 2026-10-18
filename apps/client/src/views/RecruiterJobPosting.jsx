import { useState } from "react";

import Nav from "../components/Navigation/Nav";
import Folder from "../components/RecruiterJobPosting/Folder";
import { AddJobOpeningPage } from "../components/RecruiterJobPosting/AddJobOpening";
import './RecruiterJobPosting.scss';

/**
 * Recruiter Job Posting
 * main page to see the recruiter job posting
 * 
 * @param {Function} setView 
 * @returns Recruiter Job Posting Component
 */
export default function RecruiterJobPosting({ setView }) {
  const [isAdding, setIsAdding] = useState(false);
  
  return (
    <section>
      <Nav setView={setView} /> 

      <main className="recruiter-job-posting">
        <h2> Job Posting </h2>
        <Folder setIsAdding={setIsAdding} />
        { isAdding && <AddJobOpeningPage setIsAdding={setIsAdding} /> }
      </main>
    </section>
  );
}
