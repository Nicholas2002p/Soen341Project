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
  const { token, user } = useAuth();
  const [data, setData] = useState({});
 
  const [fname, setFName] = useState('');
  const [lname, setLName] = useState('');
  const [profileURL, setProfileURL] = useState(null);
  const [role, setRole] = useState('ROLE');
  const [desc, setDesc] = useState(null);
  
  useEffect(() => {
    console.log("PROFILE EFFECT", token);

    if (!token) return;
    const getProfile = async () => {
      const data = await GetProfileApi(token);
      if (!data) return;
      const profile = data.profile; 

      setData(profile);
      setFName(profile.firstName);
      setLName(profile.lastName);
      setRole(user?.role ?? 'ROLE');
      setProfileURL(profile.profileURL);
      setDesc(profile.bio);
    };
    getProfile();
    
  }, [token, user?.role]);

  return (
    <main className="profilepage">
      <Nav setView={setView} profileURL={profileURL} />

      <section className='profile'>
        <ProfileCard profileURL={profileURL} fname={fname} lname={lname} role={role} desc={desc} />

        <section className='profile-modifications'>
          <ProfileEdit 
            fname={fname}
            lname={lname} 
            desc={desc}
            old_profile={data}
            setFName={setFName}
            setLName={setLName}
            setDesc={setDesc} 
            setProfileURL={setProfileURL}
          />
          <ResumeUpload />
        </section>
      </section>
    </main>
  );
}
