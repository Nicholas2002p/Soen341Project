/**
 * Password
 * the password field in the form
 * 
 * @param {string} label Name
 * @param {boolean} passwordType the first password field (text or password) input type
 * @param {boolean} passwordType2 the second password field (text or password) input type
 * @param {function} setPasswordType - sets the first password field to text or password
 * @param {function} setPasswordType2 - sets the second password field to text or password
 * @param {function} setPassword - initializes the password or modifies it
 * @param {function} setConfirmPass - sets the confirmed password
 * @returns the password component
 */
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