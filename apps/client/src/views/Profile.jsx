import { useState } from 'react';

import ProfileCard from '../components/ProfileCard';
import ProfileEdit from '../components/ProfileEdit';
import ResumeUpload from '../components/ResumeUpload';
import Nav from '../components/Nav';

import './Profile.scss';

/**
 * Profile
 * this displays the profile id card + profile edit + resume upload
 * 
 * @returns Profile component
 */
export default function Profile({ setView }) {
  const [fname, setFName] = useState('FNAME');
  const [lname, setLName] = useState('LNAME');
  const [role, setRole] = useState('ROLE');
  const [desc, setDesc] = useState('DESC');

  return (
    <main className="profilepage">
      <Nav setView={setView} />

      <section className='profile'>
        <ProfileCard fname={fname} lname={lname} role={role} desc={desc} />

        <section className='profile-modifications'>
          <ProfileEdit 
            fname={fname}
            lname={lname} 
            desc={desc}
            setFName={setFName}
            setLName={setLName}
            setDesc={setDesc} 
          />
          <ResumeUpload />
        </section>
      </section>
    </main>
  );
}