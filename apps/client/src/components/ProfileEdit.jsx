import { useState } from 'react';
import './ProfileEdit.scss';

export default function ProfileEdit({ fname, lname, desc, setFName, setLName, setDesc }) {
  const [password, setPassword] = useState('');

  return (
    <section className="profile-edit">
      <h2> EDIT YOUR PROFILE </h2>

      <label htmlFor="">
        First Name: 
        <input type="text" id="fname" name="fname" maxlength="50" placeholder={fname} onChange={(e) => { setFName(e.target.value) }} />
      </label>

      <label htmlFor="">
        Last Name: 
        <input type="text" id="lname" name="lname" maxlength="50" placeholder={lname} onChange={(e) => { setLName(e.target.value) }} />
      </label>

      <label htmlFor="">
        Password:
        <input type="password" maxlength="50" onChange={(e) => { setPassword(e.target.value) }} />
      </label>

      <label htmlFor="">
        Description: 
        <input type="text" id="desc" maxlength="250" name="desc" placeholder={desc} onChange={(e) => { setDesc(e.target.value) }} />
      </label>

      <label htmlFor="">
        Profile Picture:
        <input type="file" id="avatar" name="avatar" accept="image/png, image/jpeg" />
      </label>

      <button className='profile-edit-button' button="type" onClick={() => { Save(fname, lname, desc, password) }}>
        Save
      </button>
    </section>
  );
}

function Save(fname, lname, desc, password) {
  // call the api to update the database
  console.log('first name: ' + fname);
  console.log('last name: ' + lname);
}