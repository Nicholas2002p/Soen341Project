import "./Filters.scss";

/**
 * Filters
 * column that shows every filter option possible for the job board
 * 
 * @returns the filters component 
 */
export default function Filters() {
  return (
    <section className="filters">
      <h2> Filters </h2>

      <Filter num={1} choices={options} />
      <Filter num={2} choices={options} />
    </section>
  );
}

/**
 * Filter
 * example of what it looks like
 * Filter 1
 * checkbox option 1
 * checkbox option 2 ....
 * 
 * @param {number} num - ex. Filter 1, Filter 2
 * @param {Array} choices - the options shown for filtering 
 * @returns the filter component
 */
function Filter({ num, choices }) {
  return (
    <fieldset className="filter">
      <legend> Filter {num} </legend>

      {choices.map( (choice) => 
        <label>
          <input type="checkbox" value={choice} id={choice} name={choice} /> 
          {choice}
        </label>
      )}
    </fieldset>
  );
}

// ============================= SAMPLE DATA ==================================

const options = ['choice 1', 'choice 2', 'choice 3']