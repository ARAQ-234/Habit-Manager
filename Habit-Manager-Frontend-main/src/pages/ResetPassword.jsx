import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!token) { toast.error('This reset link is missing its token. Request a new one.'); return; }
    if (password !== confirmation) { toast.error('The passwords do not match.'); return; }
    setSubmitting(true);
    try {
      const { data } = await api.post('/auth/reset-password', { token, password });
      toast.success(data.message);
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'This reset link may have expired. Request a new one.');
    } finally { setSubmitting(false); }
  };

  return (
    <AuthLayout eyebrow="Secure your account" title={<>Choose a new<br />passphrase.</>} description="Use a memorable phrase that’s unique to this account.">
      <h2>Reset password</h2>
      <p className="auth-intro">Reset links work once and expire after 20 minutes.</p>
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-field"><label htmlFor="reset-password">New password</label><input id="reset-password" className="form-control" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" minLength={12} maxLength={128} placeholder="12–128 characters" required /><p className="auth-password-hint">Use 12–128 characters.</p></div>
        <div className="form-field"><label htmlFor="reset-confirmation">Confirm password</label><input id="reset-confirmation" className="form-control" type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="new-password" minLength={12} maxLength={64} placeholder="Enter it again" required /></div>
        <button className="btn-primary-solid auth-submit" type="submit" disabled={submitting}>{submitting ? 'Updating…' : 'Update password'}</button>
      </form>
      <p className="auth-switch"><Link to="/login">Back to sign in</Link></p>
    </AuthLayout>
  );
}
