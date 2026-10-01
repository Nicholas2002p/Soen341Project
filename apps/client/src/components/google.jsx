import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { GoogleLogInApi } from "../utils/Api";

export default function GoogleSignIn({ setToken, setUser, setView }) {
  const [error, setError] = useState(null);

 const handleLogin = async (googleData) => {
    setError(null);
    const allGood = await GoogleLogInApi(googleData.credential, setError, setToken, setUser);
    if (allGood) setView("profile");
  };

  const handleError = (error) => {
    console.error("Error logging in with google:", error);
    setError("Google sign-in failed. Please try again.");
  };

  return (
    <div>
      <GoogleLogin onSuccess={handleLogin} onError={handleError} />
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}