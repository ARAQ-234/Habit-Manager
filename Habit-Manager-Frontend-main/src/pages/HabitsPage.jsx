import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { archiveHabit, createHabit, deleteHabit, fetchHabits, restoreHabit, updateHabit } from '../features/habits/habitSlice';
import { FaArchive, FaBell, FaBullseye, FaCalendarAlt, FaClock, FaPlus, FaSeedling, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../services/api';
import { formatLocalDate } from '../utils/habitSchedule';
import { categoryIcons, getCategoryIcon } from '../utils/categoryIcons';

const weekDays = [
  { value: 'MON', label: 'Mon' }, { value: 'TUE', label: 'Tue' }, { value: 'WED', label: 'Wed' },
  { value: 'THU', label: 'Thu' }, { value: 'FRI', label: 'Fri' }, { value: 'SAT', label: 'Sat' }, { value: 'SUN', label: 'Sun' },
];
const monthDates = Array.from({ length: 31 }, (_, index) => index + 1);
const selectableIcons = Object.entries(categoryIcons);

export default function HabitsPage() {
  const dispatch = useDispatch();
  const habits = useSelector((state) => state.habits.list);
  const user = useSelector((state) => state.auth.user);
  const habitsLoading = useSelector((state) => state.habits.loading);
  const habitsError = useSelector((state) => state.habits.error);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [archivedHabits, setArchivedHabits] = useState([]);
  const [loadingArchived, setLoadingArchived] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goalCount, setGoalCount] = useState('1');
  const [frequency, setFrequency] = useState('DAILY');
  const [unit, setUnit] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [endDate, setEndDate] = useState('');
  const [reminderMap, setReminderMap] = useState({});
  const [reminderPanelId, setReminderPanelId] = useState(null);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [reminderDays, setReminderDays] = useState([]);
  const [savingReminder, setSavingReminder] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categoryId, setCategoryId] = useState('');
  const [showCategoryCreator, setShowCategoryCreator] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('STAR');
  const [savingCategory, setSavingCategory] = useState(false);

  useEffect(() => {
    api.get('/reminders').then(({ data }) => setReminderMap(Object.fromEntries(data.map((item) => [item.habitId, item]))))
      .catch(() => toast.error('Could not load reminders.'));
    api.get('/categories').then(({ data }) => setCategories(data)).catch(() => toast.error('Could not load habit categories.'));
  }, []);

  useEffect(() => { dispatch(fetchHabits()); }, [dispatch]);

  const resetForm = () => {
    setEditingId(null); setTitle(''); setDescription(''); setGoalCount('1'); setFrequency('DAILY');
    setUnit(''); setSelectedDays([]); setSelectedDates([]); setEndDate(''); setCategoryId('');
  };

  const toggleValue = (value, setValues) => {
    setValues((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    if (frequency === 'WEEKLY' && selectedDays.length === 0) {
      toast.error('Choose at least one day for a weekly habit.');
      return;
    }
    if (frequency === 'MONTHLY' && selectedDates.length === 0) {
      toast.error('Choose at least one date for a monthly habit.');
      return;
    }
    const scheduledValues = frequency === 'WEEKLY' ? selectedDays.join(',') : frequency === 'MONTHLY' ? selectedDates.join(',') : '';
    setSaving(true);
    try {
      const payload = { title: title.trim(), description: description.trim(), goalCount: Number(goalCount), frequency, unit: unit.trim(), scheduledValues, endDate: endDate || null, categoryId: categoryId ? Number(categoryId) : null };
      if (editingId) await dispatch(updateHabit({ id: editingId, ...payload })).unwrap();
      else await dispatch(createHabit(payload)).unwrap();
      toast.success(editingId ? 'Habit updated.' : 'Habit added to your routine.');
      setShowForm(false);
      resetForm();
    } catch (error) {
      toast.error(error?.message || 'Could not save this habit. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (habit) => {
    setEditingId(habit.id); setTitle(habit.title); setDescription(habit.description || '');
    setGoalCount(String(habit.goalCount || 1)); setFrequency(habit.frequency); setUnit(habit.unit || '');
    setCategoryId(habit.category?.id ? String(habit.category.id) : '');
    setSelectedDays(habit.frequency === 'WEEKLY' ? (habit.scheduledValues || '').split(',').filter(Boolean) : []);
    setSelectedDates(habit.frequency === 'MONTHLY' ? (habit.scheduledValues || '').split(',').filter(Boolean).map(Number) : []);
    setEndDate(habit.endDate || ''); setShowForm(true); setShowArchived(false);
  };

  const loadArchived = async () => {
    setShowArchived(true); setLoadingArchived(true);
    try {
      const { data } = await api.get('/habits?archived=true');
      setArchivedHabits(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not load archived habits.');
      setShowArchived(false);
    } finally { setLoadingArchived(false); }
  };

  const handleArchive = async (habit) => {
    if (!window.confirm(`Archive “${habit.title}”? Its history will be kept.`)) return;
    try {
      const archived = await dispatch(archiveHabit(habit.id)).unwrap();
      setArchivedHabits((current) => [archived, ...current.filter((item) => item.id !== archived.id)]);
      toast.success('Habit archived. Its history is safe.');
    } catch (error) { toast.error(error?.message || 'Could not archive this habit.'); }
  };

  const handleRestore = async (habit) => {
    try {
      await dispatch(restoreHabit(habit.id)).unwrap();
      setArchivedHabits((current) => current.filter((item) => item.id !== habit.id));
      toast.success('Habit restored.');
    } catch (error) { toast.error(error?.message || 'Could not restore this habit.'); }
  };

  const handleDeleteArchived = async (habit) => {
    if (!window.confirm(`Permanently delete “${habit.title}” and all of its check-in history? This cannot be undone.`)) return;
    setDeletingId(habit.id);
    try {
      await dispatch(deleteHabit(habit.id)).unwrap();
      setArchivedHabits((current) => current.filter((item) => item.id !== habit.id));
      toast.success('Archived habit and its history permanently deleted.');
    } catch (error) {
      toast.error(error?.message || 'Could not delete this archived habit.');
    } finally { setDeletingId(null); }
  };

  const openReminder = (habit) => {
    const reminder = reminderMap[habit.id];
    setReminderTime(reminder?.reminderTime?.slice(0, 5) || '09:00');
    setReminderDays(reminder?.daysOfWeek ? reminder.daysOfWeek.split(',') : []);
    setReminderPanelId((current) => current === habit.id ? null : habit.id);
  };

  const saveReminder = async (habit) => {
    setSavingReminder(true);
    const reminder = reminderMap[habit.id];
    try {
      const payload = { habitId: habit.id, reminderTime, daysOfWeek: reminderDays.join(','), active: true };
      const { data } = reminder?.id ? await api.put(`/reminders/${reminder.id}`, payload) : await api.post('/reminders', payload);
      setReminderMap((current) => ({ ...current, [habit.id]: data }));
      setReminderPanelId(null);
      toast.success('Reminder saved.');
    } catch (error) { toast.error(error.response?.data?.message || 'Could not save this reminder.'); }
    finally { setSavingReminder(false); }
  };

  const removeReminder = async (habit) => {
    const reminder = reminderMap[habit.id];
    if (!reminder?.id) return;
    try {
      await api.delete(`/reminders/${reminder.id}`);
      setReminderMap((current) => { const next = { ...current }; delete next[habit.id]; return next; });
      setReminderPanelId(null);
      toast.success('Reminder removed.');
    } catch (error) { toast.error(error.response?.data?.message || 'Could not remove this reminder.'); }
  };

  const createCategory = async () => {
    setSavingCategory(true);
    try {
      const { data } = await api.post('/categories', { name: newCategoryName.trim(), iconKey: newCategoryIcon });
      setCategories((current) => [...current, data].sort((a, b) => a.name.localeCompare(b.name)));
      setCategoryId(String(data.id)); setNewCategoryName(''); setShowCategoryCreator(false);
      toast.success('Category created.');
    } catch (error) { toast.error(error.response?.data?.message || 'Could not create this category.'); }
    finally { setSavingCategory(false); }
  };

  const today = formatLocalDate(new Date(), user?.timeZone);
  const visibleHabits = habits.filter((habit) => categoryFilter === 'all' || String(habit.category?.id || '') === categoryFilter);
  const displayedHabits = showArchived ? archivedHabits : visibleHabits;
  const selectedCategory = categories.find((category) => String(category.id) === categoryId);
  const focusedHabit = !showArchived ? displayedHabits.find((habit) => habit.id === reminderPanelId) : null;

  const renderHabitCard = (habit) => (
    <article className={`surface-card habit-card${reminderPanelId === habit.id ? ' reminder-open' : ''}`} key={habit.id}>
      {(() => { const Icon = getCategoryIcon(habit.category); return <div className="habit-card-top"><span className="habit-symbol"><Icon /></span><span className="status-pill pending"><FaCalendarAlt /> {habit.frequency.toLowerCase()}</span></div>; })()}
      <h3 className="habit-card-title mt-3">{habit.title}</h3>
      <p className="habit-card-description">{habit.description || 'A small step toward a more consistent routine.'}</p>
      <div className="habit-card-details">
        {habit.category && <span className="detail-chip">{habit.category.name}</span>}
        <span className="detail-chip"><FaBullseye /> {habit.goalCount} {habit.unit || 'times'}</span>
        {habit.scheduledValues && <span className="detail-chip">{habit.scheduledValues.replaceAll(',', ' · ')}</span>}
        {habit.endDate && <span className="detail-chip"><FaClock /> Until {habit.endDate}</span>}
      </div>
      {reminderPanelId === habit.id && !showArchived && <div className="reminder-editor"><div className="form-grid"><div className="form-field"><label htmlFor={`reminder-time-${habit.id}`}>Reminder time</label><input id={`reminder-time-${habit.id}`} className="form-control" type="time" value={reminderTime} onChange={(event) => setReminderTime(event.target.value)} /></div><div className="form-field"><label>Repeat days <span className="form-optional">(blank follows habit schedule)</span></label><div className="schedule-pills">{weekDays.map((day) => { const fullDay = { MON: 'MONDAY', TUE: 'TUESDAY', WED: 'WEDNESDAY', THU: 'THURSDAY', FRI: 'FRIDAY', SAT: 'SATURDAY', SUN: 'SUNDAY' }[day.value]; return <button key={day.value} type="button" aria-pressed={reminderDays.includes(fullDay)} className={`schedule-pill${reminderDays.includes(fullDay) ? ' selected' : ''}`} onClick={() => setReminderDays((current) => current.includes(fullDay) ? current.filter((value) => value !== fullDay) : [...current, fullDay])}>{day.label}</button>; })}</div></div></div><p className="muted-note">Email delivery needs SMTP credentials. In-app reminders appear while this app is open.</p><div className="form-actions"><button type="button" className="btn-quiet" onClick={() => setReminderPanelId(null)}>Cancel</button>{reminderMap[habit.id]?.id && <button type="button" className="btn-danger-soft" onClick={() => removeReminder(habit)}>Remove reminder</button>}<button type="button" className="btn-primary-solid" disabled={savingReminder} onClick={() => saveReminder(habit)}>{savingReminder ? 'Saving…' : 'Save reminder'}</button></div></div>}
      <div className="habit-card-actions">
        {showArchived ? <><button type="button" className="btn-primary-soft" onClick={() => handleRestore(habit)}><FaArchive /> Restore</button><button type="button" className="btn-danger-soft" disabled={deletingId === habit.id} onClick={() => handleDeleteArchived(habit)}><FaTrash /> {deletingId === habit.id ? 'Deleting…' : 'Delete'}</button></> : <><button type="button" className="btn-quiet" aria-expanded={reminderPanelId === habit.id} onClick={() => openReminder(habit)}><FaBell /> {reminderMap[habit.id]?.active ? 'Reminder set' : 'Reminder'}</button><button type="button" className="btn-quiet" onClick={() => startEditing(habit)}>Edit</button><button type="button" className="btn-danger-soft" onClick={() => handleArchive(habit)}><FaArchive /> Archive</button></>}
      </div>
    </article>
  );

  return (
    <div className="page-wrap">
      <header className="page-heading">
        <div>
          <p className="page-eyebrow">Your routines</p>
          <h1 className="page-title">My habits</h1>
          <p className="page-description">Keep your goals clear, manageable, and easy to return to.</p>
        </div>
          <button type="button" className="btn-primary-solid" onClick={() => { if (showForm) resetForm(); setShowForm((open) => !open); }}>
          <FaPlus /> {showForm ? 'Close form' : 'New habit'}
        </button>
      </header>

      {showForm && (
        <section className="surface-card form-panel" aria-labelledby="create-habit-title">
          <div className="form-panel-head">
            <div><h2 id="create-habit-title">{editingId ? 'Edit habit' : 'Create a habit'}</h2><p>Start with a goal you can repeat consistently.</p></div>
            <span className="stat-icon lime"><FaSeedling /></span>
          </div>
          <form onSubmit={handleCreate}>
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="habit-title">Habit name</label>
                <input id="habit-title" className="form-control" placeholder="e.g. Read a few pages" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} required />
              </div>
              <div className="form-field">
                <label htmlFor="habit-frequency">Repeat</label>
                <select id="habit-frequency" className="form-select" value={frequency} onChange={(event) => setFrequency(event.target.value)}>
                  <option value="DAILY">Every day</option><option value="WEEKLY">Selected days</option><option value="MONTHLY">Selected dates</option>
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="habit-category">Category <span className="form-optional">(optional)</span></label>
                <div className="category-select-wrap">{selectedCategory && (() => { const CategoryIcon = getCategoryIcon(selectedCategory); return <span className="category-select-icon" aria-hidden="true"><CategoryIcon /></span>; })()}<select id="habit-category" className="form-select" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}><option value="">No category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>
                <button type="button" className="category-create-toggle" aria-expanded={showCategoryCreator} onClick={() => setShowCategoryCreator((open) => !open)}><FaPlus /> {showCategoryCreator ? 'Close category creator' : 'Create a category'}</button>
                {showCategoryCreator && <div className="category-creator"><label htmlFor="new-category-name">New category name</label><input id="new-category-name" className="form-control" value={newCategoryName} onChange={(event) => setNewCategoryName(event.target.value)} maxLength={40} placeholder="e.g. Self care" /><span className="category-icon-label">Choose an icon</span><div className="category-icon-picker" role="group" aria-label="Choose category icon">{selectableIcons.map(([key, Icon]) => <button key={key} type="button" className={`category-icon-option${newCategoryIcon === key ? ' selected' : ''}`} aria-label={key.toLowerCase()} aria-pressed={newCategoryIcon === key} onClick={() => setNewCategoryIcon(key)}><Icon /></button>)}</div><button type="button" className="btn-primary-soft category-create-button" disabled={!newCategoryName.trim() || savingCategory} onClick={createCategory}>{savingCategory ? 'Creating…' : 'Create category'}</button></div>}
              </div>
              <div className="form-field full">
                <label htmlFor="habit-description">Description <span className="form-optional">(optional)</span></label>
                <textarea id="habit-description" className="form-control" placeholder="Why does this matter to you?" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={2000} rows={2} />
              </div>
              {frequency === 'WEEKLY' && (
                <div className="form-field full">
                  <label>Days of the week</label>
                  <div className="schedule-pills" role="group" aria-label="Choose weekdays">
                    {weekDays.map((day) => <button key={day.value} type="button" aria-pressed={selectedDays.includes(day.value)} className={`schedule-pill${selectedDays.includes(day.value) ? ' selected' : ''}`} onClick={() => toggleValue(day.value, setSelectedDays)}>{day.label}</button>)}
                  </div>
                </div>
              )}
              {frequency === 'MONTHLY' && (
                <div className="form-field full">
                  <label>Days of the month</label>
                  <div className="schedule-pills date-pills" role="group" aria-label="Choose dates of the month">
                    {monthDates.map((date) => <button key={date} type="button" aria-pressed={selectedDates.includes(date)} className={`schedule-pill${selectedDates.includes(date) ? ' selected' : ''}`} onClick={() => toggleValue(date, setSelectedDates)}>{date}</button>)}
                  </div>
                </div>
              )}
              <div className="form-field">
                <label htmlFor="habit-goal">Daily goal</label>
                <div className="input-with-icon"><FaBullseye aria-hidden="true" /><input id="habit-goal" className="form-control" type="number" min="1" max="9999" step="1" value={goalCount} onChange={(event) => setGoalCount(event.target.value)} required /></div>
              </div>
              <div className="form-field">
                <label htmlFor="habit-unit">Unit <span className="form-optional">(optional)</span></label>
                <input id="habit-unit" className="form-control" placeholder="pages, km, glasses…" value={unit} onChange={(event) => setUnit(event.target.value)} maxLength={100} />
              </div>
              <div className="form-field">
                <label htmlFor="habit-end-date">End date <span className="form-optional">(optional)</span></label>
                <div className="input-with-icon"><FaClock aria-hidden="true" /><input id="habit-end-date" className="form-control" type="date" min={editingId ? undefined : today} value={endDate} onChange={(event) => setEndDate(event.target.value)} /></div>
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn-quiet" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</button>
              <button type="submit" className="btn-primary-solid" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Save changes' : 'Save habit'}</button>
            </div>
          </form>
        </section>
      )}

      <div className="section-heading section-heading-first">
        <div><h2>{showArchived ? 'Archived habits' : 'Your routine list'}</h2><p>{showArchived ? `${archivedHabits.length} archived` : `${habits.length} ${habits.length === 1 ? 'habit' : 'habits'} in your workspace`}</p></div>
        {showArchived ? <button type="button" className="btn-quiet" onClick={() => setShowArchived(false)}>Back to active habits</button> : <div className="habit-list-tools"><label className="sr-only" htmlFor="category-filter">Filter habits by category</label><select id="category-filter" className="form-select" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}><option value="all">All categories</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select><button type="button" className="btn-quiet" onClick={loadArchived}>View archived</button></div>}
      </div>

      {showArchived && loadingArchived ? <div className="empty-state surface-card" role="status"><p>Loading archived habits…</p></div> : !showArchived && habitsError ? <div className="empty-state surface-card"><div><h3>Could not load your habits</h3><p>Check your connection and try again.</p><button type="button" className="btn-primary-solid" onClick={() => dispatch(fetchHabits())}>Try again</button></div></div> : (showArchived ? archivedHabits : visibleHabits).length === 0 ? (
        <div className="empty-state surface-card">
          <div><span className="empty-icon"><FaSeedling /></span><h3>{showArchived ? 'No archived habits' : habitsLoading ? 'Loading habits…' : 'No habits yet'}</h3><p>{showArchived ? 'Habits you archive will stay here with their history.' : 'Add a simple, repeatable goal and make it part of your day.'}</p>{!showArchived && !habitsLoading && <button type="button" className="btn-primary-solid" onClick={() => setShowForm(true)}><FaPlus /> Add your first habit</button>}</div>
        </div>
      ) : focusedHabit ? (
        <div className="habit-focus-layout">
          <div className="habit-focus-primary">{renderHabitCard(focusedHabit)}</div>
          <div className="habit-side-list" aria-label="Other habits">{displayedHabits.filter((habit) => habit.id !== focusedHabit.id).map(renderHabitCard)}</div>
        </div>
      ) : (
        <div className={`habit-cards${showArchived ? ' archived-habit-cards' : ''}`}>
          {displayedHabits.map(renderHabitCard)}
        </div>
      )}
    </div>
  );
}
