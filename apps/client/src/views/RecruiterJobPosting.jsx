import { useState } from "react";

import Nav from "../components/Nav";
import Folder from "../components/RecruiterJobPosting/Folder";
import { AddJobOpeningPage } from "../components/RecruiterJobPosting/AddJobOpening";
import './RecruiterJobPosting.scss';

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
