import { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import api from '../services/api';
import { fetchHabits } from '../features/habits/habitSlice';
import { FaCalendarAlt, FaCheck, FaLeaf } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { formatLocalDate, isHabitDueOnDate } from '../utils/habitSchedule';

export default function CalendarPage() {
  const dispatch = useDispatch();
  const habits = useSelector((state) => state.habits.list);
  const user = useSelector((state) => state.auth.user);
  const habitsLoading = useSelector((state) => state.habits.loading);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeStartDate, setActiveStartDate] = useState(new Date());
  const [logsMap, setLogsMap] = useState({});
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [checking, setChecking] = useState(false);
  const [inputCounts, setInputCounts] = useState({});

  useEffect(() => { dispatch(fetchHabits()); }, [dispatch]);

  useEffect(() => {
    let active = true;
    const monthStart = new Date(activeStartDate.getFullYear(), activeStartDate.getMonth(), 1);
    const monthEnd = new Date(activeStartDate.getFullYear(), activeStartDate.getMonth() + 1, 0);
    setLoadingLogs(true);
    api.get(`/logs/range?start=${formatLocalDate(monthStart, user?.timeZone)}&end=${formatLocalDate(monthEnd, user?.timeZone)}`)
      .then(({ data }) => {
        const nextMap = {};
        data.forEach((log) => {
          nextMap[log.checkInDate] ||= [];
          nextMap[log.checkInDate].push(log);
        });
        if (active) setLogsMap(nextMap);
      })
      .catch(() => { if (active) toast.error('Could not load this month’s check-ins.'); })
      .finally(() => { if (active) setLoadingLogs(false); });
    return () => { active = false; };
  }, [activeStartDate, user?.timeZone]);

  const tasks = useMemo(() => habits.filter((habit) => isHabitDueOnDate(habit, selectedDate, user?.timeZone)), [habits, selectedDate, user?.timeZone]);
  const selectedKey = formatLocalDate(selectedDate, user?.timeZone);
  const selectedLogs = logsMap[selectedKey] || [];
  const dateLabel = selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', ...(user?.timeZone ? { timeZone: user.timeZone } : {}) });
  const isFutureDate = selectedKey > formatLocalDate(new Date(), user?.timeZone);
  const isPastDate = selectedKey < formatLocalDate(new Date(), user?.timeZone);

  const getTileState = (date, view) => {
    if (view !== 'month') return '';
    const due = habits.filter((habit) => isHabitDueOnDate(habit, date, user?.timeZone));
    if (!due.length) return '';
    const dayLogs = logsMap[formatLocalDate(date, user?.timeZone)] || [];
    const done = due.filter((habit) => dayLogs.some((log) => log.habit.id === habit.id && log.status === 'SUCCESS')).length;
    const logged = due.filter((habit) => dayLogs.some((log) => log.habit.id === habit.id)).length;
    if (done === due.length) return 'calendar-tile-done';
    if (done > 0 || logged > 0) return 'calendar-tile-partial';
    return formatLocalDate(date, user?.timeZone) <= formatLocalDate(new Date(), user?.timeZone) ? 'calendar-tile-pending' : '';
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setActiveStartDate(date);
  };

  const goToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setActiveStartDate(today);
  };

  const completedOnSelectedDate = tasks.filter((habit) => selectedLogs.some((log) => log.habit.id === habit.id && log.status === 'SUCCESS')).length;

  const handleCheckIn = async (habit) => {
    setChecking(true);
    try {
      const completedCount = Number(inputCounts[habit.id] ?? habit.goalCount);
      if (!Number.isInteger(completedCount) || completedCount < 1) {
        toast.error('Enter a whole number of at least 1.');
        return;
      }
      const { data: savedLog } = await api.post('/logs/checkin', { habitId: habit.id, completedCount, date: selectedKey });
      setLogsMap((current) => ({ ...current, [selectedKey]: [...(current[selectedKey] || []).filter((log) => log.habit.id !== habit.id), savedLog] }));
      toast.success(savedLog.status === 'SUCCESS' ? 'Goal met. Check-in saved.' : 'Progress saved. Keep going when you can.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not save this check-in.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="page-wrap">
      <header className="page-heading">
        <div><p className="page-eyebrow">Plan and reflect</p><h1 className="page-title">Your calendar</h1><p className="page-description">See the days you showed up and choose what to focus on next.</p></div>
      </header>

      {habitsLoading && habits.length === 0 ? <div className="empty-state surface-card"><p>Loading your routines…</p></div> : habits.length === 0 ? (
        <div className="empty-state surface-card"><div><span className="empty-icon"><FaCalendarAlt /></span><h3>Your calendar is ready</h3><p>Add a habit to see your schedule and daily check-ins here.</p></div></div>
      ) : (
        <div className="calendar-layout">
          <section className="surface-card calendar-card" aria-label="Habit calendar">
            <div className="calendar-card-heading">
              <div><p className="page-eyebrow">Your schedule</p><h2>Monthly view</h2></div>
              <button type="button" className="btn-quiet calendar-today-button" onClick={goToToday}>Today</button>
            </div>
            <Calendar
              onChange={handleDateChange}
              onActiveStartDateChange={({ activeStartDate: nextDate }) => nextDate && setActiveStartDate(nextDate)}
              activeStartDate={activeStartDate}
              value={selectedDate}
              showNeighboringMonth={false}
              prev2Label={null}
              next2Label={null}
              prevLabel="‹"
              nextLabel="›"
              minDetail="month"
              tileClassName={({ date, view }) => getTileState(date, view)}
              tileContent={({ date, view }) => getTileState(date, view) ? <span className="calendar-mark" aria-hidden="true" /> : null}
            />
            <div className="calendar-legend" aria-label="Calendar status legend">
              <span className="legend-item"><i className="legend-dot done" /> Completed</span>
              <span className="legend-item"><i className="legend-dot partial" /> In progress</span>
              <span className="legend-item"><i className="legend-dot pending" /> To do</span>
            </div>
          </section>

          <section className="surface-card tasks-card" aria-labelledby="tasks-title">
            <div className="tasks-card-heading">
              <div><p className="page-eyebrow">Daily focus</p><h2 className="tasks-date" id="tasks-title">{dateLabel}</h2></div>
            </div>
            <p className="tasks-subtitle">{isPastDate ? 'Past day · check-ins are closed' : isFutureDate ? 'Upcoming day · check-ins open on the selected date' : `${completedOnSelectedDate} of ${tasks.length} goals met today`}</p>
            {loadingLogs ? <p className="muted-note">Loading check-ins…</p> : tasks.length === 0 ? (
              <div className="empty-state compact"><div><span className="empty-icon"><FaLeaf /></span><h3>A clear day</h3><p>No habits are scheduled for this date.</p></div></div>
            ) : (
              <div className="task-list">
                {tasks.map((habit) => {
                  const log = selectedLogs.find((entry) => entry.habit.id === habit.id);
                  const isDone = log?.status === 'SUCCESS';
                  return (
                    <article className="task-item" key={habit.id}>
                      <div className="min-w-0"><h3>{habit.title}</h3><p>Goal: {habit.goalCount} {habit.unit || 'times'} · {habit.frequency.toLowerCase()}</p></div>
                      {isDone ? <span className="status-pill success"><FaCheck /> Goal met</span> : isPastDate ? <span className="status-pill pending">Day closed</span> : <div className="task-progress-controls">
                        <input aria-label={`Completed amount for ${habit.title}`} className="habit-count-input" type="number" min="1" step="1" value={inputCounts[habit.id] ?? log?.completedCount ?? habit.goalCount} onChange={(event) => setInputCounts((current) => ({ ...current, [habit.id]: event.target.value }))} disabled={checking || isFutureDate || loadingLogs} />
                        <button type="button" className="btn-primary-soft task-checkin" disabled={checking || isFutureDate || loadingLogs || !Number.isInteger(Number(inputCounts[habit.id] ?? log?.completedCount ?? habit.goalCount)) || Number(inputCounts[habit.id] ?? log?.completedCount ?? habit.goalCount) < 1} onClick={() => handleCheckIn(habit)}>{checking ? 'Saving…' : isFutureDate ? 'Upcoming' : log ? 'Update' : 'Check in'}</button>
                      </div>}
                      {log && !isDone && <span className="status-pill pending">{log.completedCount} / {habit.goalCount} logged</span>}
                    </article>
                  );
                })}
              </div>
            )}
            {isFutureDate && <p className="muted-note mt-3">Check-ins become available on the selected day.</p>}
          </section>
        </div>
      )}
    </div>
  );
}
