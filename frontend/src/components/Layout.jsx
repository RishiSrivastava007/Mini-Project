import React, { useContext } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, FileText, PlusSquare, User, LogOut } from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const getPageInfo = () => {
    switch (location.pathname) {
      case '/': return { title: `Welcome back, ${user?.name || 'User'}!`, subtitle: "Here's your invoice overview." };
      case '/invoices': return { title: 'All Invoices', subtitle: 'Manage all your invoices in one place.' };
      case '/invoices/new': return { title: 'Create new invoice', subtitle: 'Create and send professional invoices.' };
      default: return { title: `Welcome back, ${user?.name || 'User'}!`, subtitle: "Here's your invoice overview." };
    }
  };

  const info = getPageInfo();

  return (
    <div className="app-wrapper">
      <aside className="sidebar">
        <div className="sidebar-header">
          <FileText size={24} color="var(--primary-color)" />
          <span>AI Invoice App</span>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/" className={({isActive}) => isActive && location.pathname === '/' ? "nav-item active" : "nav-item"}>
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>
          <NavLink to="/invoices" className={({isActive}) => isActive && location.pathname === '/invoices' ? "nav-item active" : "nav-item"}>
            <FileText size={20} /> Invoices
          </NavLink>
          <NavLink to="/invoices/new" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <PlusSquare size={20} /> Create Invoice
          </NavLink>
          <NavLink to="/profile" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <User size={20} /> Profile
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <button onClick={logout} className="nav-item" style={{background:'transparent', border:'none', width:'100%', cursor:'pointer', textAlign:'left'}}>
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>
      
      <div className="page-wrapper">
        <header className="top-header">
          <div className="header-title">
            <h2>{info.title}</h2>
            {info.subtitle && <p>{info.subtitle}</p>}
          </div>
          <div className="user-profile">
            <div className="avatar">{user?.name?.charAt(0).toUpperCase() || 'U'}</div>
            <div className="user-info">
              <p>{user?.name || 'User'}</p>
              <span>{user?.email || 'user@example.com'}</span>
            </div>
          </div>
        </header>
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
