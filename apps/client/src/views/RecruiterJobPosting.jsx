import { useState } from "react";

export default function RecruiterJobPosting({}) {
  const [isAdding, setIsAdding] = useState(false);
  
  return (
    <main className="recruiter-job-posting">
      { isAdding && <Folder setIsAdding={setIsAdding} /> }
      { !isAdding && <AddJobOpeningPage setIsAdding={setIsAdding} /> }
    </main>
  );
}

// =========================================== FOLDER ===========================================

function Folder({ setIsAdding }) {
  const [folderView, setFolderView] = useState("all");
  
  return (
    <section className="folder">
      <FolderTabs setFolderView={setFolderView} />

      <section className="folder-content">
        <AddJobOpening setIsAdding={setIsAdding} />

        <DisplayJobOpenings folderView={folderView} />
      </section>    

    </section>
  );
}

function FolderTabs({ setFolderView }) {
  return (
    <ul className="folder-tabs"> 
      <li onClick={() => { setFolderView("all"); }}> All </li>
      <li onClick={() => { setFolderView("open"); }}> Open </li>
      <li onClick={() => { setFolderView("applicants"); }}> Applicants </li>
      <li onClick={() => { setFolderView("closed"); }}> Closed </li>
    </ul>
  );
}

function DisplayJobOpenings({ folderView }) {
  const [jobs, setJobs] = useState(jobList);

  return (
    <>
      {jobs.map((job, index) => (
        <Job key={index} job={job} />
      ))}
    </>
  );
}

function Job({ job }) {
  
}

// =========================================== ADD JOB OPENING ===========================================

function AddJobOpeningPage({ setIsAdding }) {}

function AddJobOpening({ setIsAdding }) {}


// =========================================== SAMPLE DATA ===========================================
const jobList = [
  {}, {}, {}, {}, {}
]