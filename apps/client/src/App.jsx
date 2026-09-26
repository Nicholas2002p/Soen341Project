import { useState } from 'react';

import './App.css';

import Home from './views/Home';
import Profile from './views/Profile';
import Registration from './views/Registration';

function Main() {
 const [view, setView] = useState("home");

  return (
    <div id="app">
      {view === "home" && <Home setView={setView} /> }
      {view === "profile" && <Profile setView={setView} />}
      {view === "registration" && <Registration setView={setView} />} 
    </div>
  );
};

export default Main;
