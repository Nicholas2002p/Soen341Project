import { useState } from "react";
import { AddJobOpening } from "./AddJobOpening";

import './Folder.scss';

export default function Folder({ setIsAdding }) {
  const [folderView, setFolderView] = useState("all");
  
  return (
    <section className="folder">
      <FolderTabs setFolderView={setFolderView} />

      <section className="folder-content">
        <DisplayJobOpenings folderView={folderView} setIsAdding={setIsAdding} />
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

function DisplayJobOpenings({ folderView, setIsAdding }) {
  const [jobs, setJobs] = useState(jobList);

  return (
    <section className="folder-job-openings">
      <AddJobOpening setIsAdding={setIsAdding} />

      {jobs.map((job, index) => (
        <Job key={index} job={job} />
      ))}
    </section>
  );
}

function Job({ job }) {
  return (
    <section className="job">
      <p> Title </p>
      <p> Description </p>
      <p> blabla </p>
    </section>
  );
}


// =========================================== SAMPLE DATA ===========================================

const jobList = [
  {}, {}, {}, {}, {}
]