import { useState } from 'react';
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


  return (
        <section className="registration">  
            <main className="loginbox">
                <h2>Register</h2>
                <section className='reg-inside'>

                    <div className='password'>
                        <label for="email">Email:</label>
                        <input type="text " name="email" maxlength="50" onChange={(e) => { setEmail(e.target.value) }} />
                    </div>

                    <div className='password'>
                        <label for="password">Password:</label>
                        <div className="password-display">
                            <input type={passwordType ? "password": "text" } name="password" maxlength="50" onChange={(e) => { setPassword(e.target.value) }} />
                            <button className="eye" onClick={() => {setPasswordType(!passwordType)}}>p</button>
                        </div>
                    </div>

                    <div className='password'>
                        <label for="confirm-password ">Password:</label>
                        <div className="password-display">
                            <input type={passwordType2 ? "password": "text" } name="confirm-password" maxlength="50" onChange={(e) => { setConfirmPass(e.target.value) }} />
                            <button className="eye" onClick={() => {setPasswordType2(!passwordType2)}}>p</button>
                        </div>
                    </div>
                    
                    <div className='password'>
                        <label for="fname">First Name:</label>
                        <input type="text " name="fname" maxlength="50" onChange={(e) => { setfname(e.target.value) }} />
                    </div>

                    <div className='password'>
                        <label for="lname"> Last name:</label>
                        <input type="text " name="lname" maxlength="50" onChange={(e) => { setlname(e.target.value) }} />
                    </div>

                    <section>
                        Already have an account?
                        <a onClick={() => { setView("sign-in") }}> Sign In </a>
                    </section>
                    <span class="error-text">
                        {errorMessage}
                    </span>
                
                    <button className="register-btn" onClick={() => {  RegisterUser(password, confirmPass, setErrorMessage, fname, lname, email) } }> Register </button>
                </section>
            </main>
        </section>
  );
}
          
function RegisterUser(password, confirmPass, setErrorMessage, fname, lname, email) { 
    if (password != confirmPass) {
        setErrorMessage("Passwords do not match");
    } else {
        setErrorMessage("");
        RegisterApi(fname, lname, email, password);
    }
}

async function RegisterApi(fname, lname, email, password){
    try{
        const response = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        });
         console.log("Status:", response.status);
         const data = await response.json();
         
         if (!response.ok) {
        console.error("Error Message:", data.message || data.msg);
        } else {
        console.log("Success:", data.message);
        }
        // const data = await response.json();
        // const userId = data.user.id;
        // const sessionToken = data.sessionToken;


        // const response2 = await fetch("/api/", {
        // method: "POST",
        // headers: {
        //     "Content-Type": "application/json",
        // },
        // body: JSON.stringify({ email, password }),
        // });

    } catch (error) {
        console.error(error);
    }

}