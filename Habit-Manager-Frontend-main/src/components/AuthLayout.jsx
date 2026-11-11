import { Link, useLocation } from 'react-router-dom';

export default function AuthLayout({ eyebrow, title, description, children }) {
  const { pathname } = useLocation();
  const isRegister = pathname === '/register';

  return (
    <div className={`auth-shell${isRegister ? ' auth-register' : ' auth-login'}`}>
      <section className="auth-promo">
        <Link to="/login" className="auth-promo-brand">
          <span className="brand-mark"><img className="brand-mark-image" src="/habit-manager-logo.png" alt="" /></span>
          <span><span className="brand-name">Habit Manager</span><span className="brand-caption">Small steps, lasting change</span></span>
        </Link>
        <div className="auth-promo-message">
          <p className="page-eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <div className="auth-promo-footer">A little progress, every day.</div>
      </section>
      <section className="auth-form-side">
        <div className="auth-card">{children}</div>
      </section>
    </div>
  );
}
