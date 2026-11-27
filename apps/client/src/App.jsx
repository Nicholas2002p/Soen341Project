import { Route, Routes } from 'react-router';
import { useEffect, useState } from 'react';

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

import './App.css';

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
        <Routes>
          <Route path="/" element={<Home setSelectedJob={setSelectedJob} />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/sign-in" element={<Login />} />
          <Route path="/history" element={<JobApplicationHistory />} />
          <Route path="/job-search" element={<JobSearch setSelectedJob={setSelectedJob} />} />
          <Route path="/recruiter-job-posting" element={<RecruiterJobPosting />} />
          <Route path="/job-application/:jobId" element={<JobApplication job={selectedJob}/>} />
          <Route path="/reset-password" element={<PasswordReset />} />
        </Routes>
      </div>
    </AuthContext.Provider>
  );
};

export default Main;


