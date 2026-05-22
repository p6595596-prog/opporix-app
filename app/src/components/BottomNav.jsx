import { NavLink } from 'react-router-dom';
import { LayoutGrid, BookmarkCheck, ShieldCheck, User } from 'lucide-react';
import './BottomNav.css';

export default function BottomNav() {
  return (
    <nav className="bottom-nav glass">
      <NavLink to="/" end className={({ isActive }) => `bnav-item ${isActive ? 'active' : ''}`}>
        <LayoutGrid size={22} />
        <span>Home</span>
      </NavLink>
      <NavLink to="/saved" className={({ isActive }) => `bnav-item ${isActive ? 'active' : ''}`}>
        <BookmarkCheck size={22} />
        <span>Saved</span>
      </NavLink>
      <NavLink to="/vault" className={({ isActive }) => `bnav-item ${isActive ? 'active' : ''}`}>
        <ShieldCheck size={22} />
        <span>Vault</span>
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => `bnav-item ${isActive ? 'active' : ''}`}>
        <User size={22} />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
}
