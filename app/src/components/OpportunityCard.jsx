import { useState, useEffect } from 'react';
import {
  Calendar, Clock, Users, MapPin, ExternalLink, Bookmark,
  BookmarkCheck, ChevronDown, ChevronUp, CheckCircle, XCircle, IndianRupee
} from 'lucide-react';
import './OpportunityCard.css';
import { computeMatchScore } from '../utils/match';

function getCountdown(deadline) {
  const now = new Date();
  const end = new Date(deadline);
  const diff = end - now;
  if (diff <= 0) return { text: 'Closed', urgent: false, closed: true };
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return { text: 'Today!', urgent: true, closed: false };
  if (days <= 7) return { text: `${days}d left`, urgent: true, closed: false };
  if (days <= 30) return { text: `${days} days left`, urgent: false, closed: false };
  return { text: `${days} days left`, urgent: false, closed: false };
}

function formatDate(dateStr) {
  if (!dateStr) return 'TBA';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

function MatchScore({ score }) {
  const color = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  const label = score >= 80 ? 'Great Match' : score >= 50 ? 'Partial Match' : 'Low Match';
  return (
    <div className="match-score" style={{ '--score-color': color }}>
      <div className="match-ring">
        <svg viewBox="0 0 36 36" className="match-svg">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="3" />
          <circle
            cx="18" cy="18" r="15.9" fill="none"
            stroke={color} strokeWidth="3"
            strokeDasharray={`${score} ${100 - score}`}
            strokeDashoffset="25"
            strokeLinecap="round"
          />
        </svg>
        <span className="match-pct">{score}%</span>
      </div>
      <span className="match-label">{label}</span>
    </div>
  );
}

export default function OpportunityCard({ opp, userProfile, delay = 0, applications = [], onUpdateStatus }) {
  const [expanded, setExpanded] = useState(false);
  const countdown = getCountdown(opp.applicationDeadline);
  
  const currentApp = applications.find(a => a.opportunity_id === opp.id);
  const currentStatus = currentApp ? currentApp.status : null;

  const matchScore = computeMatchScore(opp, userProfile);

  const typeColors = {
    scholarship: 'var(--purple-2)', job: 'var(--blue-2)',
    exam: 'var(--cyan-1)', internship: 'var(--success)', fellowship: 'var(--warning)'
  };

  return (
    <div
      className={`opp-card glass ${expanded ? 'expanded' : ''} ${countdown.urgent ? 'urgent' : ''}`}
      style={{ animationDelay: `${delay}ms`, '--type-color': typeColors[opp.type] || 'var(--blue-2)' }}
    >
      {/* Top Row */}
      <div className="card-top">
        <div className="card-badges">
          <span className={`badge badge-${opp.type}`}>{opp.type}</span>
          <span className={`badge badge-${opp.status}`}>{opp.status}</span>
          {opp.featured && <span className="badge badge-featured">⭐ Featured</span>}
        </div>
        
        <div className="status-dropdown">
          <select 
            value={currentStatus || ''} 
            onChange={(e) => onUpdateStatus && onUpdateStatus(opp.id, e.target.value)}
            className={`status-select ${currentStatus ? `status-${currentStatus.toLowerCase()}` : ''}`}
          >
            <option value="">Track Status...</option>
            <option value="Saved">📌 Saved</option>
            <option value="Applied">✅ Applied</option>
            <option value="Shortlisted">🎯 Shortlisted</option>
            <option value="Rejected">❌ Rejected</option>
          </select>
        </div>
      </div>

      {/* Title & Org */}
      <h3 className="card-title">{opp.title}</h3>
      <p className="card-org">{opp.organization}</p>

      {/* Amount */}
      <div className="card-amount">
        <IndianRupee size={14} />
        <span>{opp.amount}</span>
      </div>

      {/* Countdown + Match */}
      <div className="card-meta-row">
        <div className={`countdown-pill ${countdown.urgent ? 'urgent' : ''} ${countdown.closed ? 'closed' : ''}`}>
          <Clock size={13} />
          <span>{countdown.text}</span>
        </div>
        <MatchScore score={matchScore} />
      </div>

      {/* Date Row */}
      <div className="card-dates">
        <div className="date-item">
          <Calendar size={13} />
          <span>Deadline: <strong>{formatDate(opp.applicationDeadline)}</strong></span>
        </div>
        {opp.examDate && (
          <div className="date-item">
            <Calendar size={13} />
            <span>Exam: <strong>{formatDate(opp.examDate)}</strong></span>
          </div>
        )}
        <div className="date-item">
          <MapPin size={13} />
          <span>{opp.state}</span>
        </div>
        <div className="date-item">
          <Users size={13} />
          <span>{opp.seats.toLocaleString('en-IN')} seats</span>
        </div>
      </div>

      {/* Expandable */}
      {expanded && (
        <div className="card-expanded anim-fade">
          <p className="card-desc">{opp.description}</p>
          <div className="eligibility-box">
            <p className="elig-title">Eligibility Criteria</p>
            <div className="elig-grid">
              <div className="elig-item">
                <CheckCircle size={14} style={{ color: 'var(--success)' }} />
                <span><strong>Education:</strong> {opp.eligibility.education.join(', ')}</span>
              </div>
              {opp.eligibility.minPercentage > 0 && (
                <div className="elig-item">
                  <CheckCircle size={14} style={{ color: 'var(--success)' }} />
                  <span><strong>Min %:</strong> {opp.eligibility.minPercentage}%</span>
                </div>
              )}
              <div className="elig-item">
                <CheckCircle size={14} style={{ color: 'var(--success)' }} />
                <span><strong>Age:</strong> {opp.eligibility.ageMin}–{opp.eligibility.ageMax === 0 ? 'No limit' : opp.eligibility.ageMax} yrs</span>
              </div>
              <div className="elig-item">
                <CheckCircle size={14} style={{ color: 'var(--success)' }} />
                <span><strong>Income:</strong> {opp.eligibility.income}</span>
              </div>
              <div className="elig-item">
                <CheckCircle size={14} style={{ color: 'var(--success)' }} />
                <span><strong>Category:</strong> {opp.eligibility.category.join(', ')}</span>
              </div>
            </div>
          </div>
          <div className="card-tags">
            {opp.tags.map(t => <span key={t} className="tag">{t}</span>)}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="card-actions">
        <button className="btn btn-ghost btn-sm" onClick={() => setExpanded(!expanded)}>
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          {expanded ? 'Less' : 'Details & Eligibility'}
        </button>
        <button
          onClick={() => window.open(opp.applyLink, '_blank', 'noopener,noreferrer')}
          className="btn btn-primary btn-sm"
        >
          Apply Now <ExternalLink size={13} />
        </button>
      </div>
    </div>
  );
}
