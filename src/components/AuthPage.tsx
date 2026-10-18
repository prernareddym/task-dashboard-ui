import { useState, type FormEvent } from 'react';
import { clearAuthError, login, register } from '../store/authSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

export default function AuthPage() {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state) => state.auth);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const isRegister = mode === 'register';

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (isRegister) {
      void dispatch(register({ email, password, displayName }));
    } else {
      void dispatch(login({ email, password }));
    }
  }

  function switchMode() {
    dispatch(clearAuthError());
    setMode(isRegister ? 'login' : 'register');
  }

  return (
    <main className="auth">
      <form className="card auth-card" onSubmit={onSubmit} aria-label={isRegister ? 'Create account' : 'Sign in'}>
        <h1>Task Dashboard</h1>
        <p className="muted">
          {isRegister ? 'Create an account for the Task Tracker API.' : 'Sign in with your Task Tracker API account.'}
        </p>

        {isRegister && (
          <label>
            Display name
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required maxLength={100} />
          </label>
        )}
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={isRegister ? 8 : undefined}
            autoComplete={isRegister ? 'new-password' : 'current-password'}
          />
        </label>

        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}

        <button type="submit" className="primary" disabled={status === 'loading'}>
          {status === 'loading' ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}
        </button>
        <button type="button" className="link" onClick={switchMode}>
          {isRegister ? 'I already have an account' : 'Create a new account'}
        </button>
      </form>
    </main>
  );
}
