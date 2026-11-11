import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../services/api';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { FaArrowLeft, FaArrowRight, FaBullseye, FaCalendarAlt, FaCheck, FaChartLine, FaPlus } from 'react-icons/fa';

ChartJS.register(ArcElement, Tooltip);

const summaryChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '72%',
  plugins: { legend: { display: false }, tooltip: { enabled: false } },
};

const formatMonth = (date) => new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
const getYearMonth = (date, timeZone) => {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: timeZone || undefined, year: 'numeric', month: 'numeric' }).formatToParts(date);
  return { year: Number(parts.find((part) => part.type === 'year')?.value), month: Number(parts.find((part) => part.type === 'month')?.value) };
};

const stateLabel = (state) => ({
  COMPLETE: 'Completed', PARTIAL: 'In progress', MISSED: 'Not completed', UPCOMING: 'Upcoming', NONE: 'Not scheduled',
}[state] || 'No data');

export default function AnalyticsPage() {
  const user = useSelector((state) => state.auth.user);
  const [monthCursor, setMonthCursor] = useState(() => {
    const current = getYearMonth(new Date(), user?.timeZone);
    return new Date(current.year, current.month - 1, 1);
  });
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const year = monthCursor.getFullYear();
  const month = monthCursor.getMonth() + 1;
  const currentMonth = getYearMonth(new Date(), user?.timeZone);
  const isCurrentMonth = year === currentMonth.year && month === currentMonth.month;

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    setErrorMessage('');
    api.get('/analytics/monthly', { params: { year, month } })
      .then(({ data }) => { if (active) setAnalytics(data); })
      .catch((requestError) => {
        if (!active) return;
        setAnalytics(null);
        setError(true);
        const status = requestError.response?.status;
        setErrorMessage(status === 404
          ? 'The running backend does not have the monthly analytics endpoint yet. Stop it with Ctrl+C, then start it again.'
          : status === 401
            ? 'Your login session has expired. Sign in again, then reload Insights.'
            : status
              ? `The API returned error ${status}. ${requestError.response?.data?.message || 'Check the backend terminal for details.'}`
              : 'The frontend could not reach the API. Check that the backend is running on port 8080.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [year, month]);

  const moveMonth = (amount) => setMonthCursor((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  const habits = analytics?.habits || [];
  const weeks = analytics?.weeks || [];
  const topHabits = analytics?.topHabits || [];
  const doughnutData = {
    labels: ['Completed', 'Left'],
    datasets: [{ data: analytics?.totalGoals ? [analytics.completedGoals, analytics.leftGoals] : [0, 1], backgroundColor: ['#4d8b68', '#e7ebe6'], borderColor: '#ffffff', borderWidth: 3, hoverOffset: 3 }],
  };

  return (
    <div className="page-wrap analytics-page">
      <header className="analytics-page-heading">
        <div><p className="analytics-eyebrow">PLAN · TRACK · GROW</p><h1>Insights</h1><p>One month of habit progress, grouped into four weeks.</p></div>
        <div className="analytics-month-control" aria-label="Choose month">
          <button type="button" aria-label="Previous month" onClick={() => moveMonth(-1)} disabled={loading}><FaArrowLeft /></button>
          <span><FaCalendarAlt /> {analytics?.year === year && analytics?.month === month ? analytics.monthLabel : formatMonth(monthCursor)}</span>
          <button type="button" aria-label="Next month" onClick={() => moveMonth(1)} disabled={loading || isCurrentMonth}><FaArrowRight /></button>
        </div>
      </header>

      {error ? <section className="analytics-empty analytics-error" role="alert"><FaChartLine /><h2>Insights could not be loaded</h2><p>{errorMessage}</p><button type="button" onClick={() => moveMonth(0)}>Try again</button></section> : loading && !analytics ? (
        <div className="analytics-empty" role="status">Loading this month’s progress…</div>
      ) : !habits.length ? (
        <section className="analytics-empty"><FaChartLine /><h2>Your monthly overview starts with a habit</h2><p>Create a habit and its progress will appear here.</p><Link to="/habits"><FaPlus /> Add a habit</Link></section>
      ) : (
        <div className={`analytics-dashboard${loading ? ' is-refreshing' : ''}`} aria-busy={loading}>
          <section className="analytics-top-row" aria-label="Monthly summary">
            <article className="analytics-dark-card weekly-bars-card">
              <div className="analytics-card-title-row"><div><p className="analytics-eyebrow">DAILY PROGRESS</p><h2>Progress by week</h2></div><span className="analytics-small-badge">{analytics.daysInMonth} days</span></div>
              <div className="weekly-bars" role="list" aria-label="Monthly completion by week">
                {weeks.map((week) => <div className="weekly-bar-item" role="listitem" key={week.week}>
                  <span className="weekly-bar-value">{week.completionPercent}%</span>
                  <div className="weekly-bar-track" role="img" aria-label={`Week ${week.week}: ${week.completionPercent}% completed`}><span className="weekly-bar-fill" style={{ height: `${Math.max(week.completionPercent > 0 ? 4 : 0, week.completionPercent)}%` }} /></div>
                  <strong>WEEK {week.week}</strong><small>{week.fromDay}–{week.toDay}</small>
                </div>)}
              </div>
            </article>

            <article className="analytics-dark-card goals-summary-card">
              <div className="summary-stats">
                <div className="summary-stat"><span className="summary-stat-icon"><FaBullseye /></span><div><small>TOTAL GOALS</small><strong>{analytics.totalGoals}</strong></div></div>
                <div className="summary-stat"><span className="summary-stat-icon"><FaCheck /></span><div><small>COMPLETED</small><strong>{analytics.completedGoals}</strong></div></div>
                <div className="summary-stat"><span className="summary-stat-icon"><FaChartLine /></span><div><small>LEFT</small><strong>{analytics.leftGoals}</strong></div></div>
              </div>
              <div className="summary-doughnut-wrap" role="img" aria-label={`${analytics.completionPercent}% of monthly goals completed`}>
                <Doughnut data={doughnutData} options={summaryChartOptions} />
                <div className="summary-doughnut-center"><strong>{analytics.completionPercent}%</strong><span>COMPLETE</span></div>
                <div className="summary-chart-legend"><span><i className="legend-purple" />Done</span><span><i className="legend-muted" />Left</span></div>
              </div>
            </article>
          </section>

          <section className="analytics-dark-card month-overview-card" aria-labelledby="month-overview-title">
            <div className="analytics-card-title-row overview-title-row">
              <div><p className="analytics-eyebrow">YOUR ROUTINES</p><h2 id="month-overview-title">Week overview</h2><p className="analytics-card-subtitle">Each dot shows a scheduled day this month.</p></div>
              <Link className="analytics-add-habit" to="/habits"><FaPlus /> Add habit</Link>
            </div>
            <div className="month-grid-scroll">
              <div className="month-matrix" style={{ '--month-day-count': analytics.daysInMonth }}>
                <div className="matrix-week-label" />
                {weeks.map((week) => <div className="matrix-week-band" style={{ gridColumn: `span ${week.toDay - week.fromDay + 1}` }} key={`band-${week.week}`}>WEEK {week.week}</div>)}
                <div className="matrix-habit-heading">HABIT</div>
                {Array.from({ length: analytics.daysInMonth }, (_, index) => <div className="matrix-day-heading" key={`day-${index + 1}`}>{index + 1}</div>)}
                {habits.map((habit) => <FragmentHabitRow key={habit.id} habit={habit} daysInMonth={analytics.daysInMonth} />)}
              </div>
            </div>
            <div className="matrix-legend"><span><i className="matrix-legend-complete" />Completed</span><span><i className="matrix-legend-partial" />In progress</span><span><i className="matrix-legend-empty" />Not done</span><span><i className="matrix-legend-future" />Upcoming / rest</span></div>
          </section>

          <section className="analytics-bottom-row" aria-label="Habit analysis">
            <article className="analytics-dark-card analysis-card">
              <div className="analytics-card-title-row"><div><p className="analytics-eyebrow">MONTHLY BREAKDOWN</p><h2>Analysis</h2></div><span className="analytics-small-badge">{habits.length} habits</span></div>
              <div className="analysis-table-scroll"><table className="analysis-table"><thead><tr><th>Habit</th><th>Goal</th><th>Done</th><th>Left</th><th>Progress</th><th>%</th></tr></thead><tbody>
                {habits.map((habit) => <tr key={habit.id}><td><span className="analysis-habit-name"><i />{habit.title}</span></td><td>{habit.scheduledCount}</td><td>{habit.completedCount}</td><td>{habit.leftCount}</td><td><div className="analysis-progress-track"><span style={{ width: `${habit.completionPercent}%` }} /></div></td><td className="analysis-percent">{habit.completionPercent}%</td></tr>)}
              </tbody></table></div>
            </article>

            <article className="analytics-dark-card top-habits-card">
              <div className="analytics-card-title-row"><div><p className="analytics-eyebrow">YOUR STRONGEST ROUTINES</p><h2>Top habits</h2></div><FaChartLine className="top-habits-icon" /></div>
              {topHabits.length ? <ol className="top-habits-list">{topHabits.map((habit, index) => <li key={habit.id}><span className="top-habit-rank">{index + 1}</span><span className="top-habit-name">{habit.title}</span><strong>{habit.completionPercent}%</strong></li>)}</ol> : <p className="analytics-card-subtitle">Your habit ranking will appear here.</p>}
            </article>
          </section>
        </div>
      )}
    </div>
  );
}

function FragmentHabitRow({ habit, daysInMonth }) {
  return <>
    <div className="matrix-habit-name" title={habit.title}><span className="matrix-habit-dot" />{habit.title}</div>
    {Array.from({ length: daysInMonth }, (_, index) => {
      const state = habit.dayStates[index] || 'NONE';
      return <span className={`matrix-cell ${state.toLowerCase()}`} title={`${habit.title} · day ${index + 1} · ${stateLabel(state)}`} aria-label={`${habit.title}, day ${index + 1}: ${stateLabel(state)}`} key={`${habit.id}-${index + 1}`} />;
    })}
  </>;
}
