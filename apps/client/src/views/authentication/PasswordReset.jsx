import { useState } from 'react';
import { ResetPasswordApi } from '../../utils/Api';
import "./Registration.scss";

export default function PasswordReset({ setView }) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const token = new URLSearchParams(window.location.search).get('token');

    const submit = async () => {
        setMessage('');

        if (!token) {
            setMessage('This password reset link is invalid or incomplete.');
            return;
        }
        if (password.length < 8) {
            setMessage('The new password must be at least 8 characters long.');
            return;
        }
        if (password !== confirmPassword) {
            setMessage('Passwords do not match.');
            return;
        }

        setSubmitting(true);
        try {
            await ResetPasswordApi(token, password);
            setMessage('Your password has been reset successfully.');
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Password could not be reset.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="registration">
            <main className="loginbox">
                <h2>Reset password</h2>
                <section className="reg-inside">
                    <div className="password">
                        <label htmlFor="new-password">New password</label>
                        <input
                            id="new-password"
                            className="registration-input"
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                        />
                    </div>
                    <div className="password">
                        <label htmlFor="confirm-password">Confirm password</label>
                        <input
                            id="confirm-password"
                            className="registration-input"
                            type="password"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                        />
                    </div>
                    <span className="error-text" role="status">{message}</span>
                    <button className="register-btn" type="button" onClick={submit} disabled={submitting || !token}>
                        {submitting ? 'Resetting...' : 'Reset password'}
                    </button>
                    <button type="button" onClick={() => setView('sign-in')}>Back to login</button>
                </section>
            </main>
        </section>
    );
}
