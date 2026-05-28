import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useOperations } from '../context/OperationContext';
import { validateFunction, deriveWithSteps, integrateWithSteps } from '../utils/mathSolver';
import { exportToPDF } from '../utils/pdfExport';
import MathChart from '../components/MathChart';
import Math3DChart from '../components/Math3DChart';
import { DashboardSkeleton } from '../components/SkeletonLoader';
import * as math from 'mathjs';
import katex from 'katex';
import { 
  Play, 
  Trash2, 
  Download, 
  ChevronRight, 
  HelpCircle, 
  Sliders,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Settings2,
  CornerDownLeft,
  BookOpen
} from 'lucide-react';
import { motion } from 'framer-motion';

// Inline KaTeX equation component
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

const Dashboard = () => {
  const { saveToHistory } = useOperations();
  
  // Math States
  const [funcion, setFuncion] = useState('x^2 - 4*x + 3');
  const [validation, setValidation] = useState({ isValid: true, error: null });
  const [lastEvaluatedFunction, setLastEvaluatedFunction] = useState('');
  
  // Action/Calculation States
  const [activeTab, setActiveTab] = useState('derivada'); // 'derivada' | 'integral' | 'grafica' | 'grafica3d'
  const [limiteInferior, setLimiteInferior] = useState('-2');
  const [limiteSuperior, setLimiteSuperior] = useState('5');
  
  // Graph States
  const [xMin, setXMin] = useState(-10);
  const [xMax, setXMax] = useState(10);
  const [showGraphSettings, setShowGraphSettings] = useState(false);
  
  // Loader States (SaaS Skeleton thinking phase)
  const [isLoading, setIsLoading] = useState(false);

  // Result States
  const [calculated, setCalculated] = useState(false);
  const [resultado, setResultado] = useState('');
  const [pasos, setPasos] = useState([]);
  const [errorCal, setErrorCal] = useState('');

  const inputRef = useRef(null);

  // Validate function when user types
  useEffect(() => {
    // If we are in 3D graphing tab, we validate against variables x and y
    const allowedVar = activeTab === 'grafica3d' ? 'y' : 'x';
    const val = validateFunction(funcion, 'x');
    
    if (activeTab === 'grafica3d') {
      // Custom loose validation for 3D inputs to allow both x and y
      try {
        const node = math.parse(funcion);
        const symbols = [];
        node.traverse((n) => {
          if (n.isSymbolNode) symbols.push(n.name);
        });
        const unknownSymbols = symbols.filter(
          (s) => s !== 'x' && s !== 'y' && typeof math[s] !== 'function' && s !== 'pi' && s !== 'e'
        );
        if (unknownSymbols.length > 0) {
          setValidation({
            isValid: false,
            error: `Símbolos desconocidos: ${unknownSymbols.join(', ')}. Usa 'x' e 'y' en 3D.`
          });
        } else {
          setValidation({ isValid: true, error: null });
        }
      } catch (err) {
        setValidation({ isValid: false, error: `Error de sintaxis: ${err.message}` });
      }
    } else {
      setValidation(val);
    }
  }, [funcion, activeTab]);

  // Adjust placeholder expression when switching tabs
  const handleTabChange = (mode) => {
    setActiveTab(mode);
    setCalculated(false);
    setErrorCal('');
    
    if (mode === 'grafica3d') {
      setFuncion('sin(x) * cos(y)');
    } else if (funcion === 'sin(x) * cos(y)') {
      setFuncion('x^2 - 4*x + 3');
    }
  };

  // Convert raw formula input into LaTeX dynamically
  const liveLaTeX = useMemo(() => {
    if (!funcion || !validation.isValid) return '';
    try {
      const cleanExpr = funcion;
      let node = math.parse(cleanExpr);
      let tex = node.toTex({ parenthesis: 'keep' });
      
      if (activeTab === 'integral') {
        return `\\int_{${limiteInferior}}^{${limiteSuperior}} \\left(${tex}\\right) \\, dx`;
      }
      if (activeTab === 'derivada') {
        return `\\frac{d}{dx} \\left(${tex}\\right)`;
      }
      return tex;
    } catch (e) {
      return '';
    }
  }, [funcion, validation.isValid, activeTab, limiteInferior, limiteSuperior]);

  // Insert symbol at current cursor position
  const insertSymbol = (symbol) => {
    if (inputRef.current) {
      const start = inputRef.current.selectionStart;
      const end = inputRef.current.selectionEnd;
      const text = inputRef.current.value;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      
      setFuncion(before + symbol + after);
      
      setTimeout(() => {
        inputRef.current.focus();
        inputRef.current.selectionStart = start + symbol.length;
        inputRef.current.selectionEnd = start + symbol.length;
      }, 50);
    } else {
      setFuncion(prev => prev + symbol);
    }
  };

  const handleClear = () => {
    setFuncion('');
    setCalculated(false);
    setResultado('');
    setPasos([]);
    setErrorCal('');
  };

  const handleCalculate = async (e) => {
    if (e) e.preventDefault();
    if (!validation.isValid) return;

    setErrorCal('');
    setIsLoading(true); // Trigger skeleton loading screen
    setCalculated(false);

    // Simulate premium SaaS AI processing delay
    setTimeout(async () => {
      try {
        if (activeTab === 'derivada') {
          const res = deriveWithSteps(funcion, 'x');
          setResultado(res.simplified);
          setPasos(res.steps);
          setCalculated(true);
          setLastEvaluatedFunction(funcion);
          await saveToHistory('derivada', funcion, res.simplified, res.steps);
        } else if (activeTab === 'integral') {
          const res = integrateWithSteps(funcion, 'x', limiteInferior, limiteSuperior);
          if (res.result === null) {
            throw new Error(res.steps[0]);
          }
          const resStr = `${res.result.toFixed(6)}`;
          setResultado(resStr);
          setPasos(res.steps);
          setCalculated(true);
          setLastEvaluatedFunction(funcion);
          await saveToHistory(
            'integral', 
            `[${limiteInferior}, ${limiteSuperior}] ${funcion}`, 
            resStr, 
            res.steps
          );
        } else if (activeTab === 'grafica') {
          setResultado('Graficado Exitosamente');
          setPasos([
            `Generado gráfico de dos dimensiones para f(x) = ${funcion} en el rango horizontal [${xMin}, ${xMax}].`,
            `Evaluamos la función f(x) secuencialmente para trazar una aproximación de curva lineal continua.`,
            `Puedes inspeccionar puntos específicos moviendo el puntero sobre la gráfica interactiva.`
          ]);
          setCalculated(true);
          setLastEvaluatedFunction(funcion);
          await saveToHistory('grafica', funcion, 'Graficado', [`Graficado en x = [${xMin}, ${xMax}]`]);
        } else if (activeTab === 'grafica3d') {
          setResultado('Superficie 3D Cargada');
          setPasos([
            `Generada superficie de tres dimensiones para z = f(x, y) = ${funcion}.`,
            `El visualizador tridimensional proyecta la malla rotada y colorea las celdas según su altura.`,
            `Puedes interactuar directamente arrastrando el ratón o deslizando el dedo sobre el lienzo.`
          ]);
          setCalculated(true);
          setLastEvaluatedFunction(funcion);
          await saveToHistory('grafica3d', funcion, 'Superficie 3D', [`Trazado de malla z = f(x, y)`]);
        }
      } catch (err) {
        console.error(err);
        setErrorCal(err.message || 'Error en el cálculo matemático. Revisa los parámetros.');
        setCalculated(false);
      } finally {
        setIsLoading(false);
      }
    }, 1000); // 1 second skeleton pulse loader
  };

  const handleExportPDF = () => {
    if (!calculated) return;
    exportToPDF({
      tipo: activeTab,
      funcion: activeTab === 'integral' ? `[${limiteInferior}, ${limiteSuperior}] ${funcion}` : funcion,
      resultado: resultado,
      pasos: pasos,
      fecha: new Date().toISOString()
    });
  };

  // Math keyboard keys (includes x and y for 3D equations)
  const keyboardKeys = [
    { label: 'x', value: 'x' },
    { label: 'y', value: 'y' },
    { label: 'π', value: 'pi' },
    { label: 'e', value: 'e' },
    { label: '+', value: ' + ' },
    { label: '-', value: ' - ' },
    { label: '*', value: '*' },
    { label: '/', value: '/' },
    { label: '^', value: '^' },
    { label: 'sin', value: 'sin(' },
    { label: 'cos', value: 'cos(' },
    { label: 'tan', value: 'tan(' },
    { label: 'ln', value: 'log(' },
    { label: 'exp', value: 'exp(' },
    { label: '√', value: 'sqrt(' },
    { label: '(', value: '(' },
    { label: ')', value: ')' },
  ];

  // Convert standard math string to LaTeX for the result box
  const getLaTeXResult = (expr) => {
    try {
      return math.parse(expr).toTex({ parenthesis: 'keep' });
    } catch (e) {
      return expr;
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white font-display">Playground Matemático</h2>
          <p className="text-xs text-zinc-500">Diseña, deriva, integra y visualiza funciones con potencia de cálculo AI</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Motor Operativo Activo</span>
        </div>
      </div>

      {/* Main calculation Console layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core Math compiler console (Col span 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="saas-card p-6 bg-[#0a0a0f]/60 relative border border-white/5 overflow-hidden">
            
            {/* Ambient visual overlay decoration */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-accent-blue/5 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">Expresión</span>
                {funcion && (
                  validation.isValid ? (
                    <span className="flex items-center space-x-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Sintaxis Válida</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 text-[9px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full animate-pulse">
                      <AlertCircle className="h-3 w-3" />
                      <span>Error Compilación</span>
                    </span>
                  )
                )}
              </div>
              
              {/* SaaS Operation Modes Toggle (Includes 3D Tab) */}
              <div className="flex p-0.5 rounded-lg bg-zinc-950/80 border border-white/5 w-fit">
                {[
                  { id: 'derivada', name: 'Derivar' },
                  { id: 'integral', name: 'Integral' },
                  { id: 'grafica', name: 'Gráfica 2D' },
                  { id: 'grafica3d', name: 'Gráfica 3D' }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => handleTabChange(mode.id)}
                    className={`px-2.5 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-wider transition cursor-pointer ${
                      activeTab === mode.id 
                        ? 'bg-zinc-900 text-white border border-white/5 shadow-inner' 
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {mode.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form console */}
            <form onSubmit={handleCalculate} className="space-y-4">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={funcion}
                  onChange={(e) => setFuncion(e.target.value)}
                  className="w-full bg-zinc-950/60 border border-white/5 rounded-xl py-4 pl-5 pr-14 text-base font-mono text-zinc-100 placeholder-zinc-700 tracking-wider focus:outline-none focus:border-accent-purple/60 focus:ring-1 focus:ring-accent-purple/20 transition-all duration-200"
                  placeholder={activeTab === 'grafica3d' ? 'Ej. sin(x) * cos(y)' : 'Ej. x^2 - sin(x)'}
                  required
                />
                
                {/* Clean inline utilities */}
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                  {funcion && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="p-1 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition cursor-pointer"
                      title="Limpiar"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={!validation.isValid || !funcion}
                    className="p-1.5 rounded-lg bg-accent-blue/10 border border-accent-blue/20 text-accent-blue hover:bg-accent-blue hover:text-white transition disabled:opacity-50 disabled:bg-transparent disabled:text-zinc-600 disabled:border-transparent cursor-pointer"
                  >
                    <CornerDownLeft className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Dynamic live LaTeX preview */}
              {liveLaTeX && (
                <div className="p-3 bg-zinc-950/20 border border-white/5 rounded-lg text-center overflow-x-auto scrollbar-none py-2 text-zinc-200">
                  <div className="text-[9px] font-bold text-zinc-500 tracking-wider uppercase block text-left mb-1.5">
                    Previsualización LaTeX
                  </div>
                  <LaTeX mathFormula={liveLaTeX} block={true} />
                </div>
              )}

              {/* Validation alert banner */}
              {!validation.isValid && (
                <div className="p-3 bg-red-500/10 border border-red-500/15 rounded-lg text-red-400 text-xs flex items-start space-x-2 animate-slideDown">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{validation.error}</span>
                </div>
              )}

              {/* Integral integration bounds panel */}
              {activeTab === 'integral' && (
                <div className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl grid grid-cols-2 gap-4 animate-slideDown">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Límite Inferior (a)</label>
                    <input
                      type="text"
                      value={limiteInferior}
                      onChange={(e) => setLimiteInferior(e.target.value)}
                      className="w-full bg-zinc-950/60 border border-white/5 rounded-lg py-1.5 px-3 text-xs font-mono text-zinc-300 focus:border-accent-blue/40"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Límite Superior (b)</label>
                    <input
                      type="text"
                      value={limiteSuperior}
                      onChange={(e) => setLimiteSuperior(e.target.value)}
                      className="w-full bg-zinc-950/60 border border-white/5 rounded-lg py-1.5 px-3 text-xs font-mono text-zinc-300 focus:border-accent-purple/40"
                      placeholder="pi"
                    />
                  </div>
                </div>
              )}

              {/* Math Keyboard Panel */}
              <div className="space-y-2 pt-2">
                <span className="text-[9px] font-bold text-zinc-500 tracking-widest block uppercase">Teclado de Fórmulas</span>
                <div className="grid grid-cols-4 sm:grid-cols-9 gap-2">
                  {keyboardKeys.map((key) => {
                    // Hide y variable if we are not in 3D tab (reduces clutter)
                    if (key.label === 'y' && activeTab !== 'grafica3d') return null;
                    return (
                      <button
                        key={key.label}
                        type="button"
                        onClick={() => insertSymbol(key.value)}
                        className="py-1.5 rounded-lg bg-zinc-950/60 hover:bg-zinc-900 border border-white/5 hover:border-white/10 text-xs font-mono text-zinc-300 hover:text-white transition active:scale-95 cursor-pointer"
                      >
                        {key.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Centered execution button */}
              <button
                type="submit"
                disabled={!validation.isValid || !funcion}
                className="w-full py-3 saas-button-primary text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Ejecutar Cálculo Matemático</span>
              </button>
            </form>
          </div>

          {errorCal && (
            <div className="p-4 bg-red-500/10 border border-red-500/15 rounded-xl text-red-400 text-xs flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorCal}</span>
            </div>
          )}
        </div>

        {/* Right Settings/Parameters column */}
        <div className="space-y-4">
          <div className="saas-card p-5 bg-[#0a0a0f]/60 relative border border-white/5 space-y-4">
            <button
              type="button"
              onClick={() => setShowGraphSettings(!showGraphSettings)}
              className="w-full flex items-center justify-between text-xs font-bold text-zinc-400 tracking-wider uppercase cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <Settings2 className="h-4 w-4 text-accent-purple" />
                <span>RANGO DE GRAFICACIÓN</span>
              </div>
              <span className="text-[10px] text-accent-blue hover:underline">Ajustar</span>
            </button>
            
            <p className="text-xs text-zinc-500 leading-relaxed">
              Define los valores de frontera para el trazado interactivo de curvas matemáticas del gráfico.
            </p>

            <div className="space-y-4 pt-2">
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs font-mono text-zinc-400">
                  <span>Mínimo (X Min)</span>
                  <span className="font-bold text-accent-blue">{xMin}</span>
                </div>
                <input
                  type="range"
                  min="-40"
                  max="-2"
                  value={xMin}
                  onChange={(e) => setXMin(parseInt(e.target.value))}
                  className="w-full h-1 accent-accent-blue bg-zinc-950/80 rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs font-mono text-zinc-400">
                  <span>Máximo (X Max)</span>
                  <span className="font-bold text-accent-purple">{xMax}</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="40"
                  value={xMax}
                  onChange={(e) => setXMax(parseInt(e.target.value))}
                  className="w-full h-1 accent-accent-purple bg-zinc-950/80 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 flex items-start space-x-2 text-[10px] text-zinc-500">
              <HelpCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-zinc-600" />
              <span>El eje Y se adaptará dinámicamente según los picos calculados de la función.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Render skeleton pulses when thinking */}
      {isLoading && <DashboardSkeleton />}

      {/* Results output panel */}
      {calculated && !isLoading && (
        <div className="saas-card p-6 md:p-8 bg-[#0a0a0f]/60 relative border border-white/5 space-y-6 animate-slideUp">
          
          {/* Header result row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div>
              <span className="text-[9px] font-bold text-accent-purple tracking-widest block uppercase">{activeTab} de f(x)</span>
              <h3 className="text-lg font-bold text-white tracking-tight mt-0.5">Análisis Técnico y Solución</h3>
            </div>
            
            <button
              onClick={handleExportPDF}
              className="flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold saas-button-secondary cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Reporte PDF</span>
            </button>
          </div>

          {/* Large output glowing result container */}
          <div className="p-6 bg-zinc-950/80 border border-white/5 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase block">Resultado Simplificado</span>
            <div className="text-lg sm:text-xl font-bold text-white tracking-wider font-mono overflow-x-auto py-1">
              {activeTab === 'derivada' ? (
                <LaTeX mathFormula={getLaTeXResult(resultado)} block={true} />
              ) : (
                resultado
              )}
            </div>
          </div>

          {/* Dual columns result layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
            
            {/* Resolution steps list */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-zinc-400 tracking-wider uppercase flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-accent-purple" />
                <span>Explicación Paso a Paso</span>
              </h4>

              <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {pasos.map((step, idx) => {
                  let cleanedStep = step;
                  const isTitle = step.startsWith('**');
                  if (isTitle) {
                    cleanedStep = step.replace(/\*\*/g, '');
                  }
                  
                  // Regex split for math segments
                  const parts = cleanedStep.split(/(\$\$[\s\S]*?\$\$|\$.*?\$)/g);
                  
                  return (
                    <div 
                      key={idx} 
                      className={`p-3.5 rounded-lg text-xs leading-relaxed transition-all border ${
                        isTitle 
                          ? 'bg-gradient-to-r from-accent-purple/5 to-transparent border-accent-purple/20 text-slate-100 font-semibold' 
                          : 'bg-zinc-950/20 border-white/5 text-zinc-400 hover:border-white/10'
                      }`}
                    >
                      {parts.map((part, pIdx) => {
                        if (part.startsWith('$$') && part.endsWith('$$')) {
                          const mathFormula = part.slice(2, -2);
                          return <LaTeX key={pIdx} mathFormula={mathFormula} block={true} />;
                        } else if (part.startsWith('$') && part.endsWith('$')) {
                          const mathFormula = part.slice(1, -1);
                          return <LaTeX key={pIdx} mathFormula={mathFormula} block={false} />;
                        }
                        return <span key={pIdx}>{part}</span>;
                      })}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Interactive Graph (2D or 3D canvas) */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-zinc-400 tracking-wider uppercase flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-accent-blue" />
                <span>Gráfica {activeTab === 'grafica3d' ? 'Tridimensional' : 'Bidimensional'}</span>
              </h4>
              
              <div className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl min-h-[350px] flex items-center justify-center">
                {activeTab === 'grafica3d' ? (
                  <Math3DChart expression={lastEvaluatedFunction} />
                ) : (
                  <MathChart 
                    expression={activeTab === 'derivada' ? resultado : lastEvaluatedFunction} 
                    xMin={xMin} 
                    xMax={xMax} 
                  />
                )}
              </div>
            </div>
            
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Dashboard;
