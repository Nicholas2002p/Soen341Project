import { useState, useEffect } from 'react';
import { useAuth } from '../utils/Auth';
import { GetProfileApi }from '../utils/Api';

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
  const { token, setToken } = useAuth();
 
  const [fname, setFName] = useState('FNAME');
  const [lname, setLName] = useState('LNAME');
  const [role, setRole] = useState('ROLE');
  const [desc, setDesc] = useState('DESC');

  useEffect(() => {

    console.log("PROFILE EFFECT", token);

    if (!token) return;
      const getProfile = async () => {
            const data = await GetProfileApi(token);
            if (!data) return;
            setFName(data.profile.firstName);
            setLName(data.profile.lastName);
            setDesc(data.profile.bio);
      };
      getProfile();
}, []);

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