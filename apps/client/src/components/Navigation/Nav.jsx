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
export default function Nav({ setView, profileURL }) {
  return (
    <nav>
      <p className="logo"> Career Connect </p>
      <NavItems setView={setView} />
      <Account setView={setView} profileURL={profileURL} />  
    </nav>
  );
}

/**
 * Nav Items
 * list of the links we can navigate to
 * 
 * @returns the nav item component
 */
function NavItems({ setView }) {
  const { token } = useAuth();
  console.log(`toekn = ${token}`)
  return (
    <ul className="nav-list-items">
      <a onClick={() => { setView("home")}}> Home </a>
      <a onClick={() => { setView("job-search") }}> Jobs </a>
      {token && <a onClick={() => setView("profile")}> Profile </a>}
      {token && <a onClick={() => setView("recruiter-job-posting")}> Post a Job </a>}

    </ul>
  );
}

// NOTE: if user is a recruiter and the token is valid for next PR change