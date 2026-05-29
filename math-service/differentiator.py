"""differentiator module for CalcMaster AI microservice.

Provides a function to compute the derivative of a mathematical expression using SymPy,
returning the derivative result, a simple step-by-step explanation, and LaTeX representation.
"""

import sympy as sp
from sympy.parsing.sympy_parser import parse_expr

def _extract_symbols(expr: sp.Expr) -> list:
    """Return a list of free symbols in the expression sorted alphabetically.
    """
    return sorted(expr.free_symbols, key=lambda s: s.name)

def derive_expression(expression: str) -> dict:
    """Derive the given mathematical expression.

    Parameters
    ----------
    expression: str
        The expression to differentiate, e.g., "x**2 + sin(x)".

    Returns
    -------
    dict
        A dictionary with keys:
        - "derivative": string representation of the derivative (sympy pretty).
        - "steps": a simple textual explanation of the differentiation steps.
        - "latex": LaTeX string of the derivative.
    """
    # Parse the expression safely.
    
    expression = expression.replace("^", "**")  
    try:
        expr = parse_expr(expression, evaluate=False)
    except Exception as e:
        raise ValueError(f"Unable to parse expression: {e}")

    # Determine the primary variable (first symbol alphabetically).
    symbols = _extract_symbols(expr)
    if not symbols:
        raise ValueError("No variable found in the expression.")
    var = symbols[0]

    # Compute derivative.
    derivative = sp.diff(expr, var)

    # Build LaTeX representation.
    derivative_latex = sp.latex(derivative)

    # Simple step-by-step explanation.
    steps = [
        f"Parse the expression: {expression}",
        f"Identify variable for differentiation: {var}",
        f"Compute derivative using SymPy's diff function.",
        f"Resulting derivative (symbolic): {sp.pretty(derivative)}",
    ]
    steps_text = "\n".join(steps)

    return {
        "derivative": sp.pretty(derivative),
        "steps": steps_text,
        "latex": derivative_latex,
    }

if __name__ == "__main__":
    # Simple manual test when run directly.
    import json, sys
    expr_input = sys.argv[1] if len(sys.argv) > 1 else "x**2 + sin(x)"
    result = derive_expression(expr_input)
    print(json.dumps(result, indent=2, ensure_ascii=False))
