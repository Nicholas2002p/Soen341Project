import JobPosting from "./JobPosting";
import Account from "../components/Account";

import './Home.scss';

/**
 * 
 * &#x25BC; reference from https://stackoverflow.com/questions/2701192/what-characters-can-be-used-for-up-down-triangle-arrow-without-stem-for-displa 
 * @returns the home page
 */
export default function Home() {
  return (
    <section className="homepage">
      <nav>
        <p className="logo"> Career Connect </p>
        <NavItems />
        <Account />  
      </nav>

      <main className="home">
        <GetStarted />
        <JobPosting />
      </main>
    </section>
  );
}

function NavItems() {
  return (
    <ul className="nav-list-items">
      <li> <a href=""> Home </a> </li>
      <li> <a href=""> Jobs </a> </li>
    </ul>
  );
}

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
