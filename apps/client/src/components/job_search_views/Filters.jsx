import "./Filters.scss";
import {employmentTypes, orderBy} from "../../utils/filterTypes";
/**
 * Filters
 * column that shows every filter option possible for the job board
 * 
 * @returns the filters component 
 */
export default function Filters({ filters, setFilters }) {

  /**
   * takes in the the values from the filter and sets The filter
   * @param {*} value 
   */
  const toggleType = (value) => {
    const current = filters.employmentTypes;

    let updated;
    if (current.includes(value)) {
      updated = current.filter((t) => t !== value); 
    } else {
      updated = [...current, value]; 
    }

    setFilters({ ...filters, employmentTypes: updated });
  };

  return (
    <section className="filters">
      <h2> Filters </h2>
      <SortFilter
        value={filters.sortBy}
        onChange={(sortBy) =>
          setFilters((prev) => ({ ...prev, sortBy }))
        }
      />
      <Filter
        id="employmentType"
        choices={employmentTypes}
        selected={filters.employmentTypes}
        onToggle={toggleType}
      />
      <SalaryFilter
        value={filters.minSalary}
        onChange={(minSalary) =>
          setFilters((prev) => ({ ...prev, minSalary }))
        }
      />
    </section>
  );
}

/**
 * shows all filter options 
 * @param {*} id 
 * @param {*} choices 
 * @param {*} selected 
 * @param {*} onToggle
 * @returns  the filter html
 */
function Filter({ id, choices, selected, onToggle }) {
  return (
    <fieldset className="filter">
      <legend> Employment type </legend>

      {choices.map((choice) => (
        <label key={choice.value}>
          <input
            type="checkbox"
            id={`${id}-${choice.value}`}
            name={id}
            value={choice.value}
            checked={selected.includes(choice.value)}
            onChange={() => onToggle(choice.value)}
          />
          {choice.label}
        </label>
      ))}
    </fieldset>
  );
}

/**
 *  the salary side bar 
 * @param {*} value 
 * @param {*} onChange
 * @returns  the salary slide bar html
 */
function SalaryFilter({ value, onChange }) {
  return (
    <fieldset className="filter">
      <legend> Salary </legend>

      <label htmlFor="minSalary">
        {value === 0 ? "Any Salary" : `$${value}+`}
      </label>
      <input
        type="range"
        id="minSalary"
        name="minSalary"
        min={0}
        max={200000}
        step={1000}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </fieldset>
  );
}

/**
 * the sort by dropdown
 * @param {*} value
 * @param {*} onChange
 * @returns the sort 
 */
function SortFilter({ value, onChange }) {
  return (
    <fieldset className="filter">
      <legend> Sort by </legend>

      <select
        id="sortBy"
        className="dropdown"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {orderBy.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
    </fieldset>
  );
}
