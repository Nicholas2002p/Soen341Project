import './ProfileCard.scss';

export default function ProfileCard({ fname, lname, role, desc }) {
  return (
    <section className="profile-card">
      <section className='profile-card-display'>
        <div className='card-hole'>  </div>
        <section className='profile-card-information'>
          <img src="random-pfp.PNG" alt="" />
          <section className='profile-card-information-text'>
            <p className="card-name"> {lname}, {fname} </p>
            <p className="card-role"> {role} </p>
            <p className="card-description"> {desc} </p>
          </section>
        </section>
      </section>
    </section>
  );
}