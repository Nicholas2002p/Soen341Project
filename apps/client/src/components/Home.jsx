import JobPosting from "./JobPosting";
import Account from "../utils/Account";

export default function Home() {
  return (
    <>
      <nav>
        <p class="logo"> Career Connect </p>
        
        <ul>
          <li> Home </li>
          <li> Jobs </li>
        </ul>
        
        <Account />  
      </nav>

      <main class="home">
        <section class="get-started">
          <p> Welcome to Career Connect! </p>
          <p> let's get you started </p>

          <button> Get Started </button>
        </section>

        <JobPosting />
      </main>
    </>
  );
}



