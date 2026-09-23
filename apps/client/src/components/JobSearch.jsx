export default function JobSearch() {
  return (
    <section className="job-search">
      <h2> Job Search </h2>

      <JobBoard jobs={sampleRequirements} />  
    </section>
  );
}

function JobBoard(jobs) {
  const displayJobs = jobs.map((jobs) => 
    <section className="job">
      <Requirements requirements={jobs.requirements} />
    </section>
  );

  return (
    <section className="job-board">
      { displayJobs } 
    </section>
  );
}

function Requirements(requirements) {
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
    title: 'Job Title',
    recruiter: 'Recruiter',
    requirements: ['requirement 1', 'requirement 2', 'requirement 3']
  }, 
  {
    title: 'Job Title',
    recruiter: 'Recruiter',
    requirements: ['requirement 1', 'requirement 2', 'requirement 3']
  }, 
  {
    title: 'Job Title',
    recruiter: 'Recruiter',
    requirements: ['requirement 1', 'requirement 2', 'requirement 3']
  },
  {
    title: 'Job Title',
    recruiter: 'Recruiter',
    requirements: ['requirement 1', 'requirement 2', 'requirement 3']
  }
];