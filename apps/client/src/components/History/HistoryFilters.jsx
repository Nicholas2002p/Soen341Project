import './HistoryFilters.scss';
import { useState } from 'react';
/**
 * History Filters
 * allows the user to filter their application history by 
 * - applied: application wasn't review yet at all
 * - offered: job offer (accepted)
 * - interview: received interview for the job
 * - under_review: the job application is pending
 * - rejected: the application was rejected
 * 
 * @param {*} param0 
 * @returns History Filter Component
 */
export default function HistoryFilters({history, setFilterHistory}) {
   const [checked, setChecked] = useState(['applied', 'offered', 'interview', 'under_review', 'rejected']);

  const toggle = (value) => {
    const next = checked.includes(value)
      ? checked.filter((c) => c !== value)
      : [...checked, value];

    setChecked(next);
    setFilterHistory(history.filter((h) => next.includes(h.status.toLowerCase().replace(' ', '_'))));
  }
  return (
    <fieldset className='history-filters'>
      <legend> Application Filters </legend>
      
      <label htmlFor="">
        <input type="checkbox" value="applied" className="applied" name="applied" checked={checked.includes('applied')} onChange={() => toggle('applied')} />
        Applied (gray)
      </label>

      <label htmlFor="">
        <input type="checkbox" value="offered" className="offered" name="offered" checked={checked.includes('offered')} onChange={() => toggle('offered')} />
        Accepted (green)
      </label>

      <label htmlFor="">
        <input type="checkbox" value="interview" className="interview" name="interview" checked={checked.includes('interview')} onChange={() => toggle('interview')} />
        Interview (blue)
      </label>

      <label htmlFor="">
        <input type="checkbox" value="under_review" className="under_review" name="under_review" checked={checked.includes('under_review')} onChange={() => toggle('under_review')} />
        Pending (yellow)
      </label>

      <label htmlFor="">
        <input type="checkbox" value="rejected" className="rejected" name="rejected" checked={checked.includes('rejected')} onChange={() => toggle('rejected')} />
        Rejected (red)       
      </label>
    </fieldset>
  );
}