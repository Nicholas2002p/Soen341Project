import { useAuth } from "../utils/Auth";
import Account from "./Account";

import "./Nav.scss";

/**
 * Nav
 * displays the navigation bar
 * 
 * @param {function} setView 
 * @returns the nav component
 */
export default function Nav({ setView }) {
  return (
    <nav>
      <p className="logo"> Career Connect </p>
      <NavItems setView={setView} />
      <Account setView={setView} />  
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
  const { token, setToken } = useAuth();

  return (
    <ul className="nav-list-items">
      <a onClick={() => { setView("home")}}> Home </a>
      <a> Jobs </a>
      <a onClick={() => { 
        if (token) {
          setView("profile");
        }
      }}>
        Profile 
      </a>
    </ul>
  );
}