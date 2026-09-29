import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ChevronLeft,
  ChevronRight,
  MenuIcon,
  UserIcon,
  GridIcon,
  LogOutIcon,
} from './icons';

export default function TopBar({ solid, onOpenDrawer }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const isAdmin = user?.tipo_cuenta === 'Admin';

  return (
    <header className={`topbar${solid ? ' topbar--solid' : ''}`}>
      <button
        type="button"
        className="icon-btn topbar-burger"
        onClick={onOpenDrawer}
        aria-label="Abrir menú"
      >
        <MenuIcon size={20} />
      </button>

      <div className="topbar-nav">
        <button
          type="button"
          className="icon-btn"
          onClick={() => navigate(-1)}
          aria-label="Atrás"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={() => navigate(1)}
          aria-label="Adelante"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="topbar-spacer" />

      <div className="topbar-actions">
        <span className="chip chip--outline topbar-chip">
          {isAdmin ? 'Admin' : 'Premium'}
        </span>

        <div style={{ position: 'relative' }} ref={menuRef}>
          <button
            type="button"
            className="account-button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Menú de cuenta"
          >
            <span className="account-avatar">
              {user?.nombre ? user.nombre.trim().charAt(0).toUpperCase() : <UserIcon size={16} />}
            </span>
            <span className="account-name">{user?.nombre ?? 'Invitado'}</span>
            <ChevronRight
              size={16}
              style={{ transform: 'rotate(90deg)', opacity: 0.7 }}
            />
          </button>

          {menuOpen && (
            <div className="menu" style={{ right: 0, top: 'calc(100% + 8px)' }} role="menu">
              <div className="menu-account">
                <span className="account-avatar account-avatar--lg">
                  {user?.nombre ? user.nombre.trim().charAt(0).toUpperCase() : <UserIcon size={18} />}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div className="menu-account-name">{user?.nombre ?? 'Invitado'}</div>
                  <div className="menu-account-mail">{user?.email}</div>
                </div>
              </div>

              <hr className="menu-divider" />

              <Link className="menu-item" to="/profile" onClick={() => setMenuOpen(false)}>
                <UserIcon size={16} /> Cuenta
              </Link>

              {isAdmin && (
                <Link className="menu-item" to="/admin" onClick={() => setMenuOpen(false)}>
                  <GridIcon size={16} /> Panel de administración
                </Link>
              )}

              <hr className="menu-divider" />

              <button
                type="button"
                className="menu-item menu-item--danger"
                onClick={handleLogout}
              >
                <LogOutIcon size={16} /> Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
