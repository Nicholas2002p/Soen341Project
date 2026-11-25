import { useEffect, useState } from 'react';
import './App.css';
import JobApplicationHistory from './views/history/JobApplicationHistory';
import JobApplication from './views/application/JobApplication';
import Home from './views/home/Home';
import Profile from './views/profile/Profile';
import Registration from './views/authentication/Registration';
import Login from './views/authentication/Login';
import JobSearch from './views/job_search/JobSearch'
import RecruiterJobPosting from './views/recruiter_job_posting/RecruiterJobPosting';
import PasswordReset from './views/authentication/PasswordReset';


import { AuthContext } from './utils/Auth';
import { GetCurrentUserApi } from './utils/Api';

// Key used to keep the session token in the browser
const SESSION_TOKEN_KEY = 'careerconnect.sessionToken';

function readStoredToken() {
  try {
    return localStorage.getItem(SESSION_TOKEN_KEY);
  } catch {
    // Storage can be unavailable (for example in private browsing)
    return null;
  }
}

function Main() {
  const [view, setView] = useState(
    window.location.pathname === '/reset-password'
      ? 'reset-password'
      : window.location.pathname === '/login'
        ? 'sign-in'
        : 'home'
  );
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(readStoredToken);
  const [selectedJob, setSelectedJob] = useState(null);
  // Save the token so a page refresh does not log the user out, and remove it on logout
  useEffect(() => {
    try {
      if (token) {
        localStorage.setItem(SESSION_TOKEN_KEY, token);
      } else {
        localStorage.removeItem(SESSION_TOKEN_KEY);
      }
    } catch {
      // Storage can be unavailable, the session then only lasts until the next refresh
    }
  }, [token]);

  // After a refresh, get the user back from the server, or drop the token if the session expired
  useEffect(() => {
    if (!token || user) {
      return;
    }

    let cancelled = false;

    GetCurrentUserApi(token).then((currentUser) => {
      if (cancelled) {
        return;
      }

      if (currentUser) {
        setUser(currentUser);
      } else if (currentUser === null) {
        // Only drop the token when the server says the session is no longer valid
        setToken(null);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [token, user]);


  return (
    <AuthContext.Provider value={{ token, setToken, user, setUser }}>
      <div id="app">
        {view === "home" && <Home setView={setView} setSelectedJob={setSelectedJob} />}
        {view === "profile" && <Profile setView={setView} />}
        {view === "registration" && <Registration setView={setView} />} 
        {view === "sign-in" && <Login setView={setView} />} 
        {view === "history" && <JobApplicationHistory setView={setView}/>}
        {view === "job-search" && <JobSearch setView={setView} setSelectedJob={setSelectedJob} />} 
        {view === "recruiter-job-posting" && <RecruiterJobPosting setView={setView} /> }
        {view === "job-application" && <JobApplication setView={setView} job={selectedJob}/> }
        {view === "reset-password" && <PasswordReset setView={setView} />}
      </div>
    </AuthContext.Provider>
  );
};

export default Main;


