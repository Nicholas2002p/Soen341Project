import './Application.scss';
import { GetResumesApi } from '../../utils/Api';
import {useState, useEffect} from 'react';
import { useAuth } from '../../utils/Auth';

export default function Application({ handleApply, selectedResumeId, setSelectedResumeId, alreadyApplied }) {
   
   const [resumes, setResumes] = useState([]);
   const [errorMessage, setErrorMessage] = useState('');
   const { token } = useAuth();

    useEffect(() => {
      const getResumes = async () => {
        if (alreadyApplied) return;
        const data = await GetResumesApi(setErrorMessage, token);
        if (!data) return;
        setResumes(data);
      };
      getResumes();
    }, [alreadyApplied, setResumes, token]);

    

return (
    <div className="application">
      {
        alreadyApplied ? <> </>: <p className="">Select the resume you want to use to apply?</p>
      }

      {resumes.length === 0 ? (
        <p className="application-empty">No resumes uploaded yet go to profile to upload one.</p>
        ) : !alreadyApplied ? (
          <DisplayResume resumes={resumes} selectedResumeId={selectedResumeId } setSelectedResumeId={setSelectedResumeId} />
        ) : <> </>
      }

      <div className='application-already-applied'>
        {errorMessage && <p className="resume-error">{errorMessage}</p>}
        {alreadyApplied && <p className='applied-resume'> You've applied to this job! </p>}
        <button disabled={alreadyApplied} onClick={() => { handleApply(); }}>Apply</button>
      </div>
    </div>
  );
}

/**
 * takes in the resumes of the user and displays them in a list
 * @param {*} resumes 
 * @returns a list of resumes 
 */
function DisplayResume({resumes, selectedResumeId, setSelectedResumeId}) {
  return(
  <ul className="application-resume-list">
    {resumes.map((resume) => (
      <li key={resume.id}>
        <label>
          <input
            type="radio"
            name="resume"
            value={resume.id}
            checked={selectedResumeId === resume.id}
            onChange={() => setSelectedResumeId(resume.id)}
          />
          <span className="resume-name">{resume.fileName}</span>
          <span className="resume-date">
            {new Date(resume.createdAt).toLocaleDateString()}
          </span>
        </label>
      </li>
    ))}
    </ul>
  )
}
