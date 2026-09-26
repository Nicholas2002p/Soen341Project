/**
 * Account
 * component shows the profile picture + name of the signed in user
 * 
 * @returns the account component 
 */
export default function Account({ setView }) {
  return (
    <section className="account">
      <img src="random-pfp.PNG" alt="" />
      <a onClick={ () => { setView("registration") }}> Sign in </a>
    </section>
  );
}