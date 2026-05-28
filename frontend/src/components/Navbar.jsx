import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calculator, History, Settings, LogOut, LogIn, User, Menu, X, Cpu } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: Calculator, requireAuth: false },
    { name: 'Historial', path: '/history', icon: History, requireAuth: true },
    { name: 'Configuración', path: '/settings', icon: Settings, requireAuth: true },
  ];

  return (
    <nav className="sticky top-0 z-50 glass-card border-b border-white/5 py-4 px-6 md:px-12 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo and Brand */}
        <Link to="/" className="flex items-center space-x-3 text-slate-100 font-bold text-xl group">
          <div className="p-2 bg-gradient-to-tr from-accent-purple to-accent-blue rounded-lg shadow-lg group-hover:scale-105 transition-all duration-300">
            <Cpu className="h-5 w-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-slate-100 via-slate-100 to-accent-purple bg-clip-text text-transparent group-hover:to-accent-blue transition-all duration-500 font-semibold tracking-wide">
            CalcMaster <span className="text-accent-blue font-bold">AI</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => {
            if (link.requireAuth && !isAuthenticated) return null;
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'text-accent-blue bg-accent-blue/10 border-b-2 border-accent-blue/80'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Right side: Auth Controls */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                <User className="h-4 w-4 text-accent-purple" />
                <span className="text-xs font-semibold text-slate-200">{user?.nombre}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 transition-all duration-200"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Salir</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <span className="text-xs font-medium text-slate-500 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                Modo Invitado
              </span>
              <Link
                to="/login"
                className="flex items-center space-x-1.5 px-4 py-1.5 rounded-md text-xs font-semibold text-white bg-gradient-to-r from-accent-blue to-accent-purple hover:opacity-90 shadow-md shadow-accent-purple/10 transition-all duration-200"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Ingresar</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-200 hover:bg-white/5 focus:outline-none"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-white/5 space-y-2 animate-fadeIn">
          {navLinks.map((link) => {
            if (link.requireAuth && !isAuthenticated) return null;
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-md text-base font-medium transition-all ${
                  active
                    ? 'text-accent-blue bg-accent-blue/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{link.name}</span>
              </Link>
            );
          })}
          
          <div className="pt-4 border-t border-white/5">
            {isAuthenticated ? (
              <div className="flex flex-col space-y-3 px-3">
                <div className="flex items-center space-x-2 text-slate-200">
                  <User className="h-5 w-5 text-accent-purple" />
                  <span className="font-medium text-sm">{user?.nombre}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-3 px-3">
                <div className="text-center text-xs text-slate-500">
                  Historial desactivado en modo invitado
                </div>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-semibold text-white bg-gradient-to-r from-accent-blue to-accent-purple"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Ingresar a la plataforma</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
