import { useState } from 'react';

import { useAuth } from '../utils/Auth';
import { UpdateProfileApi, UpdateProfileImageApi } from '../utils/Api';
import './ProfileEdit.scss';

/**
 * Profile Edit
 * this component lets you edit the profile information in the database
 * 
 * @param {string} props.fname - The user's first name.
 * @param {string} props.lname - The user's last name.
 * @param {string} props.desc - The user's description.
 * @param {Function} props.setFName - Updates the first name state.
 * @param {Function} props.setLName - Updates the last name state.
 * @param {Function} props.setDesc - Updates the description state.
 * @returns the profile edit component
 */
export default function ProfileEdit({ fname, lname, desc, old_profile, setFName, setLName, setDesc, setProfileURL }) {
  const { token, setToken } = useAuth();
  const [password, setPassword] = useState('');

  const [phone, setPhone] = useState(null);
  const [location, setLocation] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [file, setFile] = useState(null);

  return (
    <section className="profile-edit">
      <h2> EDIT YOUR PROFILE </h2>

      <label htmlFor="">
        First Name: 
        <input className='profile-edit-input' type="text" id="fname" name="fname" maxLength="50" placeholder={fname} 
          onChange={(e) => { setFName(e.target.value) }} 
        />
      </label>

      <label htmlFor="">
        Last Name: 
        <input className='profile-edit-input' type="text" id="lname" name="lname" maxLength="50" placeholder={lname} 
          onChange={(e) => { setLName(e.target.value) }} 
        />
      </label>

      {/* <label htmlFor="">
        Password:
        <input className='profile-edit-input' type="password" maxlength="50" 
          onChange={(e) => { setPassword(e.target.value) }} 
        />
      </label> */}

      <label htmlFor="">
        Phone:
        <input className='profile-edit-input' type="tel" id="phone" name="phone" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" placeholder={phone} 
          onChange={(e) => { setPhone(e.target.value) }} 
        />
      </label>

      <label htmlFor="">
        Location:  
        <input className='profile-edit-input' type="text" id="location" maxLength="250" name="location" placeholder={location} 
          onChange={(e) => { setLocation(e.target.value) }} 
        />
      </label>

      <label htmlFor="">
        Description: 
        <input className='profile-edit-input' type="text" id="desc" maxLength="250" name="desc" placeholder={desc} 
          onChange={(e) => { setDesc(e.target.value) }} 
        />
      </label>

      <label htmlFor="">
        Profile Picture:
        <input className='profile-edit-input' type="file" id="avatar" name="avatar" accept="image/png, image/jpeg" 
          onChange={(e) => { setFile(e.target.files?.[0] ?? null) }}
        />
      </label>

      {/* <span> Error: {errorMessage} </span> */}

      <button className='profile-edit-button' button="type" 
        onClick={() => { Save(fname, lname, phone, desc, location, file, setProfileURL, setErrorMessage, token, password, old_profile) }}
      >
        Save
      </button>
    </section>
  );
}

/**
 * This function saves the edited information into the database
 * NOTE: ensure there's a modification with a check
 * 
 * @param {*} fname 
 * @param {*} lname 
 * @param {*} desc 
 * @param {*} password 
 */
async function Save(fname, lname, phone, desc, location, file, setProfileURL, setErrorMessage, token, password, old_profile) {
  if (password.trim() !== "") {
    // call api to update the password
  }

  if (file) {
    const profile = await UpdateProfileImageApi(file, setErrorMessage, token);
    if (profile?.profileURL) {
      setProfileURL(profile.profileURL);
    }
  }

  if (fname !== old_profile.firstName || lname !== old_profile.lastName || phone !== old_profile.phone || desc !== old_profile.bio || location !== old_profile.location) {
    await UpdateProfileApi(fname, lname, phone, desc, location, setErrorMessage, token);
  }
}