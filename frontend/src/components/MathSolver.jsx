// MathSolver.jsx - React component for CalcMaster AI
// Modern dark UI with glassmorphism, responsive layout.
// Uses React hooks and axios to call the Flask microservice.

import React, { useState } from "react";
import axios from "axios";
import "katex/dist/katex.min.css"; // KaTeX CSS for rendering LaTeX

const MathSolver = () => {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSolve = async () => {
    if (!expression.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/math/derive",
        { expression },
        { headers: { "Content-Type": "application/json" } }
      );
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "An unexpected error occurred while solving the expression."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="math-solver container">
      <h2 className="title">Math Solver</h2>
      <div className="input-group">
        <input
          type="text"
          placeholder="Enter a mathematical expression, e.g., x**2 + sin(x)"
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          className="expression-input"
          disabled={loading}
        />
        <button
          onClick={handleSolve}
          className="solve-button"
          disabled={loading}
        >
          {loading ? "Solving..." : "Solve"}
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      {result && (
        <div className="result-card">
          <h3>Derivative</h3>
          <pre className="derivative-output">{result.derivative}</pre>
          <h3>LaTeX</h3>
          <p
            className="latex-output"
            dangerouslySetInnerHTML={{ __html: result.latex }}
          />
          <h3>Steps</h3>
          <pre className="steps-output">{result.steps}</pre>
        </div>
      )}
    </section>
  );
};

export default MathSolver;

/*
  Styling (recommended to place in a dedicated CSS/SCSS file, e.g., MathSolver.css):
  --------------------------------------------------------------
  .math-solver {
    background: rgba(30,30,30,0.85);
    backdrop-filter: blur(12px);
    border-radius: 12px;
    padding: 1.5rem;
    margin: 1rem auto;
    max-width: 800px;
    color: #e0e0e0;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  }
  .math-solver .title { text-align: center; margin-bottom: 1rem; font-size: 1.75rem; }
  .input-group { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  .expression-input {
    flex: 1 1 60%;
    padding: 0.75rem;
    border: none;
    border-radius: 8px;
    background: rgba(255,255,255,0.1);
    color: #fff;
    font-size: 1rem;
  }
  .solve-button {
    flex: 0 0 auto;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #6a5acd, #00bfff);
    border: none;
    border-radius: 8px;
    color: #fff;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s ease;
  }
  .solve-button:disabled { opacity: 0.6; cursor: not-allowed; }
  .solve-button:hover { background: linear-gradient(135deg, #7b68ee, #1e90ff); }
  .error-message { color: #ff6b6b; margin-top: 0.5rem; }
  .result-card { margin-top: 1.5rem; background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px; }
  .result-card h3 { margin-top: 0.75rem; }
  .derivative-output, .steps-output { background: rgba(255,255,255,0.05); padding: 0.75rem; border-radius: 6px; overflow-x: auto; }
  .latex-output { font-size: 1.2rem; margin-top: 0.5rem; }
  @media (max-width: 600px) {
    .expression-input { flex-basis: 100%; }
    .solve-button { width: 100%; }
  }
*/
