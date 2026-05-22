import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import OpportunityCard from '../components/OpportunityCard';
import { isGoodMatch } from '../utils/match';
import './OpportunitiesList.css';

const statusFilters = ['all', 'active', 'upcoming'];

export default function OpportunitiesList({ opportunities, type, title, icon: Icon, color, userProfile, applications, onUpdateStatus }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('deadline');

  let filtered = opportunities
    .filter(o => type === 'all' || o.type === type)
    .filter(o => status === 'all' || o.status === status)
    .filter(o =>
      o.title.toLowerCase().includes(search.toLowerCase()) ||
      o.organization.toLowerCase().includes(search.toLowerCase()) ||
      o.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    );

  // Profile-based filtering (skip if type is 'all' because they explicitly saved these in Tracker)
  if (type !== 'all' && userProfile) {
    filtered = filtered.filter(o => isGoodMatch(o, userProfile));
  }

  filtered = filtered.sort((a, b) => {
      if (sort === 'deadline') return new Date(a.applicationDeadline) - new Date(b.applicationDeadline);
      if (sort === 'seats') return b.seats - a.seats;
      return 0;
    });

  return (
    <div className="list-page anim-fade-up">
      {/* Page Header */}
      <div className="list-hero glass" style={{ '--page-color': color }}>
        <div className="list-hero-icon" style={{ background: `${color}22`, color }}>
          {Icon && <Icon size={28} />}
        </div>
        <div>
          <h1 className="list-title">{title}</h1>
          <p className="list-sub">{filtered.length} opportunities found</p>
        </div>
      </div>

      {/* Category Navigation (Horizontal Scroll) */}
      <div className="category-nav">
        <Link to="/scholarships" className={`cat-pill ${type === 'scholarship' ? 'active' : ''}`}>Scholarships</Link>
        <Link to="/jobs" className={`cat-pill ${type === 'job' ? 'active' : ''}`}>Govt. Jobs</Link>
        <Link to="/exams" className={`cat-pill ${type === 'exam' ? 'active' : ''}`}>Exams</Link>
        <Link to="/internships" className={`cat-pill ${type === 'internship' ? 'active' : ''}`}>Internships</Link>
        <Link to="/fellowships" className={`cat-pill ${type === 'fellowship' ? 'active' : ''}`}>Fellowships</Link>
      </div>

      {/* Filters */}
      <div className="filters-bar glass">
        <div className="filter-search">
          <Search size={15} className="fsearch-icon" />
          <input
            type="text"
            placeholder={`Search ${title}...`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="filter-input"
          />
          {search && <button className="fsearch-clear" onClick={() => setSearch('')}><X size={14} /></button>}
        </div>

        <div className="filter-group">
          <SlidersHorizontal size={15} style={{ color: 'var(--text-muted)' }} />
          {statusFilters.map(s => (
            <button
              key={s}
              className={`filter-pill ${status === s ? 'active' : ''}`}
              style={status === s ? { background: color + '22', color, borderColor: color + '55' } : {}}
              onClick={() => setStatus(s)}
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <select
          className="sort-select"
          value={sort}
          onChange={e => setSort(e.target.value)}
        >
          <option value="deadline">Sort: Deadline</option>
          <option value="seats">Sort: Most Seats</option>
        </select>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="empty-state glass">
          <p className="empty-icon">🔍</p>
          <p className="empty-title">No results found</p>
          <p className="empty-sub">Try changing your search or filter criteria</p>
          <button className="btn btn-ghost" onClick={() => { setSearch(''); setStatus('all'); }}>Clear Filters</button>
        </div>
      ) : (
        <div className="cards-grid">
          {filtered.map((o, i) => (
            <OpportunityCard key={o.id} opp={o} userProfile={userProfile} delay={i * 60} applications={applications} onUpdateStatus={onUpdateStatus} />
          ))}
        </div>
      )}
    </div>
  );
}
