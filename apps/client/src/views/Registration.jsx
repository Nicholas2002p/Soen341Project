import { useState } from 'react';
import Password from '../components/Password';
import { useAuth } from '../utils/Auth'
import { RegisterApi } from '../utils/Api';

import "./Registration.scss";

export default function Registration({ setView }) {
    const [fname, setfname] = useState('');
    const [lname, setlname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [passwordType, setPasswordType] = useState(true);
    const [passwordType2, setPasswordType2] = useState(true);
    const { token, setToken } = useAuth();


  return (
    <section className="registration">  
        <main className="loginbox">
            <h2>Register</h2>
            <section className='reg-inside'>

                <div className='password'>
                    <label for="email">Email:</label>
                    <input className='registration-input' type="text " name="email" maxlength="50" onChange={(e) => { setEmail(e.target.value) }} />
                </div>

                <Password labelName={"Password"} passwordType={passwordType} passwordType2={passwordType2} setPasswordType={setPasswordType} setPasswordType2={setPasswordType2} setPassword={setPassword} setConfirmPass={setConfirmPass} />
                
                <Password labelName={"Confirm Password"} passwordType={passwordType} passwordType2={passwordType2} setPasswordType={setPasswordType} setPasswordType2={setPasswordType2} setPassword={setPassword} setConfirmPass={setConfirmPass} />
                
                <div className='password'>
                    <label for="fname">First Name:</label>
                    <input className='registration-input' type="text " name="fname" maxlength="50" onChange={(e) => { setfname(e.target.value) }} />
                </div>

                <div className='password'>
                    <label for="lname"> Last name:</label>
                    <input className='registration-input' type="text " name="lname" maxlength="50" onChange={(e) => { setlname(e.target.value) }} />
                </div>

                <section>
                    Already have an account?
                    <a className='cursor' onClick={() => { setView("sign-in") }}> Sign In </a>
                </section>
                <span class="error-text">
                    {errorMessage}
                </span>
            
                <button className="register-btn" onClick={() => {  RegisterUser(password, confirmPass, setErrorMessage, fname, lname, email, setToken,token,setView) } }> Register </button>
            </section>
        </main>
    </section>
  );
}

/**
 * validates the input fields and then calls the api methods
 * if valid changed screen to profile
 * @param {*} password 
 * @param {*} confirmPass 
 * @param {*} setErrorMessage 
 * @param {*} fname 
 * @param {*} lname 
 * @param {*} email 
 * @param {*} setToken 
 * @param {*} token 
 * @param {*} setView 
 */          
function RegisterUser(password, confirmPass, setErrorMessage, fname, lname, email,setToken,token,setView) { 
    if (email.trim() === "") setErrorMessage("Email is required");

    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) setErrorMessage("Please enter a valid email address");
     
    else if (password === "") setErrorMessage("Password is required");
    
    else if (confirmPass === "") setErrorMessage("Please confirm your password");

    else if (password !== confirmPass) setErrorMessage("Passwords do not match");
    
    else if (fname.trim() === "") setErrorMessage("First name is required");
    
    else if (lname.trim() === "") setErrorMessage("Last name is required");
    
    else {
        setErrorMessage("");
        const allGood = RegisterApi(fname, lname, email, password, setErrorMessage, setToken,token);
        if(allGood) setView("profile");
    }
}
