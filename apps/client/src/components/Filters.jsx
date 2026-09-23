export default function Filters() {
  return (
    <section className="filters">
      <h2> Filters </h2>

      <Filter num={1} choices={options} />
      <Filter num={2} choices={options} />
    </section>
  );
}

function Filter({ num, choices }) {
  return (
    <fieldset>
      <legend> Filter {num} </legend>

      {choices.map( (key, choice) => 
        <>
          <label key={key} htmlFor="">
            <input type="checkbox" value={choice} id={choice} name={choice} /> 
            {choice}
          </label>
        </>
      )}
    </fieldset>
  );
}

// ============================= SAMPLE DATA ==================================

const options = ['choice 1', 'choice 2', 'choice 3']