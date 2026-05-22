import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, GraduationCap, Briefcase, FileText, Rocket, Award,
  ArrowRight, Clock, Zap, Target, Bell, Bookmark
} from 'lucide-react';
import OpportunityCard from '../components/OpportunityCard';
import { isGoodMatch } from '../utils/match';
import './Dashboard.css';

function getStatCards(ops) {
  return [
    { label: 'Scholarships', value: ops.filter((o) => o.type === 'scholarship').length, icon: GraduationCap, color: '#9d5cf6', to: '/scholarships' },
    { label: 'Govt. Jobs', value: ops.filter((o) => o.type === 'job').length, icon: Briefcase, color: '#5b7cff', to: '/jobs' },
    { label: 'Exams', value: ops.filter((o) => o.type === 'exam').length, icon: FileText, color: '#22d3ee', to: '/exams' },
    { label: 'Internships', value: ops.filter((o) => o.type === 'internship').length, icon: Rocket, color: '#10b981', to: '/internships' },
    { label: 'Fellowships', value: ops.filter((o) => o.type === 'fellowship').length, icon: Award, color: '#f59e0b', to: '/fellowships' },
  ];
}

function getUrgent(ops) {
  const now = new Date();
  return ops
    .filter(o => {
      const days = Math.floor((new Date(o.applicationDeadline) - now) / (1000 * 60 * 60 * 24));
      return days >= 0 && days <= 30;
    })
    .sort((a, b) => new Date(a.applicationDeadline) - new Date(b.applicationDeadline))
    .slice(0, 3);
}

function CountdownTimer({ deadline }) {
  const [time, setTime] = useState('');
  useEffect(() => {
    const calc = () => {
      const diff = new Date(deadline) - new Date();
      if (diff <= 0) { setTime('Closed'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTime(`${d}d ${h}h ${m}m`);
    };
    calc();
    const id = setInterval(calc, 60000);
    return () => clearInterval(id);
  }, [deadline]);
  return <span className="live-timer"><Clock size={12} /> {time}</span>;
}

export default function Dashboard({ userProfile, opportunities, applications, onUpdateStatus }) {
  // Filter out irrelevant opportunities based on profile
  const matchedOpportunities = opportunities.filter(o => isGoodMatch(o, userProfile));

  const featured = matchedOpportunities.filter(o => o.featured).slice(0, 6);
  const urgent = getUrgent(matchedOpportunities);
  const upcoming = matchedOpportunities.filter(o => o.status === 'upcoming').slice(0, 3);
  const statCards = getStatCards(matchedOpportunities);

  return (
    <div className="dashboard anim-fade-up">
      {/* Hero */}
      <div className="hero-section glass">
        <div className="hero-content">
          <div className="hero-badge"><Zap size={13} /> Your Gateway to Opportunities</div>
          <h1 className="hero-title">
            Discover Government <span className="grad-text">Opportunities</span> Made for You
          </h1>
          <p className="hero-sub">
            Scholarships, Jobs, Exams, Internships & Fellowships — all in one place,
            with live deadlines and eligibility matching.
          </p>
          <div className="hero-actions">
            <Link to="/scholarships" className="btn btn-primary btn-lg">
              Explore Now <ArrowRight size={18} />
            </Link>
            <Link to="/profile" className="btn btn-outline btn-lg">
              <Target size={18} /> Set My Profile
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
          <div className="hero-card-float glass-strong">
            <Bell size={18} style={{ color: 'var(--cyan-1)' }} />
            <div>
              <p className="float-title">Live Updates</p>
              <p className="float-sub">{opportunities.length} active opportunities</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        {statCards.map((s, i) => (
          <Link key={s.label} to={s.to} className="stat-card glass" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="stat-icon" style={{ background: `${s.color}22`, color: s.color }}>
              <s.icon size={22} />
            </div>
            <div>
              <p className="stat-value" style={{ color: s.color }}>{s.value}</p>
              <p className="stat-label">{s.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Deadline Alert Strip */}
      {urgent.length > 0 && (
        <div className="alert-strip glass">
          <div className="alert-icon"><Bell size={16} /></div>
          <div className="alert-scroll">
            {urgent.map(o => (
              <span key={o.id} className="alert-item">
                <span className="alert-title">{o.title}</span>
                <CountdownTimer deadline={o.applicationDeadline} />
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Featured */}
      <section className="section">
        <div className="section-header">
          <div>
            <h2 className="section-title"><TrendingUp size={20} /> Featured Opportunities</h2>
            <p className="section-sub">Hand-picked, high-value opportunities for you</p>
          </div>
          <Link to="/scholarships" className="btn btn-ghost btn-sm">View All <ArrowRight size={14} /></Link>
        </div>
        <div className="cards-grid">
          {featured.map((o, i) => (
            <OpportunityCard key={o.id} opp={o} userProfile={userProfile} delay={i * 80} applications={applications} onUpdateStatus={onUpdateStatus} />
          ))}
        </div>
      </section>

      {/* Upcoming */}
      <section className="section">
        <div className="section-header">
          <div>
            <h2 className="section-title"><Clock size={20} /> Opening Soon</h2>
            <p className="section-sub">Application windows opening in the next few weeks</p>
          </div>
        </div>
        <div className="cards-grid">
          {upcoming.map((o, i) => (
            <OpportunityCard key={o.id} opp={o} userProfile={userProfile} delay={i * 80} applications={applications} onUpdateStatus={onUpdateStatus} />
          ))}
        </div>
      </section>
    </div>
  );
}
