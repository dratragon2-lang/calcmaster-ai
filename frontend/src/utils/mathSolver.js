import * as math from 'mathjs';

/**
 * Validates whether a string is a mathematically valid function of the given variable.
 * @param {string} expr - The expression string to validate (e.g., "x^2 + 3*x")
 * @param {string} variable - The variable name (e.g., "x")
 * @returns {Object} { isValid: boolean, error: string }
 */
export const validateFunction = (expr, variable = 'x') => {
  if (!expr || expr.trim() === '') {
    return { isValid: false, error: 'La función no puede estar vacía.' };
  }
  try {
    const node = math.parse(expr);
    
    // Check if the expression contains only allowed symbols/variables
    const symbols = [];
    node.traverse((n) => {
      if (n.isSymbolNode) {
        symbols.push(n.name);
      }
    });

    const unknownSymbols = symbols.filter(
      (s) => s !== variable && typeof math[s] !== 'function' && s !== 'pi' && s !== 'e' && s !== 'i'
    );

    if (unknownSymbols.length > 0) {
      return {
        isValid: false,
        error: `Símbolos desconocidos detectados: ${unknownSymbols.join(', ')}. Usa '${variable}' como variable.`
      };
    }

    // Try evaluating at a sample value to verify it executes
    const compiled = node.compile();
    const scope = {};
    scope[variable] = 2; // Test with x = 2
    compiled.evaluate(scope);

    return { isValid: true, error: null };
  } catch (error) {
    return { isValid: false, error: `Error de sintaxis: ${error.message}` };
  }
};

/**
 * Checks if a Math.js node depends on the specified variable.
 */
const dependsOn = (node, variable) => {
  let found = false;
  node.traverse((n) => {
    if (n.isSymbolNode && n.name === variable) {
      found = true;
    }
  });
  return found;
};

/**
 * Recursively differentiates a mathjs Node and collects human-readable steps.
 */
const diffNode = (node, variable, steps = []) => {
  // Constant Node
  if (node.isConstantNode) {
    const val = node.value;
    const step = `La derivada de la constante \`${val}\` es \`0\`.`;
    steps.push(step);
    return math.parse('0');
  }

  // Symbol Node
  if (node.isSymbolNode) {
    if (node.name === variable) {
      const step = `La derivada de la variable \`${variable}\` respecto a sí misma es \`1\`.`;
      steps.push(step);
      return math.parse('1');
    } else {
      const step = `Tratamos la variable o constante simbólica \`${node.name}\` como una constante: su derivada es \`0\`.`;
      steps.push(step);
      return math.parse('0');
    }
  }

  // Parenthesis Node
  if (node.isParenthesisNode) {
    const innerDiff = diffNode(node.content, variable, steps);
    return new math.ParenthesisNode(innerDiff);
  }

  // Operator Node
  if (node.isOperatorNode) {
    const op = node.op;

    // Unary Operators (-u)
    if (node.args.length === 1) {
      if (op === '-') {
        const u = node.args[0];
        steps.push(`Regla del signo negativo: d/d${variable}[-u] = -d/d${variable}[u]. Diferenciamos \`${u.toString()}\`.`);
        const uDiff = diffNode(u, variable, steps);
        return new math.OperatorNode('-', 'unaryMinus', [uDiff]);
      }
      // Fallback for other unary operators
      return math.parse('0');
    }

    // Binary Operators
    const u = node.args[0];
    const v = node.args[1];

    if (op === '+' || op === '-') {
      steps.push(`Regla de la ${op === '+' ? 'suma' : 'resta'}: d/d${variable}[u ${op} v] = u' ${op} v'.`);
      steps.push(`Diferenciando el primer término \`${u.toString()}\`:`);
      const uDiff = diffNode(u, variable, steps);
      steps.push(`Diferenciando el segundo término \`${v.toString()}\`:`);
      const vDiff = diffNode(v, variable, steps);
      return new math.OperatorNode(op, op === '+' ? 'add' : 'subtract', [uDiff, vDiff]);
    }

    if (op === '*') {
      steps.push(`Regla del producto: d/d${variable}[u · v] = u' · v + u · v'.`);
      steps.push(`Identificamos u = \`${u.toString()}\` y v = \`${v.toString()}\`.`);
      
      steps.push(`Calculamos u' (derivada de \`${u.toString()}\`):`);
      const uDiff = diffNode(u, variable, steps);
      
      steps.push(`Calculamos v' (derivada de \`${v.toString()}\`):`);
      const vDiff = diffNode(v, variable, steps);

      const term1 = new math.OperatorNode('*', 'multiply', [uDiff, v]);
      const term2 = new math.OperatorNode('*', 'multiply', [u, vDiff]);
      const result = new math.OperatorNode('+', 'add', [term1, term2]);
      steps.push(`Unimos aplicando la regla del producto: \`(${uDiff.toString()}) · (${v.toString()}) + (${u.toString()}) · (${vDiff.toString()})\`.`);
      return result;
    }

    if (op === '/') {
      steps.push(`Regla del cociente: d/d${variable}[u / v] = (u' · v - u · v') / v².`);
      steps.push(`Identificamos u = \`${u.toString()}\` y v = \`${v.toString()}\`.`);

      steps.push(`Calculamos u' (derivada del numerador \`${u.toString()}\`):`);
      const uDiff = diffNode(u, variable, steps);
      
      steps.push(`Calculamos v' (derivada del denominador \`${v.toString()}\`):`);
      const vDiff = diffNode(v, variable, steps);

      const uDiffV = new math.OperatorNode('*', 'multiply', [uDiff, v]);
      const uVDiff = new math.OperatorNode('*', 'multiply', [u, vDiff]);
      const numerator = new math.OperatorNode('-', 'subtract', [uDiffV, uVDiff]);
      const denominator = new math.OperatorNode('^', 'pow', [v, math.parse('2')]);
      const result = new math.OperatorNode('/', 'divide', [
        new math.ParenthesisNode(numerator),
        new math.ParenthesisNode(denominator)
      ]);
      steps.push(`Unimos aplicando la regla del cociente: \`[(${uDiff.toString()}) · (${v.toString()}) - (${u.toString()}) · (${vDiff.toString()})] / (${v.toString()})²\`.`);
      return result;
    }

    if (op === '^') {
      const uDepends = dependsOn(u, variable);
      const vDepends = dependsOn(v, variable);

      if (uDepends && !vDepends) {
        // Generalized Power Rule: d/dx(u^n) = n * u^(n-1) * u'
        steps.push(`Regla de la potencia generalizada: d/d${variable}[u^n] = n · u^(n-1) · u'.`);
        steps.push(`Aquí u = \`${u.toString()}\` y el exponente constante n = \`${v.toString()}\`.`);
        
        steps.push(`Calculamos u' (derivada de la base \`${u.toString()}\`):`);
        const uDiff = diffNode(u, variable, steps);

        const expMinusOne = new math.OperatorNode('-', 'subtract', [v, math.parse('1')]);
        const uPower = new math.OperatorNode('^', 'pow', [u, new math.ParenthesisNode(expMinusOne)]);
        const term = new math.OperatorNode('*', 'multiply', [v, uPower]);
        const result = new math.OperatorNode('*', 'multiply', [term, uDiff]);
        
        steps.push(`Obtenemos: \`${v.toString()} · (${u.toString()})^(${v.toString()} - 1) · (${uDiff.toString()})\`.`);
        return result;
      }

      if (!uDepends && vDepends) {
        // Exponential Rule: d/dx(a^u) = a^u * ln(a) * u'
        steps.push(`Regla de la función exponencial: d/d${variable}[a^u] = a^u · ln(a) · u'.`);
        steps.push(`Aquí la base constante a = \`${u.toString()}\` y el exponente u = \`${v.toString()}\`.`);

        steps.push(`Calculamos u' (derivada del exponente \`${v.toString()}\`):`);
        const vDiff = diffNode(v, variable, steps);

        const lnA = new math.FunctionNode('ln', [u]);
        const term1 = new math.OperatorNode('*', 'multiply', [node, lnA]);
        const result = new math.OperatorNode('*', 'multiply', [term1, vDiff]);

        steps.push(`Obtenemos: \`(${u.toString()})^(${v.toString()}) · ln(${u.toString()}) · (${vDiff.toString()})\`.`);
        return result;
      }

      if (uDepends && vDepends) {
        // Logarithmic differentiation: d/dx(u^v) = u^v * (v' * ln(u) + v * u' / u)
        steps.push(`Regla de diferenciación logarítmica para bases y exponentes variables d/d${variable}[u^v] = u^v · (v' · ln(u) + v · u' / u).`);
        steps.push(`Identificamos u = \`${u.toString()}\` y v = \`${v.toString()}\`.`);

        steps.push(`Calculamos u' (derivada de la base \`${u.toString()}\`):`);
        const uDiff = diffNode(u, variable, steps);

        steps.push(`Calculamos v' (derivada del exponente \`${v.toString()}\`):`);
        const vDiff = diffNode(v, variable, steps);

        const lnU = new math.FunctionNode('ln', [u]);
        const term1 = new math.OperatorNode('*', 'multiply', [vDiff, lnU]);
        
        const term2Num = new math.OperatorNode('*', 'multiply', [v, uDiff]);
        const term2 = new math.OperatorNode('/', 'divide', [term2Num, u]);
        
        const sum = new math.OperatorNode('+', 'add', [term1, term2]);
        const result = new math.OperatorNode('*', 'multiply', [node, new math.ParenthesisNode(sum)]);

        steps.push(`Obtenemos la combinación: \`(${u.toString()})^(${v.toString()}) · [(${vDiff.toString()}) · ln(${u.toString()}) + (${v.toString()} · ${uDiff.toString()}) / (${u.toString()})]\`.`);
        return result;
      }

      // Neither depends on x
      steps.push(`El término \`${node.toString()}\` es constante respecto a \`${variable}\`, por lo que su derivada es \`0\`.`);
      return math.parse('0');
    }
  }

  // Function Node (sin, cos, etc.)
  if (node.isFunctionNode) {
    const fName = node.name;
    const arg = node.args[0];

    steps.push(`Aplicamos la regla de la cadena para la función trigonométrica o matemática: d/d${variable}[${fName}(u)] = ${fName}'(u) · u'.`);
    steps.push(`Identificamos u = \`${arg.toString()}\`.`);
    
    steps.push(`Calculamos u' (derivada del argumento \`${arg.toString()}\`):`);
    const argDiff = diffNode(arg, variable, steps);

    let fPrimeNode;
    if (fName === 'sin') {
      fPrimeNode = new math.FunctionNode('cos', [arg]);
      steps.push(`Sabemos que la derivada del seno es el coseno: d/du[sin(u)] = cos(u).`);
    } else if (fName === 'cos') {
      fPrimeNode = new math.OperatorNode('-', 'unaryMinus', [new math.FunctionNode('sin', [arg])]);
      steps.push(`Sabemos que la derivada del coseno es el seno negativo: d/du[cos(u)] = -sin(u).`);
    } else if (fName === 'tan') {
      // 1 / cos(u)^2 or sec(u)^2
      const cosNode = new math.FunctionNode('cos', [arg]);
      const cosSq = new math.OperatorNode('^', 'pow', [cosNode, math.parse('2')]);
      fPrimeNode = new math.OperatorNode('/', 'divide', [math.parse('1'), cosSq]);
      steps.push(`Sabemos que la derivada de la tangente es la secante al cuadrado: d/du[tan(u)] = 1 / cos²(u).`);
    } else if (fName === 'ln' || fName === 'log') {
      fPrimeNode = new math.OperatorNode('/', 'divide', [math.parse('1'), arg]);
      steps.push(`Sabemos que la derivada del logaritmo natural es: d/du[ln(u)] = 1 / u.`);
    } else if (fName === 'exp') {
      fPrimeNode = new math.FunctionNode('exp', [arg]);
      steps.push(`Sabemos que la derivada de e^u es ella misma: d/du[e^u] = e^u.`);
    } else if (fName === 'sqrt') {
      const doubleSqrt = new math.OperatorNode('*', 'multiply', [math.parse('2'), new math.FunctionNode('sqrt', [arg])]);
      fPrimeNode = new math.OperatorNode('/', 'divide', [math.parse('1'), doubleSqrt]);
      steps.push(`Sabemos que la derivada de la raíz cuadrada es: d/du[√u] = 1 / (2√u).`);
    } else {
      // Fallback
      fPrimeNode = new math.FunctionNode(`d_${fName}`, [arg]);
      steps.push(`Función genérica d/du[${fName}(u)].`);
    }

    if (arg.isSymbolNode && arg.name === variable) {
      steps.push(`Como el argumento es simplemente \`${variable}\` (u' = 1), el resultado de la derivada es \`${fPrimeNode.toString()}\`.`);
      return fPrimeNode;
    } else {
      const result = new math.OperatorNode('*', 'multiply', [fPrimeNode, argDiff]);
      steps.push(`Multiplicando por la derivada del argumento u' por la regla de la cadena: \`(${fPrimeNode.toString()}) · (${argDiff.toString()})\`.`);
      return result;
    }
  }

  // Fallback
  return math.parse('0');
};

/**
 * Calculates the symbolic derivative and generates human-readable steps.
 * @param {string} expr - The function expression (e.g., "3*x^2 + sin(x)")
 * @param {string} variable - The variable to differentiate with respect to.
 * @returns {Object} { derivative: string, simplified: string, steps: string[] }
 */
export const deriveWithSteps = (expr, variable = 'x') => {
  const steps = [];
  try {
    const node = math.parse(expr);
    steps.push(`**Paso de inicio:** Iniciamos el cálculo de la derivada de la función \`f(${variable}) = ${expr}\` respecto a \`${variable}\`.`);
    
    const rawDiffNode = diffNode(node, variable, steps);
    const rawDiffString = rawDiffNode.toString();
    
    // Simplify the final derivative using math.js simplification rules
    let simplifiedString = '';
    try {
      const simplifiedNode = math.simplify(rawDiffNode);
      simplifiedString = simplifiedNode.toString();
      steps.push(`**Paso de simplificación:** Simplificamos la expresión resultante \`${rawDiffString}\` obteniendo \`${simplifiedString}\`.`);
    } catch (e) {
      simplifiedString = rawDiffString;
      steps.push(`**Paso final:** Dejamos la expresión resultante en su formato directo: \`${rawDiffString}\`.`);
    }

    return {
      derivative: rawDiffString,
      simplified: simplifiedString,
      steps: steps
    };
  } catch (error) {
    return {
      derivative: '',
      simplified: '',
      steps: [`Ocurrió un error al calcular la derivada: ${error.message}`]
    };
  }
};

/**
 * Calculates a definite integral numerically using Simpson's 1/3 Rule and returns steps.
 * @param {string} expr - The function expression to integrate (e.g. "x^2")
 * @param {string} variable - Variable of integration (e.g. "x")
 * @param {string} aStr - Lower bound (as string or number)
 * @param {string} bStr - Upper bound (as string or number)
 * @returns {Object} { result: number, steps: string[] }
 */
export const integrateWithSteps = (expr, variable = 'x', aStr, bStr) => {
  const steps = [];
  try {
    const a = math.evaluate(aStr);
    const b = math.evaluate(bStr);

    if (isNaN(a) || isNaN(b)) {
      throw new Error('Los límites de integración deben ser números válidos.');
    }

    steps.push(`**Planteamiento del problema:** Se requiere calcular la integral definida:`);
    steps.push(`$$\\int_{${a}}^{${b}} (${expr}) \\, d${variable}$$`);
    
    steps.push(`Dado que el cálculo simbólico exacto de antiderivadas es complejo para cualquier expresión general, empleamos el **Método de Integración Numérica de Simpson 1/3** para aproximar el resultado.`);
    steps.push(`El intervalo $[a, b] = [${a}, ${b}]$ se dividirá en subintervalos de igual ancho. La fórmula de Simpson es:`);
    steps.push(`$$I \\approx \\frac{\\Delta x}{3} \\left[ f(x_0) + 4\\sum_{i\\text{ impar}} f(x_i) + 2\\sum_{i\\text{ par}} f(x_i) + f(x_n) \\right]$$`);

    // We compile the function for fast evaluation
    const compiled = math.compile(expr);
    const f = (val) => {
      const scope = {};
      scope[variable] = val;
      return compiled.evaluate(scope);
    };

    // Step-by-step example with N = 6 for clear visual math demonstration
    const N_steps = 6;
    const h_steps = (b - a) / N_steps;
    steps.push(`**Ejemplo de cálculo paso a paso con $N = ${N_steps}$ intervalos:**`);
    steps.push(`El ancho de cada intervalo es: $\\Delta x = \\frac{b - a}{N} = \\frac{${b} - ${a}}{${N_steps}} = ${h_steps.toFixed(4)}$`);

    const tableRows = [];
    let sumOdd = 0;
    let sumEven = 0;
    const f_vals = [];

    for (let i = 0; i <= N_steps; i++) {
      const xi = a + i * h_steps;
      const yi = f(xi);
      f_vals.push(yi);

      let weight = 1;
      if (i > 0 && i < N_steps) {
        weight = i % 2 === 0 ? 2 : 4;
        if (i % 2 === 0) sumEven += yi;
        else sumOdd += yi;
      }

      tableRows.push(`| $x_{${i}}$ | ${xi.toFixed(4)} | $f(x_{${i}})$ | ${yi.toFixed(6)} | Peso: ${weight} |`);
    }

    steps.push(`Calculamos la tabla de puntos:`);
    steps.push(`| Punto | Valor $x$ | Función | Valor $f(x)$ | Peso en la Fórmula |`);
    steps.push(`|---|---|---|---|---|`);
    tableRows.forEach(row => steps.push(row));

    const approxValue = (h_steps / 3) * (f_vals[0] + 4 * sumOdd + 2 * sumEven + f_vals[N_steps]);
    
    steps.push(`Suma de los términos impares (multiplicados por 4): $4 \\times (${sumOdd.toFixed(6)}) = ${(4 * sumOdd).toFixed(6)}$`);
    steps.push(`Suma de los términos pares (multiplicados por 2): $2 \\times (${sumEven.toFixed(6)}) = ${(2 * sumEven).toFixed(6)}$`);
    steps.push(`Suma total en corchete: $f(x_0) + 4\\Sigma_{impar} + 2\\Sigma_{par} + f(x_n) = ${f_vals[0].toFixed(6)} + ${(4 * sumOdd).toFixed(6)} + ${(2 * sumEven).toFixed(6)} + ${f_vals[N_steps].toFixed(6)} = ${(f_vals[0] + 4 * sumOdd + 2 * sumEven + f_vals[N_steps]).toFixed(6)}$`);
    steps.push(`Multiplicando por $\\Delta x / 3$: $I \\approx \\frac{${h_steps.toFixed(4)}}{3} \\times ${(f_vals[0] + 4 * sumOdd + 2 * sumEven + f_vals[N_steps]).toFixed(6)} = ${approxValue.toFixed(6)}$`);

    // Now, for final high precision, run with N = 1000
    const N_precision = 1000;
    const h_precision = (b - a) / N_precision;
    let sumOdd_p = 0;
    let sumEven_p = 0;
    const y0_p = f(a);
    const yn_p = f(b);

    for (let i = 1; i < N_precision; i++) {
      const xi = a + i * h_precision;
      const yi = f(xi);
      if (i % 2 === 0) {
        sumEven_p += yi;
      } else {
        sumOdd_p += yi;
      }
    }

    const precisionValue = (h_precision / 3) * (y0_p + 4 * sumOdd_p + 2 * sumEven_p + yn_p);
    
    steps.push(`**Cálculo de alta precisión ($N = ${N_precision}$):**`);
    steps.push(`Para garantizar la exactitud en la gráfica y resultados finales, recalculamos con $N = ${N_precision}$ divisiones.`);
    steps.push(`El valor altamente aproximado de la integral definida es: **${precisionValue.toFixed(6)}**.`);

    return {
      result: precisionValue,
      steps: steps
    };
  } catch (error) {
    return {
      result: null,
      steps: [`Ocurrió un error al calcular la integral definida: ${error.message}`]
    };
  }
};
