import './HistoryFilters.scss';

export default function HistoryFilters({}) {
  return (
    <fieldset className='history-filters'>
      <legend> Application Filters </legend>
      
      <label htmlFor="">
        <input type="checkbox" value="applied" className="applied" name="applied" checked />
        Applied (gray)
      </label>

      <label htmlFor="">
        <input type="checkbox" value="offered" className="offered" name="offered" checked />
        Accepted (green)
      </label>

      <label htmlFor="">
        <input type="checkbox" value="interview" className="interview" name="interview" checked />
        Interview (blue)
      </label>

      <label htmlFor="">
        <input type="checkbox" value="under_review" className="under_review" name="under_review" checked />
        Pending (yellow)
      </label>

      <label htmlFor="">
        <input type="checkbox" value="rejected" className="rejected" name="rejected" checked />
        Rejected (red)       
      </label>
    </fieldset>
  );
}