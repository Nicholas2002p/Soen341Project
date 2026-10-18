import { useState } from "react";
import { AddJobOpening } from "./AddJobOpening";

import './Folder.scss';

/**
 * Folder
 * Folder component that has tabs where it filters the different job postings
 * it contains all of the job postings that were added by the specific recruiter
 * 
 * @param {Function} setIsAdding 
 * @returns the Folder Component
 */
export default function Folder({ setIsAdding }) {
  const [folderView, setFolderView] = useState("all");
  
  return (
    <section className="folder">
      <FolderTabs folderView={folderView} setFolderView={setFolderView} />

      <section className="folder-content">
        <DisplayJobOpenings setIsAdding={setIsAdding} />
      </section>    

    </section>
  );
}

/**
 * Folder Tabs
 * shows:
 *      - all: every job posting available
 *      - open: the ones posted for the public to see and apply
 *      - applicants: the job postings who have applicants to them
 *      - closed: job postings that are past their deadlines
 * 
 * @param {String} folderView
 * @param {Function} setFolderView
 * @returns Folder Tabs Component
 */
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

/**
 * Display Job Openings
 * shows every job opening that the recruiter made
 * 
 * Note: to add folderView to the parameter to filter them when displaying
 * @param {Function} setIsAdding 
 * @returns Display Job Openings
 */
function DisplayJobOpenings({ setIsAdding }) {
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

/**
 * Job
 * single sheet of paper (A4 Paper measurements divided by 1.5) - this is where the sizing in the css is inspired by
 * Displays the information for each paper job
 * 
 * @param {Object} job 
 * @returns Job Component
 */
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