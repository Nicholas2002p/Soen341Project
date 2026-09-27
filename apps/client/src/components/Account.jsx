import { useState } from 'react';
import { useAuth } from "../utils/Auth";

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
      { !token && <SignIn setView={setView} /> }
      { token && <SignedIn setView={setView} setToken={setToken} /> }
      
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
function SignIn({ setView }) {
  return (
    <>
      <img src="random-pfp.PNG" alt="" />
      <a onClick={ () => { setView("registration") }}> Sign in </a>
    </>
  );
}

/**
 * Signed In 
 * will show that the user is signed in
 * Name display will be shown in sprint 2
 * 
 * @param {Function} setView
 * @param {Function} setToken 
 * @returns the signed in component
 */
function SignedIn({ setView, setToken }) {
  return (
    <>
      <img src="random-pfp.PNG" alt="" />
      <a onClick={ () => { setView("home"); setToken(null) }}> Logout </a>
    </>
  )
}