import "./JobSearch.scss";

export default function JobSearch() {
  return (
    <section className="job-search">
      <h2> Job Search </h2>

      <JobBoard jobs={sampleRequirements} />  
    </section>
  );
}

function JobBoard({ jobs }) {
  const displayJobs = jobs.map((job) => 
    <section key={job.id} className="job">
      <h2> {job.title} </h2>
      <p> {job.recruiter} </p>
      <Requirements requirements={job.requirements} />
    </section>
  );

  return (
    <section className="job-board">
      { displayJobs } 
    </section>
  );
}

function Requirements({ requirements }) {
  const displayReq =  requirements.map( (req) =>
    <li> {req} </li>
  );
    
  return (
    <ul>
      { displayReq }
    </ul>
  );
}

// ============================= SAMPLE DATA ==================================

const sampleRequirements = [
  {
    id: 1,
    title: 'Job Title',
    recruiter: 'Recruiter',
    requirements: ['requirement 1', 'requirement 2', 'requirement 3']
  }, 
  {
    id: 2,
    title: 'Job Title',
    recruiter: 'Recruiter',
    requirements: ['requirement 1', 'requirement 2', 'requirement 3']
  }, 
  {
    id: 3,
    title: 'Job Title',
    recruiter: 'Recruiter',
    requirements: ['requirement 1', 'requirement 2', 'requirement 3']
  },
  {
    id: 4,
    title: 'Job Title',
    recruiter: 'Recruiter',
    requirements: ['requirement 1', 'requirement 2', 'requirement 3']
  }
];