import './ProfileCard.scss';

export default function ProfileCard({ fname, lname, role, desc }) {
  return (
    <section className="profile-card">
      <img src="random-pfp.PNG" alt="" />
      <p className="card-name"> {lname}, {fname} </p>
      <p className="card-role"> {role} </p>
      <p className="card-description"> {desc} </p>
    </section>
  );
}