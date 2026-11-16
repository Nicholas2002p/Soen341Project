/**
 * Applications View
 * shows the applications of the clicked job, with a filter bar
 *
 * @param {Object} job - the clicked job
 * @param {Array} applications - applications for that job
 * @param {String} search - filter text
 * @param {Function} setSearch
 * @param {Function} onBack - returns to the job list
 * @returns Applications View Component
 */
export default function ApplicationsView({ job, applications, search, setSearch, onBack }) {
  const shown = applications.filter((a) =>
    `${a.applicant?.name ?? ""} ${a.status ?? ""}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="applications-view">
      <div className="applicant-filter-bar">
        <button onClick={onBack}> Back </button>
        <div> Applications for {job.title} </div>
      </div>

      {shown.length === 0 ? (
        <p> No applications found. </p>
      ) : (
        shown.map((a, index) => (
          <div key={a.applicationId ?? index} className="application-card">
            <p> {a.userId} </p>
            <p> {a.status} </p>
          </div>
        ))
      )}
    </section>
  );
}