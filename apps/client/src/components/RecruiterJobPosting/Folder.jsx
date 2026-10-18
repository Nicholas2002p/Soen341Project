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