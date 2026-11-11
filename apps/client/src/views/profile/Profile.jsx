import { useState, useEffect } from 'react';
import { useAuth } from '../../utils/Auth';
import { GetProfileApi, SendTestNotificationApi }from '../../utils/Api';

import ProfileCard from '../../components/Profile/ProfileCard';
import ProfileEdit from '../../components/Profile/ProfileEdit';
import ResumeUpload from '../../components/Profile/ResumeUpload';
import Nav from '../../components/Navigation/Nav';

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
  const [notificationMessage, setNotificationMessage] = useState('');
  const [sendingNotification, setSendingNotification] = useState(false);
  
  useEffect(() => {
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

  const sendTestNotification = async () => {
    setSendingNotification(true);
    setNotificationMessage('');
    try {
      const sent = await SendTestNotificationApi(token);
      setNotificationMessage(sent
        ? 'Test notification sent.'
        : 'Test notification could not be sent.');
    } catch (error) {
      console.error('Test notification failed:', error);
      setNotificationMessage('Test notification could not be sent.');
    } finally {
      setSendingNotification(false);
    }
  };

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
          <section className="notification-test">
            <h2>Notifications</h2>
            <button type="button" onClick={sendTestNotification} disabled={sendingNotification}>
              {sendingNotification ? 'Sending...' : 'Send test notification'}
            </button>
            {notificationMessage && <p role="status">{notificationMessage}</p>}
          </section>
        </section>
      </section>
    </main>
  );
}
