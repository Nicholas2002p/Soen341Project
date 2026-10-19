import './Job.scss';

/**
 * Job
 * single sheet of paper (A4 Paper measurements divided by 1.5) - this is where the sizing in the css is inspired by
 * Displays the information for each paper job
 * 
 * @param {Object} job - for next PR
 * @returns Job Component
 */
export default function Job({ page }) {
  return (
    <section className={page === "application" ? "job-display-paper" : "job-paper"}>
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
