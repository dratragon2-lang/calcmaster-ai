import React, { useMemo } from 'react';
import * as math from 'mathjs';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register only the required components to save bundle size and ensure compatibility
ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const MathChart = ({ expression, xMin = -10, xMax = 10, variable = 'x' }) => {
  const chartData = useMemo(() => {
    if (!expression) return null;

    try {
      const compiled = math.compile(expression);
      const points = 150; // High resolution for smooth curves
      const step = (xMax - xMin) / points;
      
      const labels = [];
      const data = [];

      for (let i = 0; i <= points; i++) {
        const x = xMin + i * step;
        const scope = {};
        scope[variable] = x;
        let y = compiled.evaluate(scope);

        // Filter out extreme values and NaN/Infinity to prevent broken lines
        if (typeof y === 'object' && y.re !== undefined) {
          // Complex number output from math.js (e.g. sqrt(-1)) - take real part or skip
          y = y.re;
        }

        if (isNaN(y) || !isFinite(y) || Math.abs(y) > 1000) {
          data.push(null); // Chart.js skips null values gracefully
        } else {
          data.push(y);
        }
        labels.push(x.toFixed(2));
      }

      return {
        labels,
        datasets: [
          {
            label: `f(${variable}) = ${expression}`,
            data: data,
            borderColor: '#3b82f6', // Neon Blue
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2.5,
            pointRadius: 0, // Disable points for smooth line look
            pointHoverRadius: 5,
            pointBackgroundColor: '#a855f7', // Purple dot on hover
            pointBorderColor: '#fff',
            tension: 0.15, // Sleek bezier curve
            spanGaps: false // Don't bridge asymptotic gaps
          }
        ]
      };
    } catch (e) {
      console.warn('Error rendering function chart:', e.message);
      return null;
    }
  }, [expression, xMin, xMax, variable]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#e2e8f0', // Slate 200
          font: {
            family: 'Outfit',
            size: 13,
            weight: 'semibold'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 15, 25, 0.95)',
        titleColor: '#3b82f6',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          title: (context) => `x = ${parseFloat(context[0].label).toFixed(2)}`,
          label: (context) => `y = ${context.parsed.y !== null ? context.parsed.y.toFixed(4) : 'Indefinido'}`
        }
      }
    },
    scales: {
      x: {
        type: 'linear',
        min: xMin,
        max: xMax,
        grid: {
          color: 'rgba(255, 255, 255, 0.04)',
          borderColor: 'rgba(255, 255, 255, 0.08)'
        },
        ticks: {
          color: '#94a3b8', // Slate 400
          font: {
            family: 'Inter',
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.04)',
          borderColor: 'rgba(255, 255, 255, 0.08)'
        },
        ticks: {
          color: '#94a3b8',
          font: {
            family: 'Inter',
            size: 11
          }
        }
      }
    }
  };

  if (!chartData) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-black/20 rounded-xl border border-white/5 border-dashed">
        <p className="text-sm">Ingresa una función válida para generar el gráfico interactivo</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[320px] p-2 relative">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default MathChart;
