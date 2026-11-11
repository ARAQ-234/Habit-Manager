import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email: email.trim() });
      setSent(true);
      toast.success(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not request a reset link. Please try again.');
    } finally { setSubmitting(false); }
  };

  return (
    <AuthLayout eyebrow="Account recovery" title={<>A fresh start<br />is one link away.</>} description="We’ll send a one-time password reset link if an account matches that email.">
      <h2>Forgot your password?</h2>
      <p className="auth-intro">Enter the email address on your account.</p>
      {sent ? <div className="auth-notice" role="status">If an account exists for that email, a reset link has been sent. Check your inbox and spam folder.</div> : (
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-field"><label htmlFor="forgot-email">Email address</label><input id="forgot-email" className="form-control" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" maxLength={254} placeholder="you@example.com" required /></div>
          <button className="btn-primary-solid auth-submit" type="submit" disabled={submitting}>{submitting ? 'Sending…' : 'Send reset link'}</button>
        </form>
      )}
      <p className="auth-switch"><Link to="/login">Back to sign in</Link></p>
    </AuthLayout>
  );
}
