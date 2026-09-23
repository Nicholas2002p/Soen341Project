export default function Filters() {
  return (
    <section className="filters">
      <h2> Filters </h2>

      <Filter num={1} choices={['choice 1', 'choice 2', 'choice 3']} />
      <Filter num={2} choices={['choice 1', 'choice 2', 'choice 3']} />
    </section>
  );
}

function Filter(num, choices) {
  return (
    <fieldset>
      <legend> Filter {num} </legend>

      <input type="checkbox" id={choices[0]} name={choices[0]} /> 
      <input type="checkbox" id={choices[1]} name={choices[1]} /> 
      <input type="checkbox" id={choices[2]} name={choices[2]} /> 
    </fieldset>
  );
}