import { useState, useContext, createContext } from 'react';
import './App.css';

import Home from './views/Home';
import Profile from './views/Profile';
import Registration from './views/Registration';
import Login from './views/Login';

export const AuthContext = createContext();

function Main() {
 const [view, setView] = useState("home");
 const [token, setToken] = useState(null);

  return (
    <AuthContext.Provider value={{ token, setToken }}>
      <div id="app">
        {view === "home" && <Home setView={setView} /> }
        {view === "profile" && <Profile setView={setView} />}
        {view === "registration" && <Registration setView={setView} />} 
        {view === "sign-in" && <Login setView={setView} />} 
      </div>
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}

export default Main;

