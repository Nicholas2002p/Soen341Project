import './HistoryInfo.scss';

export default function HistoryJobApplication({}) {
  const [arrow, setArrow] = useState(true);

  return (
    <section className='history-application'>
      <div className='history-application-header'>
        <p className='history-application-title'> Job Title </p>

        <div className='status-arrow'>
          <div className='status'></div>
          <p onClick={() => { setArrow(!arrow) }} className='history-arrow'> { arrow ? <> &#x25BC; </> : <> &#x25B2; </> } </p>
        </div>
      </div>

      <div className={arrow ? "display-none" : "history-application-info"}>
        <p> Resume for now </p>
      </div>
    </section>
  );
}
