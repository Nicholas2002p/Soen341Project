import { useState, useEffect } from 'react';
import { useAuth } from '../../utils/Auth';
import {
  GetProfileApi,
  GetSavedJobsApi,
  SendTestEmailApi,
  SendTestNotificationApi,
} from '../../utils/Api';
import ProfileCard from '../../components/Profile/ProfileCard';
import ProfileEdit from '../../components/Profile/ProfileEdit';
import ResumeUpload from '../../components/Profile/ResumeUpload';
import SavedJobs from '../../components/Profile/SaveJob';
import Nav from '../../components/Navigation/Nav';

import './Profile.scss';

/**
 * Profile
 * this displays the profile id card + profile edit + resume upload
 * 
 * @returns Profile component
 */
export default function Profile() {
  const { token, user } = useAuth();
  const [data, setData] = useState({});
  const [savedJobs, setSaveJobs] = useState([]); 
 
  const [fname, setFName] = useState('');
  const [lname, setLName] = useState('');
  const [profileURL, setProfileURL] = useState(null);
  const [role, setRole] = useState('ROLE');
  const [desc, setDesc] = useState(null);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [sendingNotification, setSendingNotification] = useState(false);
  const [emailMessage, setEmailMessage] = useState('');
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  
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

    async function getSavedJobs() {
      const saved = await GetSavedJobsApi(token);
      setSaveJobs(saved);
    }

    getProfile();
    getSavedJobs();
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

  const sendTestEmail = async () => {
    setSendingTestEmail(true);
    setEmailMessage('');
    try {
      await SendTestEmailApi(token);
      setEmailMessage('A test email has been sent.');
    } catch (error) {
      console.error('Test email failed:', error);
      setEmailMessage(error instanceof Error ? error.message : 'Test email could not be sent.');
    } finally {
      setSendingTestEmail(false);
    }
  };

  return (
    <main className="profilepage">
      <Nav profileURL={profileURL} />

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

          { user?.role === "jobseeker" ? <SavedJobs savedJobs={savedJobs} /> : ""}
          
          <ResumeUpload />
          <section className="notification-test">
            <h2>Notifications</h2>
            <button type="button" onClick={sendTestNotification} disabled={sendingNotification}>
              {sendingNotification ? 'Sending...' : 'Send test notification'}
            </button>
            {notificationMessage && <p role="status">{notificationMessage}</p>}
          </section>
          <section className="email-actions">
            <h2>Email</h2>
            <button type="button" onClick={sendTestEmail} disabled={sendingTestEmail}>
              {sendingTestEmail ? 'Sending...' : 'Send generic test email'}
            </button>
            {emailMessage && <p role="status">{emailMessage}</p>}
          </section>
        </section>
      </section>
    </main>
  );
}
