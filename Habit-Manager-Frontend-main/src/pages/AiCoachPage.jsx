import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { FaArrowRight, FaLightbulb, FaLock, FaMagic, FaRedoAlt } from 'react-icons/fa';
import api from '../services/api';

const generationTimeoutMs = 270_000;

const readSavedPlan = (key) => {
  if (!key) return null;
  try {
    const value = JSON.parse(sessionStorage.getItem(key));
    return value?.advice && value?.periodStart && value?.periodEnd ? value : null;
  } catch {
    return null;
  }
};

export default function AiCoachPage() {
  const account = useSelector((state) => state.auth.user);
  const storageKey = account?.id ? `habit-manager-ai-coach:${account.id}` : null;
  const [status, setStatus] = useState(null);
  const [statusError, setStatusError] = useState('');
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [savedPlan, setSavedPlan] = useState(() => ({ key: storageKey, data: readSavedPlan(storageKey) }));
  const result = savedPlan.key === storageKey ? savedPlan.data : null;
  const [error, setError] = useState('');

  useEffect(() => {
    if (savedPlan.key !== storageKey) {
      setSavedPlan({ key: storageKey, data: readSavedPlan(storageKey) });
      return;
    }
    if (!storageKey) return;
    try {
      if (savedPlan.data) sessionStorage.setItem(storageKey, JSON.stringify(savedPlan.data));
      else sessionStorage.removeItem(storageKey);
    } catch {
      // Keep the current result visible even when browser storage is unavailable.
    }
  }, [savedPlan, storageKey]);

  const loadStatus = async () => {
    setLoadingStatus(true);
    setStatusError('');
    try {
      const { data } = await api.get('/ai/coach/status');
      setStatus(data);
    } catch (requestError) {
      setStatusError(requestError.response?.data?.message || 'Could not check the local AI service. Confirm the backend and Ollama are running, then try again.');
    } finally { setLoadingStatus(false); }
  };

  useEffect(() => { loadStatus(); }, []);

  const generateAdvice = async () => {
    setGenerating(true);
    setError('');
    try {
      // Local models can take much longer than ordinary API calls, especially on the first request.
      const { data } = await api.post('/ai/coach', {}, { timeout: generationTimeoutMs });
      setSavedPlan({ key: storageKey, data });
    } catch (requestError) {
      const message = requestError.response?.data?.message;
      setError(message || (requestError.code === 'ECONNABORTED'
        ? 'The local model is taking longer than expected. Keep Ollama running and try again.'
        : 'The coaching plan could not be generated. Check that Ollama is running, then try again.'));
    } finally { setGenerating(false); }
  };

  return (
    <div className="page-wrap ai-coach-page">
      <header className="page-heading">
        <div><p className="page-eyebrow">A little help for your next step</p><h1 className="page-title">AI Habit Coach</h1><p className="page-description">Get practical feedback on your habits and progress over the last seven days.</p></div>
        <span className="ai-coach-mark" aria-hidden="true"><FaLightbulb /></span>
      </header>

      <section className="surface-card ai-coach-intro">
        <div className="ai-coach-intro-icon"><FaMagic /></div>
        <div className="ai-coach-intro-copy"><h2>Turn your progress into a simple plan</h2><p>The coach reviews your active habit names, categories, schedules, goals, and completed days to suggest realistic next steps.</p></div>
      </section>

      <section className="surface-card ai-coach-panel" aria-labelledby="ai-coach-generate-title">
        <div className="ai-coach-panel-head"><div><p className="page-eyebrow">WEEKLY REFLECTION</p><h2 id="ai-coach-generate-title">Build my coaching plan</h2><p>Free local AI runs on your computer. Habit progress is not sent to an external AI service. Advice is generated in English.</p></div><span className="ai-privacy-icon"><FaLock /></span></div>
        {statusError && <div className="inline-error" role="alert">{statusError} <button type="button" onClick={loadStatus}>Try again</button></div>}
        {!statusError && !loadingStatus && status?.running && !status?.modelInstalled && <div className="ai-coach-setup" role="status"><strong>Install the local AI model</strong><p>Run this command once in PowerShell:</p><code>ollama pull {status.model}</code></div>}
        {!statusError && !loadingStatus && status && !status.running && <div className="ai-coach-setup" role="status"><strong>Start local AI</strong><p>Ollama is not responding. Open the Ollama app or run <code>ollama serve</code>, then retry.</p><a href="https://ollama.com/download" target="_blank" rel="noreferrer">Get Ollama</a></div>}
        {error && <div className="account-delete-error" role="alert">{error}</div>}
        <button type="button" className="btn-primary-solid ai-coach-generate" onClick={generateAdvice} disabled={loadingStatus || !status?.configured || generating}>
          <FaMagic /> {generating ? 'Generating your plan…' : result ? 'Generate a new plan' : 'Get my coaching plan'} <FaArrowRight />
        </button>
      </section>

      {result && <section className="surface-card ai-coach-result" aria-live="polite" aria-labelledby="ai-coach-result-title">
        <div className="ai-coach-result-head"><div><p className="page-eyebrow">YOUR PERSONAL PLAN</p><h2 id="ai-coach-result-title">Your plan for this week</h2><p>Based on progress from {result.periodStart} to {result.periodEnd}.</p></div><button type="button" className="btn-quiet" onClick={generateAdvice} disabled={generating}><FaRedoAlt /> Generate again</button></div>
        <div className="ai-coach-advice">{result.advice}</div>
        <p className="ai-coach-note">AI suggestions are general guidance. Choose what fits your situation.</p>
      </section>}
    </div>
  );
}
