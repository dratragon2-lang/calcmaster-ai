import React, { useState, useMemo } from 'react';
import { useOperations } from '../context/OperationContext';
import { exportToPDF } from '../utils/pdfExport';
import * as math from 'mathjs';
import katex from 'katex';
import { 
  Trash2, 
  Download, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Calendar,
  Layers
} from 'lucide-react';
import { motion } from 'framer-motion';

// Reusable KaTeX Renderer Component
const LaTeX = ({ mathFormula, block = false }) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(mathFormula, {
        displayMode: block,
        throwOnError: false
      });
    } catch (e) {
      return mathFormula;
    }
  }, [mathFormula, block]);

  return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

// Custom LaTeX inline parser for step descriptions
const LaTeXText = ({ text }) => {
  if (typeof text !== 'string') return text;
  
  // Split by block math $$...$$ and inline math $...$
  const parts = text.split(/(\$\$[\s\S]*?\$\$|\$.*?\$)/g);
  
  return (
    <span>
      {parts.map((part, index) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const mathFormula = part.slice(2, -2);
          return <LaTeX key={index} mathFormula={mathFormula} block={true} />;
        } else if (part.startsWith('$') && part.endsWith('$')) {
          const mathFormula = part.slice(1, -1);
          return <LaTeX key={index} mathFormula={mathFormula} block={false} />;
        }
        
        // Remove basic markdown bold markers inside plain text parts
        const cleanPart = part.replace(/\*\*(.*?)\*\*/g, '$1').replace(/`(.*?)`/g, '$1');
        return <span key={index}>{cleanPart}</span>;
      })}
    </span>
  );
};

const History = () => {
  const { history, deleteFromHistory, clearAllHistory, loading } = useOperations();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'derivada' | 'integral' | 'grafica'
  const [expandedItemId, setExpandedItemId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedItemId(prev => prev === id ? null : id);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation(); // Prevent accordion toggle
    if (confirm('¿Estás seguro de que quieres eliminar esta operación del historial?')) {
      deleteFromHistory(id);
    }
  };

  const handleClearAll = () => {
    if (confirm('¿Estás seguro de que quieres vaciar TODO tu historial de operaciones? Esta acción no se puede deshacer.')) {
      clearAllHistory();
    }
  };

  // Convert standard math string to LaTeX using mathjs node toTex
  const getLaTeXFormula = (expr) => {
    try {
      let cleanExpr = expr;
      let bounds = null;
      
      // Parse definite integral bounds formatting: "[a, b] function"
      if (expr.startsWith('[')) {
        const closeBracket = expr.indexOf(']');
        if (closeBracket !== -1) {
          bounds = expr.substring(1, closeBracket);
          cleanExpr = expr.substring(closeBracket + 1).trim();
        }
      }
      
      const node = math.parse(cleanExpr);
      const tex = node.toTex({ parenthesis: 'keep' });
      
      if (bounds) {
        const parts = bounds.split(',');
        const a = parts[0]?.trim() || '';
        const b = parts[1]?.trim() || '';
        return `\\int_{${a}}^{${b}} \\left(${tex}\\right) \\, dx`;
      }
      
      return tex;
    } catch (e) {
      return expr;
    }
  };

  // Filter history list
  const filteredHistory = history.filter(item => {
    const matchesSearch = item.funcion.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (item.resultado && item.resultado.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterType === 'all' || item.tipo === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      
      {/* SaaS Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white font-display">Bitácora de Operaciones</h2>
          <p className="text-xs text-zinc-500">Historial secuencial y exportable de análisis matemáticos</p>
        </div>
        
        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center justify-center space-x-1.5 px-3 py-1.5 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-xs font-semibold rounded-lg transition duration-200 cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            <span>Limpiar Bitácora</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="saas-card p-4 bg-[#0a0a0f]/40 flex flex-col md:flex-row gap-4 items-center border border-white/5">
        {/* Search */}
        <div className="relative w-full md:flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full saas-input py-2 pl-9 pr-4 text-xs font-medium"
            placeholder="Buscar por función o resultado..."
          />
        </div>

        {/* Filter Type */}
        <div className="flex items-center space-x-2 w-full md:w-auto shrink-0">
          <Filter className="h-3.5 w-3.5 text-zinc-500" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full md:w-auto bg-zinc-950 border border-white/5 rounded-lg py-2 px-3 text-xs text-zinc-300 focus:border-accent-purple/80 cursor-pointer focus:outline-none"
          >
            <option value="all">Ver Todas</option>
            <option value="derivada">Derivadas</option>
            <option value="integral">Integrales Definidas</option>
            <option value="grafica">Gráficos</option>
          </select>
        </div>
      </div>

      {/* History Timeline */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent-purple"></div>
          <span className="text-[11px] text-zinc-500 mt-2">Cargando bitácora...</span>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="saas-card p-16 text-center border-dashed border-white/5 flex flex-col items-center justify-center">
          <Layers className="h-8 w-8 text-zinc-700 mb-3" />
          <h3 className="text-zinc-300 font-semibold text-sm">Sin registros matemáticos</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-xs leading-relaxed">
            {searchTerm || filterType !== 'all' 
              ? 'Prueba modificando los filtros o el texto ingresado.' 
              : 'Las operaciones calculadas en tu sesión activa aparecerán aquí estructuradas.'
            }
          </p>
        </div>
      ) : (
        /* Timeline Wrapper */
        <div className="relative pl-8 sm:pl-10 space-y-6">
          
          {/* Vertical connection line */}
          <div className="timeline-line" />

          {filteredHistory.map((item) => {
            const isExpanded = expandedItemId === item.id;
            const formattedDate = new Date(item.fecha).toLocaleString('es-ES', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            });

            let stepsList = item.pasos;
            if (typeof item.pasos === 'string') {
              try {
                stepsList = JSON.parse(item.pasos);
              } catch (e) {
                stepsList = [item.pasos];
              }
            }

            // Dot border colors based on type
            const dotBorderClass = item.tipo === 'derivada' 
              ? 'border-accent-blue' 
              : item.tipo === 'integral' 
              ? 'border-accent-purple' 
              : 'border-emerald-500';

            return (
              <div 
                key={item.id}
                onClick={() => toggleExpand(item.id)}
                className="timeline-item relative group cursor-pointer"
              >
                {/* Timeline interactive dot node */}
                <div className={`timeline-dot ${dotBorderClass} group-hover:scale-125`} />

                {/* Calculation Card */}
                <div className="saas-card p-5 bg-[#0a0a0f]/60 hover:bg-[#0f0f18]/60 relative border border-white/5 overflow-hidden transition-all duration-300">
                  
                  {/* Top card header details */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center space-x-3">
                      <span className={`text-[9px] font-bold tracking-widest px-2.5 py-0.5 rounded-full uppercase ${
                        item.tipo === 'derivada'
                          ? 'bg-accent-blue/10 text-accent-blue border border-accent-blue/20'
                          : item.tipo === 'integral'
                          ? 'bg-accent-purple/10 text-accent-purple border border-accent-purple/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {item.tipo}
                      </span>
                      
                      <span className="flex items-center text-[10px] text-zinc-500 space-x-1.5 font-medium">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formattedDate}</span>
                      </span>
                    </div>

                    {/* Actions tools inside card header */}
                    <div className="flex items-center space-x-1.5 self-end sm:self-auto">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          exportToPDF(item);
                        }}
                        className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-white/5 border border-white/5 transition cursor-pointer"
                        title="Exportar PDF"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, item.id)}
                        className="p-1.5 rounded-md text-red-400/80 hover:text-red-300 hover:bg-red-500/10 border border-red-500/10 transition cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Math statement content in styled LaTeX */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-zinc-950/20 p-3 rounded-lg border border-white/5">
                    <div className="space-y-1.5 min-w-0">
                      <span className="text-[9px] font-bold text-zinc-500 tracking-wider uppercase block">Operación de Entrada</span>
                      <div className="text-xs font-mono text-zinc-200 overflow-x-auto scrollbar-none py-0.5">
                        <LaTeX mathFormula={getLaTeXFormula(item.funcion)} block={false} />
                      </div>
                    </div>
                    
                    <div className="hidden sm:block text-zinc-700 font-semibold px-2">→</div>
                    
                    <div className="space-y-1.5 text-left sm:text-right shrink-0">
                      <span className="text-[9px] font-bold text-zinc-500 tracking-wider uppercase block">Resultado Resuelto</span>
                      <div className="text-xs font-extrabold text-accent-blue font-mono glow-blue overflow-x-auto scrollbar-none py-0.5">
                        {item.tipo === 'derivada' ? (
                          <LaTeX mathFormula={getLaTeXFormula(item.resultado)} block={false} />
                        ) : (
                          item.resultado
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Accordion steps toggle indicator at bottom of card */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5 text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
                    <div className="flex items-center space-x-1">
                      <BookOpen className="h-3.5 w-3.5 text-accent-purple" />
                      <span>{isExpanded ? 'Ocultar resolución paso a paso' : 'Ver resolución paso a paso'}</span>
                    </div>
                    {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </div>

                  {/* Inline Expanded resolution details drawer */}
                  {isExpanded && (
                    <div className="mt-4 border-t border-white/5 pt-4 bg-zinc-950/20 space-y-3 animate-slideDown">
                      <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                        {Array.isArray(stepsList) ? (
                          stepsList.map((step, idx) => {
                            const isTitle = step.startsWith('**');
                            return (
                              <div 
                                key={idx} 
                                className={`p-3 rounded-lg text-xs leading-relaxed transition-all border ${
                                  isTitle 
                                    ? 'bg-gradient-to-r from-accent-purple/5 to-transparent border-accent-purple/20 text-white font-semibold' 
                                    : 'bg-zinc-950/40 border-white/5 text-zinc-300'
                                }`}
                              >
                                <LaTeXText text={step} />
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-3 rounded-lg bg-zinc-950/40 text-xs text-zinc-300">
                            <LaTeXText text={item.pasos} />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default History;
