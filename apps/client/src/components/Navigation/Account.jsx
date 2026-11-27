import { Link, useNavigate } from 'react-router';
import { useAuth } from "../../utils/Auth";
import { googleLogout } from "@react-oauth/google";
import { LogOutApi } from "../../utils/Api";
import { UnregisterStoredPushInstallation } from "../Notifications/NotificationToggle";
import NotificationCenter from "../Notifications/NotificationCenter";

/**
 * Account
 * component shows the profile picture + name of the signed in user
 * 
 * @returns the account component 
 */
export default function Account() {
  const navigate = useNavigate();
  const { token, setToken } = useAuth();

  return (
    <section className="account">
      {!token && <SignIn />}
      {token && <SignedIn navigate={navigate} setToken={setToken} token={token} />}

    </section>
  );
}

/**
 * Sign In
 * displays the sign in button for the user to sign in
 * 
 * @returns the sign in component
 */
function SignIn() {
  return (
    <>
      <Link to="/registration"> Sign in </Link>
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
function SignedIn({ navigate, setToken, token }) {
  return (
    <>
      <NotificationCenter token={token} />
      <a onClick={async () => {
        await UnregisterStoredPushInstallation(token);
        await LogOutApi(token);
        googleLogout();
        setToken(null);
        navigate("/");
      }}> Logout </a>

    </>
  )
}