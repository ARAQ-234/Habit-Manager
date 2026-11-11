import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaDownload, FaGlobe, FaShieldAlt, FaTrashAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../services/api';
import { logout, updateAccount } from '../features/auth/authSlice';

const fallbackZones = ['Asia/Yangon', 'Asia/Bangkok', 'Asia/Kolkata', 'Asia/Tokyo', 'Australia/Sydney', 'Europe/London', 'Europe/Paris', 'America/Los_Angeles', 'America/New_York', 'UTC'];

export default function SettingsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const account = useSelector((state) => state.auth.user);
  const [timeZone, setTimeZone] = useState(account?.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const zones = useMemo(() => {
    const supported = Intl.supportedValuesOf?.('timeZone') || fallbackZones;
    return [...new Set([timeZone, ...supported, 'UTC'])].sort();
  }, [timeZone]);

  useEffect(() => {
    let active = true;
    api.get('/account/settings').then(({ data }) => {
      if (!active) return;
      setTimeZone(data.timeZone);
      dispatch(updateAccount(data));
    }).catch((error) => toast.error(error.response?.data?.message || 'Could not load account settings.'))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [dispatch]);

  const saveSettings = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/account/settings', { timeZone });
      dispatch(updateAccount(data));
      toast.success('Time zone saved.');
    } catch (error) { toast.error(error.response?.data?.message || 'Could not save settings.'); }
    finally { setSaving(false); }
  };

  const exportData = async () => {
    setExporting(true);
    try {
      const { data } = await api.get('/account/export');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'habit-manager-data.json';
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Your data export is ready.');
    } catch (error) { toast.error(error.response?.data?.message || 'Could not export your data.'); }
    finally { setExporting(false); }
  };

  const deleteAccount = async (event) => {
    event.preventDefault();
    if (!window.confirm('Permanently delete your account, habits, and activity history? This cannot be undone.')) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await api.delete('/account', { data: { password: deletePassword } });
      dispatch(logout());
      toast.success('Your account has been deleted.');
      navigate('/register', { replace: true });
    } catch (error) {
      const message = error.response?.data?.message
        || (error.code === 'ECONNABORTED' ? 'The request timed out. Check whether the backend is still running, then try again.'
          : !error.response ? 'Could not reach the backend. Check your connection and try again.'
            : 'Could not delete your account. Please try again.');
      setDeleteError(message);
      toast.error(message);
    }
    finally { setDeleting(false); }
  };

  return (
    <div className="page-wrap">
      <header className="page-heading"><div><p className="page-eyebrow">Your preferences</p><h1 className="page-title">Settings</h1><p className="page-description">Manage your local time, keep a copy of your data, or close your account.</p></div></header>
      <div className="settings-grid">
        <section className="surface-card settings-card" aria-labelledby="settings-timezone-title">
          <div className="settings-card-heading"><span className="stat-icon"><FaGlobe /></span><div><h2 id="settings-timezone-title">Time zone</h2><p>Used to decide which habits are due today and when reminders run.</p></div></div>
          {loading ? <p className="muted-note" role="status">Loading your settings…</p> : <form className="settings-form" onSubmit={saveSettings}><div className="form-field"><label htmlFor="account-time-zone">Your time zone</label><select id="account-time-zone" className="form-select" value={timeZone} onChange={(event) => setTimeZone(event.target.value)}>{zones.map((zone) => <option key={zone} value={zone}>{zone.replaceAll('_', ' ')}</option>)}</select></div><button className="btn-primary-solid" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save time zone'}</button></form>}
        </section>

        <section className="surface-card settings-card" aria-labelledby="settings-export-title">
          <div className="settings-card-heading"><span className="stat-icon lime"><FaDownload /></span><div><h2 id="settings-export-title">Download your data</h2><p>Export your account details, habits, check-ins, reminders, and activity as JSON.</p></div></div>
          <button className="btn-primary-soft" type="button" onClick={exportData} disabled={exporting}>{exporting ? 'Preparing export…' : 'Download data export'}</button>
        </section>

        <section className="surface-card settings-card settings-danger" aria-labelledby="settings-delete-title">
          <div className="settings-card-heading"><span className="stat-icon" style={{ background: 'var(--red-soft)', color: 'var(--red)' }}><FaShieldAlt /></span><div><h2 id="settings-delete-title">Delete account</h2><p>This permanently removes your habits, check-ins, reminders, and activity. Export your data first if you want to keep a copy.</p></div></div>
          <form className="settings-form" onSubmit={deleteAccount}><div className="form-field"><label htmlFor="delete-password">Confirm with your password</label><input id="delete-password" className="form-control" type="password" autoComplete="current-password" value={deletePassword} onChange={(event) => { setDeletePassword(event.target.value); setDeleteError(''); }} required disabled={deleting} /></div>{deleteError && <p className="account-delete-error" role="alert">{deleteError}</p>}<button className="btn-danger-soft" type="submit" disabled={deleting}><FaTrashAlt /> {deleting ? 'Deleting…' : 'Delete my account'}</button></form>
        </section>
      </div>
    </div>
  );
}
