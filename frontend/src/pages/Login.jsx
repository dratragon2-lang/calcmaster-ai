import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Cpu, Mail, Lock, User, ArrowRight, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    if (!correo || !password) {
      setFormError('Por favor completa todos los campos requeridos.');
      return;
    }

    if (!isLogin && !nombre) {
      setFormError('Por favor ingresa tu nombre para registrarte.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(correo, password);
      } else {
        await register(nombre, correo, password);
      }
      navigate('/'); // Redirect to dashboard
    } catch (err) {
      setFormError(err.message || 'Ocurrió un error inesperado. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestEntry = () => {
    navigate('/');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25 }}
      className="min-h-[85vh] flex flex-col items-center justify-center py-10 relative"
    >
      {/* Background radial gradients for ambient neon glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-accent-purple/5 rounded-full blur-[120px] pointer-events-none bg-glow-pulse"></div>
      <div className="absolute top-1/3 left-1/3 w-[250px] h-[250px] bg-accent-blue/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-sm saas-card p-8 shadow-2xl relative z-10 border border-white/5 bg-[#0b0b11]/70 font-display">
        
        {/* Top brand header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-2 bg-zinc-900 border border-white/10 rounded-lg shadow-sm mb-3">
            <Cpu className="h-5 w-5 text-accent-blue" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h1>
          <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
            {isLogin 
              ? 'Introduce tus datos para acceder a tu laboratorio matemático.' 
              : 'Regístrate para guardar operaciones y revisar tu historial.'
            }
          </p>
        </div>

        {formError && (
          <div className="mb-5 p-3 bg-red-500/10 border border-red-500/15 rounded-lg flex items-start space-x-2 text-red-400 text-xs animate-slideDown">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
            <span className="leading-tight">{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre (Registration only) */}
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">Nombre</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full saas-input py-2 pl-9 pr-4 text-xs font-medium"
                  placeholder="Juan Pérez"
                />
              </div>
            </div>
          )}

          {/* Correo */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">Correo Electrónico</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className="w-full saas-input py-2 pl-9 pr-4 text-xs font-medium"
                placeholder="usuario@ejemplo.com"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">Contraseña</label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full saas-input py-2 pl-9 pr-4 text-xs font-medium"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 saas-button-primary text-xs font-semibold cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-1.5"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white/20 border-t-white"></div>
            ) : (
              <>
                <span>{isLogin ? 'Ingresar' : 'Registrarse'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
          <div className="relative flex justify-center text-[10px]"><span className="bg-[#0b0b11] px-2 text-zinc-500 font-medium">o también</span></div>
        </div>

        {/* Guest access option */}
        <button
          onClick={handleGuestEntry}
          className="w-full py-2 saas-button-secondary text-xs font-semibold cursor-pointer"
        >
          Continuar como Invitado
        </button>

        {/* Toggle link */}
        <div className="text-center mt-5">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setFormError('');
            }}
            className="text-[11px] text-accent-blue hover:text-accent-purple font-medium transition duration-200 cursor-pointer"
          >
            {isLogin 
              ? '¿No tienes una cuenta? Regístrate' 
              : '¿Ya tienes una cuenta? Inicia sesión'
            }
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Login;
