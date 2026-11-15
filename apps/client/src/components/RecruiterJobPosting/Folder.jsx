import { useState} from "react";

import { AddJobOpening } from "./AddJobOpening";
import Job from "../Job/Job";

import './Folder.scss';

/**
 * Folder
 * Folder component that has tabs where it filters the different job postings
 * it contains all of the job postings that were added by the specific recruiter
 * 
 * @param {Function} setIsAdding 
 * @returns the Folder Component
 */
export default function Folder({ setIsAdding, jobs, setCurrentJob }) {
  const [folderView, setFolderView] = useState("all");
  
  return (
    <section className="folder">
      <FolderTabs folderView={folderView} setFolderView={setFolderView} />

      <section className="folder-content">
        <DisplayJobOpenings setIsAdding={setIsAdding} jobs={jobs} setCurrentJob={setCurrentJob} />
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
      <li id={folderView == "archive" ? "folder-tabs-selected" : " "} onClick={() => { setFolderView("archive"); }}> Archive </li>
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
function DisplayJobOpenings({ setIsAdding, jobs, setCurrentJob }) {

  return (
    <section className="folder-job-openings">
      <AddJobOpening setIsAdding={setIsAdding} setCurrentJob={setCurrentJob} />

      {jobs.map((job, index) => (
        <Job page={""} key={index} job={job} setIsAdding={setIsAdding} setCurrentJob={setCurrentJob} />
      ))}
    </section>
  );
}
