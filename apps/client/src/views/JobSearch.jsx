import JobPosting from "./JobPosting";
import Nav from '../components/Nav';
import { useState } from "react";

export default function JobSearch({ setView }) {
    const [searchBar, setSearchBar] = useState('');

  return (
    <section className="homepage">
      <Nav setView={setView} />      
          <div className='searchBar'>
              <label htmlfor="search">Job Search</label>
              <input className='registration-input' type="text" name="search" maxLength="50" onChange={(e) => { setSearchBar(e.target.value) }} />
          </div>
      <main className="home">
        
        <JobPosting />
      </main>
    </section>
  );
}
