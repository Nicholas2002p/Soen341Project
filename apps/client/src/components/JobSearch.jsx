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
    <a href="" key={job.id} className="job">
      <div className="pin"> </div>
      <p className="job-title"> {job.title} </p>
      <p className="job-recruiter"> {job.recruiter} </p>
      <p className="job-description"> {job.description} </p>
      <Requirements requirements={job.requirements} />
    </a>
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
    <ul className="requirements">
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
    description: 'sadfiosahjfiohwefoiwehfiosdhfiodshfiosdhfiohewoisadfiosahjfiohwefoiwehfiosdhfiodshfiosdhfiohewoisadfiosahjfiohwefoiwehfiosdhfiodshfiosdhfiohewoisadfiosahjfiohwefoiwehfiosdhfiodshfiosdhfiohewoi',
    requirements: ['requirement 1', 'requirement 2', 'requirement 3']
  }, 
  {
    id: 2,
    title: 'Job Title',
    recruiter: 'Recruiter',
    description: 'sadfiosahjfiohwefoiwehfiosdhfiodshfiosdhfiohewoisadfiosahjfiohwefoiwehfiosdhfiodshfiosdhfiohewoisadfiosahjfiohwefoiwehfiosdhfiodshfiosdhfiohewoisadfiosahjfiohwefoiwehfiosdhfiodshfiosdhfiohewoi',
    requirements: ['requirement 1', 'requirement 2', 'requirement 3']
  }, 
  {
    id: 3,
    title: 'Job Title',
    recruiter: 'Recruiter',
    description: 'sadfiosahjfiohwefoiwehfiosdhfiodshfiosdhfiohewoisadfiosahjfiohwefoiwehfiosdhfiodshfiosdhfiohewoisadfiosahjfiohwefoiwehfiosdhfiodshfiosdhfiohewoisadfiosahjfiohwefoiwehfiosdhfiodshfiosdhfiohewoi',
    requirements: ['requirement 1', 'requirement 2', 'requirement 3']
  },
  {
    id: 4,
    title: 'Job Title',
    recruiter: 'Recruiter',
    description: 'sadfiosahjfiohwefoiwehfiosdhfiodshfiosdhfiohewoisadfiosahjfiohwefoiwehfiosdhfiodshfiosdhfiohewoisadfiosahjfiohwefoiwehfiosdhfiodshfiosdhfiohewoisadfiosahjfiohwefoiwehfiosdhfiodshfiosdhfiohewoi',
    requirements: ['requirement 1', 'requirement 2', 'requirement 3']
  },
  {
    id: 5,
    title: 'Job Title',
    recruiter: 'Recruiter',
    description: 'sadfiosahjfiohwefoiwehfiosdhfiodshfiosdhfiohewoisadfiosahjfiohwefoiwehfiosdhfiodshfiosdhfiohewoisadfiosahjfiohwefoiwehfiosdhfiodshfiosdhfiohewoisadfiosahjfiohwefoiwehfiosdhfiodshfiosdhfiohewoi',
    requirements: ['requirement 1', 'requirement 2', 'requirement 3']
  },
];