import { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  Key,
  FileSignature,
  Settings,
  Search,
  ChevronRight,
  Cpu,
  Clock,
  Book
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Organizations from './components/Organizations';
import UsersPage from './components/Users';
import Keys from './components/Keys';
import SigningConfigs from './components/SigningConfigs';
import Projects from './components/Projects';
import AuditLogs from './components/AuditLogs';
import Documentation from './components/Documentation';
import { NotificationCenter, NotificationBadge } from './components/NotificationCenter';
import './index.css';

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img
            src="/kt-secure-logo.png"
            alt="KT Secure"
            style={{ height: '28px', width: 'auto' }}
          />
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-title">Overview</div>
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
            <LayoutDashboard />
            <span>Dashboard</span>
          </NavLink>
        </div>

        <div className="nav-section">
          <div className="nav-section-title">Management</div>
          <NavLink to="/organizations" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Building2 />
            <span>Organizations</span>
          </NavLink>
          <NavLink to="/users" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Users />
            <span>Users</span>
          </NavLink>
          <NavLink to="/projects" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Cpu />
            <span>Projects / ECUs</span>
          </NavLink>
        </div>

        <div className="nav-section">
          <div className="nav-section-title">HSM / Signing</div>
          <NavLink to="/keys" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Key />
            <span>PKCS#11 Keys</span>
          </NavLink>
          <NavLink to="/signing-configs" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <FileSignature />
            <span>Signing Configs</span>
          </NavLink>
        </div>

        <div className="nav-section">
          <div className="nav-section-title">System</div>
          <NavLink to="/audit-logs" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Clock />
            <span>Audit Logs</span>
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Settings />
            <span>Settings</span>
          </NavLink>
          <NavLink to="/documentation" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Book />
            <span>Documentation</span>
          </NavLink>
        </div>
      </nav>
    </aside>
  );
}

function Header() {
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path === '/organizations') return 'Organizations';
    if (path === '/users') return 'Users';
    if (path === '/projects') return 'Projects / ECUs';
    if (path === '/keys') return 'PKCS#11 Keys';
    if (path === '/signing-configs') return 'Signing Configurations';
    if (path === '/audit-logs') return 'Audit Logs';
    if (path === '/settings') return 'Settings';
    if (path === '/documentation') return 'Documentation';
    return 'KT Secure';
  };

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === '/') return null;
    return (
      <div className="flex items-center gap-sm text-sm text-muted">
        <span>Home</span>
        <ChevronRight size={14} />
        <span style={{ color: 'var(--color-text-primary)' }}>{getPageTitle()}</span>
      </div>
    );
  };

  return (
    <header className="header">
      <div>
        <h1 className="header-title">{getPageTitle()}</h1>
        {getBreadcrumb()}
      </div>
      <div className="header-actions">
        <div className="search-input">
          <Search />
          <input
            type="text"
            className="form-input"
            placeholder="Search..."
            style={{ width: '250px' }}
          />
        </div>
        <button className="btn btn-ghost btn-icon">
          <Bell size={20} />
        </button>
      </div>
    </header>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Header />
          <div className="page-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/organizations" element={<Organizations />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/keys" element={<Keys />} />
              <Route path="/signing-configs" element={<SigningConfigs />} />
              <Route path="/audit-logs" element={<AuditLogs />} />
              <Route path="/documentation" element={<Documentation />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;

