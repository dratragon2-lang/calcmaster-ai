import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Calculator, 
  History, 
  Settings, 
  LogOut, 
  LogIn, 
  User, 
  Cpu, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsUpDown,
  BookOpen
} from 'lucide-react';

const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: Calculator },
    { name: 'Historial', path: '/history', icon: History, requireAuth: true },
    { name: 'Configuración', path: '/settings', icon: Settings, requireAuth: true },
  ];

  const handleLinkClick = () => {
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  // Get initials for profile avatar
  const getInitials = (name) => {
    if (!name) return 'IN';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <>
      {/* Sidebar background overlay for mobile drawer */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Main Sidebar Container */}
      <aside 
        className={`fixed md:sticky top-0 left-0 h-screen z-50 bg-[#07070b] border-r border-white/5 flex flex-col transition-all duration-300 ${
          isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'md:w-16' : 'md:w-60'}`}
      >
        {/* Sidebar Header Brand */}
        <div className="p-4 flex items-center justify-between border-b border-white/5 h-16 shrink-0">
          <Link 
            to="/" 
            onClick={handleLinkClick}
            className={`flex items-center space-x-3 text-slate-100 font-bold overflow-hidden ${
              isCollapsed ? 'justify-center w-full' : ''
            }`}
          >
            <div className="p-1.5 bg-gradient-to-tr from-accent-purple to-accent-blue rounded-lg shadow-lg">
              <Cpu className="h-5 w-5 text-white" />
            </div>
            {!isCollapsed && (
              <span className="bg-gradient-to-r from-slate-100 to-accent-purple bg-clip-text text-transparent font-semibold tracking-wide text-sm whitespace-nowrap">
                CalcMaster <span className="text-accent-blue font-bold">AI</span>
              </span>
            )}
          </Link>

          {/* Desktop collapse button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-1 rounded-md text-slate-500 hover:text-slate-200 hover:bg-white/5"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Workspace Dropdown Selector (Linear/Slack Style) */}
        {!isCollapsed && (
          <div className="p-3 border-b border-white/5 shrink-0 relative">
            <button
              onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
              className="w-full flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition text-left cursor-pointer"
            >
              <div className="flex items-center space-x-2.5 overflow-hidden">
                <div className="h-5 w-5 bg-accent-purple/20 border border-accent-purple/40 rounded flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-accent-purple">C1</span>
                </div>
                <div className="leading-tight truncate">
                  <span className="text-xs font-semibold text-slate-200 block truncate">Álgebra y Cálculo</span>
                  <span className="text-[9px] text-slate-500 block">Espacio Local</span>
                </div>
              </div>
              <ChevronsUpDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            </button>

            {showWorkspaceMenu && (
              <div className="absolute top-full left-3 right-3 mt-1.5 p-1 rounded-lg bg-[#0e0e16] border border-white/10 shadow-2xl z-50 space-y-0.5 animate-slideDown">
                <span className="text-[9px] font-bold text-slate-500 block px-2 py-1 tracking-wider uppercase">Mis Espacios</span>
                <button className="w-full text-left text-xs text-slate-300 hover:text-white p-2 hover:bg-white/5 rounded transition">
                  🏫 Cálculo Diferencial
                </button>
                <button className="w-full text-left text-xs text-slate-300 hover:text-white p-2 hover:bg-white/5 rounded transition">
                  📐 Física Matemática
                </button>
              </div>
            )}
          </div>
        )}

        {/* Navigation items section */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navLinks.map((link) => {
            if (link.requireAuth && !isAuthenticated) return null;
            const Icon = link.icon;
            const active = isActive(link.path);

            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={handleLinkClick}
                className={`flex items-center rounded-lg p-2.5 text-sm font-medium transition-all group duration-150 ${
                  isCollapsed ? 'justify-center' : 'space-x-3'
                } ${
                  active
                    ? 'sidebar-item-active text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
                title={isCollapsed ? link.name : ''}
              >
                <Icon className={`h-4.5 w-4.5 shrink-0 ${active ? 'text-accent-blue' : 'text-slate-400 group-hover:text-slate-200'}`} />
                {!isCollapsed && <span>{link.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Bottom Profile Card */}
        <div className="p-3 border-t border-white/5 shrink-0 bg-black/10">
          {isAuthenticated ? (
            <div className={`flex items-center justify-between ${isCollapsed ? 'flex-col space-y-3' : 'space-x-2'}`}>
              <div className="flex items-center space-x-2.5 overflow-hidden">
                <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-accent-purple to-accent-blue flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                  {getInitials(user?.nombre)}
                </div>
                {!isCollapsed && (
                  <div className="leading-tight truncate">
                    <span className="text-xs font-semibold text-slate-200 block truncate">{user?.nombre}</span>
                    <span className="text-[9px] text-slate-500 block truncate">{user?.correo}</span>
                  </div>
                )}
              </div>
              
              <button
                onClick={handleLogout}
                className={`p-1.5 rounded-md text-red-400/80 hover:text-red-300 hover:bg-red-500/10 border border-red-500/10 cursor-pointer ${
                  isCollapsed ? 'w-8 h-8 flex items-center justify-center' : ''
                }`}
                title="Cerrar Sesión"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {!isCollapsed && (
                <div className="flex items-center space-x-1.5 text-[9px] font-semibold text-slate-500 bg-white/5 p-1.5 rounded border border-white/5 justify-center">
                  <BookOpen className="h-3 w-3 text-accent-purple" />
                  <span>MODO INVITADO ACTIVO</span>
                </div>
              )}
              <Link
                to="/login"
                onClick={handleLinkClick}
                className={`w-full flex items-center bg-gradient-to-r from-accent-blue to-accent-purple text-white text-xs font-semibold py-2 px-3 rounded-lg hover:opacity-90 transition justify-center ${
                  isCollapsed ? 'h-8 w-8 p-0 rounded-full' : 'space-x-1.5'
                }`}
                title="Iniciar Sesión"
              >
                <LogIn className="h-3.5 w-3.5" />
                {!isCollapsed && <span>Ingresar</span>}
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
