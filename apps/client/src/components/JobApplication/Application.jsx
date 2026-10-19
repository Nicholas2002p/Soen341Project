import './Application.scss';

export default function Application({ setView }) {
  return (
    <div className="application">
      <p className=""> Is this the resume you want to use to apply? </p>

      <button onClick={() => { setView(); apply_to_job(); }}> Apply </button>
    </div>
  );
}

function apply_to_job() {
  // call api which saves which job they applied to
}