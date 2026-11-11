import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';
import toast from 'react-hot-toast';
import { formatLocalDate } from '../utils/habitSchedule';

const ReminderListener = () => {
  const [reminder, setReminder] = useState(null);
  const [show, setShow] = useState(false);
  const token = useSelector((state) => state.auth.token);
  const timeZone = useSelector((state) => state.auth.user?.timeZone);
  const [dismissed, setDismissed] = useState({});
  const [responding, setResponding] = useState(false);
  const today = formatLocalDate(new Date(), timeZone);

  useEffect(() => {
    if (!token || show) return undefined;
    let active = true;
    const checkReminders = async () => {
      try {
        const res = await api.get('/reminders/pending');
        const next = res.data?.find((item) => dismissed[item.id] !== today);
        if (active && next && !show) {
          setReminder(next);
          setShow(true);
        }
      } catch { /* The next poll retries transient network failures. */ }
    };
    checkReminders();
    const interval = setInterval(checkReminders, 60000);
    return () => { active = false; clearInterval(interval); };
  }, [token, show, dismissed, today]);

  const handleResponse = async (response) => {
    setResponding(true);
    try {
      await api.post(`/reminders/${reminder.id}/respond`, response);
      setShow(false);
      setReminder(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update the reminder.');
    } finally { setResponding(false); }
  };

  if (!show || !reminder) return null;

  return (
    <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1050 }}>
      <div className="toast show reminder-toast" role="alert" aria-live="polite">
        <div className="toast-header">
          <strong className="me-auto">⏰ Reminder</strong>
          <button type="button" className="btn-close" aria-label="Dismiss reminder for today" onClick={() => { setDismissed((current) => ({ ...current, [reminder.id]: today })); setShow(false); }}></button>
        </div>
        <div className="toast-body">
          <p><strong>{reminder.habit?.title}</strong> is due now.</p>
          <div className="d-flex gap-2">
            <button className="btn-primary-solid" disabled={responding} onClick={() => handleResponse('ACCEPT')}>{responding ? 'Saving…' : '✓ Accept'}</button>
            <button className="btn-quiet" disabled={responding} onClick={() => handleResponse('SKIP')}>Skip today</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReminderListener;
