import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';

const OperationContext = createContext(null);

const API_URL = 'http://localhost:5000/api';

export const OperationProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch history when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchHistory();
    } else {
      // Clear history when user logs out (guest state starts fresh)
      setHistory([]);
    }
  }, [isAuthenticated, token]);

  const fetchHistory = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/operations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setHistory(data.history || []);
      } else {
        throw new Error(data.error || 'Error al obtener historial');
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveToHistory = async (tipo, funcion, resultado, pasos) => {
    setError(null);
    const newOpLocal = {
      id: 'local_' + Date.now(),
      tipo,
      funcion,
      resultado,
      pasos,
      fecha: new Date().toISOString()
    };

    if (!isAuthenticated) {
      // Guest mode: save to local state only
      setHistory(prev => [newOpLocal, ...prev]);
      return newOpLocal;
    }

    try {
      const res = await fetch(`${API_URL}/operations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ tipo, funcion, resultado, pasos })
      });
      const data = await res.json();
      if (res.ok) {
        // Prepend backend saved operation
        setHistory(prev => [data.operation, ...prev]);
        return data.operation;
      } else {
        throw new Error(data.error || 'Error al guardar en el historial');
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
      // Fallback: save to local state even if server fails
      setHistory(prev => [newOpLocal, ...prev]);
      return newOpLocal;
    }
  };

  const deleteFromHistory = async (id) => {
    setError(null);
    
    // If it's a local/guest ID, delete it locally
    if (String(id).startsWith('local_') || !isAuthenticated) {
      setHistory(prev => prev.filter(item => item.id !== id));
      return;
    }

    try {
      const res = await fetch(`${API_URL}/operations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setHistory(prev => prev.filter(item => item.id !== id));
      } else {
        throw new Error(data.error || 'Error al eliminar registro');
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const clearAllHistory = async () => {
    setError(null);
    if (!isAuthenticated) {
      setHistory([]);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/operations`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setHistory([]);
      } else {
        throw new Error(data.error || 'Error al limpiar historial');
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const value = {
    history,
    loading,
    error,
    fetchHistory,
    saveToHistory,
    deleteFromHistory,
    clearAllHistory
  };

  return <OperationContext.Provider value={value}>{children}</OperationContext.Provider>;
};

export const useOperations = () => {
  const context = useContext(OperationContext);
  if (!context) {
    throw new Error('useOperations must be used within an OperationProvider');
  }
  return context;
};
