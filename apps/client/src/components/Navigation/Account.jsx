import { Link, useNavigate } from 'react-router';
import { useAuth } from "../../utils/Auth";
import { googleLogout } from "@react-oauth/google";
import { LogOutApi } from "../../utils/Api";

import NotificationToggle, {
  UnregisterStoredPushInstallation,
} from "../Notifications/NotificationToggle";
import NotificationCenter from "../Notifications/NotificationCenter";

/**
 * Account
 * component shows the profile picture + name of the signed in user
 * 
 * @param {Function} setView
 * @returns the account component 
 */
export default function Account({ setView }) {
  const { token, setToken } = useAuth();

  return (
    <section className="account">
      {!token && <SignIn />}
      {token && <SignedIn setToken={setToken} token={token} />}

    </section>
  );
}

/**
 * Sign In
 * displays the sign in button for the user to sign in
 * 
 * @param {Function} setView 
 * @returns the sign in component
 */
function SignIn({ }) {
  return (
    <>
      <Link to="/registration"> Sign in </Link>

      {/* <a onClick={() => { setView("registration") }}> Sign in </a> */}
    </>
  );
}

/**
 * Signed In 
 * will show that the user is signed in
 * Name display will be shown in sprint 2
 * 
 * @param {Function} setToken 
 * @returns the signed in component
 */
function SignedIn({ setToken, token }) {
  const navigate = useNavigate();

  return (
    <>
      <NotificationCenter token={token} />
      <NotificationToggle token={token} />

      <a onClick={async () => {
        await UnregisterStoredPushInstallation(token);
        await LogOutApi(token);
        googleLogout();
        setToken(null);
        navigate("/");
        // setView("home");
      }}> Logout </a>

    </>
  )
}