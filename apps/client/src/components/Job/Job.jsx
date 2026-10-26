import './Job.scss';

/**
 * Job
 * single sheet of paper (A4 Paper measurements divided by 1.5) - this is where the sizing in the css is inspired by
 * Displays the information for each paper job
 * 
 * @param {Object} job - for next PR
 * @returns Job Component
 */
export default function Job({ page, job }) {
  const deadlineDate = new Date(job.deadline).toLocaleDateString();
  return (
    <section className={page === "application" ? "job-display-paper" : "job-paper"}>
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
