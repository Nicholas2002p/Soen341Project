import './ManageApplicants.scss';
import { useState } from 'react';

export default function ManageApplicants({}) {
  const [index, setIndex] = useState(0);
  const data = [{"resume": 1}, { "resume": 2 }, {"resume": 3}, {"resume": 4}];

  const prevResume = () => {
    if (index === 0) return;
    setIndex(index - 1);
  }

  const nextResume = () => {
    if (index === data.length - 1) return;
    setIndex(index + 1);
  }

  return (
    <section className="recruiter-manage-applicants">
      <section className='manage-applicants'>
        <div>
          <button onClick={prevResume}> &lt; </button>
          <ApplicationResumes resume={data[index]} />
          <button onClick={nextResume}> &gt; </button>
        </div>
      </section>
      
      <ApplicationMenu />
    </section>
  );
}

function ApplicationMenu({}) {
  return (
    <section className='recruiter-application-menu'>
      <div className='application-menu'>
        <h2> Application menu </h2>
        <div className='application-menu-options'>
          <button> <div className='status offered'></div> Accept </button>
          <button> <div className='status interview'></div> Interview </button>
          <button> <div className='status rejected'></div> Reject </button>
        </div>
      </div>
    </section>
  )
}

function ApplicationResumes({ resume }) {
  return (
    <section className='recruiter-application-resumes'>
      <p> {resume.resume} </p>
    </section>
  )
}