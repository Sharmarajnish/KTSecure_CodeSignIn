import { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  Key,
  FileSignature,
  Search,
  ChevronRight,
  Cpu,
  Clock,
  Book,
  LogOut,
  Shield
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import Organizations from './components/Organizations';
import UsersPage from './components/Users';
import Keys from './components/Keys';
import SigningConfigs from './components/SigningConfigs';
import Projects from './components/Projects';
import AuditLogs from './components/AuditLogs';
import Documentation from './components/Documentation';
import CertificateAuthority from './components/CertificateAuthority';
import { NotificationCenter, NotificationBadge } from './components/NotificationCenter';
import { AIChatbot } from './components/AIChatbot';
import { LoginPage } from './components/LoginPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

function Sidebar() {
  const { logout, user } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div style={{
            background: 'white',
            borderRadius: '6px',
            padding: '4px 8px',
            display: 'inline-flex',
            alignItems: 'center'
          }}>
            <img
              src="/kt-secure-logo.png"
              alt="KT Secure"
              style={{ height: '24px', width: 'auto' }}
            />
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-title">Overview</div>
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
            <LayoutDashboard />
            <span>Dashboard</span>
            <ChevronRight className="nav-arrow" />
          </NavLink>
        </div>

        <div className="nav-section">
          <div className="nav-section-title">Management</div>
          <NavLink to="/organizations" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Building2 />
            <span>Organizations</span>
            <ChevronRight className="nav-arrow" />
          </NavLink>
          <NavLink to="/users" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Users />
            <span>Users</span>
            <ChevronRight className="nav-arrow" />
          </NavLink>
          <NavLink to="/projects" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Cpu />
            <span>Projects / ECUs</span>
            <ChevronRight className="nav-arrow" />
          </NavLink>
        </div>

        <div className="nav-section">
          <div className="nav-section-title">Security</div>
          <NavLink to="/keys" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Key />
            <span>PKCS#11 Keys</span>
            <ChevronRight className="nav-arrow" />
          </NavLink>
          <NavLink to="/signing-configs" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <FileSignature />
            <span>Signing Configs</span>
            <ChevronRight className="nav-arrow" />
          </NavLink>
          <NavLink to="/certificates" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Shield />
            <span>Certificates</span>
            <ChevronRight className="nav-arrow" />
          </NavLink>
        </div>

        <div className="nav-section">
          <div className="nav-section-title">System</div>
          <NavLink to="/audit-logs" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Clock />
            <span>Audit Logs</span>
            <ChevronRight className="nav-arrow" />
          </NavLink>
          <NavLink to="/documentation" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Book />
            <span>Documentation</span>
            <ChevronRight className="nav-arrow" />
          </NavLink>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div style={{ padding: 'var(--spacing-md)', borderTop: '1px solid rgba(139, 92, 246, 0.15)' }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-accent-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: 600
              }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'white' }}>{user.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>{user.role}</div>
              </div>
            </div>
          )}
          <button
            onClick={logout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
              padding: 'var(--spacing-sm) var(--spacing-md)',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: '#ef4444',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 500
            }}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

function Header({ onNotificationClick }: { onNotificationClick: () => void }) {
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Dashboard';
      case '/organizations': return 'Organizations';
      case '/users': return 'Users';
      case '/projects': return 'Projects / ECUs';
      case '/keys': return 'PKCS#11 Keys';
      case '/signing-configs': return 'Signing Configurations';
      case '/audit-logs': return 'Audit Logs';
      case '/documentation': return 'Documentation';
      default: return 'Dashboard';
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">{getPageTitle()}</h1>
      </div>
      <div className="header-right">
        <div className="search-input">
          <Search />
          <input
            type="text"
            className="form-input"
            placeholder="Search..."
            style={{ width: '250px' }}
          />
        </div>
        <NotificationBadge onClick={onNotificationClick} />
      </div>
    </header>
  );
}

function AuthenticatedApp() {
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Header onNotificationClick={() => setNotificationsOpen(true)} />
        <div className="page-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/organizations" element={<Organizations />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/keys" element={<Keys />} />
            <Route path="/signing-configs" element={<SigningConfigs />} />
            <Route path="/certificates" element={<CertificateAuthority />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
            <Route path="/documentation" element={<Documentation />} />
          </Routes>
        </div>
      </main>
      <NotificationCenter
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
      <AIChatbot />
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading, login } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg-primary)'
      }}>
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={login} />;
  }

  return <AuthenticatedApp />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
