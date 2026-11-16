import { useState , useEffect} from 'react';
import { useAuth } from "../../utils/Auth";
import './AddJobOpening.scss';
import {CreateJobApi, GetCompaniesApi,  UpdateJobApi, ArchivedJobsApi} from '../../utils/Api';

/**
 * Add Job Opening
 * Page where it has a big + in the middle and when clicking on it,
 * opens the AddJobOpeningPage so you can't post a new job
 * 
 * @param {Function} setIsAdding 
 * @returns Add Job Opening component
 */
export function AddJobOpening({ setIsAdding, setCurrentJob }) {
  return (
    <section onClick={() => { setCurrentJob({}); setIsAdding(true); }} className="add-job-button">
      <p className='add-job'> + </p>
    </section>
  );
}

/**
 * Add Job Opening Page
 * the page prompts you to enter the information needed to make a job posting
 * 
 * @param {Function} setIsAdding 
 * @returns Add Job Opening Page
 */
export function AddJobOpeningPage({ setIsAdding, currentJob, handleJobSaved }) {
  const {token} = useAuth();
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [salary, setSalary] = useState(0);
  const [deadline, setDeadline] = useState(null);
  const [category, setCategory] = useState("");
  const [listCompany, setListCompany] = useState([]);

  // employment type: on_site, hybrid, remote
  const [type, setType] = useState(""); 

  const [archived, setArchived] = useState(currentJob?.archive ?? false);

  useEffect(() => {
    const getCompany = async () => {
      const data = await GetCompaniesApi();
      console.log(data);
      if (!data) return;
      setListCompany(data);
    };
    getCompany();
  }, []);

  //calls api and toggles Archive
  const handleArchiveToggle = async () => {
    const updated = await ArchivedJobsApi(currentJob.jobId, token, !archived,);
    if (!updated) return;

    setArchived((prev) => !prev);
    handleJobSaved?.(updated, true);
  };

  const setPlaceholder = (input) => {
    if (!Object.keys(currentJob).length > 0) return;

    if (input === "company") {
      return currentJob.company.companyId;
    }

    if (input === "deadline") {
      const date = new Date(currentJob.deadline);
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
      return date.toISOString().slice(0, 16); 
    }

    return currentJob[input];
  }

  return (
    <section className='add-job-opening-page'>
      <section className='add-job-opening-content'>
        <div className='add-job-page-header'>
          <h2> Job Posting </h2>
          <p onClick={() => { setIsAdding(false); }} className='leave'> X </p>
        </div>

        <label className='add-job-inputs' htmlFor="job-title">
          Title:
          <input className='' placeholder={setPlaceholder("title")} type="text" name="job-title" maxLength="50" 
            onChange={(e) => { setTitle(e.target.value); }} 
          />
        </label>

        <label className='add-job-inputs' htmlFor="job-company">
          Company:
          <select onChange={(e) => { setCompany(e.target.value); }} id="job-company" name="job-company" value={company || setPlaceholder("company") || ""} >
            <option value="">--Select a company--</option>
            {listCompany.map((c) => (
              <option key={c.companyId} value={c.companyId}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className='add-job-inputs' htmlFor="job-employ-type">
          Employment Type: 
          <select onChange={(e) => { setType(e.target.value); }} name="employ-type" id="employ-type" value={type || setPlaceholder("employmentType") || ""}>
            <option value="">--Select the employment type--</option>
            <option value="on_site" >On Site</option>
            <option value="hybrid">Hybrid</option>
            <option value="remote">Remote</option>
          </select>
        </label>

        <label className='add-job-inputs' htmlFor="job-category">
          Category:
          <input className='' placeholder={setPlaceholder("category")} type="text" name="job-category" maxLength="50" 
            onChange={(e) => { setCategory(e.target.value); }} 
          />
        </label>

        <label className='add-job-inputs' htmlFor="job-location">
          Location:
          <input className='' placeholder={setPlaceholder("location")} type="text" name="job-location" maxLength="100" 
            onChange={(e) => { setLocation(e.target.value); }} 
          />
        </label>

        <label className='add-job-inputs' htmlFor="job-description">
          Description:
          <input className='' placeholder={setPlaceholder("description")} type="text" name="job-description" maxLength="250" 
            onChange={(e) => { setDescription(e.target.value); }} 
          />
        </label>

        <label className='add-job-inputs' htmlFor="job-salary">
          Salary per year:
          <input className='' value={setPlaceholder("salary")} type="number" name="job-salary" min="0" max="5000000"
            onChange={(e) => { setSalary(e.target.value); }} 
          />
        </label>

        <label className='add-job-inputs' htmlFor="job-deadline">
          Deadline: 
          <input className='' value={setPlaceholder("deadline")} type="datetime-local" name="job-deadline"  
            onChange={(e) => { setDeadline(e.target.value); }} 
          />
        </label>

        {Object.keys(currentJob).length > 0 && (
          <div className='archive'>
            <label htmlFor="archive-toggle"> Archive: </label>
            <input type="checkbox" id="archive-toggle" checked={archived} onChange={handleArchiveToggle} />
          </div>
        )}

        <button onClick={() => { postJob(title, company, location, description, salary, deadline, type, category, setIsAdding, token, currentJob, handleJobSaved); }}> Done </button>
      </section>
      
    </section>
  );
}

// Post Job is a function that will call the api to post the job after clicking on the Post button
async function postJob(title, company, location, description, salary, deadline, type, category, setIsAdding, token, currentJob, handleJobSaved) {

  const editing = Boolean(currentJob?.jobId);
  setIsAdding(true);
  console.log(currentJob.company?.companyId);
  if (editing){
    const jobEdit = {
      companyId: company || currentJob.company?.companyId,
      title: title || currentJob.title,
      category: category || currentJob.category,
      location: location || currentJob.location,
      description: description || currentJob.description,
      salary: salary || currentJob.salary,
      employmentType: type || currentJob.employmentType,
      deadline: deadline || currentJob.deadline
    };
    console.log(jobEdit);

    const updated = await UpdateJobApi(currentJob.jobId, jobEdit, token);
    if (updated) handleJobSaved?.(updated, true);

  }
  else{
    const job = {
      companyId: company,
      title,
      category,
      location,
      description,
      salary,
      employmentType: type,
      deadline
    };
   const created = await CreateJobApi(job, token);
    if (created) handleJobSaved?.(created, false);

  }

  setIsAdding(false);
}