import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';
import { FaHistory, FaRegClock } from 'react-icons/fa';
import toast from 'react-hot-toast';

const actionLabel = (action = '') => action.replaceAll('_', ' ').toLowerCase();

export default function HistoryPage() {
  const token = useSelector((state) => state.auth.token);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.get('/history')
      .then(({ data }) => { if (active) setHistory(data); })
      .catch((error) => { if (active) toast.error(error.response?.data?.message || 'Could not load activity history.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token]);

  return (
    <div className="page-wrap">
      <header className="page-heading">
        <div><p className="page-eyebrow">Your journey</p><h1 className="page-title">Activity</h1><p className="page-description">A timeline of the small actions that make your routines stick.</p></div>
      </header>

      {loading ? <div className="empty-state surface-card"><p>Loading your activity…</p></div> : history.length === 0 ? (
        <div className="empty-state surface-card"><div><span className="empty-icon"><FaHistory /></span><h3>Your story starts here</h3><p>Creating habits and checking in will show up in this timeline.</p></div></div>
      ) : (
        <section className="surface-card history-card" aria-label="Activity history">
          <div className="history-card-heading"><div><h2>Recent activity</h2><p>{history.length} {history.length === 1 ? 'event' : 'events'} recorded</p></div><span className="stat-icon"><FaRegClock /></span></div>
          <div className="table-responsive">
            <table className="history-table">
              <thead><tr><th scope="col">When</th><th scope="col">Activity</th><th scope="col">Details</th></tr></thead>
              <tbody>
                {history.map((record) => {
                  const action = actionLabel(record.action);
                  return (
                    <tr key={record.id}>
                      <td className="history-time">{new Date(record.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</td>
                      <td><span className={`action-badge ${action.replaceAll(' ', '_')}`}>{action}</span></td>
                      <td>{record.details}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
