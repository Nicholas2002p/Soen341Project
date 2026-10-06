import './ProfileCard.scss';
import { getApiUrl } from '../utils/Api';

/**
 * Profile Card
 * this displays:
 *  - profile picture
 *  - last name, first name
 *  - role
 *  - description
 * 
 * @param {Object} props
 * @param {string} props.fname - The user's first name.
 * @param {string} props.lname - The user's last name.
 * @param {string} props.role - The user's current role (job seeker, recruiter)
 * @param {string} props.desc - A short description of the user.
 * @returns the profile card component
 */
export default function ProfileCard({ profileURL, fname, lname, role, desc }) {
  const userRole = role === "jobseeker" ? "Job Seeker" : "Recruiter";

  return (
    <section className="profile-card">
      <section className='profile-card-display'>
        <div className='card-hole'>  </div>
        <section className='profile-card-information'>
          <img src={profileURL === null ? "random-pfp.PNG" : getApiUrl(profileURL)} alt="" />
          <section className='profile-card-information-text'>
            <p className="card-name"> {lname}, {fname} </p>
            <p className="card-role"> {userRole} </p>
            <p className="card-description"> {desc} </p>
          </section>
        </section>
      </section>
    </section>
  );
}