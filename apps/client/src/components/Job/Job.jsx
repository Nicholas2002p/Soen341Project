import './Job.scss';
import './Trash.scss';
import {DeleteJobApi} from "../../utils/Api";
import { useAuth } from './../../utils/Auth';


/**
 * Job
 * single sheet of paper (A4 Paper measurements divided by 1.5) - this is where the sizing in the css is inspired by
 * Displays the information for each paper job
 * 
 * @param {Object} job - for next PR
 * @returns Job Component
 */
export default function Job({ page, job, setIsAdding, setCurrentJob, onDelete, folderView, setIsManaging }) {
  const deadlineDate = new Date(job.deadline).toLocaleDateString();
  const { token } = useAuth();
  
  return (
    <section onClick={() => { jobClick(page, setIsAdding, setCurrentJob, job, folderView, setIsManaging); }} className={page === "application" ? "job-display-paper" : "job-paper"}>
      {page !== "application" && <DeleteJob job={job} token={token} onDelete={onDelete}/>}

      <div className="job-paper-header">
        <p className="job-paper-title"> {job.title} </p>
        <p className="job-paper-createdAt"> {new Date(job.createdAt).toLocaleDateString()}</p>
      </div>
      <hr />

      <div className="job-paper-recruiter">
        <img src="person-icon.png" alt="" />
        <p> {job.title}, from {job.company.name} </p>
      </div>

      <div className="job-paper-details">
        <p className="job-paper-type"><strong>Employment Type: </strong>{job.employmentType} </p>
        <p className="job-paper-location"><strong>Location:</strong> {job.location} </p>
        <p className="job-paper-salary"><strong>Salary:</strong> ${job.salary} </p>
        <p className="job-paper-description"><strong>Job description</strong> <br/>{job.description} </p>
      </div>

      <p className="job-paper-deadline"> Deadline: {deadlineDate} </p>
    </section>
  );
}

function DeleteJob({ job , token , onDelete}) {
  return (
    <div onClick={async (e) => {
      e.stopPropagation();
      await deleteJob(job, token, onDelete); }} className='delete-job'>
      <img src="trash.svg" alt="trash-icon" />
    </div>
  )
}

function jobClick(page, setIsAdding, setCurrentJob, job, folderView, setIsManaging) {
  if (page === "application") return;
  
  if (folderView === "applicants") {
    setIsManaging(true);
    return;
  }

  setIsAdding(true);
  setCurrentJob(job);
}

// API call to delete the job
async function deleteJob(job, token, onDelete) {
  const deleted = await DeleteJobApi(job.jobId, token)
  if (deleted) onDelete?.(job.jobId);
}