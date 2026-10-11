import './AddJobOpening.scss';

export function AddJobOpening({ setIsAdding }) {
  return (
    <section onClick={() => { setIsAdding(true); }} className="add-job-button">
      <p className='add-job'> + </p>
    </section>
  );
}


export function AddJobOpeningPage({ setIsAdding }) {
  return (
    <h1> heh </h1>
  );
}
