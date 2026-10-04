import { useState } from 'react';
import './App.css';
import Home from './views/Home';
import Profile from './views/Profile';
import Registration from './views/Registration';
import Login from './views/Login';
import JobSearch from './views/JobSearch';

import { AuthContext } from './utils/Auth'

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
        {view === "job-search" && <JobSearch setView={setView} />} 

      </div>
    </AuthContext.Provider>
  );
};

export default Main;


