export default function Password({labelName, passwordType, passwordType2, setPasswordType, setPasswordType2, setPassword, setConfirmPass }) {
    const password_type = labelName === "Password" ? passwordType : passwordType2;
    const set_password_type = labelName === "Password" ? setPasswordType : setPasswordType2; 
    const set_password = labelName === "Password" ? setPassword : setConfirmPass;

    return (
        <div className='password'>
            <label for="password"> {labelName} </label>
            <div className="password-display">
                <input className='registration-input' type={password_type ? "password": "text" } name="password" maxlength="50" onChange={(e) => { set_password(e.target.value) }} />
                <button className="eye" onClick={() => { set_password_type(!password_type)}}>p</button>
            </div>
        </div>
    );
}