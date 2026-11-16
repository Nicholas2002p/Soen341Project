/**
 * 
 * shows the applications of the clicked job
 *
 * @param {Object} job - the clicked job
 * @param {Array} applications - applications for that job
 * @param {Function} onBack - returns to the job list
 * @returns Applications View Component
 */
export default function ApplicationsView({ job, applications,  onBack }) {

  return (
    <section className="applications-view">
      <div className="applicant-filter-bar">
        <button onClick={onBack}> Back </button>
        <div> Applications for {job.title} </div>
      </div>

      {applications.length === 0 ? (
        <p> No applications found. </p>
      ) : (
        applications.map((a, index) => (
          <div key={a.applicationId ?? index} className="application-card">
            <p> {a.userId} </p>
            <p> {a.status} </p>
          </div>
        ))
      )}
    </section>
  );
}