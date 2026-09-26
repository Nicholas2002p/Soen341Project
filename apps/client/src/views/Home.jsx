import JobPosting from "./JobPosting";
import Account from "../components/Account";
import Nav from '../components/Nav';

import './Home.scss';

/**
 * Home
 * Displays the navigation and the job posting preview
 * 
 * &#x25BC; reference from https://stackoverflow.com/questions/2701192/what-characters-can-be-used-for-up-down-triangle-arrow-without-stem-for-displa 
 * @returns the home page
 */
export default function Home({ setView }) {
  return (
    <section className="homepage">
      <Nav setView={setView} />      

      <main className="home">
        <GetStarted />
        <JobPosting />
      </main>
    </section>
  );
}

/**
 * this component is omitted for this sprint at the moment
 * 
 * @returns 
 */
function GetStarted() {
  return (
    <section className="get-started">
      <section className="get-started-text">
        <h2 className="welcome"> Welcome to Career Connect! </h2>
        <h2 className="get-started-welcome"> let's get you started </h2>

        <button className="get-started-button"> Get Started </button>
      </section>

      <button className="arrow-down"> &#x25BC; </button>
    </section>
  );
}
