import "./JobSearch.scss";

/**
 * Job Search
 * 
 * @returns the job search component
 */
export default function JobSearch() {
  return (
    <section className="job-search">
      <h2> Job Search </h2>

      <JobBoard jobs={sampleRequirements} />  
    </section>
  );
}

/**
 * Job Board
 * contains an array of many job postings where it shows: 
 * the title, the recruiter, the description and its requirements
 * 
 * @param {Object} jobs - what the job entails
 * @returns the job board component
 */
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

/**
 * Requirements
 * lists every requirement to display
 * 
 * @param {Array} requirements - list of requirements that the job is looking for
 * @returns the requirements component
 */
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