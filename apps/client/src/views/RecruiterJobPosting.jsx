import { useState } from "react";

import Folder from "../components/RecruiterJobPosting/Folder";
import { AddJobOpeningPage } from "../components/RecruiterJobPosting/AddJobOpening";
import './RecruiterJobPosting.scss';

export default function RecruiterJobPosting({}) {
  const [isAdding, setIsAdding] = useState(false);
  
  return (
    <main className="recruiter-job-posting">
      <h2> Job Posting </h2>
      <Folder setIsAdding={setIsAdding} />
      { isAdding && <AddJobOpeningPage setIsAdding={setIsAdding} /> }
    </main>
  );
}
