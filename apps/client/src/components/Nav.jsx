import Account from "./Account";
import "./Nav.scss";

export default function Nav({ setView }) {
  return (
    <nav>
      <p className="logo"> Career Connect </p>
      <NavItems setView={setView} />
      <Account />  
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
  return (
    <ul className="nav-list-items">
      <a onClick={() => { setView("home")}}> Home </a>
      <a> Jobs </a>
      <a onClick={() => { setView("profile")}}> Profile </a>
    </ul>
  );
}