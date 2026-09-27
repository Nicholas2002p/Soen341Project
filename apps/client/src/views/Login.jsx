import { useState } from 'react';
import "./Registration.scss";
import Password from '../components/Password';
import { useAuth } from '../utils/Auth'
import {LogInApi} from '../utils/Api';

/**
 * Displays the sign in for users
 * @param {function} setView
 * @returns returns the sign in page
 */
export default function Login({ setView }) {
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
            <h2>Login</h2>
            <section className='reg-inside'>

                <div className='password'>
                    <label for="email">Email:</label>
                    <input className='registration-input' type="text " name="email" maxlength="50" onChange={(e) => { setEmail(e.target.value) }} />
                </div>

                <Password labelName={"Password"} passwordType={passwordType} passwordType2={passwordType2} setPasswordType={setPasswordType} setPasswordType2={setPasswordType2} setPassword={setPassword} setConfirmPass={setConfirmPass} />
                            
                <section>
                    Don't have an account?
                    <a className='cursor' onClick={() => { setView("registration") }}> Register </a>
                </section>

                <span class="error-text">
                    {errorMessage}
                </span>
            
                <button className="register-btn" onClick={() => {  RegisterUser(password,  setErrorMessage, email, setToken,setView) } }> Log in </button>
            </section>
        </main>
    </section>
  );
}

         
/**
 * validates the input fields and then calls the api methods
 * if valid changed screen to profile
 * @param {string} password 
 * @param {function} setErrorMessage 
 * @param {string} email 
 * @param {function} setToken 
 * @param {function} setView 
 */
async function RegisterUser(password, setErrorMessage,email,setToken,setView) { 
    if (email.trim() === "") {
        setErrorMessage("Email is required");
    } 

    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setErrorMessage("Please enter a valid email address");
    } 

    else if (password === "") {
        setErrorMessage("Password is required");
    } 
    
    else {
        setErrorMessage("");
        const allGood = await LogInApi( email, password, setErrorMessage, setToken);
        if(allGood) setView("profile");
    }
}
