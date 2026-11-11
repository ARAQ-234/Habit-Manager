import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import toast from 'react-hot-toast';
import AuthLayout from '../components/AuthLayout';
import api from '../services/api';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/auth/register', { username: username.trim(), email: email.trim(), password });
      toast.success('Your account is ready. Please sign in.');
      navigate('/login');
    } catch (error) {
      const response = error.response?.data;
      const validationMessage = response?.errors && Object.values(response.errors)[0];
      toast.error(validationMessage || response?.message || 'Could not create your account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout eyebrow="Start where you are" title={<>A steadier routine<br />starts small.</>} description="Create your space, choose a few meaningful habits, and build momentum at your own pace.">
      <h2>Create your account</h2>
      <p className="auth-intro">It only takes a moment to get started.</p>
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="register-username">Username</label>
            <input id="register-username" className="form-control" type="text" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" minLength={3} maxLength={50} placeholder="How should we call you?" required />
          </div>
        <div className="form-field">
          <label htmlFor="register-email">Email address</label>
          <input id="register-email" className="form-control" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" maxLength={254} placeholder="Enter Your Email" required />
        </div>
        <div className="form-field">
          <label htmlFor="register-password">Password</label>
          <input id="register-password" className="form-control" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" minLength={5} maxLength={12} placeholder="Create a passphrase" required />
          <p className="auth-password-hint">Use 5–12 characters. A few memorable words are easier to remember and harder to guess.</p>
        </div>
        <button className="btn-primary-solid auth-submit" type="submit" disabled={submitting}>{submitting ? 'Creating account…' : <>Create account <FaArrowRight /></>}</button>
      </form>
      <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
    </AuthLayout>
  );
}
