import JobPosting from "./JobPosting";
import Account from "../utils/Account";

/**
 * 
 * &#x25BC; reference from https://stackoverflow.com/questions/2701192/what-characters-can-be-used-for-up-down-triangle-arrow-without-stem-for-displa 
 * @returns the home page
 */
export default function Home() {
  return (
    <>
      <nav>
        <p class="logo"> Career Connect </p>
        <NavItems />
        <Account />  
      </nav>

      <main class="home">
        <GetStarted />
        <JobPosting />
      </main>
    </>
  );
}

function NavItems() {
  return (
    <ul class="nav-list-items">
      <li> Home </li>
      <li> Jobs </li>
    </ul>
  );
}

function GetStarted() {
  return (
    <section class="get-started">
      <section class="get-started-text">
        <p> Welcome to Career Connect! </p>
        <p> let's get you started </p>

        <button> Get Started </button>
      </section>

      <button> &#x25BC; </button>
    </section>
  );
}
