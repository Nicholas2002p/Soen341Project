import { useState } from 'react';
import Home from './views/Home';
import Profile from './views/Profile';

import './App.css';

function Main() {
 const [view, setView] = useState("home");

  return (
    <div id="app">
      {view === "home" && <Home setView={setView} /> }
      {view === "profile" && <Profile setView={setView} />}
    </div>
  );
};

export default Main;
