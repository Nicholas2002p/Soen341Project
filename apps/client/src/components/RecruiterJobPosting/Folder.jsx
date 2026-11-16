import { useState, useMemo, useEffect} from "react";
import { useAuth } from "../../utils/Auth";
import ApplicantJob from "./ApplicantJob";
import ApplicationsView from "./ApplicationsView";
import { AddJobOpening } from "./AddJobOpening";
import Job from "../Job/Job";
import { GetArchivedJobsApi,  GetJobApplicationsApi } from "../../utils/Api";

import './Folder.scss';

/**
 * Folder
 * Folder component that has tabs where it filters the different job postings
 * it contains all of the job postings that were added by the specific recruiter
 * 
 * @param {Function} setIsAdding 
 * @returns the Folder Component
 */
export default function Folder({ setIsAdding, jobs, setCurrentJob, onDelete }) {
  const [folderView, setFolderView] = useState("all");
  const [archivedJobs, setArchivedJobs] = useState([]);
  const { token} = useAuth();
  const isApplicantsTab = folderView === "applicants"; 
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [applicationSearch, setApplicationSearch] = useState("");
  
  useEffect(() => {
    if (folderView === "archive") {
      GetArchivedJobsApi(token).then(setArchivedJobs);
    }
  }, [folderView]);

    useEffect(() => {
    if (!isApplicantsTab) return;
    return () => setSelectedJob(null);
  }, [isApplicantsTab]);

  // load the applications of the clicked job (Applicants tab only)
  useEffect(() => {
    if (!isApplicantsTab || !selectedJob) return;
    setApplicationSearch("");
    GetJobApplicationsApi(selectedJob.jobId, token).then((data) => setApplications(data || []));
  }, [isApplicantsTab, selectedJob, token]);

  const filteredJobs = useMemo(() => {
    const now = new Date();
    const isClosed = (job) => new Date(job.deadline) < now;

    switch (folderView) {
      case "open":
        return jobs.filter((job) => !isClosed(job));
      case "closed":
        return jobs.filter((job) => isClosed(job));
      case "applicants": {
        return jobs;
      }
      case "archive": {
        return archivedJobs;
      }
      case "all":
      default:
        return jobs;
    }
  }, [folderView, jobs, archivedJobs]);

  return (
    <section className="folder">
      <FolderTabs folderView={folderView} setFolderView={setFolderView} />

      <section className="folder-content">
        {!isApplicantsTab && (
          <DisplayJobOpenings setIsAdding={setIsAdding} jobs={filteredJobs} setCurrentJob={setCurrentJob} onDelete={onDelete}/>
        )}

        {isApplicantsTab && !selectedJob && (
          <ApplicantJobList jobs={filteredJobs} onSelect={setSelectedJob} />
        )}

        {isApplicantsTab && selectedJob && (
          <ApplicationsView
            job={selectedJob}
            applications={applications}
            search={applicationSearch}
            setSearch={setApplicationSearch}
            onBack={() => setSelectedJob(null)}
          />
        )}
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
function DisplayJobOpenings({ setIsAdding, jobs, setCurrentJob, onDelete }) {

  return (
    <section className="folder-job-openings">
      <AddJobOpening setIsAdding={setIsAdding} setCurrentJob={setCurrentJob} />

      {jobs.map((job, index) => (
        <Job page={""} key={index} job={job} setIsAdding={setIsAdding} setCurrentJob={setCurrentJob} onDelete={onDelete}/>
      ))}
    </section>
  );
}

function ApplicantJobList({ jobs, onSelect }) {
  return (
    <section className="folder-job-openings">
      {jobs.map((job, index) => (
        <ApplicantJob key={index} job={job} onSelect={onSelect} />
      ))}
    </section>
  );
}
