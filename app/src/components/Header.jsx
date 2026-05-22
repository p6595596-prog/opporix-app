import { useState } from 'react';
import { Search, Bell, Menu, X, Sparkles } from 'lucide-react';
import { notifications } from '../data/mockData';
import './Header.css';

export default function Header({ onMenuToggle, menuOpen, lastFetched }) {
  const [showNotif, setShowNotif] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  // Calculate minutes ago
  const minsAgo = lastFetched ? Math.floor((new Date() - lastFetched) / 60000) : 0;
  const timeText = minsAgo === 0 ? 'Just now' : `${minsAgo}m ago`;

  return (
    <header className="top-header glass">
      <button className="menu-btn btn btn-ghost" onClick={onMenuToggle}>
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Search */}
      <div className="header-search">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          placeholder="Search scholarships, jobs, exams..."
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          className="search-input"
        />
        {searchVal && (
          <button className="search-clear" onClick={() => setSearchVal('')}>
            <X size={14} />
          </button>
        )}
      </div>

      <div className="header-right">
        {/* Live badge */}
        <div className="live-badge" title={`Data fetched from live source`}>
          <span className="live-dot" style={{ animation: 'pulse-glow 2s infinite' }} />
          Live • <span style={{ opacity: 0.7, fontSize: '0.9em', marginLeft: 4 }}>{timeText}</span>
        </div>

        {/* Notifications */}
        <div className="notif-wrap">
          <button className="notif-btn btn btn-ghost" onClick={() => setShowNotif(!showNotif)}>
            <Bell size={18} />
            <span className="notif-count">{notifications.length}</span>
          </button>
          {showNotif && (
            <div className="notif-dropdown glass-strong anim-fade">
              <p className="notif-title">Notifications</p>
              {notifications.map((n) => (
                <div key={n.id} className={`notif-item notif-${n.type}`}>
                  <div className="notif-dot" />
                  <div>
                    <p className="notif-text">{n.text}</p>
                    <p className="notif-time">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="header-avatar">
          <Sparkles size={16} />
        </div>
      </div>
    </header>
  );
}
