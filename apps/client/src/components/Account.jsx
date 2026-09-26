/**
 * Account
 * component shows the profile picture + name of the signed in user
 * 
 * @returns the account component 
 */
export default function Account() {
  return (
    <section className="account">
      <img src="random-pfp.PNG" alt="" />
      <a href=""> Sign in </a>
    </section>
  );
}