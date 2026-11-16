import '../Job/Job.scss';

/**
 * Applicant Job
 * job card used on the Applicants tab, clicking it opens that job's applications
 *
 * @param {Object} job - the job to display
 * @param {Function} onSelect - called with the job when the card is clicked
 * @returns Applicant Job Component
 */
export default function ApplicantJob({ job, onSelect }) {
  const deadlineDate = new Date(job.deadline).toLocaleDateString();

  return (
    <section onClick={() => onSelect(job)} className="job-paper">
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
        <p className="job-paper-description"><strong>Job description</strong> <br />{job.description} </p>
      </div>

      <p className="job-paper-deadline"> Deadline: {deadlineDate} </p>
    </section>
  );
}