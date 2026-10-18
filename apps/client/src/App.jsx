import { useState } from 'react';
import './App.css';
import Home from './views/home/Home';
import Profile from './views/profile/Profile';
import Registration from './views/authentication/Registration';
import Login from './views/authentication/Login';

import RecruiterJobPosting from './views/recruiter_job_posting/RecruiterJobPosting';

import { AuthContext } from './utils/Auth';

function Main() {
 const [view, setView] = useState("home");
 const [user, setUser] = useState(null);
 const [token, setToken] = useState(null);

  return (
    <AuthContext.Provider value={{ token, setToken, user, setUser }}>
      <div id="app">
        {view === "home" && <Home setView={setView} /> }
        {view === "profile" && <Profile setView={setView} />}
        {view === "registration" && <Registration setView={setView} />} 
        {view === "sign-in" && <Login setView={setView} />} 
        {view === "recruiter-job-posting" && <RecruiterJobPosting setView={setView} /> }
      </div>
    </AuthContext.Provider>
  );
};

export default Main;
