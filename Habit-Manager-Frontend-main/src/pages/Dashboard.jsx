import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchHabits } from '../features/habits/habitSlice';
import { setStreak, setStreaks } from '../features/analytics/analyticsSlice';
import api from '../services/api';
import { FaArrowRight, FaCheck, FaFire, FaLeaf, FaRegCalendarAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { formatLocalDate, isHabitDueOnDate } from '../utils/habitSchedule';
import { getCategoryIcon } from '../utils/categoryIcons';

export default function Dashboard() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const habits = useSelector((state) => state.habits.list);
  const habitsLoading = useSelector((state) => state.habits.loading);
  const habitsError = useSelector((state) => state.habits.error);
  const streaks = useSelector((state) => state.analytics.streaks);
  const [checking, setChecking] = useState({});
  const [todayLogs, setTodayLogs] = useState({});
  const [inputCounts, setInputCounts] = useState({});
  const [dailyDataLoading, setDailyDataLoading] = useState(true);
  const [dailyDataError, setDailyDataError] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const todayDate = new Date();
  const today = formatLocalDate(todayDate, user?.timeZone);
  const dueHabits = habits.filter((habit) => isHabitDueOnDate(habit, todayDate, user?.timeZone));

  useEffect(() => {
    dispatch(fetchHabits());
  }, [dispatch]);

  useEffect(() => {
    if (!habits.length) { setTodayLogs({}); setDailyDataLoading(false); return undefined; }
    let active = true;
    const loadDailyData = async () => {
      setDailyDataLoading(true);
      setDailyDataError(false);
      try {
        const [logResult, streakResult] = await Promise.all([
          api.get(`/logs/range?start=${today}&end=${today}`),
          api.get('/streak'),
        ]);
        if (active) {
          setTodayLogs(Object.fromEntries(logResult.data.map((log) => [log.habit.id, log])));
          dispatch(setStreaks(streakResult.data));
        }
      } catch { if (active) setDailyDataError(true); }
      finally { if (active) setDailyDataLoading(false); }
    };
    loadDailyData();
    return () => { active = false; };
  }, [habits, dispatch, today, refreshCount]);

  const handleCheckIn = async (habitId) => {
    const completedCount = Number(inputCounts[habitId] ?? dueHabits.find((habit) => habit.id === habitId)?.goalCount ?? 1);
    if (!Number.isInteger(completedCount) || completedCount < 1) {
      toast.error('Enter a whole number of at least 1.');
      return;
    }

    setChecking((previous) => ({ ...previous, [habitId]: true }));
    try {
      const { data: log } = await api.post('/logs/checkin', { habitId, completedCount, date: today });
      setTodayLogs((previous) => ({ ...previous, [habitId]: log }));
      toast.success('Nice work. Your check-in is saved.');
      try {
        const response = await api.get(`/streak/${habitId}`);
        dispatch(setStreak({ habitId, streak: response.data }));
      } catch { /* The saved check-in remains successful if streak refresh is unavailable. */ }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check-in failed. Please try again.');
    } finally {
      setChecking((previous) => ({ ...previous, [habitId]: false }));
    }
  };

  const completedCount = dueHabits.filter((habit) => todayLogs[habit.id]?.status === 'SUCCESS').length;
  const averageStreak = dueHabits.length ? (dueHabits.reduce((total, habit) => total + (streaks[habit.id] || 0), 0) / dueHabits.length).toFixed(1) : '0';
  const dateLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', ...(user?.timeZone ? { timeZone: user.timeZone } : {}) });

  return (
    <div className="page-wrap">
      <header className="page-heading">
        <div>
          <p className="page-eyebrow">Your daily rhythm</p>
          <h1 className="page-title">Welcome back{user?.username ? `, ${user.username}` : ''}</h1>
          <p className="page-description">Consistency grows from the small things you do today.</p>
        </div>
        <div className="page-date"><FaRegCalendarAlt className="me-2" />{dateLabel}</div>
      </header>

      <section className="welcome-banner" aria-label="Daily encouragement">
        <div className="welcome-content">
          <p className="welcome-kicker">One day at a time</p>
          <h2 className="welcome-title">Make today count.</h2>
          <p className="welcome-copy">A good routine is built one small promise kept at a time. Pick a habit and get started.</p>
          <Link to="/habits" className="btn-primary-soft"><FaLeaf /> Explore your habits <FaArrowRight /></Link>
        </div>
        <div className="welcome-mark" aria-hidden="true"><FaLeaf /></div>
      </section>

      <section className="stat-grid" aria-label="Your progress">
        <article className="surface-card stat-card">
          <div><p className="stat-label">DUE TODAY</p><p className="stat-value">{dueHabits.length}</p><p className="stat-footnote">Habits on today’s schedule</p></div>
          <span className="stat-icon"><FaLeaf /></span>
        </article>
        <article className="surface-card stat-card">
          <div><p className="stat-label">GOAL MET TODAY</p><p className="stat-value">{completedCount}<span className="stat-denominator"> / {dueHabits.length}</span></p><p className="stat-footnote">Progress counts when you log it</p></div>
          <span className="stat-icon lime"><FaCheck /></span>
        </article>
        <article className="surface-card stat-card">
          <div><p className="stat-label">AVERAGE STREAK</p><p className="stat-value">{averageStreak}<span className="stat-unit"> days</span></p><p className="stat-footnote">Across habits due today</p></div>
          <span className="stat-icon amber"><FaFire /></span>
        </article>
      </section>

      <section aria-labelledby="dashboard-habits-title">
        <div className="section-heading">
          <div><h2 id="dashboard-habits-title">Today’s habits</h2><p>Track your progress toward each scheduled goal.</p></div>
          <Link to="/habits" className="text-link">Manage habits <FaArrowRight /></Link>
        </div>
        {habitsLoading && habits.length === 0 ? <div className="empty-state surface-card" role="status"><p>Loading your habits…</p></div> : habitsError ? (
          <div className="empty-state surface-card"><div><h3>Could not load your habits</h3><p>Check your connection and try again.</p><button type="button" className="btn-primary-solid" onClick={() => dispatch(fetchHabits())}>Try again</button></div></div>
        ) : habits.length === 0 ? (
          <div className="empty-state surface-card">
            <div><span className="empty-icon"><FaLeaf /></span><h3>Your first habit starts here</h3><p>Choose one small routine you would like to practice and add it to your list.</p><Link to="/habits" className="btn-primary-solid">Create a habit <FaArrowRight /></Link></div>
          </div>
        ) : dueHabits.length === 0 ? (
          <div className="empty-state surface-card"><div><span className="empty-icon"><FaCheck /></span><h3>No habits scheduled today</h3><p>You’re all clear for today. Your next scheduled habit will appear here.</p></div></div>
        ) : (
          <>
          {dailyDataError && <div className="inline-error" role="alert">Could not load today’s check-ins. <button type="button" onClick={() => setRefreshCount((count) => count + 1)}>Try again</button></div>}
          <div className="habit-list">
            {dueHabits.map((habit) => {
              const log = todayLogs[habit.id];
              const isDone = log?.status === 'SUCCESS';
              const CategoryIcon = getCategoryIcon(habit.category);
              return (
                <article className="surface-card habit-row" key={habit.id}>
                  <div className="habit-main">
                    <span className="habit-symbol"><CategoryIcon /></span>
                    <div className="min-w-0">
                      <h3 className="habit-name">{habit.title}</h3>
                      <p className="habit-meta">Goal: {habit.goalCount} {habit.unit || 'times'} · {habit.frequency.toLowerCase()}</p>
                    </div>
                  </div>
                  <div className="habit-progress-area">
                    <span className="streak-pill"><FaFire /> {streaks[habit.id] || 0} day streak</span>
                      {isDone ? <span className="status-pill success"><FaCheck /> Goal met</span> : (
                      <>
                        <label className="sr-only" htmlFor={`count-${habit.id}`}>Completed amount for {habit.title}</label>
                        <input className="habit-count-input" id={`count-${habit.id}`} type="number" min="1" step="1" value={inputCounts[habit.id] ?? log?.completedCount ?? habit.goalCount} onChange={(event) => setInputCounts((previous) => ({ ...previous, [habit.id]: event.target.value }))} aria-label={`Completed amount for ${habit.title}`} disabled={checking[habit.id]} />
                        <button type="button" className="btn-primary-solid" onClick={() => handleCheckIn(habit.id)} disabled={checking[habit.id] || dailyDataLoading || !Number.isInteger(Number(inputCounts[habit.id] ?? log?.completedCount ?? habit.goalCount)) || Number(inputCounts[habit.id] ?? log?.completedCount ?? habit.goalCount) < 1}>
                          {checking[habit.id] ? 'Saving…' : log ? 'Update progress' : 'Check in'}
                        </button>
                      </>
                    )}
                      {log && !isDone && <span className="status-pill pending">{log.completedCount} / {habit.goalCount} logged</span>}
                  </div>
                </article>
              );
            })}
          </div>
          </>
        )}
      </section>
    </div>
  );
}
