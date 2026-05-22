import { NavLink, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  LayoutGrid, GraduationCap, Briefcase, FileText,
  Rocket, Award, Bell, BookmarkCheck, User, ChevronRight, ShieldCheck
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { to: '/', icon: LayoutGrid, label: 'Dashboard' },
  { to: '/saved', icon: BookmarkCheck, label: 'Saved' },
  { to: '/vault', icon: ShieldCheck, label: 'My Vault' },
  { to: '/scholarships', icon: GraduationCap, label: 'Scholarships' },
  { to: '/jobs', icon: Briefcase, label: 'Govt. Jobs' },
  { to: '/exams', icon: FileText, label: 'Exams' },
  { to: '/internships', icon: Rocket, label: 'Internships' },
  { to: '/fellowships', icon: Award, label: 'Fellowships' },
];

const bottomItems = [
  { to: '/profile', icon: User, label: 'My Profile' },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar glass-strong ${open ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <img src="/logo.png" alt="Opporix Logo" style={{ height: '40px', width: 'auto', objectFit: 'contain' }} />
          <span className="logo-text">Opporix</span>
        </div>

        {/* Main Nav */}
        <nav className="sidebar-nav">
          <p className="nav-label">Opportunities</p>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Icon size={18} />
              <span>{label}</span>
              <ChevronRight size={14} className="nav-arrow" />
            </NavLink>
          ))}

          <p className="nav-label" style={{ marginTop: 24 }}>Account</p>
          {bottomItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Icon size={18} />
              <span>{label}</span>
              <ChevronRight size={14} className="nav-arrow" />
            </NavLink>
          ))}
          <button className="nav-item" onClick={async () => { await supabase.auth.signOut(); window.location.href = '/login'; }} style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', color: 'var(--danger)' }}>
            <User size={18} />
            <span>Sign Out</span>
          </button>
        </nav>

        {/* Bottom card */}
        <div className="sidebar-promo">
          <Bell size={18} />
          <div>
            <p className="promo-title">Stay Updated!</p>
            <p className="promo-sub">New opportunities added daily</p>
          </div>
        </div>
      </aside>
    </>
  );
}
