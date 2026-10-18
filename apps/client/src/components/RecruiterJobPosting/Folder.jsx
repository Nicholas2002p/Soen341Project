import { useState } from "react";
import { AddJobOpening } from "./AddJobOpening";

import './Folder.scss';

export default function Folder({ setIsAdding }) {
  const [folderView, setFolderView] = useState("all");
  
  return (
    <section className="folder">
      <FolderTabs folderView={folderView} setFolderView={setFolderView} />

      <section className="folder-content">
        <DisplayJobOpenings folderView={folderView} setIsAdding={setIsAdding} />
      </section>    

    </section>
  );
}

function FolderTabs({ folderView, setFolderView }) {
  return (
    <ul className="folder-tabs"> 
      <li id={folderView == "all" ? "folder-tabs-selected" : " "} onClick={() => { setFolderView("all"); }}> All </li>
      <li id={folderView == "open" ? "folder-tabs-selected" : " "} onClick={() => { setFolderView("open"); }}> Open </li>
      <li id={folderView == "applicants" ? "folder-tabs-selected" : " "} onClick={() => { setFolderView("applicants"); }}> Applicants </li>
      <li id={folderView == "closed" ? "folder-tabs-selected" : " "} onClick={() => { setFolderView("closed"); }}> Closed </li>
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
    <section className="job-paper">
      <div className="job-paper-header">
        <p className="job-paper-title"> Title </p>
        <p className="job-paper-createdAt"> some date </p>
      </div>
      <hr />

      <div className="job-paper-recruiter">
        <img src="person-icon.png" alt="" />
        <p> Recruiter Name, from Company </p>
      </div>

      <div className="job-paper-details">
        <p className="job-paper-type"> Employment Type </p>
        <p className="job-paper-location"> Location </p>
        <p className="job-paper-salary"> Salary </p>
        <p className="job-paper-description"> blabla </p>
      </div>

      <p className="job-paper-deadline"> Deadline </p>
    </section>
  );
}


// =========================================== SAMPLE DATA ===========================================

const jobList = [
  {}, {}, {}, {}, {}
]