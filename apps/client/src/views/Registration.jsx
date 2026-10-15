import { useState } from 'react';
import Password from '../components/Password';
import { useAuth } from '../utils/Auth';
import { RegisterApi } from '../utils/Api';

import "./Registration.scss";

/**
 * Displays the registration for users
 * @param {function} setView 
 * @returns the registration page
 */
export default function Registration({ setView }) {
    const [fname, setFName] = useState('');
    const [lname, setLName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [passwordType, setPasswordType] = useState(true);
    const [passwordType2, setPasswordType2] = useState(true);
    const [checked, setChecked] = useState(false);

    const { setToken, setUser } = useAuth();

    return (
        <section className="registration">  
            <main className="loginbox">
                <h2>Register</h2>
                <section className='reg-inside'>

                    <div className='password'>
                        <label htmlFor="email">Email:</label>
                        <input className='registration-input' type="text " name="email" maxLength="50" onChange={(e) => { setEmail(e.target.value) }} />
                    </div>

                    <Password labelName={"Password"} passwordType={passwordType} passwordType2={passwordType2} setPasswordType={setPasswordType} setPasswordType2={setPasswordType2} setPassword={setPassword} setConfirmPass={setConfirmPass} />
                    
                    <Password labelName={"Confirm Password"} passwordType={passwordType} passwordType2={passwordType2} setPasswordType={setPasswordType} setPasswordType2={setPasswordType2} setPassword={setPassword} setConfirmPass={setConfirmPass} />
                    
                    <div className='password'>
                        <label htmlFor="fname">First Name:</label>
                        <input className='registration-input' type="text " name="fname" maxLength="50" onChange={(e) => { setFName(e.target.value) }} />
                    </div>

                    <div className='password'>
                        <label htmlFor="lname"> Last name:</label>
                        <input className='registration-input' type="text " name="lname" maxLength="50" onChange={(e) => { setLName(e.target.value) }} />
                    </div>

                    <div className='recruiter'>
                        <label htmlFor="role"> Recruiter:</label>
                        <input  type="checkbox" name="role" checked={checked} onChange={() => setChecked(prev => !prev)}/>
                    </div>

                    <section>
                        Already have an account?
                        <a className='cursor' onClick={() => { setView("sign-in") }}> Sign In </a>
                    </section>
                    <span className="error-text">
                        {errorMessage}
                    </span>
                
                    <button className="register-btn" onClick={() => {  RegisterUser(password, confirmPass, setErrorMessage, fname, lname, email, setToken, setView, checked, setUser) } }> Register </button>
                </section>
            </main>
        </section>
    );
}

/**
 * validates the input fields and then calls the api methods
 * if valid changed screen to profile
 * @param {string} password 
 * @param {string} confirmPass 
 * @param {function} setErrorMessage 
 * @param {string} fname 
 * @param {string} lname 
 * @param {string} email 
 * @param {functio} setToken 
 * @param {string} token 
 * @param {functio} setView 
 */          
async function RegisterUser(password, confirmPass, setErrorMessage, fname, lname, email, setToken, setView, checked, setUser) { 
    if (email.trim() === "") setErrorMessage("Email is required");

    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) setErrorMessage("Please enter a valid email address");
     
    else if (password === "") setErrorMessage("Password is required");
    
    else if (confirmPass === "") setErrorMessage("Please confirm your password");

    else if (password !== confirmPass) setErrorMessage("Passwords do not match");
    
    else if (fname.trim() === "") setErrorMessage("First name is required");
    
    else if (lname.trim() === "") setErrorMessage("Last name is required");
    
    else {
        const role = checked ? "recruiter" : "jobseeker";
        setErrorMessage("");
        const allGood = await RegisterApi(fname, lname, email, password, setErrorMessage, setToken, role, setUser);
        if(allGood) {
            setView("profile");
        };
    }
}
