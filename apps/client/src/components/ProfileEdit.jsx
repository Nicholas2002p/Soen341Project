import { useState } from 'react';
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
export default function ProfileEdit({ fname, lname, desc, setFName, setLName, setDesc }) {
  const [password, setPassword] = useState('');

  return (
    <section className="profile-edit">
      <h2> EDIT YOUR PROFILE </h2>

      <label htmlFor="">
        First Name: 
        <input className='profile-edit-input' type="text" id="fname" name="fname" maxlength="50" placeholder={fname} onChange={(e) => { setFName(e.target.value) }} />
      </label>

      <label htmlFor="">
        Last Name: 
        <input className='profile-edit-input' type="text" id="lname" name="lname" maxlength="50" placeholder={lname} onChange={(e) => { setLName(e.target.value) }} />
      </label>

      <label htmlFor="">
        Password:
        <input className='profile-edit-input' type="password" maxlength="50" onChange={(e) => { setPassword(e.target.value) }} />
      </label>

      <label htmlFor="">
        Description: 
        <input className='profile-edit-input' type="text" id="desc" maxlength="250" name="desc" placeholder={desc} onChange={(e) => { setDesc(e.target.value) }} />
      </label>

      <label htmlFor="">
        Profile Picture:
        <input className='profile-edit-input' type="file" id="avatar" name="avatar" accept="image/png, image/jpeg" />
      </label>

      <button className='profile-edit-button' button="type" onClick={() => { Save(fname, lname, desc, password) }}>
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
function Save(fname, lname, desc, password) {
  // call the api to update the database
  console.log('first name: ' + fname);
  console.log('last name: ' + lname);
}