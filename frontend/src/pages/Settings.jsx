import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useOperations } from '../context/OperationContext';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Trash2, 
  LogOut, 
  Settings2, 
  Database,
  ShieldAlert
} from 'lucide-react';
import { motion } from 'framer-motion';

const Settings = () => {
  const { user, logout } = useAuth();
  const { clearAllHistory } = useOperations();
  const navigate = useNavigate();

  const handleClearHistory = () => {
    if (confirm('¿Estás seguro de que quieres eliminar DEFINITIVAMENTE todo tu historial de operaciones? Esta acción no se puede deshacer.')) {
      clearAllHistory();
      alert('Tu historial ha sido vaciado.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'IN';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* SaaS Page Header */}
      <div className="border-b border-white/5 pb-5">
        <h2 className="text-xl font-bold tracking-tight text-white font-display">Ajustes del Sistema</h2>
        <p className="text-xs text-zinc-500">Configura tu perfil de usuario, base de datos e interfaz matemática</p>
      </div>

      {/* Grid Layout splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Profile details block */}
        <div className="space-y-4">
          <div className="saas-card p-6 bg-[#0a0a0f]/60 text-center flex flex-col items-center space-y-4 border border-white/5">
            <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-accent-purple to-accent-blue flex items-center justify-center text-white text-lg font-bold shadow-xl border border-white/10">
              {getInitials(user?.nombre)}
            </div>
            
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-zinc-100">{user?.nombre || 'Usuario'}</h3>
              <p className="text-xs text-zinc-500 font-mono select-all">{user?.correo}</p>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-xs font-semibold rounded-lg transition duration-200 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>

          <div className="saas-card p-5 bg-[#0a0a0f]/60 text-xs space-y-3 border border-white/5">
            <span className="text-[10px] font-bold text-zinc-400 block tracking-wider uppercase">Licencia & Cuenta</span>
            <div className="flex items-center justify-between text-zinc-300">
              <span>Tipo de Perfil:</span>
              <span className="text-accent-blue font-bold">Estudiante AI</span>
            </div>
            <div className="flex items-center justify-between text-zinc-300">
              <span>Rendimiento Gráfico:</span>
              <span className="text-emerald-400 font-bold">GPU Acelerada</span>
            </div>
          </div>
        </div>

        {/* Right configuration forms (Spans 2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Core parameters preferences */}
          <div className="saas-card p-6 bg-[#0a0a0f]/60 border border-white/5 space-y-5">
            <h3 className="text-xs font-bold text-zinc-300 tracking-wider flex items-center space-x-2">
              <Settings2 className="h-4.5 w-4.5 text-accent-blue" />
              <span>PREFERENCIAS DE CÁLCULO</span>
            </h3>

            <div className="space-y-4">
              {/* Row 1: Decimal precision */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-zinc-950/40 border border-white/5 rounded-xl">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-zinc-200 block">Precisión Numérica</span>
                  <span className="text-[10px] text-zinc-500 block">Número de dígitos decimales evaluados en integrales definidas.</span>
                </div>
                <select className="bg-zinc-950 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-accent-blue/50 cursor-pointer">
                  <option>6 decimales (Estándar)</option>
                  <option>8 decimales (Alta precisión)</option>
                  <option>4 decimales (Simplificada)</option>
                </select>
              </div>

              {/* Row 2: Default variable */}
              <div className="flex items-center justify-between p-4 bg-zinc-950/40 border border-white/5 rounded-xl">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-zinc-200 block">Variable de Sistema Estándar</span>
                  <span className="text-[10px] text-zinc-500 block">Símbolo por defecto utilizado al graficar y derivar expresiones.</span>
                </div>
                <span className="font-mono text-xs font-bold text-zinc-400 bg-zinc-950 border border-white/10 px-3 py-1 rounded-lg">
                  x
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Storage and history clearing */}
          <div className="saas-card p-6 bg-[#0a0a0f]/60 border border-red-500/10 space-y-4">
            <h3 className="text-xs font-bold text-red-400 tracking-wider flex items-center space-x-2">
              <Database className="h-4.5 w-4.5" />
              <span>ZONA DE SEGURIDAD / ALMACENAMIENTO</span>
            </h3>

            <p className="text-xs text-zinc-500 leading-relaxed">
              Administra los registros y cálculos almacenados. Al limpiar tu historial, todos tus datos recopilados en tu cuenta del servidor PostgreSQL se borrarán de forma inmediata.
            </p>

            <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl flex items-start space-x-3 text-red-400 text-xs leading-relaxed">
              <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span>Esta acción es irreversible y vaciará permanentemente tu bitácora de operaciones matemáticas en línea.</span>
            </div>

            <div className="pt-2">
              <button
                onClick={handleClearHistory}
                className="flex items-center space-x-1.5 py-2.5 px-4 bg-red-500/10 hover:bg-red-500/15 text-red-400 text-xs font-semibold rounded-lg border border-red-500/20 transition cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                <span>Borrar Historial permanentemente</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </motion.div>
  );
};

export default Settings;
