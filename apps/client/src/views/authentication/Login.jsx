import { Link, useNavigate } from 'react-router';
import { useState } from 'react';
import { useAuth } from '../../utils/Auth'
import { LogInApi, RequestPasswordResetApi } from '../../utils/Api';

import Password from '../../components/Registration/Password';
import GoogleSignIn from '../../components/Registration/google';

import "./Registration.scss";

/**
 * Displays the sign in for users
 * @returns returns the sign in page
 */
export default function Login({  }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [passwordType, setPasswordType] = useState(true);
    const [passwordType2, setPasswordType2] = useState(true);
    const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');
    const [sendingForgotPassword, setSendingForgotPassword] = useState(false);
    const { setToken, setUser } = useAuth();

    const requestForgotPassword = async () => {
        const resetEmail = window.prompt('Enter your email address for a password reset:', email);
        if (resetEmail === null) return;

        const normalizedEmail = resetEmail.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            setForgotPasswordMessage('Please enter a valid email address.');
            return;
        }

        setSendingForgotPassword(true);
        setForgotPasswordMessage('');
        try {
            await RequestPasswordResetApi(normalizedEmail);
            setForgotPasswordMessage('If an account exists for that email, a password reset email has been sent.');
        } catch (error) {
            setForgotPasswordMessage(error instanceof Error ? error.message : 'Password reset email could not be sent.');
        } finally {
            setSendingForgotPassword(false);
        }
    };

    return (
        <section className="registration">
            <main className="loginbox">
                <h2>Login</h2>
                <section className='reg-inside'>

                    <div className='password'>
                        <label htmlFor="email">Email:</label>
                        <input className='registration-input' type="text " name="email" maxLength="50" onChange={(e) => { setEmail(e.target.value) }} />
                    </div>

                    <Password labelName={"Password"} passwordType={passwordType} passwordType2={passwordType2} setPasswordType={setPasswordType} setPasswordType2={setPasswordType2} setPassword={setPassword} />

                    <section>
                        Don't have an account?
                        
                        <Link className="cursor" to='/registration'> Register </Link>
                        {/* <a className='cursor' onClick={() => { setView("registration") }}> Register </a> */}
                    </section>
                    <button type="button" className="cursor" onClick={requestForgotPassword} disabled={sendingForgotPassword}>
                        {sendingForgotPassword ? 'Sending...' : 'Forgot password?'}
                    </button>
                    {forgotPasswordMessage && <span className="error-text" role="status">{forgotPasswordMessage}</span>}

                    <span className="error-text">
                        {errorMessage}
                    </span>

                    <button className="register-btn" onClick={() => { RegisterUser(password, setErrorMessage, email, setToken, setUser) }}> Log in </button>
                    <GoogleSignIn setToken={setToken} setUser={setUser}  />
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
 */
async function RegisterUser(password, setErrorMessage, email, setToken, setUser) {
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
        const allGood = await LogInApi(email, password, setErrorMessage, setToken, setUser);
        if (allGood) useNavigate("/profile");
        
        // if (allGood) setView("profile");
    }
}
