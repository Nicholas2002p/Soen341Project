import { Link } from 'react-router';
import { useAuth } from "../../utils/Auth";
import Account from "./Account";

import "./Nav.scss";

/**
 * Nav
 * displays the navigation bar
 * 
 * @param {function} setView 
 * @returns the nav component
 */
export default function Nav({ profileURL }) {
  return (
    <nav>
      <p className="logo"> Career Connect </p>
      <NavItems />
      <Account profileURL={profileURL} />  
    </nav>
  );
}

/**
 * Nav Items
 * list of the links we can navigate to
 * 
 * @returns the nav item component
 */
function NavItems({ }) {
  const { token, user } = useAuth();

  return (
    <ul className="nav-list-items">
      <Link to="/"> Home </Link>
      { token && user?.role != "recruiter" && <Link to="/history"> History </Link>}
      
      <Link to="/job-search"> Jobs </Link>
      
      {token && <Link to="/profile"> Profile </Link>}

      {token && user?.role === "recruiter" && <Link to="/recruiter-job-posting"> Post a Job </Link>} 

      {/* <a onClick={() => { setView("home")}}> Home </a>
      { token && user?.role != "recruiter" && <a onClick={() => { setView("history") }}> History </a>}
      <a onClick={() => { setView("job-search") }}> Jobs </a>
      {token && <a onClick={() => setView("profile")}> Profile </a>}
      {token && user?.role === "recruiter" && (
      <a onClick={() => setView("recruiter-job-posting")}> Post a Job </a>
      )} */}
    </ul>
  );
}
