import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import toast from 'react-hot-toast';
import AuthLayout from '../components/AuthLayout';
import { loginSuccess } from '../features/auth/authSlice';
import api from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post('/auth/login', { username: email.trim(), password });
      dispatch(loginSuccess({ user: { id: data.id, username: data.username, email: data.email, timeZone: data.timeZone }, token: data.token }));
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not sign in. Check your details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout eyebrow="Welcome back" title={<>Make space for<br />better habits.</>} description="Pick up where you left off and keep building the routines that matter to you.">
      <h2>Sign in</h2>
      <p className="auth-intro">Enter your details to access your workspace.</p>
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="login-email">Email address</label>
          <input id="login-email" className="form-control" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" maxLength={254} placeholder="Enter Your Email" required />
        </div>
        <div className="form-field">
          <label htmlFor="login-password">Password</label>
          <input id="login-password" className="form-control" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" maxLength={128} placeholder="Enter your password" required />
        </div>
        <div className="auth-forgot-row"><Link to="/forgot-password">Forgot password?</Link></div>
        <button className="btn-primary-solid auth-submit" type="submit" disabled={submitting}>{submitting ? 'Signing in…' : <>Sign in <FaArrowRight /></>}</button>
      </form>
      <p className="auth-switch">New to Habit Manager? <Link to="/register">Create an account</Link></p>
    </AuthLayout>
  );
}
